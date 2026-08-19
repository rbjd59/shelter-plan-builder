// Server-only: enqueues the three "client activated" emails described in
// the spec — one to the company, one to the attorney, one to EACH emergency
// contact listed in the intake answers. Intentionally minimal: no PDFs,
// no Sentinel upsell, no spam-warning content.

import { supabaseAdmin } from "@/integrations/supabase/client.server";

const FROM = "info@gohomesooner.com";
const SENDER_DOMAIN = "notify.gohomesooner.com";

const COMPANY_EMAIL = "info@detenciondefensa.com";
const ATTORNEY_EMAIL = "intake@sorrentinolawfirm.com";

const CORE_LEGAL_FORMS = [
  "AO 242 — Petition for Writ of Habeas Corpus (28 U.S.C. § 2241)",
  "AO 240 — Application to Proceed In Forma Pauperis",
  "JS-44 — Civil Cover Sheet",
  "SDFL Motion for Assignment / Referral of Counsel",
  "Memorandum of Law in Support of Habeas Petition",
];

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface EnqueueArgs {
  to: string;
  subject: string;
  html: string;
  text: string;
  label: string;
  idempotencyKey: string;
}

async function enqueueOne(args: EnqueueArgs): Promise<void> {
  const messageId = crypto.randomUUID();

  // Ensure an unsubscribe token exists for the recipient (queue worker requires one).
  let unsubscribeToken: string;
  const { data: existing } = await supabaseAdmin
    .from("email_unsubscribe_tokens" as never)
    .select("token")
    .eq("email", args.to)
    .maybeSingle();
  if (existing && (existing as { token: string }).token) {
    unsubscribeToken = (existing as { token: string }).token;
  } else {
    unsubscribeToken = crypto.randomUUID();
    await supabaseAdmin
      .from("email_unsubscribe_tokens" as never)
      .insert({ email: args.to, token: unsubscribeToken } as never);
  }

  const payload = {
    to: args.to,
    from: FROM,
    sender_domain: SENDER_DOMAIN,
    subject: args.subject,
    html: args.html,
    text: args.text,
    purpose: "transactional",
    label: args.label,
    idempotency_key: args.idempotencyKey,
    message_id: messageId,
    unsubscribe_token: unsubscribeToken,
    queued_at: new Date().toISOString(),
  };

  await supabaseAdmin.from("email_send_log" as never).insert({
    message_id: messageId,
    template_name: args.label,
    recipient_email: args.to,
    status: "pending",
  } as never);

  const { error } = await supabaseAdmin.rpc("enqueue_email" as never, {
    queue_name: "transactional_emails",
    payload: payload as never,
  } as never);

  if (error) {
    console.error("Activation email enqueue failed", { to: args.to, label: args.label, error });
  }
}

