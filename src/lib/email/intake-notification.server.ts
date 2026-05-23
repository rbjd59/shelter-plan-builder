// Server-only: builds AO 242 + AO 240 PDFs, uploads to private storage,
// generates 14-day signed URLs, and enqueues the intake notification email
// to the DetencionDefensa intake inbox via the transactional_emails queue.

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildIntakePdfs } from "./intake-pdfs.server";
import { createOrUpdateCaseTracking, sendWelcomeEmail } from "@/lib/case-tracking.server";

const FORMS_BUCKET = "intake-forms";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 14;

const RECIPIENTS = ["intake@detenciondefensa.com", "legal@detenciondefensa.com"];
const FROM = "intake@gohomesooner.com";
const SENDER_DOMAIN = "notify.gohomesooner.com";

function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function uploadFormsAndSign(
  sessionId: string,
  answers: Record<string, unknown>,
): Promise<{ habeasUrl: string | null; ifpUrl: string | null; errors: string[] }> {
  const errors: string[] = [];
  try {
    const { habeas, ifp } = await buildIntakePdfs(answers);
    const habeasPath = `${sessionId}/AO242-habeas-2241.pdf`;
    const ifpPath = `${sessionId}/AO240-in-forma-pauperis.pdf`;
    const up1 = await supabaseAdmin.storage
      .from(FORMS_BUCKET)
      .upload(habeasPath, habeas, { contentType: "application/pdf", upsert: true });
    if (up1.error) errors.push(`habeas upload: ${up1.error.message}`);
    const up2 = await supabaseAdmin.storage
      .from(FORMS_BUCKET)
      .upload(ifpPath, ifp, { contentType: "application/pdf", upsert: true });
    if (up2.error) errors.push(`ifp upload: ${up2.error.message}`);
    const sig1 = await supabaseAdmin.storage
      .from(FORMS_BUCKET)
      .createSignedUrl(habeasPath, SIGNED_URL_TTL_SECONDS);
    const sig2 = await supabaseAdmin.storage
      .from(FORMS_BUCKET)
      .createSignedUrl(ifpPath, SIGNED_URL_TTL_SECONDS);
    if (sig1.error) errors.push(`habeas sign: ${sig1.error.message}`);
    if (sig2.error) errors.push(`ifp sign: ${sig2.error.message}`);
    return {
      habeasUrl: sig1.data?.signedUrl ?? null,
      ifpUrl: sig2.data?.signedUrl ?? null,
      errors,
    };
  } catch (e) {
    errors.push(`pdf build failed: ${e instanceof Error ? e.message : String(e)}`);
    return { habeasUrl: null, ifpUrl: null, errors };
  }
}

function answersTable(answers: Record<string, unknown>): string {
  const rows = Object.entries(answers)
    .filter(([, v]) => v !== "" && v !== false && v != null)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font-weight:600;color:#333;vertical-align:top;width:38%;">${escapeHtml(k)}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;color:#111;white-space:pre-wrap;">${escapeHtml(v)}</td></tr>`,
    )
    .join("");
  return `<table style="border-collapse:collapse;width:100%;font-size:13px;font-family:Arial,sans-serif;">${rows}</table>`;
}

function mailingLabelHtml(opts: {
  title: string;
  toName: string;
  toLine2?: string;
  toFacility?: string;
  toAddress: string;
}): string {
  const { title, toName, toLine2, toFacility, toAddress } = opts;
  return `<div style="border:2px solid #000;padding:18px;font-family:'Courier New',monospace;font-size:14px;line-height:1.5;max-width:480px;background:#fff;margin-bottom:14px;">
    <div style="font-size:11px;letter-spacing:2px;border-bottom:1px solid #000;padding-bottom:6px;margin-bottom:10px;">${escapeHtml(title)}</div>
    <div style="font-size:11px;color:#555;margin-bottom:10px;">FROM:<br/>DetencionDefensa.com<br/>P.O. Box (return address on file)</div>
    <div style="font-size:13px;margin-top:12px;">TO:</div>
    <div style="font-weight:bold;font-size:15px;margin-top:4px;">
      ${escapeHtml(toName)}<br/>
      ${toLine2 ? `${escapeHtml(toLine2)}<br/>` : ""}
      ${toFacility ? `${escapeHtml(toFacility)}<br/>` : ""}
      ${escapeHtml(toAddress).replace(/\n/g, "<br/>")}
    </div>
  </div>`;
}

