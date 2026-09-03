// Server-only: lead capture + routing notifications.
//
// Compliance note: a lead is NOT a client. Nothing here creates an
// attorney-client relationship. The Company captures the inquiry as the
// Firm's disclosed intake agent and routes it to the Firm for review.

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendManagedEmail } from "@/lib/email/managed-send.server";

const FROM = "info@gohomesooner.com";
const SENDER_DOMAIN = "notify.gohomesooner.com";

// Sign-ups / inquiries go to info@. Legal review traffic goes to legal@.
const COMPANY_INBOX = "info@detenciondefensa.com";
const FIRM_INBOX = "legal@detenciondefensa.com";

export type LeadInput = {
  fullName: string;
  email?: string | null;
  phone?: string | null;
  language: string;
  city?: string | null;
  need?: string | null;
  message?: string | null;
  source?: string | null;
};

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function enqueue(to: string, subject: string, html: string, text: string, label: string) {
  const messageId = crypto.randomUUID();
  const result = await sendManagedEmail({
    to,
    from: FROM,
    sender_domain: SENDER_DOMAIN,
    subject,
    html,
    text,
    label,
    idempotency_key: `${label}-${messageId}`,
    message_id: messageId,
  });
  if (!result.sent && result.reason === "failed") {
    console.error("lead email send failed", { label, error: result.error });
  }
}


/** Inserts the lead, then notifies the Company inbox and the Firm inbox. */
export async function createLead(input: LeadInput): Promise<{ id: string }> {
  const row = {
    full_name: input.fullName.trim(),
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    language: input.language || "es",
    city: input.city?.trim() || null,
    need: input.need?.trim() || null,
    message: input.message?.trim() || null,
    source: input.source?.trim() || "website",
    status: "new",
  };

  const { data, error } = await supabaseAdmin
    .from("leads" as never)
    .insert(row as never)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  const id = (data as { id: string }).id;

  const lines = [
    ["Name", row.full_name],
    ["Email", row.email ?? "—"],
    ["Phone", row.phone ?? "—"],
    ["Language", row.language],
    ["City", row.city ?? "—"],
    ["Needs", row.need ?? "—"],
    ["Source", row.source],
    ["Lead ID", id],
  ];
  const html =
    `<h2 style="font-family:system-ui">New inquiry — DetencionDefensa.com</h2><table style="font-family:system-ui;font-size:14px">` +
    lines.map(([k, v]) => `<tr><td><strong>${esc(k)}</strong></td><td style="padding-left:12px">${esc(v)}</td></tr>`).join("") +
    `</table><p style="font-family:system-ui;font-size:14px;white-space:pre-wrap">${esc(row.message ?? "")}</p>` +
    `<p style="font-family:system-ui;font-size:12px;color:#666">This is an inquiry only. No attorney-client relationship is formed until Sorrentino Law Firm PLLC accepts the matter in writing.</p>`;
  const text = lines.map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\n${row.message ?? ""}`;

  await enqueue(COMPANY_INBOX, `New lead — ${row.full_name}`, html, text, "lead-company");
  await enqueue(FIRM_INBOX, `New lead for firm review — ${row.full_name}`, html, text, "lead-firm");

  await supabaseAdmin
    .from("leads" as never)
    .update({ status: "routed", routed_to: "firm", routed_at: new Date().toISOString() } as never)
    .eq("id", id);

  return { id };
}
