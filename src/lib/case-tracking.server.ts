// Server-only: family-facing case tracking lifecycle.

import { supabaseAdmin } from "@/integrations/supabase/client.server";


const FROM = "intake@gohomesooner.com";
const SENDER_DOMAIN = "notify.gohomesooner.com";
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
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#ffffff;font-family:Arial,sans-serif;color:#111;">
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
    (typeof a.client_email === "string" && a.client_email) ||
    (typeof a.contact_email === "string" && a.contact_email) ||
    params.contactEmailFromStripe ||
    null;
  const contactPhone =
    (typeof a.client_mobile === "string" && a.client_mobile) ||
    (typeof a.contact_phone === "string" && a.contact_phone) || null;
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
  clientInstallUrl?: string | null;
  familyInstallUrl?: string | null;
  habeasUrl?: string | null;
  ifpUrl?: string | null;
  inmateName?: string;
  demoMode?: boolean;
  inviteCode?: string | null;
}): Promise<void> {
  const lang = pickLang(params.language);
  const c = COPY.welcome[lang];
  const trackingUrl = `${SITE_BASE}/track/${params.trackingToken}`;
  const inmate = escapeHtml(params.inmateName || "");
  console.info(
    `[invite-code] sendWelcomeEmail.render to=${params.to} lang=${lang} invite_code=${params.inviteCode ?? "MISSING"} invite_code_len=${params.inviteCode?.length ?? 0} rendering=${params.inviteCode ? "defensasiempre_block" : params.clientInstallUrl || params.familyInstallUrl ? "pwa_install_block" : "no_activation_block"}`,
  );
  const demoBanner = params.demoMode
    ? `<div style="margin:0 0 18px;padding:16px 18px;background:#0b1220;border:2px solid #e8a04a;border-radius:10px;text-align:center;"><p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;color:#e8a04a;font-weight:700;">DEMO · INVESTOR PREVIEW</p><p style="margin:0;font-size:18px;font-weight:800;color:#fff5d6;">ASSET PROTECTION ACTIVATED</p><p style="margin:6px 0 0;font-size:12px;color:#fff5d6;line-height:1.4;">This is a preview of what the NOTIFY FAMILY app will deliver to both phones the moment activation fires.</p></div>`
    : "";

  // ---------- Service description + family-activation copy ----------
  const serviceCopy = {
    es: {
      serviceTitle: "Cómo funciona DetencionDefensa",
      servicePoints: [
        "Preparamos los formularios federales (Habeas AO 242 + IFP AO 240) listos para presentar.",
        "Instalamos un botón AVISAR A FAMILIA en el teléfono de la persona en riesgo.",
        "Si se activa, alertamos al equipo legal con su nombre, ubicación GPS y formularios — y comenzamos a localizarlo, notificar a sus contactos y preparar el paquete para enviarle.",
      ],
      familyTitle: `Si le informan que ${inmate || "su ser querido"} fue detenido`,
      familyBody:
        "Active el servicio desde SU teléfono usando el botón de abajo. Tendrá 12 horas para cancelar (manteniendo presionado 15 segundos) si fue una falsa alarma. Si no cancela, comenzamos el protocolo: localización, notificación a contactos y envío del paquete.",
      whyTwoButtons:
        "Hay DOS botones: uno para el teléfono de la persona en riesgo (cancelación de 2 horas — porque está cerca del peligro) y uno para SU teléfono como contacto familiar (cancelación de 12 horas — para confirmar la detención).",
      clientCta: "Instalar en el teléfono de la persona en riesgo (cancelación 2h)",
      familyCta: "Instalar en MI teléfono como contacto familiar (cancelación 12h)",
    },
    en: {
      serviceTitle: "How DetencionDefensa works",
      servicePoints: [
        "We prepare federal forms (Habeas AO 242 + IFP AO 240) ready to file.",
        "We install a NOTIFY FAMILY button on the at-risk person's phone.",
        "If triggered, we alert the legal team with name, GPS, and forms — and begin locating them, notifying contacts, and preparing the mail packet.",
      ],
      familyTitle: `If you are told ${inmate || "your loved one"} has been detained`,
      familyBody:
        "Activate the service from YOUR phone using the button below. You will have 12 hours to cancel (hold the button 15 seconds) if it was a false alarm. Otherwise we begin: locating, contact notification, and packet mailing.",
      whyTwoButtons:
        "There are TWO buttons: one for the at-risk person's phone (2-hour cancel window — they are close to the danger) and one for YOUR phone as family contact (12-hour cancel window — to confirm the detention).",
      clientCta: "Install on the at-risk person's phone (2h cancel)",
      familyCta: "Install on MY phone as family contact (12h cancel)",
    },
    ht: {
      serviceTitle: "Ki jan DetencionDefensa fonksyone",
      servicePoints: [
        "Nou prepare fòm federal yo (Habeas AO 242 + IFP AO 240) pare pou depoze.",
        "Nou enstale yon bouton AVIZE FANMI sou telefòn moun ki an risk la.",
        "Si w aktive li, nou alète ekip legal la ak non, GPS, ak fòm yo — epi nou kòmanse jwenn li, alète kontak yo, epi prepare pakè a.",
      ],
      familyTitle: `Si yo di ou ${inmate || "moun ou renmen an"} arete`,
      familyBody:
        "Aktive sèvis la depi telefòn PA OU avèk bouton anba a. W ap gen 12 èdtan pou anile (kenbe peze 15 segond) si li te yon fo alam. Si w pa anile, nou kòmanse pwotokòl la.",
      whyTwoButtons:
        "Genyen DE bouton: youn pou telefòn moun ki an risk la (anilasyon 2 èdtan) ak youn pou telefòn PA OU kòm kontak fanmi (anilasyon 12 èdtan).",
      clientCta: "Enstale sou telefòn moun ki an risk la (anile 2è)",
      familyCta: "Enstale sou telefòn PA M kòm kontak fanmi (anile 12è)",
    },
  } as const;
  const sc = serviceCopy[lang];

  const installButton = (url: string, label: string, color: string) =>
    `<p style="text-align:center;margin:14px 0;">
      <a href="${url}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;padding:14px 22px;border-radius:8px;font-weight:700;font-size:14px;line-height:1.3;">${escapeHtml(label)}</a>
    </p>`;

  const clientInstallSection = params.clientInstallUrl
    ? installButton(params.clientInstallUrl, sc.clientCta, "#dc2626")
    : "";
  const familyInstallSection = params.familyInstallUrl
    ? installButton(params.familyInstallUrl, sc.familyCta, "#0b1220")
    : "";


  const notDownloadNote = {
    es: "Esto NO es una descarga automática. Toque el botón abajo en el teléfono correcto, luego siga las instrucciones para guardar el ícono rojo AVISAR A FAMILIA en la pantalla de inicio (toma 10 segundos). En iPhone debe abrirse en Safari.",
    en: "This is NOT an automatic download. Tap the button below on the correct phone, then follow the prompts to save the red NOTIFY FAMILY icon to the home screen (takes 10 seconds). On iPhone you must open it in Safari.",
    ht: "Sa a se PA yon telechajman otomatik. Peze bouton an anba sou bon telefòn nan, epi swiv enstriksyon yo pou sove ikòn wouj AVIZE FANMI sou ekran prensipal la (li pran 10 segond). Sou iPhone fòk ou ouvri li nan Safari.",
  }[lang];

  // DefensaSiempre activation block (preferred when we have an invite_code from
  // the webhook). Uses the defensasiempre:// custom scheme so installed apps
  // open and prefill the code. Plain code is always visible so users can type
  // it by hand when email clients (e.g. Gmail desktop) strip custom schemes.
  const activationCopy = {
    es: {
      label: "SU CÓDIGO DE ACTIVACIÓN",
      installTitle: "Paso 1 — Instalar la app",
      installBody: "Toque el botón que coincida con su teléfono. Toma menos de 1 minuto.",
      iphoneBtn: "📱 Instalar en iPhone",
      androidBtn: "🤖 Instalar en Android",
      step2: "Paso 2 — Abra la app e ingrese el código de arriba.",
      alreadyInstalled: "¿Ya tiene la app instalada? Tocar aquí para abrirla con el código.",
      stripped: "Si el botón de abrir la app no funciona, escriba el código a mano en la pantalla de activación.",
    },
    en: {
      label: "YOUR ACTIVATION CODE",
      installTitle: "Step 1 — Install the app",
      installBody: "Tap the button that matches your phone. Takes under 1 minute.",
      iphoneBtn: "📱 Install on iPhone",
      androidBtn: "🤖 Install on Android",
      step2: "Step 2 — Open the app and enter the code above.",
      alreadyInstalled: "Already installed the app? Tap here to open it with the code.",
      stripped: "If the open-app button doesn't work, type the code by hand in the activation screen.",
    },
    ht: {
      label: "KÒD AKTIVASYON OU",
      installTitle: "Etap 1 — Enstale app la",
      installBody: "Peze bouton ki koresponn ak telefòn ou. Li pran mwens pase 1 minit.",
      iphoneBtn: "📱 Enstale sou iPhone",
      androidBtn: "🤖 Enstale sou Android",
      step2: "Etap 2 — Ouvri app la epi antre kòd la anwo.",
      alreadyInstalled: "App la deja enstale? Peze la pou ouvri li ak kòd la.",
      stripped: "Si bouton ouvri app la pa mache, tape kòd la a la men nan ekran aktivasyon an.",
    },
  }[lang];

  const downloadIos = `${SITE_BASE}/download?p=ios`;
  const downloadAndroid = `${SITE_BASE}/download?p=android`;

  const defensaSection = params.inviteCode
    ? `<div style="margin-top:24px;padding:24px 20px;background:#fef2f2;border:2px solid #dc2626;border-radius:10px;">
        <p style="margin:0 0 10px;font-size:12px;letter-spacing:2px;font-weight:800;color:#991b1b;text-align:center;">${escapeHtml(activationCopy.label)}</p>
        <p style="margin:0 0 22px;font-size:34px;font-weight:900;letter-spacing:6px;color:#0b1220;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;word-break:break-all;text-align:center;">${escapeHtml(params.inviteCode)}</p>
        <p style="margin:0 0 6px;font-size:15px;font-weight:800;color:#0b1220;">${escapeHtml(activationCopy.installTitle)}</p>
        <p style="margin:0 0 14px;font-size:13px;color:#374151;line-height:1.5;">${escapeHtml(activationCopy.installBody)}</p>
        <p style="text-align:center;margin:0 0 10px;">
          <a href="${downloadIos}" style="display:inline-block;background:#0b1220;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:8px;font-weight:800;font-size:15px;min-width:220px;">${escapeHtml(activationCopy.iphoneBtn)}</a>
        </p>
        <p style="text-align:center;margin:0 0 18px;">
          <a href="${downloadAndroid}" style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;padding:14px 22px;border-radius:8px;font-weight:800;font-size:15px;min-width:220px;">${escapeHtml(activationCopy.androidBtn)}</a>
        </p>
        <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:#0b1220;">${escapeHtml(activationCopy.step2)}</p>
        <p style="margin:0 0 4px;font-size:12px;color:#6b7280;line-height:1.5;text-align:center;">
          <a href="defensasiempre://activate?code=${encodeURIComponent(params.inviteCode)}" style="color:#6b7280;text-decoration:underline;">${escapeHtml(activationCopy.alreadyInstalled)}</a>
        </p>
        <p style="margin:10px 0 0;font-size:11px;color:#7f1d1d;line-height:1.5;font-style:italic;text-align:center;">${escapeHtml(activationCopy.stripped)}</p>
      </div>`
    : "";


  const familyActivationSection = params.inviteCode
    ? defensaSection
    : (params.clientInstallUrl || params.familyInstallUrl)
    ? `<div style="margin-top:18px;padding:18px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;">
        <p style="margin:0 0 8px;font-size:15px;font-weight:800;color:#991b1b;">${escapeHtml(sc.familyTitle)}</p>
        <p style="margin:0 0 12px;font-size:13px;color:#7f1d1d;line-height:1.55;">${escapeHtml(sc.familyBody)}</p>
        <p style="margin:0 0 14px;font-size:12px;color:#7f1d1d;line-height:1.5;font-style:italic;">${escapeHtml(sc.whyTwoButtons)}</p>
        <p style="margin:0 0 14px;padding:10px 12px;background:#fff7ed;border:1px solid #fed7aa;border-radius:6px;font-size:12px;color:#9a3412;line-height:1.5;">⚠️ ${escapeHtml(notDownloadNote)}</p>
        ${clientInstallSection}
        ${familyInstallSection}
        <p style="margin:12px 0 0;font-size:11px;color:#a16207;">One-time links. Valid 30 days. Open each link on the matching phone.</p>
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
  })
    .replace(
      `<div style="background:#fff;`,
      `${demoBanner}<div style="background:#fff;`,
    )
    .replace(
      "</div>\n      <p ",
      `${pdfSection}${familyActivationSection}</div>\n      <p `,
    );
  const subjectFinal = params.demoMode ? `[DEMO] ${c.subject}` : c.subject;
  const text = `${c.heading}\n\n${c.body}\n\n${c.cta}: ${trackingUrl}\n${
    params.inviteCode ? `\n${activationCopy.label}: ${params.inviteCode}\n${activationCopy.iphoneBtn}: ${downloadIos}\n${activationCopy.androidBtn}: ${downloadAndroid}\n` : ""
  }${
    params.clientInstallUrl ? `\n${sc.clientCta}: ${params.clientInstallUrl}` : ""
  }${params.familyInstallUrl ? `\n${sc.familyCta}: ${params.familyInstallUrl}` : ""}\n${
    params.habeasUrl ? `\nAO 242 Habeas: ${params.habeasUrl}` : ""
  }${params.ifpUrl ? `\nAO 240 IFP: ${params.ifpUrl}` : ""}\n\n${c.note}`;
  await enqueueFamilyEmail({
    to: params.to,
    subject: subjectFinal,
    html,
    text,
    template: "case-tracking-welcome",
    trackingToken: params.trackingToken,
  });
}