export async function enqueueIntakeNotification(params: {
  sessionId: string;
  answers: Record<string, unknown>;
  language: string;
  contactEmail?: string | null;
  demoMode?: boolean;
}): Promise<void> {
  const { sessionId, answers, language, contactEmail, demoMode } = params;
  const a = answers;

  const subject = `New Intake Submission — ${String(a.mail_inmate_name || a.contact_name || sessionId)}`;
  const { habeasUrl, ifpUrl, errors: pdfErrors } = await uploadFormsAndSign(sessionId, a);
  if (pdfErrors.length) console.error("Intake PDF generation issues:", pdfErrors);

  const formsHtml = `<div style="border:1px solid #d0d7de;border-radius:8px;padding:16px;background:#f6f8fa;margin-top:8px;">
    <p style="margin:0 0 10px;font-size:13px;color:#1a1a1a;"><strong>Completed forms (download &amp; print):</strong></p>
    ${habeasUrl ? `<p style="margin:0 0 6px;"><a href="${habeasUrl}" style="color:#0a58ca;text-decoration:underline;font-size:14px;">AO 242 — Petition for Writ of Habeas Corpus (28 U.S.C. § 2241).pdf</a></p>` : `<p style="margin:0 0 6px;color:#a40000;font-size:13px;">AO 242 PDF unavailable.</p>`}
    ${ifpUrl ? `<p style="margin:0;"><a href="${ifpUrl}" style="color:#0a58ca;text-decoration:underline;font-size:14px;">AO 240 — Application to Proceed In Forma Pauperis.pdf</a></p>` : `<p style="margin:0;color:#a40000;font-size:13px;">AO 240 PDF unavailable.</p>`}
    <p style="margin:10px 0 0;font-size:11px;color:#666;">Secure download links expire in 14 days.</p>
  </div>`;

  const inmateLabel = mailingLabelHtml({
    title: "USPS — FIRST CLASS MAIL — INMATE",
    toName: String(a.mail_inmate_name ?? ""),
    toLine2: a.mail_inmate_number ? `#${String(a.mail_inmate_number)}` : undefined,
    toFacility: String(a.mail_current_location ?? ""),
    toAddress: String(a.mail_facility_address ?? ""),
  });
  const familyLabel = mailingLabelHtml({
    title: "USPS — FAMILY PACKAGE",
    toName: String(a.contact_name ?? ""),
    toLine2: a.contact_relation ? `(${String(a.contact_relation)})` : undefined,
    toAddress: String(a.contact_address ?? ""),
  });

  const html = `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:Arial,sans-serif;color:#111;">
    <div style="max-width:680px;margin:0 auto;padding:24px;">
      <h1 style="font-size:20px;margin:0 0 4px;">New Intake Submission — DetencionDefensa.com</h1>
      <p style="margin:0 0 16px;color:#555;font-size:13px;">Language: ${escapeHtml(language)} &middot; Session: ${escapeHtml(sessionId)}${contactEmail ? ` &middot; Contact: ${escapeHtml(contactEmail)}` : ""}</p>
      <h2 style="font-size:15px;margin:24px 0 8px;">Completed Forms</h2>
      ${formsHtml}
      <h2 style="font-size:15px;margin:24px 0 8px;">Mailing Label — Inmate (Prepared Forms)</h2>
      ${inmateLabel}
      <h2 style="font-size:15px;margin:24px 0 8px;">Mailing Label — Family Package</h2>
      ${familyLabel}
      <h2 style="font-size:15px;margin:28px 0 8px;">Full Intake Answers</h2>
      ${answersTable(a)}
    </div>
  </body></html>`;

  const text = `New Intake Submission — DetencionDefensa.com
Session: ${sessionId}
Language: ${language}
${contactEmail ? `Contact: ${contactEmail}\n` : ""}
${habeasUrl ? `AO 242 Habeas: ${habeasUrl}` : "AO 242 Habeas: (unavailable)"}
${ifpUrl ? `AO 240 IFP:    ${ifpUrl}` : "AO 240 IFP:    (unavailable)"}

ANSWERS:
${Object.entries(a)
  .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
  .join("\n")}`;

  for (const recipient of RECIPIENTS) {
    const messageId = crypto.randomUUID();

    let unsubscribeToken: string;
    const { data: existing } = await supabaseAdmin
      .from("email_unsubscribe_tokens" as never)
      .select("token")
      .eq("email", recipient)
      .maybeSingle();
    if (existing && (existing as { token: string }).token) {
      unsubscribeToken = (existing as { token: string }).token;
    } else {
      unsubscribeToken = crypto.randomUUID();
      await supabaseAdmin
        .from("email_unsubscribe_tokens" as never)
        .insert({ email: recipient, token: unsubscribeToken } as never);
    }

    const payload = {
      to: recipient,
      from: FROM,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: "transactional",
      label: "intake-submission",
      idempotency_key: `intake-${sessionId}-${recipient}-${messageId}`,
      message_id: messageId,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    };

    await supabaseAdmin.from("email_send_log" as never).insert({
      message_id: messageId,
      template_name: "intake-submission",
      recipient_email: recipient,
      status: "pending",
    } as never);

    const { error } = await supabaseAdmin.rpc("enqueue_email" as never, {
      queue_name: "transactional_emails",
      payload: payload as never,
    } as never);

    if (error) {
      console.error("Failed to enqueue intake notification email", { recipient, error });
    }
  }

  // Family welcome + case tracking record.
  try {
    const tracking = await createOrUpdateCaseTracking({
      sessionId,
      answers,
      language,
      contactEmailFromStripe: contactEmail,
    });
    const familyEmail =
      (typeof answers.contact_email === "string" && answers.contact_email) || contactEmail;
    const emergencyEmail =
      typeof answers.emergency_contact_email === "string" && answers.emergency_contact_email
        ? answers.emergency_contact_email
        : null;
    const recipientsSet = new Set<string>();
    if (familyEmail) recipientsSet.add(String(familyEmail).toLowerCase());
    if (emergencyEmail) recipientsSet.add(String(emergencyEmail).toLowerCase());

    if (tracking && recipientsSet.size > 0) {
      const { issueAppInstallToken, buildAppInstallUrl } = await import("@/lib/app-install.server");
      const [clientToken, familyToken] = await Promise.all([
        issueAppInstallToken(sessionId, "client"),
        issueAppInstallToken(sessionId, "family"),
      ]);
      const clientInstallUrl = clientToken ? buildAppInstallUrl(clientToken) : null;
      const familyInstallUrl = familyToken ? buildAppInstallUrl(familyToken) : null;
      const inmateName =
        (typeof answers.mail_inmate_name === "string" && answers.mail_inmate_name) ||
        (typeof answers.full_name === "string" && answers.full_name) ||
        "su ser querido";
      for (const to of recipientsSet) {
        await sendWelcomeEmail({
          to,
          trackingToken: tracking.token,
          language,
          clientInstallUrl,
          familyInstallUrl,
          habeasUrl,
          ifpUrl,
          inmateName,
          demoMode,
        });
      }
    }
  } catch (e) {
    console.error("Family welcome / case tracking failed:", e);
  }
}
