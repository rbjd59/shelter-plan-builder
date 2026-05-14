// Full end-to-end intake email test:
// 1. Build AO 242 + AO 240 PDFs
// 2. Upload to intake-forms bucket, sign URLs
// 3. Send INTAKE summary email to rbjd@dr.com
// 4. Send FAMILY WELCOME email (with HELP NOW install button + tracking + PDFs) to rbjd@dr.com
// 5. Insert tracking + install token rows so install link is real.

import { createClient } from "@supabase/supabase-js";
import { sendLovableEmail } from "@lovable.dev/email-js";
import { buildIntakePdfs } from "./src/lib/email/intake-pdfs.server";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SR = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY!;

const supabase = createClient(SUPABASE_URL, SR);

const FROM = "intake@gohomesooner.com";
const SENDER_DOMAIN = "notify.gohomesooner.com";
const TO = "rbjd@dr.com";
const SITE_BASE = "https://detenciondefensa.com";
const FORMS_BUCKET = "intake-forms";

const sessionId = `test-full-${Date.now()}`;
const familyEmail = TO;

const answers: Record<string, unknown> = {
  full_name: "Juan Test Pérez",
  mail_inmate_name: "Juan Test Pérez",
  mail_inmate_number: "A123-456-789",
  mail_current_location: "Krome Detention Center",
  mail_facility_address: "18201 SW 12th St\nMiami, FL 33194",
  contact_name: "Maria Test",
  contact_relation: "spouse",
  contact_email: familyEmail,
  contact_phone: "+1 305-555-0199",
  contact_address: "1234 NW 1st St\nMiami, FL 33125",
  country_of_origin: "Honduras",
  date_of_birth: "1985-04-12",
  custody_facility: "Krome Detention Center",
  custody_date: "2026-05-10",
  fear_return: true,
  ifp_employment: "Unemployed",
  ifp_assets: "None",
  ifp_dependents: "2 children",
};

function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

