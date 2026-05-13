// Server-only: family-facing case tracking lifecycle.

import { supabaseAdmin } from "@/integrations/supabase/client.server";

const FROM = "intake@detenciondefensa.com";
const SENDER_DOMAIN = "notify.detenciondefensa.com";
const SITE_BASE = "https://detenciondefensa.com";

interface FamilyEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  template: string;
  trackingToken: string;
}

async function enqueueFamilyEmail(p: FamilyEmailParams): Promise<void> {
  const messageId = crypto.randomUUID();
  let unsubscribeToken: string;
  const { data: existing } = await supabaseAdmin
    .from("email_unsubscribe_tokens" as never)
    .select("token")
    .eq("email", p.to)
    .maybeSingle();
  if (existing && (existing as { token: string }).token) {
    unsubscribeToken = (existing as { token: string }).token;
  } else {
    unsubscribeToken = crypto.randomUUID();
    await supabaseAdmin
      .from("email_unsubscribe_tokens" as never)
      .insert({ email: p.to, token: unsubscribeToken } as never);
  }

  const payload = {
    to: p.to,
    from: FROM,
    sender_domain: SENDER_DOMAIN,
    subject: p.subject,
    html: p.html,
    text: p.text,
    purpose: "transactional",
    label: p.template,
    idempotency_key: `${p.template}-${p.trackingToken}-${messageId}`,
    message_id: messageId,
    unsubscribe_token: unsubscribeToken,
    queued_at: new Date().toISOString(),
  };

  await supabaseAdmin.from("email_send_log" as never).insert({
    message_id: messageId,
    template_name: p.template,
    recipient_email: p.to,
    status: "pending",
  } as never);

  const { error } = await supabaseAdmin.rpc("enqueue_email" as never, {
    queue_name: "transactional_emails",
    payload: payload as never,
  } as never);
  if (error) console.error("Family email enqueue failed", { template: p.template, error });
}

const COPY = {
  welcome: {
    es: {
      subject: "Recibimos su información — siga el progreso de su caso",
      heading: "Recibimos su información",
      body:
        "Estamos preparando los formularios para enviar al detenido y a la familia. Puede seguir el progreso de su caso en cualquier momento desde el siguiente enlace.",
      cta: "Ver el progreso de mi caso",
      note: "Guarde este correo. Solo usted (y quien tenga el enlace) puede ver el estado.",
    },
    en: {
      subject: "We received your info — track your case",
      heading: "We received your info",
      body:
        "We are preparing the forms to send to the detainee and the family. You can track your case progress at any time from the link below.",
      cta: "View my case progress",
      note: "Save this email. Only you (and anyone with the link) can view the status.",
    },
    ht: {
      subject: "Nou resevwa enfòmasyon ou — swiv pwogrè dosye ou",
      heading: "Nou resevwa enfòmasyon ou",
      body:
        "N ap prepare fòm yo pou voye bay detni ak fanmi an. Ou ka swiv pwogrè dosye ou nenpòt kilè nan lyen ki anba a.",
      cta: "Wè pwogrè dosye mwen",
      note: "Sere imèl sa. Sèlman ou (ak nenpòt moun ki gen lyen an) ka wè estati a.",
    },
  },
} as const;

function pickLang(language: string): "es" | "en" | "ht" {
  return language === "en" || language === "ht" ? language : "es";
}

function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtml(opts: {
  heading: string;
  body: string;
  trackingUrl: string;
  cta: string;
  note?: string;
}): string {
  return `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:Arial,sans-serif;color:#111;">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
      <div style="background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:28px;">
        <h1 style="font-size:22px;margin:0 0 12px;color:#0b1220;">${escapeHtml(opts.heading)}</h1>
        <p style="font-size:15px;line-height:1.55;color:#3a3a3a;margin:0 0 20px;">${escapeHtml(opts.body)}</p>
        <p style="text-align:center;margin:24px 0;">
          <a href="${opts.trackingUrl}" style="display:inline-block;background:#0b1220;color:#fff;text-decoration:none;padding:14px 26px;border-radius:8px;font-weight:700;font-size:15px;">${escapeHtml(opts.cta)}</a>
        </p>
        ${opts.note ? `<p style="font-size:12px;color:#777;margin:18px 0 0;border-top:1px solid #eee;padding-top:14px;">${escapeHtml(opts.note)}</p>` : ""}
      </div>
      <p style="text-align:center;font-size:11px;color:#999;margin-top:18px;">DetencionDefensa.com</p>
    </div>
  </body></html>`;
}

export async function createOrUpdateCaseTracking(params: {
  sessionId: string;
  answers: Record<string, unknown>;
  language: string;
  contactEmailFromStripe?: string | null;
}): Promise<{ token: string; contactEmail: string | null } | null> {
  const a = params.answers;
  const contactEmail =
    (typeof a.contact_email === "string" && a.contact_email) ||
    params.contactEmailFromStripe ||
    null;
  const contactPhone = (typeof a.contact_phone === "string" && a.contact_phone) || null;
  const contactName = (typeof a.contact_name === "string" && a.contact_name) || null;
  const inmateName =
    (typeof a.mail_inmate_name === "string" && a.mail_inmate_name) ||
    (typeof a.full_name === "string" && a.full_name) ||
    null;

  const { data: existing } = await supabaseAdmin
    .from("case_tracking")
    .select("tracking_token")
    .eq("intake_session_id", params.sessionId)
    .maybeSingle();

  if (existing && (existing as { tracking_token: string }).tracking_token) {
    await supabaseAdmin
      .from("case_tracking")
      .update({
        contact_email: contactEmail,
        contact_phone: contactPhone,
        contact_name: contactName,
        inmate_name: inmateName,
        language: params.language,
      } as never)
      .eq("intake_session_id", params.sessionId);
    return { token: (existing as { tracking_token: string }).tracking_token, contactEmail };
  }

  const { data: inserted, error } = await supabaseAdmin
    .from("case_tracking")
    .insert({
      intake_session_id: params.sessionId,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      contact_name: contactName,
      inmate_name: inmateName,
      language: params.language,
    } as never)
    .select("tracking_token")
    .single();

  if (error || !inserted) {
    console.error("case_tracking insert failed", error);
    return null;
  }
  return { token: (inserted as { tracking_token: string }).tracking_token, contactEmail };
}

