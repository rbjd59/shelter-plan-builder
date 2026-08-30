/**
 * CENTRAL NOTIFICATION FAN-OUT — server only.
 *
 * The phone app does exactly two things: it tells us an activation succeeded,
 * and it tells us a trigger fired (or was cancelled). Every email and SMS that
 * results from those events is sent from here. Nothing is sent by the app.
 *
 * Events:
 *   activation → contacts (email+SMS), company email, company SMS,
 *                Sorrentino email + SMS. Forms go to Sorrentino ONLY.
 *   trigger    → contacts (email+SMS), Sorrentino (email+SMS), company
 *                (email+SMS, with GPS), boards updated.
 *   cancel     → same list, "false alarm" wording.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendSms, normalizeE164 } from "@/lib/twilio-sms.server";

const FROM = "DetencionDefensa <alerts@notify.gohomesooner.com>";
const SENDER_DOMAIN = "notify.gohomesooner.com";

export const COMPANY_EMAIL = "info@detenciondefensa.com";
export const COMPANY_ALERTS_EMAIL = "alerts@detenciondefensa.com";
export const ATTORNEY_EMAIL = "intake@sorrentinolawfirm.com";
export const ATTORNEY_BOARD_EMAIL = "legal@detenciondefensa.com";

const COMPANY_PHONE = process.env.ADMIN_ALERT_PHONE || "+13053377713";
// Callback number printed in every contact message. NOTE: 534-202-6852 has no
// Live voice line answered by the company's assistant. Confirmed by the owner:
// this number is for calls only and must NEVER be used as an SMS destination.
const CALLBACK_NUMBER = process.env.CONTACT_CALLBACK_NUMBER || "534-202-6852";


const ATTORNEY_PHONE = process.env.ATTORNEY_ALERT_PHONE || null;

const ATTORNEY_BOARD_URL = "https://detenciondefensa.com/attorney-board";
const COMPANY_BOARD_URL = "https://detenciondefensa.com/company-board";

function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrap(title: string, bodyHtml: string): string {
  return (
    `<div style="font:14px/1.55 Arial,sans-serif;color:#111;max-width:640px;margin:0 auto;padding:16px">` +
    `<h2 style="margin:0 0 12px;color:#b91c1c">${esc(title)}</h2>${bodyHtml}</div>`
  );
}

async function unsubscribeToken(email: string): Promise<string> {
  const { data } = await supabaseAdmin
    .from("email_unsubscribe_tokens" as never)
    .select("token")
    .eq("email", email)
    .maybeSingle();
  const existing = (data as { token?: string } | null)?.token;
  if (existing) return existing;
  const token = crypto.randomUUID();
  await supabaseAdmin
    .from("email_unsubscribe_tokens" as never)
    .insert({ email, token } as never);
  return token;
}

export async function enqueueEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  label: string;
  idempotencyKey: string;
}): Promise<void> {
  const to = opts.to.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return;
  const messageId = crypto.randomUUID();
  const unsub = await unsubscribeToken(to);
  await supabaseAdmin.from("email_send_log" as never).insert({
    message_id: messageId,
    template_name: opts.label,
    recipient_email: to,
    status: "pending",
  } as never);
  const { error } = await supabaseAdmin.rpc("enqueue_email" as never, {
    queue_name: "transactional_emails",
    payload: {
      to,
      from: FROM,
      sender_domain: SENDER_DOMAIN,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      purpose: "transactional",
      label: opts.label,
      idempotency_key: opts.idempotencyKey,
      message_id: messageId,
      unsubscribe_token: unsub,
      queued_at: new Date().toISOString(),
    } as never,
  } as never);
  if (error) console.error("[fanout] enqueue failed", opts.label, error.message);
}

interface ClientRow {
  id: string;
  invite_token: string;
  full_name: string | null;
  email: string | null;
  phone_e164: string | null;
  language: string | null;
  a_number: string | null;
  activated_at: string | null;
}

interface ContactRow {
  name: string | null;
  email: string | null;
  phone_e164: string | null;
  relationship: string | null;
  notify_on_sos: boolean | null;
}

async function loadCase(token: string): Promise<{ client: ClientRow; contacts: ContactRow[] } | null> {
  const code = token.trim().toUpperCase();
  const { data } = await supabaseAdmin
    .from("app_clients")
    .select("id, invite_token, full_name, email, phone_e164, language, a_number, activated_at")
    .eq("invite_token", code)
    .maybeSingle();
  if (!data) return null;
  const client = data as unknown as ClientRow;
  const { data: contacts } = await supabaseAdmin
    .from("client_contacts")
    .select("name, email, phone_e164, relationship, notify_on_sos")
    .eq("client_id", client.id)
    .order("priority", { ascending: true });
  return { client, contacts: (contacts ?? []) as unknown as ContactRow[] };
}

/** Internal recipients get one copy each; duplicates are collapsed. */
function uniqueEmails(list: (string | null | undefined)[]): string[] {
  const out = new Set<string>();
  for (const raw of list) {
    const e = raw?.trim().toLowerCase();
    if (e && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) out.add(e);
  }
  return [...out];
}

