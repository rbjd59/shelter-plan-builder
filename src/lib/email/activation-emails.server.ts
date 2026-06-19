// Server-only: enqueues the three "client activated" emails described in
// the spec — one to the company, one to the attorney, one to EACH emergency
// contact listed in the intake answers. Intentionally minimal: no PDFs,
// no Sentinel upsell, no spam-warning content.

import { supabaseAdmin } from "@/integrations/supabase/client.server";

const FROM = "intake@gohomesooner.com";
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

export interface ActivationEmailParams {
  sessionId: string;
  answers: Record<string, unknown>;
  activationCode: string | null;
  activatedAt?: Date;
  language?: string; // "en" | "es" | "ht"
}

const DOWNLOAD_URL = "https://detenciondefensa.com/download";

function clientWelcomeContent(lang: string, name: string, code: string) {
  if (lang === "es") {
    return {
      subject: "Su cuenta DetencionDefensa está activa",
      heading: "¡Bienvenido(a), " + name + "!",
      body: [
        "Su intake está completo y su cuenta está activa.",
        "Su código de activación es:",
        "Su abogado ya tiene copias de sus documentos preparados.",
        "Descargue la aplicación e ingrese su código para activarla en su teléfono. No recibirá más correos hasta que active la alerta SOS desde la aplicación.",
      ],
      button: "Descargar la aplicación",
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
        "Avoka ou gen tan resevwa kopi dokiman ou yo.",
        "Telechaje aplikasyon an epi antre kòd ou pou aktive li sou telefòn ou. Ou pap resevwa lòt imèl jiskaske ou deklanche alèt SOS la nan aplikasyon an.",
      ],
      button: "Telechaje aplikasyon an",
      footer: "Si ou gen pwoblèm, reponn imèl sa a.",
    };
  }
  return {
    subject: "Your DetencionDefensa account is active",
    heading: "Welcome, " + name + "!",
    body: [
      "Your intake is complete and your account is active.",
      "Your activation code is:",
      "Your attorney already has copies of your prepared documents.",
      "Download the app and enter your code to activate it on your phone. You will not receive any more emails until you trigger the SOS alert from the app.",
    ],
    button: "Download the app",
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
  const clientEmailRaw = typeof a.contact_email === "string" ? a.contact_email.trim().toLowerCase() : "";
  const clientEmail = clientEmailRaw && clientEmailRaw.includes("@") ? clientEmailRaw : null;
  const lang = (p.language || (typeof a.language === "string" ? a.language : "en") || "en").toLowerCase();


  // 1) Company email
  const companyHtml = wrap(`
    <h1 style="font-size:18px;margin:0 0 12px;">New client activated</h1>
    <p style="margin:0 0 6px;"><strong>Client:</strong> ${esc(clientName)}</p>
    <p style="margin:0 0 6px;"><strong>Activation code (Company ID):</strong> <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;">${esc(code)}</span></p>
    <p style="margin:14px 0 0;">Client has downloaded and activated the app.</p>
  `);
  const companyText = `New client activated
Client: ${clientName}
Activation code (Company ID): ${code}

Client has downloaded and activated the app.`;
  await enqueueOne({
    to: COMPANY_EMAIL,
    subject: `New client activated — ${clientName}`,
    html: companyHtml,
    text: companyText,
    label: "activation-company",
    idempotencyKey: `activation-company-${p.sessionId}`,
  });

  // 2) Attorney email
  const formsList = CORE_LEGAL_FORMS.map((f) => `<li style="margin:4px 0;">${esc(f)}</li>`).join("");
  const attorneyHtml = wrap(`
    <h1 style="font-size:18px;margin:0 0 12px;">Client activated — ${esc(clientName)}</h1>
    <p style="margin:0 0 6px;"><strong>Client:</strong> ${esc(clientName)}</p>
    <p style="margin:0 0 6px;"><strong>Activation code:</strong> <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-weight:700;">${esc(code)}</span></p>
    <p style="margin:0 0 14px;"><strong>Activated at:</strong> ${esc(activatedAt)}</p>
    <p style="margin:14px 0 6px;"><strong>5 Core Legal forms on file:</strong></p>
    <ul style="padding-left:20px;margin:0 0 14px;">${formsList}</ul>
    <p style="margin:14px 0 0;color:#555;">No action required until SOS is triggered.</p>
  `);
  const attorneyText = `Client activated — ${clientName}
Activation code: ${code}
Activated at: ${activatedAt}

5 Core Legal forms on file:
${CORE_LEGAL_FORMS.map((f) => `- ${f}`).join("\n")}

No action required until SOS is triggered.`;
  await enqueueOne({
    to: ATTORNEY_EMAIL,
    subject: `Client activated — ${clientName} ${code}`,
    html: attorneyHtml,
    text: attorneyText,
    label: "activation-attorney",
    idempotencyKey: `activation-attorney-${p.sessionId}`,
  });

  // 3) Each emergency contact
  const contacts: string[] = [];
  for (const k of ["emergency_contact_email", "emergency_contact_2_email", "contact_email"]) {
    const v = a[k];
    if (typeof v === "string" && v.trim() && v.includes("@")) {
      contacts.push(v.trim().toLowerCase());
    }
  }
  const uniqueContacts = Array.from(new Set(contacts));
  for (const to of uniqueContacts) {
    const contactHtml = wrap(`
      <h1 style="font-size:18px;margin:0 0 12px;">You've been listed as an emergency contact</h1>
      <p style="margin:0 0 12px;"><strong>${esc(clientName)}</strong> has listed you as an emergency contact.</p>
      <p style="margin:0 0 12px;">If they are ever detained, you will receive an email at this address with instructions.</p>
      <p style="margin:0;color:#555;">No action is needed now.</p>
    `);
    const contactText = `You've been listed as an emergency contact.

${clientName} has listed you as an emergency contact. If they are ever detained, you will receive an email at this address with instructions.

No action is needed now.`;
    await enqueueOne({
      to,
      subject: "You've been listed as an emergency contact",
      html: contactHtml,
      text: contactText,
      label: "activation-contact",
      idempotencyKey: `activation-contact-${p.sessionId}-${to}`,
    });
  }
}
