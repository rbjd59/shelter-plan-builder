// Server-only SMS notification helpers for intake + case status alerts.
// Call only from server functions / server routes.

import { sendSms } from "./twilio-sms.server";

type Lang = "en" | "es" | "ht";

function pickLang(raw: string | null | undefined): Lang {
  const v = (raw || "").toLowerCase();
  if (v.startsWith("es")) return "es";
  if (v.startsWith("ht")) return "ht";
  return "en";
}

const INTAKE_CONFIRM: Record<Lang, (code: string) => string> = {
  en: (c) =>
    `DetencionDefensa: We received your case. Attorney review within 24h. Your code: ${c}. Tap to install: https://detenciondefensa.com/get-app — Reply STOP to opt out.`,
  es: (c) =>
    `DetencionDefensa: Recibimos su caso. Revisión del abogado en 24h. Su código: ${c}. Toque para instalar: https://detenciondefensa.com/get-app — Responda STOP para cancelar.`,
  ht: (c) =>
    `DetencionDefensa: Nou resevwa ka ou. Avoka ap revize nan 24è. Kòd ou: ${c}. Peze pou enstale: https://detenciondefensa.com/get-app — Reponn STOP pou sispann.`,
};

const STEP_BODY: Record<1 | 2 | 3, Record<Lang, (name: string) => string>> = {
  1: {
    en: (n) => `DetencionDefensa: Case update for ${n} — Step 1 complete: your intake has been received and assigned to the attorney team.`,
    es: (n) => `DetencionDefensa: Actualización para ${n} — Paso 1 completo: su caso fue recibido y asignado al equipo legal.`,
    ht: (n) => `DetencionDefensa: Mizajou pou ${n} — Etap 1 fini: nou resevwa ka ou epi nou voye li bay ekip avoka a.`,
  },
  2: {
    en: (n) => `DetencionDefensa: Case update for ${n} — Step 2 complete: legal forms have been mailed to the detainee.`,
    es: (n) => `DetencionDefensa: Actualización para ${n} — Paso 2 completo: los formularios fueron enviados al detenido.`,
    ht: (n) => `DetencionDefensa: Mizajou pou ${n} — Etap 2 fini: dokiman legal yo voye bay moun ki nan detansyon an.`,
  },
  3: {
    en: (n) => `DetencionDefensa: Case update for ${n} — Step 3 complete: copies sent to the family. Track: https://detenciondefensa.com/track/`,
    es: (n) => `DetencionDefensa: Actualización para ${n} — Paso 3 completo: copias enviadas a la familia. Seguimiento: https://detenciondefensa.com/track/`,
    ht: (n) => `DetencionDefensa: Mizajou pou ${n} — Etap 3 fini: kopi yo voye bay fanmi an. Swiv: https://detenciondefensa.com/track/`,
  },
};

export async function sendIntakeConfirmationSms(opts: {
  phone: string | null | undefined;
  language: string | null | undefined;
  inviteCode: string | null | undefined;
  intakeSessionId: string;
}): Promise<void> {
  if (!opts.phone) return;
  const code = opts.inviteCode || "PENDING";
  const body = INTAKE_CONFIRM[pickLang(opts.language)](code);
  await sendSms({
    to: opts.phone,
    body,
    purpose: "intake_confirmation",
    metadata: { intake_session_id: opts.intakeSessionId, invite_code: opts.inviteCode },
  });
}

export async function sendStaffNewIntakeAlert(opts: {
  clientName: string | null | undefined;
  intakeSessionId: string;
  language: string | null | undefined;
}): Promise<void> {
  const adminPhone = process.env.ADMIN_ALERT_PHONE;
  if (!adminPhone) return;
  const name = opts.clientName || "(no name)";
  const lang = pickLang(opts.language).toUpperCase();
  const body = `[DD-ADMIN] New intake received: ${name} (${lang}). Session ${opts.intakeSessionId.slice(-12)}. Review in firm queue.`;
  await sendSms({
    to: adminPhone,
    body,
    purpose: "staff_new_intake",
    metadata: { intake_session_id: opts.intakeSessionId },
  });
}

export async function sendCaseStepSms(opts: {
  phone: string | null | undefined;
  language: string | null | undefined;
  step: 1 | 2 | 3;
  inmateName: string | null | undefined;
  intakeSessionId: string;
}): Promise<void> {
  if (!opts.phone) return;
  const name = opts.inmateName || "your loved one";
  const body = STEP_BODY[opts.step][pickLang(opts.language)](name);
  await sendSms({
    to: opts.phone,
    body,
    purpose: `case_step_${opts.step}`,
    metadata: { intake_session_id: opts.intakeSessionId, step: opts.step },
  });
}
