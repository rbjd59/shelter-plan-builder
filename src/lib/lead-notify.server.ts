// Server-only: emails LEAD_NOTIFY_EMAIL about a new lead; sendManagedEmail logs it in email_send_log.
import { sendManagedEmail } from "@/lib/email/managed-send.server";
import { buildLeadNotification, type LeadNotice } from "./lead-notify";

export async function notifyNewLead(leadId: string, lead: LeadNotice): Promise<boolean> {
  const msg = buildLeadNotification(lead);
  const result = await sendManagedEmail({
    to: msg.to,
    from: "info@gohomesooner.com",
    sender_domain: "notify.gohomesooner.com",
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
    label: "lead-notify",
    idempotency_key: `lead-notify-${leadId}`,
    message_id: `lead-notify-${leadId}`,
  });
  if (!result.sent) console.error("lead notification not sent", { leadId, result });
  return result.sent;
}
