/**
 * Locate desk → attorney handoff.
 *
 * When a client triggers, the alerts desk (alerts@detenciondefensa.com) locates
 * the person. Whatever they find — facility, address, warden, A-number, arrest
 * date — is recorded here against the client and emailed to the attorney board
 * inbox so the attorney can prepare and mail the pro se filings to the person
 * at that facility.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const FROM = "alerts@notify.gohomesooner.com";
const SENDER_DOMAIN = "notify.gohomesooner.com";
const ATTORNEY_INBOX = "legal@detenciondefensa.com";

export interface DetentionInput {
  clientId: string;
  facility_name?: string | null;
  facility_address?: string | null;
  warden_name?: string | null;
  arrest_date?: string | null;
  a_number?: string | null;
  federal_id?: string | null;
  notes?: string | null;
  located_by?: string | null;
}

const clean = (v: string | null | undefined) => {
  const s = (v ?? "").trim();
  return s.length > 0 ? s : null;
};

const esc = (v: string | null) =>
  (v ?? "—").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Upserts the detention/location record for a client and emails the attorney
 * board with the full locate packet.
 */
export async function saveDetentionInfoAndNotifyAttorney(input: DetentionInput) {
  const row = {
    client_id: input.clientId,
    facility_name: clean(input.facility_name),
    facility_address: clean(input.facility_address),
    warden_name: clean(input.warden_name),
    arrest_date: clean(input.arrest_date),
    a_number: clean(input.a_number),
    federal_id: clean(input.federal_id),
    notes: clean(input.notes),
    located_at: new Date().toISOString(),
    located_by: clean(input.located_by) ?? "company-board",
  };

  const { data: existing } = await supabaseAdmin
    .from("client_detention_info")
    .select("id")
    .eq("client_id", input.clientId)
    .maybeSingle();

  let recordId: string;
  if (existing) {
    recordId = (existing as { id: string }).id;
    const { error } = await supabaseAdmin
      .from("client_detention_info")
      .update(row as never)
      .eq("id", recordId);
    if (error) throw new Error(error.message);
  } else {
    const { data: inserted, error } = await supabaseAdmin
      .from("client_detention_info")
      .insert(row as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    recordId = (inserted as { id: string }).id;
  }

  // Rebuild every legal form with the real facility/warden/address data so no
  // placeholders survive. The attorney board reads review_status from here.
  let formsResult: { regenerated: string[]; failed: string[]; ready: boolean } = {
    regenerated: [],
    failed: [],
    ready: false,
  };
  try {
    const { regenerateClientForms } = await import("@/lib/forms-regenerate.server");
    formsResult = await regenerateClientForms(input.clientId);
  } catch (e) {
    console.error("form regeneration after locate failed", e);
  }

  const { data: client } = await supabaseAdmin
    .from("app_clients")
    .select(
      "invite_token, full_name, a_number, date_of_birth, place_of_birth, country_of_origin, language, phone_e164, email",
    )
    .eq("id", input.clientId)
    .maybeSingle();

  const c = (client ?? {}) as Record<string, string | null>;
  const code = c["invite_token"] ?? "—";
  const subject = formsResult.ready
    ? `LOCATED — forms completed and ready for review: ${code} — ${c["full_name"] ?? "client"}`
    : `LOCATED: ${code} — ${c["full_name"] ?? "client"} found at ${row.facility_name ?? "facility TBD"}`;


  const line = (label: string, value: string | null) =>
    `<p style="margin:4px 0;"><strong>${label}:</strong> ${esc(value)}</p>`;

  const html =
    `<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:16px;color:#111;">` +
    `<h2 style="color:#b91c1c;margin:0 0 12px;">Client located — prepare pro se filings</h2>` +
    `<div style="background:#fef2f2;border-left:4px solid #b91c1c;padding:12px;margin:12px 0;">` +
    line("Activation code", code) +
    line("Name", c["full_name"] ?? null) +
    line("A-number", row.a_number ?? c["a_number"] ?? null) +
    line("Date of birth", c["date_of_birth"] ?? null) +
    line("Place of birth", c["place_of_birth"] ?? null) +
    line("Country of origin", c["country_of_origin"] ?? null) +
    line("Language", c["language"] ?? null) +
    line("Phone", c["phone_e164"] ?? null) +
    `</div>` +
    `<div style="background:#f8fafc;border-left:4px solid #334155;padding:12px;margin:12px 0;">` +
    `<p style="margin:0 0 6px;font-weight:bold;">Present location (entered by the locate desk)</p>` +
    line("Facility", row.facility_name) +
    line("Mailing address", row.facility_address) +
    line("Warden / officer in charge", row.warden_name) +
    line("Date of arrest", row.arrest_date) +
    line("Federal / booking ID", row.federal_id) +
    line("Notes", row.notes) +
    `</div>` +
    (formsResult.ready
      ? `<div style="background:#ecfdf5;border-left:4px solid #047857;padding:12px;margin:12px 0;">` +
        `<p style="margin:0;font-weight:bold;color:#065f46;">Forms completed — ready for review and mailing</p>` +
        `<p style="margin:6px 0 0;font-size:13px;">${formsResult.regenerated.length} form(s) rebuilt with the facility, address, warden and A-number above. No placeholders remain.</p>` +
        `</div>`
      : `<div style="background:#fffbeb;border-left:4px solid #b45309;padding:12px;margin:12px 0;">` +
        `<p style="margin:0;font-weight:bold;color:#92400e;">Forms updated — still incomplete</p>` +
        `<p style="margin:6px 0 0;font-size:13px;">Facility name, mailing address and warden are all required before the packet is mailable.</p>` +
        `</div>`) +
    `<p style="font-size:13px;">Open the client file: ` +
    `<a href="https://detenciondefensa.com/attorney-board">attorney board</a>. ` +
    `Mail the completed packet to the person at the facility address above as a pro se litigant.</p>` +
    `</div>`;

  const text =
    `LOCATED: ${code} — ${c["full_name"] ?? "client"}\n` +
    `A-number: ${row.a_number ?? c["a_number"] ?? "—"}\n` +
    `DOB: ${c["date_of_birth"] ?? "—"}\n` +
    `Country of origin: ${c["country_of_origin"] ?? "—"}\n` +
    `Facility: ${row.facility_name ?? "—"}\n` +
    `Address: ${row.facility_address ?? "—"}\n` +
    `Warden: ${row.warden_name ?? "—"}\n` +
    `Arrest date: ${row.arrest_date ?? "—"}\n` +
    `Notes: ${row.notes ?? "—"}\n` +
    (formsResult.ready
      ? `\nForms completed — ready for review and mailing (${formsResult.regenerated.join(", ")}).\n`
      : `\nForms updated but incomplete — facility, address and warden are all required.\n`);


  const messageId = `locate_${recordId}_${Date.now()}`;
  const mailResult = await sendManagedEmail({
    to: ATTORNEY_INBOX,
    from: FROM,
    sender_domain: SENDER_DOMAIN,
    subject,
    html,
    text,
    label: "locate_handoff",
    idempotency_key: messageId,
    message_id: messageId,
  });
  if (!mailResult.sent && mailResult.reason === "failed") {
    console.error("locate handoff send failed", mailResult.error);
  }

  return { ok: true, id: recordId, sent_to: ATTORNEY_INBOX, forms: formsResult };
}