async function smsOnce(to: string | null | undefined, body: string, purpose: string, sent: Set<string>) {
  const num = normalizeE164(to ?? null);
  if (!num || sent.has(num)) return;
  sent.add(num);
  // Cross-request guard: if the same number already got this exact purpose in
  // the last 15 minutes, the event was already fanned out (the app can post
  // the same event to more than one endpoint). Never text twice.
  try {
    const since = new Date(Date.now() - 15 * 60_000).toISOString();
    const { data: recent } = await supabaseAdmin
      .from("sms_send_log" as never)
      .select("id")
      .eq("recipient_phone", num)
      .eq("purpose", purpose)
      .eq("status", "sent")
      .gte("created_at", since)
      .limit(1);
    if ((recent ?? []).length > 0) return;
  } catch {
    /* log table unavailable — fall through and send */
  }
  await sendSms({ to: num, body, purpose });
}


// ---------------------------------------------------------------------------
// 1. ACTIVATION — the app confirms the code was entered on a phone.
// ---------------------------------------------------------------------------

export async function notifyAppActivation(
  token: string,
  opts?: { force?: boolean },
): Promise<{ ok: boolean; skipped?: string; contacts_notified?: number }> {
  const loaded = await loadCase(token);
  if (!loaded) return { ok: false, skipped: "client_not_found" };
  const { client, contacts } = loaded;

  // Idempotent: the app may retry. Only the first successful activation fans out.
  if (client.activated_at && !opts?.force) {
    return { ok: true, skipped: "already_activated" };
  }
  await supabaseAdmin
    .from("app_clients")
    .update({ activated_at: new Date().toISOString() } as never)
    .eq("id", client.id);

  const name = client.full_name || "the client";
  const code = client.invite_token;
  const key = `activation-${code}`;

  // --- Contacts: they were listed on the website; tell them what that means.
  const contactText =
    `${name} has activated an emergency protection app on his phone.\n\n` +
    `In the event he is detained, you will be notified by SMS and email. ` +
    `If he does not cancel within two hours, contact DetencionDefensa at ${CALLBACK_NUMBER}.\n\n` +
    `Nothing is required from you now. Keep this email.\n\n— DetencionDefensa`;
  const contactHtml = wrap(
    "You are an emergency contact",
    `<pre style="font:14px/1.55 Arial,sans-serif;white-space:pre-wrap;margin:0">${esc(contactText)}</pre>`,
  );
  let contactsNotified = 0;
  const smsSent = new Set<string>();
  const contactSms =
    `DetencionDefensa: ${name} has activated an emergency protection app. If he is detained you will be notified by SMS and email. ` +
    `If he does not cancel within two hours, contact DetencionDefensa at ${CALLBACK_NUMBER}.`;

  for (const c of contacts) {
    if (c.email) {
      await enqueueEmail({
        to: c.email,
        subject: `You are an emergency contact for ${name}`,
        html: contactHtml,
        text: contactText,
        label: "activation-contact-notice",
        idempotencyKey: `${key}-contact-${c.email.toLowerCase()}`,
      });
      contactsNotified++;
    }
    await smsOnce(c.phone_e164, contactSms, "activation_contact", smsSent);
  }

  // --- Company: board + email + phone.
  const internalText =
    `New activation: ${name}, code ${code}.\n\n` +
    `The app has been installed and activated on the client's phone.\n` +
    `Contacts on file: ${contacts.length}\n` +
    `Company board: ${COMPANY_BOARD_URL}\n`;
  const internalHtml = wrap(
    `New activation — ${code}`,
    `<pre style="font:14px/1.55 Arial,sans-serif;white-space:pre-wrap;margin:0">${esc(internalText)}</pre>`,
  );
  for (const to of uniqueEmails([COMPANY_EMAIL, COMPANY_ALERTS_EMAIL])) {
    await enqueueEmail({
      to,
      subject: `New activation: ${name} — code ${code}`,
      html: internalHtml,
      text: internalText,
      label: "activation-internal",
      idempotencyKey: `${key}-internal-${to}`,
    });
  }
  await smsOnce(COMPANY_PHONE, `[DD] New activation: ${name}, code ${code}.`, "activation_company", smsSent);

  // --- Sorrentino: activation notice PLUS the forms. Nobody else gets forms.
  const { data: docs } = await supabaseAdmin
    .from("client_documents")
    .select("title, document_type, from_app")
    .eq("client_id", client.id)
    .order("loaded_at", { ascending: true });
  const docList = (docs ?? []) as Array<{ title: string | null; document_type: string | null }>;
  const attorneyText =
    `New activation: ${name}, code ${code}.\n\n` +
    `Client: ${name}\nA-number: ${client.a_number ?? "—"}\nLanguage: ${client.language ?? "—"}\n\n` +
    `Draft forms prepared for this client (${docList.length}):\n` +
    docList.map((d) => `  • ${d.title ?? d.document_type}`).join("\n") +
    `\n\nOpen the client folder and download the forms: ${ATTORNEY_BOARD_URL}\n\n` +
    `No filing is needed yet. These are held until the client triggers an alert.`;
  const attorneyHtml = wrap(
    `New activation — ${code}`,
    `<pre style="font:14px/1.55 Arial,sans-serif;white-space:pre-wrap;margin:0">${esc(attorneyText)}</pre>` +
      `<p><a href="${ATTORNEY_BOARD_URL}" style="background:#b91c1c;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block">Open attorney board</a></p>`,
  );
  for (const to of uniqueEmails([ATTORNEY_EMAIL, ATTORNEY_BOARD_EMAIL])) {
    await enqueueEmail({
      to,
      subject: `New activation with forms: ${name} — code ${code}`,
      html: attorneyHtml,
      text: attorneyText,
      label: "activation-attorney",
      idempotencyKey: `${key}-attorney-${to}`,
    });
  }
  await smsOnce(ATTORNEY_PHONE, `[DD] New activation: ${name}, code ${code}. Forms ready on the attorney board.`, "activation_attorney", smsSent);

  return { ok: true, contacts_notified: contactsNotified };
}