async function main() {
  console.log("Session:", sessionId);

  // 1. Build PDFs
  console.log("Building PDFs...");
  const { habeas, ifp } = await buildIntakePdfs(answers);
  console.log(`  habeas=${habeas.byteLength}b ifp=${ifp.byteLength}b`);

  // 2. Upload + sign
  const habeasPath = `${sessionId}/AO242-habeas-2241.pdf`;
  const ifpPath = `${sessionId}/AO240-in-forma-pauperis.pdf`;
  const u1 = await supabase.storage.from(FORMS_BUCKET).upload(habeasPath, habeas, {
    contentType: "application/pdf", upsert: true,
  });
  if (u1.error) console.error("habeas upload error:", u1.error);
  const u2 = await supabase.storage.from(FORMS_BUCKET).upload(ifpPath, ifp, {
    contentType: "application/pdf", upsert: true,
  });
  if (u2.error) console.error("ifp upload error:", u2.error);
  const TTL = 60 * 60 * 24 * 14;
  const s1 = await supabase.storage.from(FORMS_BUCKET).createSignedUrl(habeasPath, TTL);
  const s2 = await supabase.storage.from(FORMS_BUCKET).createSignedUrl(ifpPath, TTL);
  const habeasUrl = s1.data?.signedUrl ?? null;
  const ifpUrl = s2.data?.signedUrl ?? null;
  console.log("  habeasUrl:", habeasUrl ? "ok" : "FAIL");
  console.log("  ifpUrl:", ifpUrl ? "ok" : "FAIL");

  // 3. Insert intake_submissions, case_tracking, app_install_tokens
  await supabase.from("intake_submissions").insert({
    stripe_session_id: sessionId, email: familyEmail, language: "es",
    answers: answers as never, paid: true,
  } as never);
  const ct = await supabase.from("case_tracking").insert({
    intake_session_id: sessionId,
    contact_email: familyEmail,
    contact_name: String(answers.contact_name),
    contact_phone: String(answers.contact_phone),
    inmate_name: String(answers.mail_inmate_name),
    language: "es",
  } as never).select("tracking_token").single();
  const trackingToken = (ct.data as { tracking_token: string } | null)?.tracking_token;
  console.log("  tracking_token:", trackingToken);
  const installToken = crypto.randomUUID();
  await supabase.from("app_install_tokens").insert({
    token: installToken, intake_session_id: sessionId,
  } as never);
  const installUrl = `${SITE_BASE}/app?install=${installToken}`;
  const trackingUrl = trackingToken ? `${SITE_BASE}/track/${trackingToken}` : SITE_BASE;

  // 4. Send INTAKE summary email
  const intakeSubject = `New Intake Submission — ${String(answers.mail_inmate_name)}`;
  const answersRows = Object.entries(answers)
    .map(([k, v]) => `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font-weight:600;width:38%;">${escapeHtml(k)}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;white-space:pre-wrap;">${escapeHtml(v)}</td></tr>`)
    .join("");
  const intakeHtml = `<!doctype html><html><body style="margin:0;background:#fff;font-family:Arial,sans-serif;color:#111;">
    <div style="max-width:680px;margin:0 auto;padding:24px;">
      <h1 style="font-size:20px;margin:0 0 4px;">New Intake Submission — DetencionDefensa.com</h1>
      <p style="margin:0 0 16px;color:#555;font-size:13px;">Language: es · Session: ${escapeHtml(sessionId)} · Contact: ${escapeHtml(familyEmail)}</p>
      <div style="border:1px solid #d0d7de;border-radius:8px;padding:16px;background:#f6f8fa;margin-top:8px;">
        <p style="margin:0 0 10px;font-size:13px;"><strong>Completed forms:</strong></p>
        ${habeasUrl ? `<p style="margin:0 0 6px;"><a href="${habeasUrl}" style="color:#0a58ca;">AO 242 — Petition for Writ of Habeas Corpus.pdf</a></p>` : "<p style='color:red'>AO 242 unavailable</p>"}
        ${ifpUrl ? `<p><a href="${ifpUrl}" style="color:#0a58ca;">AO 240 — Application to Proceed In Forma Pauperis.pdf</a></p>` : "<p style='color:red'>AO 240 unavailable</p>"}
        <p style="margin:10px 0 0;font-size:11px;color:#666;">Links expire in 14 days.</p>
      </div>
      <h2 style="font-size:15px;margin:24px 0 8px;">Full Intake Answers</h2>
      <table style="border-collapse:collapse;width:100%;font-size:13px;">${answersRows}</table>
    </div></body></html>`;
  console.log("Sending INTAKE summary email...");
  const r1 = await sendLovableEmail({
    to: TO, from: FROM, sender_domain: SENDER_DOMAIN,
    subject: intakeSubject, html: intakeHtml,
    text: `New intake. AO242: ${habeasUrl}\nAO240: ${ifpUrl}`,
    purpose: "transactional", label: "intake-submission",
    idempotency_key: `intake-${sessionId}`,
  } as never, { apiKey: LOVABLE_API_KEY });
  console.log("  intake msg id:", (r1 as { message_id?: string }).message_id);

  // 5. Send FAMILY WELCOME email (with HELP NOW install button + tracking + PDFs)
  const heading = "Recibimos su información";
  const body = "Estamos preparando los formularios para enviar al detenido y a la familia. Puede seguir el progreso de su caso en cualquier momento desde el siguiente enlace.";
  const cta = "Ver el progreso de mi caso";
  const note = "Guarde este correo. Solo usted (y quien tenga el enlace) puede ver el estado.";
  const installCta = "Instalar el botón AYUDA YA en mi teléfono";
  const installNote = "Abra este enlace en el teléfono que llevará la persona en riesgo. En iPhone (Safari): toque Compartir → 'Añadir a pantalla de inicio'. En Android (Chrome): menú ⋮ → 'Instalar app'. Mantenga presionado el botón AYUDA YA durante 15 segundos en una emergencia para alertar a nuestro equipo legal y a su contacto de emergencia con copia de los formularios adjunta.";
  const pdfHeading = "Sus formularios preparados (PDF)";

  const familyHtml = `<!doctype html><html><body style="margin:0;background:#fff;font-family:Arial,sans-serif;color:#111;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:28px;">
        <h1 style="font-size:22px;margin:0 0 12px;color:#0b1220;">${escapeHtml(heading)}</h1>
        <p style="font-size:15px;line-height:1.55;color:#3a3a3a;margin:0 0 20px;">${escapeHtml(body)}</p>
        <p style="text-align:center;margin:24px 0;">
          <a href="${trackingUrl}" style="display:inline-block;background:#0b1220;color:#fff;text-decoration:none;padding:14px 26px;border-radius:8px;font-weight:700;font-size:15px;">${escapeHtml(cta)}</a>
        </p>
        <div style="margin-top:18px;padding:18px;background:#f6f8fa;border:1px solid #d0d7de;border-radius:10px;">
          <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#0a1f44;">${escapeHtml(pdfHeading)}</p>
          ${habeasUrl ? `<p style="margin:0 0 6px;"><a href="${habeasUrl}" style="color:#0a58ca;font-size:14px;">AO 242 — Petition for Writ of Habeas Corpus.pdf</a></p>` : ""}
          ${ifpUrl ? `<p><a href="${ifpUrl}" style="color:#0a58ca;font-size:14px;">AO 240 — Application to Proceed In Forma Pauperis.pdf</a></p>` : ""}
          <p style="margin:10px 0 0;font-size:11px;color:#666;">Descárguelos e imprímalos. Los enlaces expiran en 14 días.</p>
        </div>
        <div style="margin-top:18px;padding:18px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;">
          <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#991b1b;">${escapeHtml(installCta)}</p>
          <p style="margin:0 0 12px;font-size:13px;color:#7f1d1d;line-height:1.5;">${escapeHtml(installNote)}</p>
          <p style="text-align:center;margin:0;">
            <a href="${installUrl}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:14px 26px;border-radius:8px;font-weight:700;font-size:15px;">${escapeHtml(installCta)}</a>
          </p>
          <p style="margin:10px 0 0;font-size:11px;color:#a16207;">Enlace de un solo uso. Válido 30 días. Ábralo en el teléfono que llevará la app (con permisos de GPS).</p>
        </div>
        <p style="font-size:12px;color:#777;margin:18px 0 0;border-top:1px solid #eee;padding-top:14px;">${escapeHtml(note)}</p>
      </div>
      <p style="text-align:center;font-size:11px;color:#999;margin-top:18px;">DetencionDefensa.com</p>
    </div></body></html>`;

  console.log("Sending FAMILY WELCOME email...");
  const r2 = await sendLovableEmail({
    to: TO, from: FROM, sender_domain: SENDER_DOMAIN,
    subject: "Recibimos su información — siga el progreso de su caso",
    html: familyHtml,
    text: `${heading}\n\n${body}\n\n${cta}: ${trackingUrl}\n\n${installCta}: ${installUrl}\n\nAO 242: ${habeasUrl}\nAO 240: ${ifpUrl}`,
    purpose: "transactional", label: "case-tracking-welcome",
    idempotency_key: `welcome-${sessionId}`,
  } as never, { apiKey: LOVABLE_API_KEY });
  console.log("  family msg id:", (r2 as { message_id?: string }).message_id);

  console.log("\n✅ DONE. Sent both emails to", TO);
  console.log("   tracking:", trackingUrl);
  console.log("   install:", installUrl);
}

main().catch((e) => { console.error("FAIL:", e); process.exit(1); });
