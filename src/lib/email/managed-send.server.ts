// Server-only: sends a pre-rendered email synchronously through Lovable's
// managed email API and records the outcome in the app's `email_send_log`
// table (kept for the admin delivery log). Delivery, retries, rate limits,
// suppression and unsubscribe handling are Lovable's responsibility — there
// is no queue in this project any more.
//
// This is the transport used by the project's hand-rendered senders (SOS
// alerts, activation emails, intake notifications, ...). Registry-based
// templates should keep using `sendTemplateEmail` from
// `@/lib/email-templates/send-email`.

import { EmailAPIError, sendLovableEmail } from "@lovable.dev/email-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface ManagedEmailPayload {
  to: string;
  from: string;
  sender_domain: string;
  subject: string;
  html: string;
  text: string;
  /** Used as the `label` sent to Lovable and as `template_name` in the log. */
  label: string;
  idempotency_key: string;
  /** Optional app-side correlation id, stored on the log row. */
  message_id?: string;
  reply_to?: string;
}

export type ManagedEmailResult =
  | { sent: true }
  | { sent: false; reason: "recipient_suppressed" }
  | { sent: false; reason: "failed"; error: string };

async function logSend(row: {
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: "sent" | "suppressed" | "failed";
  error_message?: string | null;
}): Promise<void> {
  const { error } = await supabaseAdmin.from("email_send_log" as never).insert(row as never);
  if (error) {
    console.error("email_send_log insert failed", {
      code: error.code,
      message: error.message,
      template_name: row.template_name,
      status: row.status,
    });
  }
}

/**
 * Sends one email. Never throws: the result tells the caller whether it was
 * sent, suppressed by Lovable (bounce/complaint/unsubscribe — expected, not
 * an error), or failed for any other reason. The outcome is appended to
 * `email_send_log` with the legacy status strings ('sent' | 'suppressed' |
 * 'failed') so the admin delivery log keeps working.
 */
export async function sendManagedEmail(payload: ManagedEmailPayload): Promise<ManagedEmailResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  const messageId = payload.message_id ?? crypto.randomUUID();

  if (!apiKey) {
    const msg = "LOVABLE_API_KEY is not configured";
    console.error("sendManagedEmail:", msg, { label: payload.label });
    await logSend({
      message_id: messageId,
      template_name: payload.label,
      recipient_email: payload.to,
      status: "failed",
      error_message: msg,
    });
    return { sent: false, reason: "failed", error: msg };
  }

  try {
    await sendLovableEmail(
      {
        to: payload.to,
        from: payload.from,
        sender_domain: payload.sender_domain,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        purpose: "transactional",
        label: payload.label,
        idempotency_key: payload.idempotency_key,
        reply_to: payload.reply_to,
      },
      { apiKey, sendUrl: process.env["LOVABLE_SEND_URL"] },
    );
  } catch (error) {
    if (error instanceof EmailAPIError && error.code === "recipient_suppressed") {
      await logSend({
        message_id: messageId,
        template_name: payload.label,
        recipient_email: payload.to,
        status: "suppressed",
      });
      return { sent: false, reason: "recipient_suppressed" };
    }
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Managed email send failed", {
      label: payload.label,
      status: error instanceof EmailAPIError ? error.status : undefined,
      code: error instanceof EmailAPIError ? error.code : undefined,
      error: errorMsg,
    });
    await logSend({
      message_id: messageId,
      template_name: payload.label,
      recipient_email: payload.to,
      status: "failed",
      error_message: errorMsg.slice(0, 1000),
    });
    return { sent: false, reason: "failed", error: errorMsg };
  }

  await logSend({
    message_id: messageId,
    template_name: payload.label,
    recipient_email: payload.to,
    status: "sent",
  });
  return { sent: true };
}
