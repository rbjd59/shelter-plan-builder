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

// ---------- $5/month vault subscription checkout ----------
export const createVaultSubscriptionCheckout = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      packetId: string;
      customerEmail?: string;
      returnUrl: string;
      environment: StripeEnv;
    }) => {
      if (!data.packetId) throw new Error("Invalid packetId");
      if (!data.returnUrl?.startsWith("http")) throw new Error("Invalid returnUrl");
      return data;
    },
  )
  .handler(async ({ data }) => {
    const stripe = createStripeClient(data.environment);
    const prices = await stripe.prices.list({ lookup_keys: [VAULT_PRICE_LOOKUP_KEY], limit: 1 });
    if (!prices.data.length) throw new Error("Vault price not found");

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      ui_mode: "embedded_page",
      return_url: data.returnUrl,
      line_items: [{ price: prices.data[0].id, quantity: 1 }],
      ...(data.customerEmail && { customer_email: data.customerEmail }),
      metadata: { product: "readiness_vault", packet_id: data.packetId },
      subscription_data: { metadata: { product: "readiness_vault", packet_id: data.packetId } },
    } satisfies Stripe.Checkout.SessionCreateParams);

    return session.client_secret;
  });

// ---------- Generate all 8 PDFs and stage them in the vault ----------
export const generatePacketPDFs = createServerFn({ method: "POST" })
  .inputValidator((data: { packetId: string }) => {
    if (!data.packetId) throw new Error("Invalid packetId");
    return data;
  })
  .handler(async ({ data }) => {
    const { data: row } = await supabaseAdmin
      .from("readiness_packets" as never)
      .select("id,language,form_answers,designated_recipient,status")
      .eq("id", data.packetId)
      .maybeSingle();
    if (!row) throw new Error("Packet not found");
    const p = row as {
      id: string;
      language: Lang;
      form_answers: Record<string, unknown> | null;
      designated_recipient: { name?: string; email?: string; phone?: string; relationship?: string } | null;
      status: string;
    };
    if (!p.form_answers) throw new Error("Form answers missing");

    const docs = await generateAllDocs(p.form_answers, (p.language as Lang) || "en", p.designated_recipient ?? {});
    const paths: string[] = [];
    for (const doc of docs) {
      const encrypted = await encryptForVault(p.id, doc.bytes);
      const path = `${p.id}/generated/${doc.filename}.enc`;
      const { error } = await supabaseAdmin.storage
        .from(VAULT_BUCKET_NAME)
        .upload(path, encrypted, { contentType: "application/octet-stream", upsert: true });
      if (error) throw new Error(error.message);
      paths.push(path);
    }

    // Generate signing token + 14d expiry so the customer can access the docs.
    const signingToken = crypto.randomUUID();
    const expires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    await supabaseAdmin
      .from("readiness_packets" as never)
      .update({
        generated_pdf_paths: paths,
        vault_storage_paths: paths, // initial vault contents = generated PDFs
        signing_token: signingToken,
        signing_token_expires_at: expires,
        status: "ready_to_sign",
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", p.id);

    return { ok: true as const, signingToken, count: paths.length };
  });

// ---------- Send packet to designated family member NOW (not after emergency) ----------
export const sendPacketNow = createServerFn({ method: "POST" })
  .inputValidator((data: { packetId: string; recipientEmail?: string }) => {
    if (!data.packetId) throw new Error("Invalid packetId");
    return data;
  })
  .handler(async ({ data }) => {
    const { data: row } = await supabaseAdmin
      .from("readiness_packets" as never)
      .select("id,language,designated_recipient,vault_storage_paths,status")
      .eq("id", data.packetId)
      .maybeSingle();
    if (!row) throw new Error("Packet not found");
    const p = row as {
      id: string;
      language: string;
      designated_recipient: { name?: string; email?: string } | null;
      vault_storage_paths: string[] | null;
      status: string;
    };
    const email = data.recipientEmail || p.designated_recipient?.email;
    if (!email) throw new Error("No recipient email");
    if (!p.vault_storage_paths?.length) throw new Error("No documents generated yet");

    const messageId = await sendPacketToRecipient({
      packetId: p.id,
      recipientEmail: email,
      recipientName: p.designated_recipient?.name ?? "your family member",
      language: p.language,
      vaultPaths: p.vault_storage_paths,
      mode: "send_now",
    });

    await supabaseAdmin
      .from("readiness_packets" as never)
      .update({
        recipient_sent_at: new Date().toISOString(),
        recipient_sent_message_id: messageId,
        delivery_mode: p.status === "vaulted" ? "send_now_and_vault" : "send_now",
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", p.id);

    return { ok: true as const, deliveredTo: email };
  });

// ---------- Mark packet as vaulted-only (after $5/mo subscription) ----------
export const markPacketVaulted = createServerFn({ method: "POST" })
  .inputValidator((data: { packetId: string; subscriptionId?: string }) => {
    if (!data.packetId) throw new Error("Invalid packetId");
    return data;
  })
  .handler(async ({ data }) => {
    await supabaseAdmin
      .from("readiness_packets" as never)
      .update({
        delivery_mode: "vault_until_emergency",
        vault_subscription_id: data.subscriptionId ?? null,
        status: "vaulted",
        vaulted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", data.packetId);
    return { ok: true as const };
  });
