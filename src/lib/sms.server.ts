/**
 * Twilio SMS helper — server-only.
 *
 * Uses the Lovable connector gateway so no Twilio SDK is needed.
 * Logs every send to `sms_send_log` for the admin dashboard.
 */
import { createClient } from "@supabase/supabase-js";
import { normalizeEmailLanguage } from "@/lib/email-language";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";

interface SendSmsParams {
  to: string; // E.164, e.g. "+15558675310"
  body: string;
  purpose: string; // "activation", "sos-confirm", etc.
  metadata?: Record<string, unknown>;
}

export async function sendSms(params: SendSmsParams): Promise<{
  ok: boolean;
  sid?: string;
  error?: string;
}> {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Log pending first so failures still leave a trail
  const { data: logRow } = await supabase
    .from("sms_send_log")
    .insert({
      recipient_phone: params.to,
      purpose: params.purpose,
      body_preview: params.body.slice(0, 160),
      status: "pending",
      metadata: params.metadata ?? {},
    })
    .select("id")
    .single();

  const lovableKey = process.env.LOVABLE_API_KEY;
  const twilioKey = process.env.TWILIO_API_KEY;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!lovableKey || !twilioKey || !fromNumber) {
    const error = "Twilio not configured (missing LOVABLE_API_KEY, TWILIO_API_KEY, or TWILIO_FROM_NUMBER)";
    if (logRow?.id) {
      await supabase
        .from("sms_send_log")
        .update({ status: "failed", error_message: error })
        .eq("id", logRow.id);
    }
    return { ok: false, error };
  }

  try {
    const res = await fetch(`${GATEWAY_URL}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": twilioKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: params.to,
        From: fromNumber,
        Body: params.body,
      }),
    });
    const data = (await res.json()) as { sid?: string; message?: string };

    if (!res.ok) {
      const err = `Twilio ${res.status}: ${data.message ?? JSON.stringify(data)}`;
      if (logRow?.id) {
        await supabase
          .from("sms_send_log")
          .update({ status: "failed", error_message: err })
          .eq("id", logRow.id);
      }
      return { ok: false, error: err };
    }

    if (logRow?.id) {
      await supabase
        .from("sms_send_log")
        .update({ status: "sent", twilio_sid: data.sid ?? null })
        .eq("id", logRow.id);
    }
    return { ok: true, sid: data.sid };
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    if (logRow?.id) {
      await supabase
        .from("sms_send_log")
        .update({ status: "failed", error_message: err })
        .eq("id", logRow.id);
    }
    return { ok: false, error: err };
  }
}

const ACTIVATION_BODY: Record<string, (code: string) => string> = {
  en: (c) =>
    `DetencionDefensa: your code is ${c}. Tap to install the app: https://detenciondefensa.com/get-app`,
  es: (c) =>
    `DetencionDefensa: su codigo es ${c}. Toque para instalar la app: https://detenciondefensa.com/get-app`,
  ht: (c) =>
    `DetencionDefensa: kòd ou se ${c}. Peze pou enstale aplikasyon an: https://detenciondefensa.com/get-app`,
};

export function activationSmsBody(code: string, language: string): string {
  const fn = ACTIVATION_BODY[normalizeEmailLanguage(language)];
  return fn(code);
}
