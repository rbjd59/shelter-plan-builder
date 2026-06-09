// Server-only: builds AO 242 + AO 240 + SDFL Motion + JS-44 PDFs,
// uploads to private storage, generates 14-day signed URLs, and enqueues
// the intake notification email. Also generates native-language copies
// (for the user's records, NOT for filing).

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildIntakePdfs } from "./intake-pdfs.server";
import { buildMotionReferralPdf } from "./motion-referral.server";
import { buildJs44Pdf } from "./js44.server";
import { buildNativeCopies } from "./native-copies.server";
import { buildBilingualForms } from "./bilingual-forms.server";
import { createOrUpdateCaseTracking, sendWelcomeEmail } from "@/lib/case-tracking.server";
import { buildSelfHelpLibraryHtml, buildSelfHelpLibraryText } from "@/lib/self-help-library";



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

interface UploadedUrls {
  habeasUrl: string | null;
  ifpUrl: string | null;
  brochureUrl: string | null;
  referralUrl: string | null;
  js44Url: string | null;
  nativeHabeasUrl: string | null;
  nativeIfpUrl: string | null;
  nativeMotionUrl: string | null;
  nativeJs44Url: string | null;
  bilingualHabeasUrl: string | null;
  bilingualIfpUrl: string | null;
  bilingualMotionUrl: string | null;
  bilingualJs44Url: string | null;
  errors: string[];
}

