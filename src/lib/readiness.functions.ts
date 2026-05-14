import { createServerFn } from "@tanstack/react-start";
import Stripe from "stripe";
import { z } from "zod";
import { type StripeEnv, createStripeClient } from "@/lib/stripe.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  encryptForVault,
  notifyStaffPacketReady,
  sendPacketToRecipient,
  VAULT_BUCKET_NAME,
} from "@/lib/readiness.server";
import { generateAllDocs, type Lang } from "@/lib/readiness-pdf";

const READINESS_PRICE_LOOKUP_KEY = "readiness_packet_99";
const VAULT_PRICE_LOOKUP_KEY = "readiness_vault_monthly";

// ---------- Create the $100 checkout session ----------
export const createReadinessCheckout = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      intakeSessionId: string;
      language: string;
      customerEmail?: string;
      returnUrl: string;
      environment: StripeEnv;
    }) => {
      if (!data.intakeSessionId || data.intakeSessionId.length < 6)
        throw new Error("Invalid intakeSessionId");
      if (!["en", "es", "ht"].includes(data.language)) throw new Error("Invalid language");
      if (!data.returnUrl?.startsWith("http")) throw new Error("Invalid returnUrl");
      return data;
    },
  )
  .handler(async ({ data }) => {
    const stripe = createStripeClient(data.environment);
    const prices = await stripe.prices.list({
      lookup_keys: [READINESS_PRICE_LOOKUP_KEY],
      limit: 1,
    });
    if (!prices.data.length) throw new Error("Readiness price not found");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: data.returnUrl,
      line_items: [{ price: prices.data[0].id, quantity: 1 }],
      ...(data.customerEmail && { customer_email: data.customerEmail }),
      metadata: {
        product: "readiness_packet",
        intake_session_id: data.intakeSessionId,
        language: data.language,
      },
    } satisfies Stripe.Checkout.SessionCreateParams);

    // Create the pending packet row up front so we can attach answers later.
    await supabaseAdmin.from("readiness_packets" as never).insert({
      intake_session_id: data.intakeSessionId,
      stripe_session_id: session.id,
      language: data.language,
      status: "pending_payment",
    } as never);

    return session.client_secret;
  });

// ---------- Verify payment + return packet info ----------
export const verifyReadinessPayment = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionId: string; environment: StripeEnv }) => {
    if (!data.sessionId) throw new Error("Invalid sessionId");
    return data;
  })
  .handler(async ({ data }) => {
    const stripe = createStripeClient(data.environment);
    const session = await stripe.checkout.sessions.retrieve(data.sessionId);
    if (session.payment_status !== "paid") return { paid: false as const };

    await supabaseAdmin
      .from("readiness_packets" as never)
      .update({ status: "paid", updated_at: new Date().toISOString() } as never)
      .eq("stripe_session_id", data.sessionId)
      .eq("status", "pending_payment");

    const { data: row } = await supabaseAdmin
      .from("readiness_packets" as never)
      .select("id,intake_session_id,language,status")
      .eq("stripe_session_id", data.sessionId)
      .maybeSingle();

    return {
      paid: true as const,
      packet: row as { id: string; intake_session_id: string; language: string; status: string } | null,
    };
  });

// ---------- Submit the 7-step intake form ----------
const RecipientSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  phone: z.string().min(3).max(40),
  relationship: z.string().min(1).max(100),
});