export async function sendWelcomeEmail(params: {
  to: string;
  trackingToken: string;
  language: string;
  installUrl?: string | null;
  habeasUrl?: string | null;
  ifpUrl?: string | null;
}): Promise<void> {
  const lang = pickLang(params.language);
  const c = COPY.welcome[lang];
  const trackingUrl = `${SITE_BASE}/track/${params.trackingToken}`;
  const installCta =
    lang === "es"
      ? "Instalar el botón AYUDA YA en mi teléfono"
      : lang === "ht"
      ? "Enstale bouton AYÈ KOUNYE A sou telefòn mwen"
      : "Install the HELP NOW button on my phone";
  const installNote =
    lang === "es"
      ? "Abra este enlace en el teléfono que llevará la persona en riesgo. En iPhone (Safari): toque el ícono Compartir y luego 'Añadir a pantalla de inicio'. En Android (Chrome): toque el menú ⋮ y luego 'Instalar app' o 'Añadir a pantalla de inicio'. Mantenga presionado el botón AYUDA YA durante 15 segundos en una emergencia para alertar a nuestro equipo legal y a su contacto de emergencia con copia de los formularios adjunta."
      : lang === "ht"
      ? "Louvri lyen sa a sou telefòn moun ki an risk la. Sou iPhone (Safari): tape ikon Pataje a epi 'Add to Home Screen'. Sou Android (Chrome): tape meni ⋮ a epi 'Install app' oswa 'Add to Home Screen'. Kenbe peze bouton AYÈ KOUNYE A pandan 15 segond nan yon ijans pou alète ekip legal nou ak kontak ijans ou ak yon kopi fòm yo."
      : "Open this link on the phone the at-risk person will carry. On iPhone (Safari): tap the Share icon then 'Add to Home Screen'. On Android (Chrome): tap the ⋮ menu then 'Install app' or 'Add to Home Screen'. Press and hold the HELP NOW button for 15 seconds in an emergency to alert our legal team and your emergency contact with copies of the forms attached.";
  const installSection = params.installUrl
    ? `<div style="margin-top:18px;padding:18px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;">
        <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#991b1b;">${escapeHtml(installCta)}</p>
        <p style="margin:0 0 12px;font-size:13px;color:#7f1d1d;line-height:1.5;">${escapeHtml(installNote)}</p>
        <p style="text-align:center;margin:0;">
          <a href="${params.installUrl}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:14px 26px;border-radius:8px;font-weight:700;font-size:15px;">${escapeHtml(installCta)}</a>
        </p>
        <p style="margin:10px 0 0;font-size:11px;color:#a16207;">One-time link. Valid 30 days. Open it on the phone that will carry the app.</p>
      </div>`
    : "";

  const pdfHeading =
    lang === "es"
      ? "Sus formularios preparados (PDF)"
      : lang === "ht"
      ? "Fòm yo prepare pou ou (PDF)"
      : "Your prepared forms (PDF)";
  const pdfNote =
    lang === "es"
      ? "Descárguelos e imprímalos. Los enlaces seguros expiran en 14 días."
      : lang === "ht"
      ? "Telechaje epi enprime yo. Lyen sekirize yo ekspire nan 14 jou."
      : "Download and print. Secure links expire in 14 days.";
  const pdfSection = params.habeasUrl || params.ifpUrl
    ? `<div style="margin-top:18px;padding:18px;background:#f6f8fa;border:1px solid #d0d7de;border-radius:10px;">
        <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#0a1f44;">${escapeHtml(pdfHeading)}</p>
        ${params.habeasUrl ? `<p style="margin:0 0 6px;"><a href="${params.habeasUrl}" style="color:#0a58ca;text-decoration:underline;font-size:14px;">AO 242 — Petition for Writ of Habeas Corpus (28 U.S.C. § 2241).pdf</a></p>` : ""}
        ${params.ifpUrl ? `<p style="margin:0;"><a href="${params.ifpUrl}" style="color:#0a58ca;text-decoration:underline;font-size:14px;">AO 240 — Application to Proceed In Forma Pauperis.pdf</a></p>` : ""}
        <p style="margin:10px 0 0;font-size:11px;color:#666;">${escapeHtml(pdfNote)}</p>
      </div>`
    : "";

  const html = buildHtml({
    heading: c.heading,
    body: c.body,
    trackingUrl,
    cta: c.cta,
    note: c.note,
  }).replace("</div>\n      <p ", `${pdfSection}${installSection}</div>\n      <p `);
  const text = `${c.heading}\n\n${c.body}\n\n${c.cta}: ${trackingUrl}\n\n${
    params.habeasUrl ? `AO 242 Habeas: ${params.habeasUrl}\n` : ""
  }${params.ifpUrl ? `AO 240 IFP: ${params.ifpUrl}\n` : ""}${
    params.installUrl ? `\n${installCta}: ${params.installUrl}\n` : ""
  }\n${c.note}`;
  await enqueueFamilyEmail({
    to: params.to,
    subject: c.subject,
    html,
    text,
    template: "case-tracking-welcome",
    trackingToken: params.trackingToken,
  });
}
