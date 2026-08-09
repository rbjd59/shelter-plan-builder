// Server-only: enqueues the three "client activated" emails described in
// the spec — one to the company, one to the attorney, one to EACH emergency
// contact listed in the intake answers. Intentionally minimal: no PDFs,
// no Sentinel upsell, no spam-warning content.

import { supabaseAdmin } from "@/integrations/supabase/client.server";

const FROM = "info@gohomesooner.com";
const SENDER_DOMAIN = "notify.gohomesooner.com";

const COMPANY_EMAIL = "alerts@detenciondefensa.com";
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

function clientWelcomeContent(lang: string, name: string, code: string) {
  if (lang === "es") {
    return {
      subject: "Su cuenta DetencionDefensa está activa",
      heading: "¡Bienvenido(a), " + name + "!",
      body: [
        "Su intake está completo y su cuenta está activa.",
        "Su código de activación es:",
        "Su abogado ya tiene copias de sus documentos preparados (abajo).",
        "Toque el botón para descargar la aplicación en su teléfono. Si está en un iPhone, lo llevará directo a TestFlight. Si está en Android, descargará la APK.",
      ],
      button: "Descargar la aplicación",
      configureHeading: "Configure su aplicación desde el sitio web",
      configureBody: "Puede ingresar sus contactos de emergencia, mascotas, documentos y PIN de cancelación desde la web — no es necesario hacerlo en el teléfono. Todo se sincroniza automáticamente con la app.",
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
        "Peze bouton an pou telechaje aplikasyon an sou telefòn ou. Sou iPhone, l ap mennen ou dirèkteman nan TestFlight. Sou Android, l ap telechaje APK la.",
      ],
      button: "Telechaje aplikasyon an",
      configureHeading: "Konfigire aplikasyon ou sou sit entènèt la",
      configureBody: "Ou ka antre kontak ijans, bèt kay, dokiman ak PIN anilasyon w sou entènèt — ou pa bezwen fè sa sou telefòn lan. Tout bagay sinkronize otomatikman ak aplikasyon an.",
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
      "Tap the button to download the app on your phone. On iPhone it takes you straight to TestFlight. On Android it downloads the APK.",
    ],
    button: "Download the app",
    configureHeading: "Set up your app from the website",
    configureBody: "You can enter your emergency contacts, pets, documents, and cancel PIN from the web — you don't have to do it on the phone. Everything syncs automatically with the app.",
    configureButton: "Set up from the web",
    docsHeading: "Documents prepared for your attorney",
    footer: "If you have any trouble, just reply to this email.",
  };
}

export async function enqueueActivationEmails(p: ActivationEmailParams): Promise<void> {
  const a = p.answers;
  const code = (p.activationCode ?? "").trim() || "(pending)";
  const activatedAt = (p.activatedAt ?? new Date()).toISOString();
  const clientName = String(
    a.full_name || a.mail_inmate_name || a.contact_name || "Client",
  );
  const clientEmailRaw =
    typeof a.client_email === "string" ? a.client_email.trim().toLowerCase() :
    typeof a.contact_email === "string" ? a.contact_email.trim().toLowerCase() : "";
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
  }
}