async function uploadFormsAndSign(
  sessionId: string,
  answers: Record<string, unknown>,
  language: string,
): Promise<UploadedUrls> {
  const errors: string[] = [];
  const lang = (language === "es" || language === "ht" || language === "en" ? language : "es") as "es" | "ht" | "en";

  const out: UploadedUrls = {
    habeasUrl: null, ifpUrl: null, brochureUrl: null, referralUrl: null, js44Url: null,
    nativeHabeasUrl: null, nativeIfpUrl: null, nativeMotionUrl: null, nativeJs44Url: null,
    bilingualHabeasUrl: null, bilingualIfpUrl: null, bilingualMotionUrl: null, bilingualJs44Url: null,
    errors,
  };

  try {
    const { habeas, ifp } = await buildIntakePdfs(answers);
    const referral = await buildMotionReferralPdf(answers);
    let js44: Uint8Array | null = null;
    try { js44 = await buildJs44Pdf(answers); } catch (e) { errors.push(`js44 build: ${e instanceof Error ? e.message : String(e)}`); }
    let native: Awaited<ReturnType<typeof buildNativeCopies>> | null = null;
    if (lang !== "en") {
      try { native = await buildNativeCopies(answers, lang); }
      catch (e) { errors.push(`native copies build: ${e instanceof Error ? e.message : String(e)}`); }
    }
    let bilingual: Awaited<ReturnType<typeof buildBilingualForms>> | null = null;
    if (lang !== "en") {
      try {
        bilingual = await buildBilingualForms(answers, lang, { ao242: habeas, ao240: ifp, motion: referral, js44 });
      } catch (e) { errors.push(`bilingual build: ${e instanceof Error ? e.message : String(e)}`); }
    }

    type Up = { key: keyof UploadedUrls; path: string; bytes: Uint8Array };
    // Habeas Explainer guide is pre-uploaded under _shared/ in two languages;
    // sign the appropriate one (Spanish for es; English for en/ht).
    const brochurePath = lang === "es"
      ? `_shared/Habeas-Explainer-ES.pdf`
      : `_shared/Habeas-Explainer-EN.pdf`;
    const uploads: Up[] = [
      { key: "habeasUrl", path: `${sessionId}/AO242-habeas-2241.pdf`, bytes: habeas },
      { key: "ifpUrl", path: `${sessionId}/AO240-in-forma-pauperis.pdf`, bytes: ifp },
      { key: "referralUrl", path: `${sessionId}/SDFL-Motion-Referral-Volunteer-Attorney.pdf`, bytes: referral },
    ];
    if (js44) uploads.push({ key: "js44Url", path: `${sessionId}/JS44-Civil-Cover-Sheet.pdf`, bytes: js44 });
    if (native) {
      uploads.push(
        { key: "nativeHabeasUrl", path: `${sessionId}/AO242-${lang}-copy.pdf`, bytes: native.ao242 },
        { key: "nativeIfpUrl", path: `${sessionId}/AO240-${lang}-copy.pdf`, bytes: native.ao240 },
        { key: "nativeMotionUrl", path: `${sessionId}/SDFL-Motion-${lang}-copy.pdf`, bytes: native.motion },
        { key: "nativeJs44Url", path: `${sessionId}/JS44-${lang}-copy.pdf`, bytes: native.js44 },
      );
    }
    if (bilingual) {
      if (bilingual.ao242) uploads.push({ key: "bilingualHabeasUrl", path: `${sessionId}/AO242-bilingual-${lang}.pdf`, bytes: bilingual.ao242 });
      if (bilingual.ao240) uploads.push({ key: "bilingualIfpUrl", path: `${sessionId}/AO240-bilingual-${lang}.pdf`, bytes: bilingual.ao240 });
      if (bilingual.motion) uploads.push({ key: "bilingualMotionUrl", path: `${sessionId}/SDFL-Motion-bilingual-${lang}.pdf`, bytes: bilingual.motion });
      if (bilingual.js44) uploads.push({ key: "bilingualJs44Url", path: `${sessionId}/JS44-bilingual-${lang}.pdf`, bytes: bilingual.js44 });
    }

    await Promise.all(uploads.map(async (u) => {
      const r = await supabaseAdmin.storage.from(FORMS_BUCKET).upload(u.path, u.bytes, { contentType: "application/pdf", upsert: true });
      if (r.error) errors.push(`${u.key} upload: ${r.error.message}`);
    }));
    await Promise.all(uploads.map(async (u) => {
      const r = await supabaseAdmin.storage.from(FORMS_BUCKET).createSignedUrl(u.path, SIGNED_URL_TTL_SECONDS);
      if (r.error) { errors.push(`${u.key} sign: ${r.error.message}`); return; }
      (out as unknown as Record<string, string | null>)[u.key as string] = r.data?.signedUrl ?? null;
    }));
    // Sign the shared Habeas Explainer (already pre-uploaded) for the email.
    {
      const r = await supabaseAdmin.storage.from(FORMS_BUCKET).createSignedUrl(brochurePath, SIGNED_URL_TTL_SECONDS);
      if (r.error) errors.push(`brochureUrl sign: ${r.error.message}`);
      else out.brochureUrl = r.data?.signedUrl ?? null;
    }
    return out;
  } catch (e) {
    errors.push(`pdf build failed: ${e instanceof Error ? e.message : String(e)}`);
    return out;
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
  scope?: "all" | "internal" | "welcome";
  inviteCode?: string | null;
}): Promise<void> {
  const { sessionId, answers, language, contactEmail, demoMode } = params;
  const inviteCode = params.inviteCode ?? null;
  const scope = params.scope ?? "all";
  const doInternal = scope === "all" || scope === "internal";
  const doWelcome = scope === "all" || scope === "welcome";
  const a = answers;
  console.info(
    `[invite-code] enqueueIntakeNotification session=${sessionId} scope=${scope} demo=${!!demoMode} invite_code=${inviteCode ?? "null"} invite_code_len=${inviteCode?.length ?? 0} contactEmail=${contactEmail ?? "null"}`,
  );

  const subject = `New Intake Submission — ${String(a.mail_inmate_name || a.contact_name || sessionId)}`;
  const urls = await uploadFormsAndSign(sessionId, a, language);
  if (urls.errors.length) console.error("Intake PDF generation issues:", urls.errors);
  const { habeasUrl, ifpUrl, brochureUrl, referralUrl, js44Url } = urls;
  const { nativeHabeasUrl, nativeIfpUrl, nativeMotionUrl, nativeJs44Url } = urls;
  const { bilingualHabeasUrl, bilingualIfpUrl, bilingualMotionUrl, bilingualJs44Url } = urls;

  const link = (url: string | null, label: string) =>
    url
      ? `<p style="margin:0 0 6px;"><a href="${url}" style="color:#0a58ca;text-decoration:underline;font-size:14px;">${label}</a></p>`
      : `<p style="margin:0 0 6px;color:#a40000;font-size:13px;">${label} (unavailable)</p>`;

  const formsHtml = `<div style="border:1px solid #d0d7de;border-radius:8px;padding:16px;background:#f6f8fa;margin-top:8px;">
    <p style="margin:0 0 10px;font-size:13px;color:#1a1a1a;"><strong>Official court forms (English — for filing):</strong></p>
    ${link(habeasUrl, "AO 242 — Petition for Writ of Habeas Corpus (28 U.S.C. § 2241).pdf")}
    ${link(ifpUrl, "AO 240 — Application to Proceed In Forma Pauperis.pdf")}
    ${link(referralUrl, "SDFL Motion for Referral to Volunteer Attorney Program.pdf")}
    ${link(js44Url, "JS-44 — Civil Cover Sheet.pdf")}
    ${brochureUrl ? `<p style="margin:8px 0 6px;"><a href="${brochureUrl}" style="color:#0a58ca;text-decoration:underline;font-size:14px;font-weight:600;">📘 INCLUDE WITH MAILED PACKAGE — Habeas Explainer (${language === "es" ? "Español" : "English"}, NIP guide).pdf</a></p>` : ""}
    ${(bilingualHabeasUrl || bilingualIfpUrl || bilingualMotionUrl || bilingualJs44Url) ? `
      <p style="margin:14px 0 8px;font-size:13px;color:#1a1a1a;"><strong>Side-by-side bilingual forms (English left / ${escapeHtml(language)} right — for petitioner reference, NOT for filing):</strong></p>
      ${link(bilingualHabeasUrl, `AO 242 — bilingual (EN / ${language}).pdf`)}
      ${link(bilingualIfpUrl, `AO 240 — bilingual (EN / ${language}).pdf`)}
      ${link(bilingualMotionUrl, `SDFL Motion — bilingual (EN / ${language}).pdf`)}
      ${link(bilingualJs44Url, `JS-44 — bilingual (EN / ${language}).pdf`)}
    ` : ""}
    ${(nativeHabeasUrl || nativeIfpUrl || nativeMotionUrl || nativeJs44Url) ? `
      <p style="margin:14px 0 8px;font-size:13px;color:#1a1a1a;"><strong>Native-language summary copies (${escapeHtml(language)} — for petitioner's records, NOT for filing):</strong></p>
      ${link(nativeHabeasUrl, `AO 242 — ${language} copy.pdf`)}
      ${link(nativeIfpUrl, `AO 240 — ${language} copy.pdf`)}
      ${link(nativeMotionUrl, `SDFL Motion — ${language} copy.pdf`)}
      ${link(nativeJs44Url, `JS-44 — ${language} copy.pdf`)}
    ` : ""}
    <p style="margin:10px 0 0;font-size:11px;color:#666;">Secure download links expire in 14 days.</p>
  </div>`;


  const hasInmateAddress =
    String(a.mail_current_location ?? "").trim() !== "" &&
    String(a.mail_facility_address ?? "").trim() !== "";
  const inmateLabel = hasInmateAddress
    ? mailingLabelHtml({
        title: "USPS — FIRST CLASS MAIL — INMATE",
        toName: String(a.mail_inmate_name ?? ""),
        toLine2: a.mail_inmate_number ? `#${String(a.mail_inmate_number)}` : undefined,
        toFacility: String(a.mail_current_location ?? ""),
        toAddress: String(a.mail_facility_address ?? ""),
      })
    : `<div style="border:1px dashed #b8551f;border-radius:8px;padding:14px;background:#fff7ef;color:#8a3c11;font-size:13px;">
        <strong>Pending facility lookup.</strong> DetencionDefensa.com will locate the inmate
        (facility name, booking number, mailing address) and forward those details to the
        attorney's office before the printed File Now Packet is mailed.
        ${a.mail_inmate_name ? `<div style="margin-top:8px;color:#1a1a1a;">Inmate name on mail: <strong>${escapeHtml(String(a.mail_inmate_name))}</strong></div>` : ""}
      </div>`;
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
      <h2 style="font-size:15px;margin:24px 0 8px;">Self-Help Library (linked from emails + App)</h2>
      ${buildSelfHelpLibraryHtml(language)}
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
${referralUrl ? `Motion Ref:    ${referralUrl}` : ""}
${js44Url ? `JS-44:         ${js44Url}` : ""}

${buildSelfHelpLibraryText(language)}

ANSWERS:
${Object.entries(a)
  .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
  .join("\n")}`;

  if (doInternal) {
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
  }

  if (!doWelcome) return;


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
      const clientInstallUrl = clientToken ? buildAppInstallUrl(clientToken, "client") : null;
      const familyInstallUrl = familyToken ? buildAppInstallUrl(familyToken, "family") : null;
      const inmateName =
        (typeof answers.mail_inmate_name === "string" && answers.mail_inmate_name) ||
        (typeof answers.full_name === "string" && answers.full_name) ||
        "su ser querido";
      for (const to of recipientsSet) {
        console.info(
          `[invite-code] sendWelcomeEmail session=${sessionId} to=${to} invite_code=${inviteCode ?? "MISSING"} invite_code_len=${inviteCode?.length ?? 0} path=${inviteCode ? "defensasiempre_deeplink" : "pwa_install_fallback"}`,
        );
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
          inviteCode,
        });
      }
    }
  } catch (e) {
    console.error("Family welcome / case tracking failed:", e);
  }
}
