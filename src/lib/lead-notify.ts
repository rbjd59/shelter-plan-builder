// Shared lead-notification setting and message builder (pure; safe for tests).

/** The one inbox that is emailed whenever a public form creates a lead. */
export const LEAD_NOTIFY_EMAIL = "info@detenciondefensa.com";

export const STAFF_LEADS_URL = "https://www.detenciondefensa.com/admin/leads";

export type LeadNotice = {
  source: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  need?: string | null;
  city?: string | null;
  bestTime?: string | null;
  language: string;
};

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Builds the notification using only what the visitor typed. */
export function buildLeadNotification(l: LeadNotice) {
  const need = l.need?.trim() || "—";
  const rows: [string, string][] = [
    ["Name", l.fullName],
    ["Phone", l.phone || "—"],
    ["Email", l.email || "—"],
    ["Trade / need", need],
    ["City", l.city || "—"],
    ["Preferred call time", l.bestTime || "—"],
    ["Language", l.language.toUpperCase()],
  ];
  const subject = `New lead: ${l.source} - ${need}`.replace(/[\r\n]+/g, " ").slice(0, 200);
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nStaff leads page: ${STAFF_LEADS_URL}`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:560px;padding:16px;color:#111;">
<h2 style="margin:0 0 12px;">New lead</h2>
<table style="font-size:14px;border-collapse:collapse;">${rows
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#555;">${esc(k)}</td><td style="padding:4px 0;"><strong>${esc(v)}</strong></td></tr>`)
    .join("")}</table>
<p style="margin:16px 0 0;"><a href="${STAFF_LEADS_URL}">Open the staff leads page</a></p></div>`;
  return { to: LEAD_NOTIFY_EMAIL, subject, text, html };
}
