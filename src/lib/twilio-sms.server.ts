// Server-only Twilio SMS sender (via Lovable connector gateway).
// Call only from server functions / server routes.

import { supabaseAdmin } from "@/integrations/supabase/client.server";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

export interface SendSmsArgs {
  to: string;            // E.164, e.g. +15551234567
  body: string;
  purpose: string;       // e.g. "sos_alert" | "sos_cancel"
  metadata?: Record<string, unknown>;
}

export interface SendSmsResult {
  ok: boolean;
  sid?: string;
  error?: string;
}

function normalizeE164(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Already E.164
  if (/^\+[1-9]\d{6,14}$/.test(trimmed)) return trimmed;
  // 10-digit US — assume +1
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export async function sendSms(args: SendSmsArgs): Promise<SendSmsResult> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const twilioKey = process.env.TWILIO_API_KEY;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!lovableKey || !twilioKey || !fromNumber) {
    const error = "Twilio not configured (missing LOVABLE_API_KEY, TWILIO_API_KEY, or TWILIO_FROM_NUMBER)";
    console.error("[twilio-sms]", error);
    await logSms({ ...args, status: "error", error });
    return { ok: false, error };
  }

  const to = normalizeE164(args.to);
  if (!to) {
    const error = `Invalid phone number: ${args.to}`;
    await logSms({ ...args, status: "error", error });
    return { ok: false, error };
  }

  try {
    const resp = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": twilioKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        From: fromNumber,
        Body: args.body,
      }),
    });
    const data = (await resp.json().catch(() => ({}))) as { sid?: string; message?: string; code?: number };
    if (!resp.ok) {
      const error = `Twilio ${resp.status}: ${data.message ?? "unknown"} (code ${data.code ?? "n/a"})`;
      console.error("[twilio-sms] send failed", error);
      await logSms({ ...args, to, status: "error", error });
      return { ok: false, error };
    }
    await logSms({ ...args, to, status: "sent", sid: data.sid });
    return { ok: true, sid: data.sid };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    console.error("[twilio-sms] exception", error);
    await logSms({ ...args, to, status: "error", error });
    return { ok: false, error };
  }
}

async function logSms(opts: {
  to: string;
  body: string;
  purpose: string;
  status: string;
  sid?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await supabaseAdmin.from("sms_send_log" as never).insert({
      recipient_phone: opts.to,
      purpose: opts.purpose,
      body_preview: opts.body.slice(0, 200),
      status: opts.status,
      twilio_sid: opts.sid ?? null,
      error_message: opts.error ?? null,
      metadata: opts.metadata ?? {},
    } as never);
  } catch (e) {
    console.error("[twilio-sms] log insert failed", e);
  }
}

/**
 * Send an SOS SMS fan-out to every contact for the given activation token.
 * Looks up contacts directly from client_contacts where notify_on_sos = true.
 * Returns counts; never throws.
 */
export async function sendSosSmsToContacts(opts: {
  token: string;         // 8-char invite_token
  clientName: string | null;
  kind: "alert" | "cancel";
  mapsUrl?: string | null;
  activationId?: string | null;
}): Promise<{ sent: number; failed: number; skipped: number }> {
  const norm = opts.token.trim().toUpperCase();
  if (!/^[A-Z0-9]{8}$/.test(norm)) return { sent: 0, failed: 0, skipped: 0 };

  // Resolve client
  const { data: client } = await supabaseAdmin
    .from("app_clients" as never)
    .select("id, full_name, phone_e164")
    .eq("invite_token", norm)
    .maybeSingle();
  if (!client) return { sent: 0, failed: 0, skipped: 0 };
  const c = client as { id: string; full_name: string | null; phone_e164: string | null };

  const { data: contacts } = await supabaseAdmin
    .from("client_contacts" as never)
    .select("name, phone_e164, notify_on_sos")
    .eq("client_id", c.id);

  const list = (contacts ?? []) as Array<{
    name: string | null;
    phone_e164: string | null;
    notify_on_sos: boolean | null;
  }>;

  const clientName = opts.clientName ?? c.full_name ?? "Your contact";
  const body =
    opts.kind === "alert"
      ? `ALERT: ${clientName} has triggered their DetencionDefensa emergency app and may have been detained by ICE or police. Their attorney and family have been notified.${opts.mapsUrl ? ` Location: ${opts.mapsUrl}` : ""} — DetencionDefensa`
      : `UPDATE: ${clientName} has cancelled the earlier DetencionDefensa emergency alert. This was a false alarm — no action needed. — DetencionDefensa`;

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const contact of list) {
    if (!contact.notify_on_sos) { skipped++; continue; }
    if (!contact.phone_e164) { skipped++; continue; }
    const result = await sendSms({
      to: contact.phone_e164,
      body,
      purpose: `sos_${opts.kind}`,
      metadata: {
        client_id: c.id,
        activation_id: opts.activationId ?? null,
        contact_name: contact.name,
        token: norm,
      },
    });
    if (result.ok) sent++; else failed++;
  }

  return { sent, failed, skipped };
}