// ---------------------------------------------------------------------------
// 2. TRIGGER / 3. CANCEL
// ---------------------------------------------------------------------------

export async function notifySosEvent(opts: {
  token: string;
  kind: "alert" | "cancel";
  lat?: number | null;
  lng?: number | null;
  alertId?: string | null;
  triggeredAt?: string | null;
}): Promise<{ ok: boolean; skipped?: string; contacts_notified?: number }> {
  const loaded = await loadCase(opts.token);
  if (!loaded) return { ok: false, skipped: "client_not_found" };
  const { client, contacts } = loaded;

  const name = client.full_name || "your contact";
  const code = client.invite_token;
  const when = opts.triggeredAt ?? new Date().toISOString();
  const mapsUrl =
    typeof opts.lat === "number" && typeof opts.lng === "number"
      ? `https://maps.google.com/?q=${opts.lat},${opts.lng}`
      : null;
  // 15-minute bucket, NOT the alert id: the app may post the same event to
  // more than one endpoint, and both must collapse into a single send.
  const bucket = Math.floor(Date.now() / (15 * 60_000));
  const key = `${opts.kind}-${code}-${bucket}`;

  const smsSent = new Set<string>();

  // --- Contacts
  const contactText =
    opts.kind === "alert"
      ? `EMERGENCY ALERT\n\n${name} has triggered his emergency app.\n\n` +
        `If he does not cancel it, contact DetencionDefensa at ${CALLBACK_NUMBER}. ` +
        `If you are holding a sealed package of information from him, open it after two hours and begin searching for him and his vehicle. ` +
        `Contact DetencionDefensa.\n\n` +
        `Case reference: ${code}\nTime (UTC): ${when}\n\n— DetencionDefensa`
      : `CANCELLED — ALL CLEAR\n\n${name} has cancelled the emergency alert. He is OK and no action is needed.\n\n` +
        `Case reference: ${code}\nTime (UTC): ${when}\n\n— DetencionDefensa`;
  const contactHtml = wrap(
    opts.kind === "alert" ? "Emergency alert" : "Cancelled — all clear",
    `<pre style="font:14px/1.55 Arial,sans-serif;white-space:pre-wrap;margin:0">${esc(contactText)}</pre>`,
  );
  const contactSms =
    opts.kind === "alert"
      ? `${name} has triggered his emergency app. If he does not cancel it, contact DetencionDefensa at ${CALLBACK_NUMBER}. If you hold his sealed package, open it after two hours and begin searching for him and his vehicle.`
      : `ALL CLEAR: ${name} cancelled the DetencionDefensa alert. He is OK. No action needed.`;


  let contactsNotified = 0;
  for (const c of contacts) {
    if (c.notify_on_sos === false) continue;
    if (c.email) {
      await enqueueEmail({
        to: c.email,
        subject:
          opts.kind === "alert"
            ? `EMERGENCY: ${name} may have been detained`
            : `FALSE ALARM — ${name} cancelled the emergency alert`,
        html: contactHtml,
        text: contactText,
        label: `sos-${opts.kind}-contact`,
        idempotencyKey: `${key}-contact-${c.email.toLowerCase()}`,
      });
      contactsNotified++;
    }
    await smsOnce(c.phone_e164, contactSms, `sos_${opts.kind}`, smsSent);
  }

  // --- Company (locate desk) — gets GPS so it can start finding the person.
  const companyText =
    `${opts.kind === "alert" ? "SOS TRIGGERED" : "SOS CANCELLED"}\n\n` +
    `Client: ${name}\nActivation code: ${code}\nA-number: ${client.a_number ?? "—"}\n` +
    `Phone: ${client.phone_e164 ?? "—"}\nLanguage: ${client.language ?? "—"}\n` +
    `Time (UTC): ${when}\n` +
    (mapsUrl ? `Last known location: ${mapsUrl}\n` : "Location: not reported\n") +
    `\nCompany board (locate packet + present-location form): ${COMPANY_BOARD_URL}\n`;
  const companyHtml = wrap(
    opts.kind === "alert" ? `SOS TRIGGERED — ${code}` : `SOS CANCELLED — ${code}`,
    `<pre style="font:14px/1.55 Arial,sans-serif;white-space:pre-wrap;margin:0">${esc(companyText)}</pre>` +
      `<p><a href="${COMPANY_BOARD_URL}" style="background:#b91c1c;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block">Open company board</a></p>`,
  );
  for (const to of uniqueEmails([COMPANY_ALERTS_EMAIL, COMPANY_EMAIL])) {
    await enqueueEmail({
      to,
      subject:
        opts.kind === "alert"
          ? `SOS TRIGGERED — ${name} (${code})`
          : `SOS CANCELLED — ${name} (${code})`,
      html: companyHtml,
      text: companyText,
      label: `sos-${opts.kind}-company`,
      idempotencyKey: `${key}-company-${to}`,
    });
  }
  await smsOnce(
    COMPANY_PHONE,
    opts.kind === "alert"
      ? `Trigger received: ${name} (${code}).${mapsUrl ? ` GPS: ${mapsUrl}` : ""} Open the company board.`
      : `[DD] SOS CANCELLED: ${name} (${code}). False alarm.`,
    `sos_${opts.kind}_company`,
    smsSent,
  );

  // --- Sorrentino: board + email + SMS.
  const attorneyText =
    companyText.replace(COMPANY_BOARD_URL, ATTORNEY_BOARD_URL).replace(
      "Company board (locate packet + present-location form)",
      "Attorney board (client folder + forms)",
    ) +
    (opts.kind === "alert"
      ? `\nThe locate desk is searching now. Completed forms will be sent to you for review and mailing once the facility is confirmed.\n`
      : "");
  const attorneyHtml = wrap(
    opts.kind === "alert" ? `SOS TRIGGERED — ${code}` : `SOS CANCELLED — ${code}`,
    `<pre style="font:14px/1.55 Arial,sans-serif;white-space:pre-wrap;margin:0">${esc(attorneyText)}</pre>` +
      `<p><a href="${ATTORNEY_BOARD_URL}" style="background:#b91c1c;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block">Open attorney board</a></p>`,
  );
  for (const to of uniqueEmails([ATTORNEY_EMAIL, ATTORNEY_BOARD_EMAIL])) {
    await enqueueEmail({
      to,
      subject:
        opts.kind === "alert"
          ? `SOS TRIGGERED — ${name} (${code})`
          : `SOS CANCELLED — ${name} (${code})`,
      html: attorneyHtml,
      text: attorneyText,
      label: `sos-${opts.kind}-attorney`,
      idempotencyKey: `${key}-attorney-${to}`,
    });
  }
  await smsOnce(
    ATTORNEY_PHONE,
    opts.kind === "alert"
      ? `[DD] SOS TRIGGERED: ${name} (${code}). Client folder is on the attorney board.`
      : `[DD] SOS CANCELLED: ${name} (${code}). False alarm.`,
    `sos_${opts.kind}_attorney`,
    smsSent,
  );

  return { ok: true, contacts_notified: contactsNotified };
}