export const submitReadinessIntake = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      packetId: string;
      designatedRecipient: { name: string; email: string; phone: string; relationship: string };
      formAnswers: Record<string, unknown>;
    }) => {
      if (!data.packetId) throw new Error("Invalid packetId");
      RecipientSchema.parse(data.designatedRecipient);
      if (!data.formAnswers || typeof data.formAnswers !== "object")
        throw new Error("Invalid formAnswers");
      return data;
    },
  )
  .handler(async ({ data }) => {
    const { data: packet, error: fetchErr } = await supabaseAdmin
      .from("readiness_packets" as never)
      .select("id,status,language")
      .eq("id", data.packetId)
      .maybeSingle();
    if (fetchErr || !packet) throw new Error("Packet not found");
    const p = packet as { id: string; status: string; language: string };
    if (p.status !== "paid") throw new Error("Packet not in paid state");

    await supabaseAdmin
      .from("readiness_packets" as never)
      .update({
        designated_recipient: data.designatedRecipient,
        form_answers: data.formAnswers,
        status: "pending_translation",
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", data.packetId);

    try {
      await notifyStaffPacketReady(data.packetId, p.language);
    } catch (e) {
      console.error("notifyStaffPacketReady failed", e);
    }
    return { ok: true };
  });

// ---------- Look up packet by signing token (for /readiness/sign) ----------
export const getPacketByToken = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => {
    if (!data.token || data.token.length < 8) throw new Error("Invalid token");
    return data;
  })
  .handler(async ({ data }) => {
    const { data: row } = await supabaseAdmin
      .from("readiness_packets" as never)
      .select("id,language,status,signing_token_expires_at,vault_storage_paths,designated_recipient")
      .eq("signing_token", data.token)
      .maybeSingle();
    if (!row) return { ok: false as const, error: "Token not found" };
    const p = row as {
      id: string;
      language: string;
      status: string;
      signing_token_expires_at: string | null;
      vault_storage_paths: string[] | null;
      designated_recipient: { name?: string } | null;
    };
    if (p.signing_token_expires_at && new Date(p.signing_token_expires_at) < new Date())
      return { ok: false as const, error: "Token expired" };

    // Generate 1-hour signed URLs for every staged document.
    const links: Array<{ name: string; url: string }> = [];
    for (const path of p.vault_storage_paths ?? []) {
      const { data: signed } = await supabaseAdmin.storage
        .from(VAULT_BUCKET_NAME)
        .createSignedUrl(path, 60 * 60);
      if (signed) links.push({ name: path.split("/").pop() ?? path, url: signed.signedUrl });
    }
    return {
      ok: true as const,
      packet: {
        id: p.id,
        language: p.language,
        status: p.status,
        recipientName: p.designated_recipient?.name ?? null,
        documents: links,
      },
    };
  });

// ---------- Upload a signed/notarized PDF back to the vault ----------
export const uploadSignedPacketFile = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { token: string; filename: string; base64: string }) => {
      if (!data.token) throw new Error("Invalid token");
      if (!/^[a-zA-Z0-9._-]{1,80}$/.test(data.filename)) throw new Error("Invalid filename");
      if (!data.base64 || data.base64.length > 15 * 1024 * 1024)
        throw new Error("File too large or missing");
      return data;
    },
  )
  .handler(async ({ data }) => {
    const { data: row } = await supabaseAdmin
      .from("readiness_packets" as never)
      .select("id,vault_storage_paths,signing_token_expires_at")
      .eq("signing_token", data.token)
      .maybeSingle();
    if (!row) throw new Error("Token not found");
    const p = row as {
      id: string;
      vault_storage_paths: string[] | null;
      signing_token_expires_at: string | null;
    };
    if (p.signing_token_expires_at && new Date(p.signing_token_expires_at) < new Date())
      throw new Error("Token expired");

    const bin = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const encrypted = await encryptForVault(p.id, bin);
    const path = `${p.id}/signed/${Date.now()}-${data.filename}.enc`;
    const { error } = await supabaseAdmin.storage
      .from(VAULT_BUCKET_NAME)
      .upload(path, encrypted, { contentType: "application/octet-stream", upsert: false });
    if (error) throw new Error(error.message);

    const newPaths = [...(p.vault_storage_paths ?? []), path];
    await supabaseAdmin
      .from("readiness_packets" as never)
      .update({
        vault_storage_paths: newPaths,
        status: "vaulted",
        vaulted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", p.id);
    return { ok: true, path };
  });