function wrap(bodyHtml: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#ffffff;font-family:Inter,Arial,sans-serif;color:#111;line-height:1.55;">
    <div style="max-width:560px;margin:0 auto;padding:28px 24px;">${bodyHtml}</div>
  </body></html>`;
}

export interface ActivationDocLink {
  label: string;
  url: string;
}

export interface ActivationEmailParams {
  sessionId: string;
  answers: Record<string, unknown>;
  activationCode: string | null;
  activatedAt?: Date;
  language?: string; // "en" | "es" | "ht"
  documentUrls?: {
    habeasUrl?: string | null;
    memorandumUrl?: string | null;
    referralUrl?: string | null;
    js44Url?: string | null;
    brochureUrl?: string | null;
    ifpUrl?: string | null;
    assetProtectionUrls?: Array<{ label: string; url: string }>;
  } | null;
}

// One-tap installer: server-side User-Agent sniff redirects Android→APK,
// iOS→TestFlight, everything else→/download instructions.
const DOWNLOAD_URL = "https://detenciondefensa.com/get-app";
const CONFIGURE_URL = "https://detenciondefensa.com/configurar";
const FAMILY_FORMS_URL = "https://detenciondefensa.com/family-forms";

// Separate email: the blank authorization forms are NOT in the app. They must
// be printed, signed in front of a notary, and left sealed with family.
function familyFormsContent(lang: string, name: string) {
  const url = (l: string) => `${FAMILY_FORMS_URL}?lang=${l}`;
  if (lang === "es") {
    return {
      subject: "Importante: sus formularios familiares — imprimir, firmar y notarizar",
      heading: `${name}, prepare sus formularios familiares ahora`,
      body: [
        "Estos formularios NO están dentro de la aplicación y nunca se firman por adelantado. La mayoría deben firmarse ante un notario para ser válidos.",
        "Descárguelos, complételos, notarícelos y déjelos en un sobre sellado con un familiar de confianza — para abrir solo si usted es detenido.",
      ],
      steps: [
        "Abra el enlace y descargue cada formulario en su idioma.",
        "Imprímalos. Todavía no los firme.",
        "Complete nombres, direcciones y datos con sus propias palabras.",
        "Fírmelos ante un notario (UPS Store, banco o notario público — $5 a $15 cada uno).",
        "Póngalos en un sobre y escriba: ABRIR SOLO SI ME DETIENEN.",
        "Entregue el sobre a la persona de mayor confianza y dígale dónde está.",
      ],
      button: "Ver y descargar los formularios",
      url: url("es"),
      footer:
        "Solo preparación y traducción de documentos. Esto NO es asesoría legal. Pida a un abogado con licencia en su estado que revise el poder notarial y los formularios de tutela antes de firmarlos.",
    };
  }
  if (lang === "ht") {
    return {
      subject: "Enpòtan: fòm fanmi ou yo — enprime, siyen ak notarye",
      heading: `${name}, prepare fòm fanmi ou yo kounye a`,
      body: [
        "Fòm sa yo PA nan app la e yo pa janm pre-siyen. Pifò ladan yo dwe siyen devan yon notè pou yo valab.",
        "Telechaje yo, ranpli yo, fè yo notarye, epi kite yo nan yon anvlòp sele ak yon fanmi ou fè konfyans — pou louvri sèlman si yo detni w.",
      ],
      steps: [
        "Louvri lyen an epi telechaje chak fòm nan lang ou.",
        "Enprime yo. Pa siyen ankò.",
        "Ranpli non, adrès, ak detay nan pwòp mo pa w.",
        "Siyen yo devan yon notè (UPS Store, bank, oswa notè piblik — $5 a $15 chak).",
        "Mete yo nan yon anvlòp epi ekri: LOUVRI SÈLMAN SI YO DETNI M.",
        "Bay anvlòp la moun ou fè plis konfyans epi di l kote li ye.",
      ],
      button: "Gade epi telechaje fòm yo",
      url: url("ht"),
      footer:
        "Sèlman preparasyon ak tradiksyon dokiman. Sa a PA konsèy legal. Fè yon avoka ki gen lisans nan eta w revize pouvwa avoka a ak fòm gad yo anvan ou siyen.",
    };
  }
  return {
    subject: "Important: your family forms — print, sign, notarize",
    heading: `${name}, prepare your family forms now`,
    body: [
      "These forms are NOT inside the app and are never pre-signed. Most of them must be signed in front of a notary to be valid.",
      "Download them, fill them out, have them notarized, and leave them in a sealed envelope with a family member you trust — to be opened only if you are detained.",
    ],
    steps: [
      "Open the link and download each form in your language.",
      "Print them. Do not sign yet.",
      "Fill in names, addresses, and details in your own words.",
      "Sign them in front of a notary (UPS Store, bank, or notary public — $5 to $15 each).",
      "Put them in an envelope and write: OPEN ONLY IF I AM DETAINED.",
      "Give the envelope to the person you trust most and tell them where it is.",
    ],
    button: "View and download the forms",
    url: url("en"),
    footer:
      "Document preparation and translation only. This is NOT legal advice. Have an attorney licensed in your state review the power of attorney and guardianship forms before signing.",
  };
}



function clientWelcomeContent(lang: string, name: string, code: string) {
  if (lang === "es") {
    return {
      subject: "Su cuenta DetencionDefensa está activa",
      heading: "¡Bienvenido(a), " + name + "!",
      body: [
        "Su intake está completo y su cuenta está activa.",
        "Su código de activación es:",
        "Su abogado ya tiene copias de sus documentos preparados (abajo).",
        "Android está disponible ahora. Apple/iPhone estará disponible próximamente.",
      ],
      button: "Descargar app para Android",
      manualHeading: "Manual de inicio rápido",
      installSteps: [
        "Toque Descargar app para Android y espere hasta que termine toda la descarga.",
        "Toque la descarga. Si no abre, abra Archivos o Mis archivos → Descargas y toque el archivo detenciondefensa que termina en .apk.",
        "Si Android lo bloquea, toque Configuración, permita instalar desde esta fuente para Chrome, regrese y toque Instalar.",
        "Abra DetencionDefensa e ingrese el código de activación de arriba.",
      ],
      useSteps: [
        "Contactos: agregue y guarde hasta tres familiares de confianza. Los contactos del equipo legal están bloqueados.",
        "Documentos familiares: confirme que aparecen sus documentos y toque uno para verlo.",
        "Botones inferiores: úselos para ir a Inicio, Contactos, Documentos familiares y Perfil/Configuración.",
        "Activar: use el control rojo de emergencia/SOS solamente cuando necesite ayuda y confirme en pantalla.",
        "Desactivar/cancelar: use el control de cancelar y siga las instrucciones de mantener presionado o ingresar su PIN. Confirme que la app diga que la alerta fue cancelada.",
        "No envíe una alerta real solamente para practicar.",
      ],
      apple: "Apple/iPhone — Próximamente. Le enviaremos un nuevo mensaje cuando la versión de Apple esté lista.",
      configureHeading: "Configure sus datos desde el sitio web",
      configureBody: "También puede ingresar sus tres contactos familiares, revisar documentos y configurar su PIN de cancelación desde la web. Todo se sincroniza con la app.",
      configureButton: "Configurar desde la web",
      docsHeading: "Documentos preparados para su abogado",
      footer: "Si tiene problemas, responda a este correo.",
    };
  }
  if (lang === "ht") {
    return {
      subject: "Kont DetencionDefensa ou aktive",
      heading: "Byenveni, " + name + "!",
      body: [
        "Enskripsyon ou fini epi kont ou aktive.",
        "Kòd aktivasyon ou se:",
        "Avoka ou gen tan resevwa kopi dokiman ou yo (anba a).",
        "Android disponib kounye a. Apple/iPhone ap vini byento.",
      ],
      button: "Telechaje app Android la",
      manualHeading: "Manyèl demaraj rapid",
      installSteps: [
        "Peze Telechaje app Android la epi tann tout telechajman an fini.",
        "Peze telechajman an. Si li pa ouvri, ouvri Files oswa My Files → Downloads epi peze fichye detenciondefensa ki fini ak .apk.",
        "Si Android bloke li, peze Settings, pèmèt enstalasyon soti nan sous sa pou Chrome, retounen epi peze Install.",
        "Ouvri DetencionDefensa epi antre kòd aktivasyon ki anwo a.",
      ],
      useSteps: [
        "Kontak: ajoute epi sove jiska twa moun fanmi ou fè konfyans. Kontak ekip legal la bloke.",
        "Family Docs: verifye dokiman ou yo parèt epi peze youn pou wè li.",
        "Bouton anba yo: sèvi avèk yo pou ale nan Home, Contacts, Family Docs, ak Profile/Settings.",
        "Aktive: sèvi ak kontwòl ijans/SOS wouj la sèlman lè ou bezwen èd epi konfime sou ekran an.",
        "Dezaktive/anile: sèvi ak kontwòl anile a epi swiv enstriksyon pou kenbe bouton an oswa antre PIN ou. Verifye app la di alèt la anile.",
        "Pa voye yon vrè alèt sèlman pou pratike.",
      ],
      apple: "Apple/iPhone — Ap vini byento. N ap voye yon nouvo mesaj lè vèsyon Apple la pare.",
      configureHeading: "Konfigire enfòmasyon ou sou sit entènèt la",
      configureBody: "Ou ka antre twa kontak fanmi ou, verifye dokiman yo, epi konfigire PIN anilasyon ou sou entènèt la tou. Tout bagay sinkronize ak app la.",
      configureButton: "Konfigire sou entènèt la",
      docsHeading: "Dokiman pare pou avoka w",
      footer: "Si ou gen pwoblèm, reponn imèl sa a.",
    };
  }
  return {
    subject: "Your DetencionDefensa account is active",
    heading: "Welcome, " + name + "!",
    body: [
      "Your intake is complete and your account is active.",
      "Your activation code is:",
      "Your attorney already has copies of your prepared documents (below).",
      "Android is available now. Apple/iPhone is coming soon.",
    ],
    button: "Download Android app",
    manualHeading: "Quick-start manual",
    installSteps: [
      "Tap Download Android app and wait until the entire download finishes.",
      "Tap the completed download. If it does not open, open Files or My Files → Downloads and tap the detenciondefensa file ending in .apk.",
      "If Android blocks it, tap Settings, allow installation from this source for Chrome, return, and tap Install.",
      "Open DetencionDefensa and enter the activation code shown above.",
    ],
    useSteps: [
      "Contacts: add and save up to three trusted family contacts. The legal team contacts are locked.",
      "Family Docs: confirm your documents appear and tap one to view it.",
      "Bottom buttons: use them to move between Home, Contacts, Family Docs, and Profile/Settings.",
      "Activate: use the red emergency/SOS control only when help is needed and confirm on screen.",
      "Deactivate/cancel: use the cancel control and follow the hold or PIN instructions. Confirm the app says the alert was canceled.",
      "Do not send a real alert only to practice.",
    ],
    apple: "Apple/iPhone — Coming soon. We will send you a new message when the Apple version is ready.",
    configureHeading: "Set up your information from the website",
    configureBody: "You can also enter your three family contacts, review documents, and set your cancellation PIN on the website. Everything syncs with the app.",
    configureButton: "Set up from the web",
    docsHeading: "Documents prepared for your attorney",
    footer: "If you have any trouble, just reply to this email.",
  };
}

export async function enqueueActivationEmails(p: ActivationEmailParams): Promise<void> {
  const a = p.answers;
  const code = (p.activationCode ?? "").trim() || "(pending)";
  const activatedAt = (p.activatedAt ?? new Date()).toISOString();
  // Client identity only — never an emergency/family contact.
  const clientName = String(
    a.client_full_name || a.full_name || a.mail_inmate_name || "Client",
  );
  const clientEmailRaw =
    typeof a.client_email === "string" ? a.client_email.trim().toLowerCase() :
    typeof a.email === "string" ? a.email.trim().toLowerCase() : "";
  const clientEmail = clientEmailRaw && clientEmailRaw.includes("@") ? clientEmailRaw : null;

  const lang = (p.language || (typeof a.language === "string" ? a.language : "en") || "en").toLowerCase();


  // Company, attorney, and emergency contacts are recorded on the back end
  // (app_clients / client_contacts / client_documents) and visible on the
  // company + attorney boards. No emails fired here for them — only the
  // client gets a welcome email on activation. They are notified later only
  // if an SOS alert is triggered.





  // 4) Client welcome (trilingual) — one email, then silence until SOS triggered
  if (clientEmail) {
    const w = clientWelcomeContent(lang, clientName, code);

    const d = p.documentUrls ?? {};
    const docRows: Array<{ label: string; url: string }> = [];
    if (d.habeasUrl) docRows.push({ label: "AO 242 — Petition for Writ of Habeas Corpus.pdf", url: d.habeasUrl });
    if (d.ifpUrl) docRows.push({ label: "AO 240 — Application to Proceed In Forma Pauperis.pdf", url: d.ifpUrl });
    if (d.memorandumUrl) docRows.push({ label: "Memorandum of Law in Support of Petition.pdf", url: d.memorandumUrl });
    if (d.referralUrl) docRows.push({ label: "SDFL Motion for Referral to Volunteer Attorney.pdf", url: d.referralUrl });
    if (d.js44Url) docRows.push({ label: "JS-44 — Civil Cover Sheet.pdf", url: d.js44Url });
    if (d.brochureUrl) docRows.push({ label: "Habeas Explainer (NIP guide).pdf", url: d.brochureUrl });
    for (const item of d.assetProtectionUrls ?? []) docRows.push(item);

    const docsHtml = docRows.length
      ? `<div style="border:1px solid #d0d7de;border-radius:8px;padding:16px;background:#f6f8fa;margin:0 0 22px;">
          <p style="margin:0 0 10px;font-size:14px;color:#0f172a;"><strong>${esc(w.docsHeading)}</strong></p>
          ${docRows.map((r) => `<p style="margin:0 0 6px;"><a href="${r.url}" style="color:#0a58ca;text-decoration:underline;font-size:14px;">${esc(r.label)}</a></p>`).join("")}
          <p style="margin:10px 0 0;font-size:11px;color:#666;">Secure download links expire in 14 days.</p>
        </div>`
      : "";

    const html = wrap(`
      <h1 style="font-size:22px;margin:0 0 14px;color:#0f172a;">${esc(w.heading)}</h1>
      <p style="margin:0 0 14px;">${esc(w.body[0])}</p>
      <p style="margin:0 0 6px;">${esc(w.body[1])}</p>
      <p style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:28px;font-weight:800;letter-spacing:3px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:14px 18px;margin:0 0 18px;text-align:center;">${esc(code)}</p>
      <p style="margin:0 0 14px;">${esc(w.body[2])}</p>
      <p style="margin:0 0 22px;">${esc(w.body[3])}</p>
      <p style="margin:0 0 22px;text-align:center;">
        <a href="${DOWNLOAD_URL}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 26px;border-radius:8px;font-weight:600;font-size:16px;">${esc(w.button)}</a>
      </p>
      <div style="border:1px solid #cbd5e1;background:#f8fafc;border-radius:8px;padding:16px;margin:0 0 22px;">
        <p style="margin:0 0 10px;font-size:16px;color:#0f172a;"><strong>${esc(w.manualHeading)}</strong></p>
        <p style="margin:0 0 8px;font-size:14px;color:#0f172a;"><strong>Android</strong></p>
        ${w.installSteps.map((step, index) => `<p style="margin:0 0 8px;font-size:13px;color:#1f2937;"><strong>${index + 1}.</strong> ${esc(step)}</p>`).join("")}
        <p style="margin:16px 0 8px;font-size:14px;color:#0f172a;"><strong>${lang === "es" ? "Configurar y utilizar la app" : lang === "ht" ? "Konfigire epi sèvi ak app la" : "Set up and use the app"}</strong></p>
        ${w.useSteps.map((step, index) => `<p style="margin:0 0 8px;font-size:13px;color:#1f2937;"><strong>${index + 1}.</strong> ${esc(step)}</p>`).join("")}
        <p style="margin:16px 0 0;padding-top:12px;border-top:1px solid #cbd5e1;font-size:13px;font-weight:700;color:#92400e;">${esc(w.apple)}</p>
      </div>
      ${docsHtml}
      <div style="border:1px solid #bfdbfe;background:#eff6ff;border-radius:8px;padding:16px;margin:0 0 22px;">
        <p style="margin:0 0 8px;font-size:14px;color:#0f172a;"><strong>${esc(w.configureHeading)}</strong></p>
        <p style="margin:0 0 12px;font-size:13px;color:#1f2937;">${esc(w.configureBody)}</p>
        <p style="margin:0;text-align:center;">
          <a href="${CONFIGURE_URL}" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;">${esc(w.configureButton)}</a>
        </p>
      </div>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
      <p style="margin:0;color:#666;font-size:12px;">${esc(w.footer)}</p>
    `);
    const text = `${w.heading}

${w.body[0]}

${w.body[1]}
${code}

${w.body[2]}
${docRows.map((r) => `- ${r.label}: ${r.url}`).join("\n")}

${w.body[3]}

${w.button}: ${DOWNLOAD_URL}

${w.manualHeading}
Android:
${w.installSteps.map((step, index) => `${index + 1}. ${step}`).join("\n")}

${w.useSteps.map((step, index) => `${index + 1}. ${step}`).join("\n")}

${w.apple}

${w.configureHeading}
${w.configureBody}
${w.configureButton}: ${CONFIGURE_URL}

${w.footer}`;
    await enqueueOne({
      to: clientEmail,
      subject: w.subject,
      html,
      text,
      label: "activation-client-welcome",
      idempotencyKey: `activation-client-welcome-${p.sessionId}-v2`,
    });

    // 5) Separate family-forms email — print, sign, notarize, seal with family.
    const ff = familyFormsContent(lang, clientName);
    const ffHtml = wrap(`
      <h1 style="font-size:22px;margin:0 0 14px;color:#0f172a;">${esc(ff.heading)}</h1>
      <p style="margin:0 0 14px;">${esc(ff.body[0])}</p>
      <p style="margin:0 0 20px;">${esc(ff.body[1])}</p>
      <div style="border:1px solid #cbd5e1;background:#f8fafc;border-radius:8px;padding:16px;margin:0 0 22px;">
        ${ff.steps.map((s, i) => `<p style="margin:0 0 8px;font-size:13px;color:#1f2937;"><strong>${i + 1}.</strong> ${esc(s)}</p>`).join("")}
      </div>
      <p style="margin:0 0 22px;text-align:center;">
        <a href="${ff.url}" style="display:inline-block;background:#b8551f;color:#ffffff;text-decoration:none;padding:14px 26px;border-radius:8px;font-weight:600;font-size:16px;">${esc(ff.button)}</a>
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
      <p style="margin:0;color:#666;font-size:12px;">${esc(ff.footer)}</p>
    `);
    const ffText = `${ff.heading}

${ff.body[0]}

${ff.body[1]}

${ff.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}

${ff.button}: ${ff.url}

${ff.footer}`;
    await enqueueOne({
      to: clientEmail,
      subject: ff.subject,
      html: ffHtml,
      text: ffText,
      label: "activation-family-forms",
      idempotencyKey: `activation-family-forms-${p.sessionId}-v1`,
    });
  }
}


