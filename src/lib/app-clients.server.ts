/**
 * Mobile-app client provisioning — server-only.
 *
 * Called after a paid customer completes intake. Generates an 8-char
 * activation code, mirrors the intake answers into app_clients /
 * client_contacts, queues the activation email, and fires the SMS.
 */
import { render } from "@react-email/components";
import * as React from "react";
import { createClient } from "@supabase/supabase-js";
import { TEMPLATES } from "@/lib/email-templates/registry";
import { activationSmsBody, sendSms } from "@/lib/sms.server";

const SITE_NAME = "DetencionDefensa";
const SENDER_DOMAIN = "notify.gohomesooner.com";
const FROM_DOMAIN = "notify.gohomesooner.com";

// Avoid 0/O/1/I to prevent transcription errors
const TOKEN_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateToken(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => TOKEN_ALPHABET[b % TOKEN_ALPHABET.length])
    .join("");
}

function generateHex(len = 32): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function admin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

interface ProvisionParams {
  intakeSessionId: string;
  language: string;
  answers: Record<string, unknown>;
}

export async function provisionAppClient(params: ProvisionParams): Promise<{
  ok: boolean;
  clientId?: string;
  code?: string;
  error?: string;
}> {
  const sb = admin();
  const a = params.answers;

  // Pull contact info from intake answers (best-effort)
  const fullName =
    (typeof a.client_full_name === "string" && a.client_full_name) ||
    (typeof a.full_name === "string" && a.full_name) ||
    (typeof a.contact_name === "string" && a.contact_name) ||
    null;
  const email =
    (typeof a.contact_email === "string" && a.contact_email) ||
    (typeof a.email === "string" && a.email) ||
    null;
  const phone =
    (typeof a.contact_phone === "string" && a.contact_phone) ||
    (typeof a.phone === "string" && a.phone) ||
    null;

  // Generate token with retry on collision
  let code = generateToken();
  let inserted: { id: string } | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await sb
      .from("app_clients")
      .insert({
        intake_session_id: params.intakeSessionId,
        invite_token: code,
        full_name: fullName,
        email,
        phone_e164: phone,
        language: params.language,
      })
      .select("id")
      .single();

    if (!error && data) {
      inserted = data as { id: string };
      break;
    }
    // Unique violation on invite_token → re-roll; on intake_session_id → already provisioned
    if (error?.code === "23505" && error.message.includes("invite_token")) {
      code = generateToken();
      continue;
    }
    if (error?.code === "23505" && error.message.includes("intake_session_id")) {
      // Already provisioned — fetch existing
      const { data: existing } = await sb
        .from("app_clients")
        .select("id, invite_token")
        .eq("intake_session_id", params.intakeSessionId)
        .maybeSingle();
      if (existing) {
        return {
          ok: true,
          clientId: (existing as any).id,
          code: (existing as any).invite_token,
        };
      }
    }
    return { ok: false, error: error?.message ?? "insert failed" };
  }

  if (!inserted) return { ok: false, error: "could not allocate activation code" };
  const clientId = inserted.id;

  // Mirror emergency contacts from intake answers (sections 6 + 7)
  const contactsToInsert: Array<Record<string, any>> = [];
  const addContact = (
    name: unknown,
    phone: unknown,
    email: unknown,
    relationship: string,
    priority: number,
  ) => {
    if (typeof name === "string" && name.trim()) {
      contactsToInsert.push({
        client_id: clientId,
        name: name.trim(),
        phone_e164: typeof phone === "string" ? phone : null,
        email: typeof email === "string" ? email : null,
        relationship,
        priority,
        notify_on_sos: true,
      });
    }
  };
  addContact(a.emergency_contact_name, a.emergency_contact_phone, a.emergency_contact_email, "emergency", 1);
  addContact(a.family_contact_name, a.family_contact_phone, a.family_contact_email, "family", 2);

  if (contactsToInsert.length) {
    await sb.from("client_contacts").insert(contactsToInsert);
  }

  // Seed a welcome/summary document so the app shows something on first open
  await sb.from("client_documents").insert({
    client_id: clientId,
    title: "Welcome to DetencionDefensa",
    content:
      "Your defense file has been received and is being prepared. Documents will appear here as your attorney review is completed.",
    document_type: "summary",
    send_on_alert: false,
  });

  // Send activation email
  try {
    await sendActivationEmail({
      to: email,
      code,
      language: params.language,
      fullName: fullName ?? "",
    });
  } catch (e) {
    console.error("activation email failed", e);
  }

  // Send activation SMS
  if (phone) {
    try {
      await sendSms({
        to: phone,
        body: activationSmsBody(code, params.language),
        purpose: "activation",
        metadata: { client_id: clientId },
      });
    } catch (e) {
      console.error("activation SMS failed", e);
    }
  }

  return { ok: true, clientId, code };
}

async function sendActivationEmail(params: {
  to: string | null;
  code: string;
  language: string;
  fullName: string;
}) {
  if (!params.to) return;
  const sb = admin();

  const template = TEMPLATES["app-activation"];
  if (!template) throw new Error("app-activation template not registered");

  const apkUrl = process.env.APK_URL || null;
  const testflightUrl = process.env.TESTFLIGHT_URL || null;

  const templateData = {
    code: params.code,
    language: params.language,
    fullName: params.fullName,
    apkUrl,
    testflightUrl,
  };

  const element = React.createElement(template.component, templateData);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject =
    typeof template.subject === "function"
      ? template.subject(templateData)
      : template.subject;

  const messageId = crypto.randomUUID();
  const idempotencyKey = `app-activation-${params.code}`;
  const normalizedEmail = params.to.toLowerCase();

  // Unsubscribe token
  const { data: existing } = await sb
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalizedEmail)
    .maybeSingle();
  let unsubscribeToken: string;
  if (existing && !(existing as any).used_at) {
    unsubscribeToken = (existing as any).token;
  } else {
    unsubscribeToken = generateHex(32);
    await sb
      .from("email_unsubscribe_tokens")
      .upsert(
        { token: unsubscribeToken, email: normalizedEmail },
        { onConflict: "email", ignoreDuplicates: true },
      );
  }

  await sb.from("email_send_log").insert({
    message_id: messageId,
    template_name: "app-activation",
    recipient_email: params.to,
    status: "pending",
  });

  await sb.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: params.to,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: "transactional",
      label: "app-activation",
      idempotency_key: idempotencyKey,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  });
}

export async function resendActivation(clientId: string): Promise<{
  ok: boolean;
  error?: string;
}> {
  const sb = admin();
  const { data, error } = await sb
    .from("app_clients")
    .select("invite_token, email, phone_e164, language, full_name")
    .eq("id", clientId)
    .maybeSingle();

  if (error || !data) return { ok: false, error: error?.message ?? "not found" };
  const c = data as any;

  try {
    await sendActivationEmail({
      to: c.email,
      code: c.invite_token,
      language: c.language,
      fullName: c.full_name ?? "",
    });
  } catch (e) {
    console.error(e);
  }
  if (c.phone_e164) {
    try {
      await sendSms({
        to: c.phone_e164,
        body: activationSmsBody(c.invite_token, c.language),
        purpose: "activation-resend",
        metadata: { client_id: clientId },
      });
    } catch (e) {
      console.error(e);
    }
  }
  return { ok: true };
}
