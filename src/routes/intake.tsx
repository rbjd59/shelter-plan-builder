import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { submitDemoIntake } from "@/utils/payments.functions";
import { pairIntakeWithApp } from "@/lib/intake-pair.functions";
import { notifyIntakeWebhook } from "@/lib/intake-webhook.functions";

import { SentinelUpsellCards } from "@/components/SentinelUpsellCards";
import { BilingualField } from "@/components/intake/BilingualField";
import { readSiteLang } from "@/lib/site-lang";
import { resolveIntakeGate } from "@/lib/intake-gate";


const searchSchema = z.object({
  session_id: z.string().optional(),
  lang: z.enum(["en", "es", "ht"]).catch("es"),
});

export const Route = createFileRoute("/intake")({
  validateSearch: searchSchema,
  component: IntakePage,
  head: () => ({
    meta: [
      { title: "Intake — DetencionDefensa.com" },
      {
        name: "description",
        content:
          "Complete your DetencionDefensa.com intake: emergency contacts, asset designations, and family protection plan.",
      },
      { property: "og:title", content: "Intake — DetencionDefensa.com" },
      {
        property: "og:description",
        content: "Complete your defense plan intake — emergency contacts and asset designations.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://detenciondefensa.com/intake" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://detenciondefensa.com/intake" }],
  }),
});

type Lang = "en" | "es" | "ht";
type FieldDef = {
  key: string;
  label: Record<Lang, string>;
  hint?: Record<Lang, string>;
  type?: "text" | "textarea" | "date" | "checkbox" | "number";
  disabled?: boolean;
};

const sections: { id: string; title: Record<Lang, string>; intro: Record<Lang, string>; fields: FieldDef[] }[] = [
  {
    id: "petitioner",
    title: { en: "1. About You", es: "1. Sobre el Peticionario", ht: "1. Konsènan Petisyonè a" },
    intro: {
      en: "Form AO 242 — Petition for Writ of Habeas Corpus under 28 U.S.C. § 2241.",
      es: "Formulario AO 242 — Petición de Habeas Corpus bajo 28 U.S.C. § 2241.",
      ht: "Fòm AO 242 — Petisyon pou Habeas Corpus dapre 28 U.S.C. § 2241.",
    },
    fields: [
      { key: "full_name", label: { en: "Name on U.S. Documents / Immigration Forms", es: "Nombre legal completo", ht: "Non legal konplè" } },
      { key: "other_names_used", label: { en: "Other names used", es: "Otros nombres usados", ht: "Lòt non yo te itilize" } },
      { key: "a_number", label: { en: "Alien Registration Number (A#)", es: "Número de Registro de Extranjero (A#)", ht: "Nimewo Anrejistreman Etranje (A#)" } },
      { key: "dob", label: { en: "Date of birth", es: "Fecha de nacimiento", ht: "Dat nesans" }, type: "date" },
      { key: "place_of_birth", label: { en: "Place of birth (city, state/province)", es: "Lugar de nacimiento (ciudad, estado/provincia)", ht: "Kote ou te fèt (vil, eta/pwovens)" } },
      { key: "country_of_origin", label: { en: "Country of origin", es: "País de origen", ht: "Peyi orijin" } },
      { key: "country_of_citizenship", label: { en: "Country of citizenship", es: "País de ciudadanía", ht: "Peyi sitwayènte" } },
      { key: "court_district", disabled: true, label: { en: "U.S. District Court (e.g. Florida Southern, New York Southern)", es: "Tribunal de Distrito (ej. Florida Sur, Nueva York Sur)", ht: "Tribinal Distri (egz. Florid Sid, New York Sid)" }, hint: { en: "Leave blank — determined later based on facility", es: "Dejar en blanco — se determina después según el centro", ht: "Kite vid — n ap detèmine apre" } },
      { key: "facility_name", disabled: true, label: { en: "Facility where detained", es: "Centro donde está detenido", ht: "Sant kote li detni" }, hint: { en: "Leave blank — inmate fills after transfer", es: "Dejar en blanco", ht: "Kite vid" } },
      { key: "facility_address", disabled: true, type: "textarea", label: { en: "Facility address", es: "Dirección del centro", ht: "Adrès sant lan" }, hint: { en: "Leave blank", es: "Dejar en blanco", ht: "Kite vid" } },
      { key: "booking_number", disabled: true, label: { en: "Booking / inmate ID", es: "Número de reserva", ht: "Nimewo prizonye" }, hint: { en: "Leave blank", es: "Dejar en blanco", ht: "Kite vid" } },
      { key: "date_taken_into_custody", disabled: true, type: "date", label: { en: "Date taken into custody", es: "Fecha de detención", ht: "Dat yo te pran l" }, hint: { en: "Leave blank", es: "Dejar en blanco", ht: "Kite vid" } },
    ],
  },
  {
    id: "respondent",
    title: { en: "2. Respondent (Custodian)", es: "2. Demandado (Custodio)", ht: "2. Defandè (Gadyen)" },
    intro: {
      en: "The Warden of the facility is normally the proper respondent.",
      es: "El Director del centro es normalmente el demandado correcto.",
      ht: "Direktè sant lan se nòmalman defandè ki kòrèk la.",
    },
    fields: [
      { key: "warden_name", disabled: true, label: { en: "Warden's name", es: "Nombre del director", ht: "Non Direktè a" }, hint: { en: "Leave blank", es: "Dejar en blanco", ht: "Kite vid" } },
      { key: "warden_title", disabled: true, label: { en: "Additional Respondent", es: "Título del director", ht: "Tit Direktè a" }, hint: { en: "Leave blank", es: "Dejar en blanco", ht: "Kite vid" } },
    ],
  },
  {
    id: "detainer",
    title: { en: "3. Immigration Status", es: "3. Detención de ICE", ht: "3. Detainer ICE" },
    intro: {
      en: "Has Immigration issued a Order of Removal",
      es: "Información sobre la retención migratoria.",
      ht: "Enfòmasyon sou kenbe imigrasyon an.",
    },
    fields: [
      { key: "serious_felony", type: "checkbox", label: { en: "Have you ever been convicted of a serious felony anywhere?", es: "¿Alguna vez ha sido condenado por un delito grave en cualquier lugar?", ht: "Èske ou janm te kondane pou yon krim grav nenpòt kote?" } },
      { key: "prior_immigration_proceedings", type: "textarea", label: { en: "Describe prior Immigration Status", es: "Describa procedimientos migratorios anteriores", ht: "Dekri pwosedi imigrasyon anvan" } },
    ],
  },
  {
    id: "grounds",
    title: { en: "4. Why you believe you should not be detained by ICE ", es: "4. Motivos de la Petición", ht: "4. Rezon pou Petisyon an" },
    intro: {
      en: "Check the grounds that apply. We do NOT choose your legal grounds. If you are not sure the Attorney will complete them, Leave them blank.",
      es: "Marque los motivos que apliquen. NOSOTROS NO elegimos sus motivos legales.",
      ht: "Tcheke rezon yo. Nou PA chwazi rezon legal pou ou.",
    },
    fields: [],
  },
  {
    id: "ifp",
    title: { en: "5. Application for No Court Fee ", es: "5. AO 240 — In Forma Pauperis", ht: "5. AO 240 — In Forma Pauperis" },
    intro: {
      en: "Remember you only file this after arrested. Answer the question based upon being in jail. If you want to wait to see your financial condition after arrest, we will send you this form in English, Spanish & Hattian, wait to fill it out. This form is sworn under penalty of perjury.  You must be accurate. If you have income now and will lose your income if arrested it is best to wait to complete it. If you have no income now and are below the poverty level you may fill it out now for consideration of a sliding scale fee by DetencionDefensa.com through your church or non-profit organization.   YOU WILL BE REQUIRED TO PROVIDE PROOF OF INABILITY TO PAY. THE FILING FEE IS ONLY $5.00 AND IF YOU DO NOT COMPLETE THIS FORM YOU WILL RECIEVE A CHECK WIITH YOUR PACKAGE PAYABLE TO THE CLERK OF THE COURT FOR $5.00 SO YOU CAN SIGN AND MAIL THE PRO SE FORMS FOR FILING FROM DETENTION.",
      es: "Si no puede pagar la tasa de $5, esto pide que la exima. Ingrese 0 si no hay.",
      ht: "Si li pa kapab peye frè $5 la, sa mande tribinal la egzante l. Mete 0 si pa gen.",
    },
    fields: [
      { key: "ifp_employer", type: "textarea", label: { en: "Employer name & address (if any)", es: "Nombre y dirección del empleador", ht: "Non ak adrès anplwayè" } },
      { key: "ifp_monthly_pay", type: "number", label: { en: "Gross monthly pay ($)", es: "Pago mensual bruto ($)", ht: "Salè brit chak mwa ($)" } },
      { key: "ifp_other_income", type: "textarea", label: { en: "Other monthly income", es: "Otros ingresos mensuales", ht: "Lòt revni chak mwa" } },
      { key: "ifp_cash_on_hand", type: "number", label: { en: "Cash on hand or in bank ($)", es: "Efectivo en mano o banco ($)", ht: "Lajan likid oswa labank ($)" } },
      { key: "ifp_property", type: "textarea", label: { en: "Property of value", es: "Bienes de valor", ht: "Pwopriyete valè" } },
      { key: "ifp_dependents", type: "textarea", label: { en: "Dependents", es: "Dependientes", ht: "Depandan" } },
      { key: "ifp_monthly_expenses", type: "number", label: { en: "Monthly expenses ($)", es: "Gastos mensuales ($)", ht: "Depans chak mwa ($)" } },
      { key: "ifp_debts", type: "textarea", label: { en: "Debts owed", es: "Deudas", ht: "Dèt" } },
    ],
  },
  {
    id: "mailto",
    title: {
      en: "6. Emergency Contact for the NOTIFY FAMILY App + Mailing Address if Detained",
      es: "6. Contacto de Emergencia para la App AVISAR A FAMILIA + Dirección Postal si está Detenido",
      ht: "6. Kontak Ijans pou App AVIZE FANMI + Adrès Postal si Detni",
    },
    intro: {
      en: "If the petitioner is detained, this is where we'll mail a an additional printed copy of the File Now Packet (AO 242 + AO 240). The same person is also notified by email . Your family ca ask the Court to file the forms on your behalf if you are disabled or otherwise qualify. ",
      es: "Si el peticionario es detenido, aquí enviaremos por correo una copia impresa del Paquete File Now (AO 242 + AO 240). Esta misma persona recibe un aviso por correo electrónico — con copia de los formularios adjunta — en el momento en que el peticionario active el botón AVISAR A FAMILIA en la app móvil.",
      ht: "Si yo detni petisyonè a, se la nou pral voye yon kopi enprime nan File Now Packet la (AO 242 + AO 240). Menm moun sa a resevwa yon notifikasyon imèl — ak yon kopi fòm yo — lè petisyonè a aktive bouton AVIZE FANMI nan app la.",
    },
    fields: [
      { key: "emergency_contact_name", label: { en: "Emergency contact full name (notified by the app)", es: "Nombre completo del contacto de emergencia (notificado por la app)", ht: "Non konplè kontak ijans (app la notifye)" } },
      { key: "emergency_contact_email", label: { en: "Emergency contact email — receives the activation alert + form copies", es: "Correo del contacto de emergencia — recibe la alerta + copia de los formularios", ht: "Imèl kontak ijans — resevwa alèt la + kopi fòm yo" } },
      { key: "mail_inmate_name", label: { en: "Inmate full name (as on mail)", es: "Nombre completo del recluso", ht: "Non konplè prizonye a" } },
      { key: "mail_current_location", disabled: true, label: { en: "Where is inmate located now (facility name)", es: "¿Dónde está el recluso ahora?", ht: "Kote prizonye a ye kounye a" }, hint: { en: "Leave blank — detenciondefensa.com locates the inmate and forwards this to the attorney's office", es: "Dejar en blanco — detenciondefensa.com localiza al recluso y lo envía al despacho del abogado", ht: "Kite vid — detenciondefensa.com jwenn kote prizonye a e voye l bay biwo avoka a" } },
      { key: "mail_inmate_number", disabled: true, label: { en: "Inmate / booking number", es: "Número de recluso", ht: "Nimewo prizonye" }, hint: { en: "Leave blank — completed by detenciondefensa.com once the inmate is located", es: "Dejar en blanco — lo completa detenciondefensa.com al localizar al recluso", ht: "Kite vid — detenciondefensa.com ranpli l lè li jwenn prizonye a" } },
      { key: "mail_facility_address", disabled: true, type: "textarea", label: { en: "Facility mailing address (for printed File Now Packet)", es: "Dirección postal del centro (para el Paquete File Now impreso)", ht: "Adrès postal sant lan (pou File Now Packet enprime)" }, hint: { en: "Leave blank — completed by detenciondefensa.com once the inmate is located", es: "Dejar en blanco — lo completa detenciondefensa.com al localizar al recluso", ht: "Kite vid — detenciondefensa.com ranpli l lè li jwenn prizonye a" } },
    ],
  },
  {
    id: "contact",
    title: { en: "7. Family Contact (you)", es: "7. Contacto Familiar (usted)", ht: "7. Kontak Fanmi (ou menm)" },
    intro: {
      en: "We send the prepared forms to this contact.",
      es: "Enviamos los formularios a este contacto.",
      ht: "Nou voye fòm yo bay kontak sa a.",
    },
    fields: [
      { key: "contact_name", label: { en: "Your full name", es: "Su nombre completo", ht: "Non konplè w" } },
      { key: "contact_relation", label: { en: "Relationship to petitioner", es: "Parentesco", ht: "Relasyon" } },
      { key: "contact_phone", label: { en: "Phone (with WhatsApp if applicable)", es: "Teléfono (WhatsApp)", ht: "Telefòn (WhatsApp)" } },
      { key: "contact_email", label: { en: "Email", es: "Correo electrónico", ht: "Imèl" } },
      { key: "contact_address", type: "textarea", label: { en: "Mailing address", es: "Dirección postal", ht: "Adrès postal" } },
    ],
  },
];

const UI = {
  en: {
    title: "    ANSWER ALL QUESTIONS NOT BLOCKED",
    sub: "IF THE QUESTIONS IS BLOCKED IT MEANS THE ATTORNEY WILL COMPLETE IT IF YOU ARE DETAINED",
    upl: "The information below is translated and typed onto the Pro Se Federal Habeas Corpus Form AO 242.",
    submit: "Submit answers",
    submitting: "Submitting…",
    done: "Check your email. We just sent you a link to download the emergency app. When you receive it, follow the instructions after you enter in the activation code above. We have transferred the draft documents to your phone and scrubbed our servers of your information for your safety.",
    spamTitle: "IMPORTANT — don't let our emails go to spam",
    spamBody: "If you don't see our email, check your spam/junk folder. To make sure future emergency emails reach you, tap the button below to send us a quick test email. This trains your phone to trust intake@gohomesooner.com so our alerts always arrive.",
    spamBtn: "Send test email now",
    spamSubject: "Test — please whitelist this address",
    spamMailBody: "Hi, I am sending this so my phone recognizes your address and does not send your emails to spam. No reply needed.",
    notpaid: "We could not verify your payment. Please return to checkout.",
    backToSite: "Return to home",
    verifying: "Verifying payment…",
  },
  es: {
    title: "    RESPONDA TODAS LAS PREGUNTAS NO BLOQUEADAS",
    sub: "SI LA PREGUNTA ESTÁ BLOQUEADA, EL ABOGADO LA COMPLETARÁ SI USTED ESTÁ DETENIDO",
    upl: "NO somos un bufete de abogados. No damos consejos legales. El peticionario firma y presenta.",
    submit: "Enviar respuestas",
    submitting: "Enviando…",
    done: "Revise su correo electrónico. Acabamos de enviarle un enlace para descargar la app de emergencia. Cuando lo reciba, siga las instrucciones después de ingresar el código de activación de arriba. Hemos transferido los documentos borrador a su teléfono y borrado su información de nuestros servidores para su seguridad.",
    spamTitle: "IMPORTANTE — no deje que nuestros correos vayan a spam",
    spamBody: "Si no ve nuestro correo, revise la carpeta de spam/correo no deseado. Para asegurarse de recibir nuestros correos de emergencia, toque el botón abajo para enviarnos un correo de prueba. Esto le enseña a su teléfono a confiar en intake@gohomesooner.com.",
    spamBtn: "Enviar correo de prueba ahora",
    spamSubject: "Prueba — por favor agregue esta dirección a contactos",
    spamMailBody: "Hola, envío este correo para que mi teléfono reconozca su dirección y no envíe sus correos a spam. No es necesario responder.",
    notpaid: "No pudimos verificar su pago. Vuelva al pago.",
    backToSite: "Volver al inicio",
    verifying: "Verificando pago…",
  },
  ht: {
    title: "    REPONN TOUT KESYON KI PA BLOKE",
    sub: "SI KESYON AN BLOKE, AVOKA A AP RANPLI L SI YO DETNI W",
    upl: "Nou PA yon kabinè avoka. Nou pa bay konsèy legal. Petisyonè a siyen e depoze.",
    submit: "Voye repons",
    submitting: "K ap voye…",
    done: "Tcheke imèl ou. Nou fenk voye yon lyen pou telechaje app ijans la. Lè ou resevwa l, swiv enstriksyon yo apre ou antre kòd aktivasyon anwo a. Nou transfere dokiman bouyon yo nan telefòn ou e efase enfòmasyon ou yo nan sèvè nou pou sekirite w.",
    spamTitle: "ENPÒTAN — pa kite imèl nou yo ale nan spam",
    spamBody: "Si ou pa wè imèl nou an, tcheke katab spam/junk lan. Pou asire imèl ijans rive jwenn ou, peze bouton anba a pou voye yon imèl tès ba nou. Sa montre telefòn ou pou l fè konfyans intake@gohomesooner.com.",
    spamBtn: "Voye imèl tès la kounye a",
    spamSubject: "Tès — tanpri ajoute adrès sa a",
    spamMailBody: "Bonjou, m ap voye sa pou telefòn mwen rekonèt adrès ou epi pa voye imèl ou yo nan spam. Pa bezwen reponn.",
    notpaid: "Nou pa kapab verifye peman ou.",
    backToSite: "Tounen lakay",
    verifying: "K ap verifye peman…",
  },
} as const;

function IntakePage() {
  const { session_id, lang } = Route.useSearch();
  const navigate = useNavigate();
  const [resolvedLang, setResolvedLang] = useState<Lang | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rawLang = new URLSearchParams(window.location.search).get("lang");
    const decision = resolveIntakeGate({
      rawLang,
      siteLang: readSiteLang(),
      isAccepted: (l) =>
        window.localStorage.getItem(`dd_agreement_accepted_v1_${l}`) === "1",
    });

    if (decision.kind === "rewrite") {
      navigate({ to: "/intake", search: { lang: decision.lang }, replace: true });
      return;
    }
    if (decision.kind === "agreement") {
      navigate({ to: "/agreement", search: { lang: decision.lang }, replace: true });
      return;
    }
    setResolvedLang(decision.lang);
  }, [lang, navigate]);

  if (!resolvedLang) return null;
  return <IntakeInner sessionId={session_id} L={resolvedLang} ui={UI[resolvedLang]} />;
}


function IntakeInner({ sessionId: _session_id, L, ui }: { sessionId: string | undefined; L: Lang; ui: typeof UI[Lang] }) {

  const submitFn = useServerFn(submitDemoIntake);
  const pairFn = useServerFn(pairIntakeWithApp);
  const webhookFn = useServerFn(notifyIntakeWebhook);

  const [status, setStatus] = useState<"ready" | "submitting" | "done" | "error">("ready");
  const [errMsg, setErrMsg] = useState("");
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [englishAnswers, setEnglishAnswers] = useState<Record<string, string>>({});
  const [approvals, setApprovals] = useState<Record<string, boolean>>({});
  const [smsConsent, setSmsConsent] = useState(false);
  

  const isBilingual = L !== "en";

  const requiredApprovals = useMemo(() => {
    const keys: string[] = [];
    for (const s of sections) for (const f of s.fields) {
      if (f.disabled) continue;
      if (f.type === "checkbox" || f.type === "number" || f.type === "date") continue;
      const v = (answers[f.key] as string) || "";
      if (v.trim()) keys.push(f.key);
    }
    return keys;
  }, [answers]);
  const allApproved = !isBilingual || requiredApprovals.every((k) => approvals[k]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allApproved) {
      setErrMsg(L === "es" ? "Apruebe todas las traducciones al inglés antes de enviar." : L === "ht" ? "Apwouve tout tradiksyon Angle yo anvan w voye." : "Approve all English translations before submitting.");
      setStatus("error");
      return;
    }
    if (!smsConsent) {
      setErrMsg(L === "es" ? "Marque la casilla de consentimiento de SMS para continuar." : L === "ht" ? "Tcheke kazye konsantman SMS la pou kontinye." : "Please check the SMS consent box to continue.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    try {
      // Merge: English-approved values overwrite native values for PDF filling;
      // preserve the native originals under "<key>__native" for record copies.
      const merged: Record<string, string | boolean> = {
        ...answers,
        sms_consent: true,
        sms_consent_text:
          "I agree to receive SMS messages from DetencionDefensa.com, Inc. at the phone number provided, including an activation code and emergency-case notifications. Message and data rates may apply. Message frequency varies. Reply STOP to unsubscribe, HELP for help.",
        sms_consent_at: new Date().toISOString(),
      };
      if (isBilingual) {
        for (const [k, v] of Object.entries(answers)) {
          if (typeof v === "string" && englishAnswers[k]) {
            merged[`${k}__native`] = v;
            merged[k] = englishAnswers[k];
          }
        }
      }
      // Fire pairing + webhook first (in parallel) so we can pass the
      // DefensaSiempre invite_code into the welcome email as a deep link.
      // Pairing/webhook failures are non-fatal — we still submit so PDFs go out.
      const hasPairableData =
        !!(merged.full_name || merged.a_number || merged.dob);
      const intakeSessionId = `lovable_session_${crypto.randomUUID()}`;
      const [pairResult, webhookResult] = await Promise.all([
        hasPairableData
          ? pairFn({ data: { answers: merged, intakeSessionId } }).catch((err) => {
              console.error("Pairing failed:", err);
              return null;
            })
          : Promise.resolve(null),
        hasPairableData
          ? webhookFn({
              data: { answers: merged, intakeSessionId, language: L },
            }).catch((err) => {
              console.error("Intake webhook failed:", err);
              return null;
            })
          : Promise.resolve(null),
      ]);
      await submitFn({
        data: {
          answers: merged,
          language: L,
          inviteCode: webhookResult?.inviteCode ?? null,
        },
      });
      if (pairResult?.code) setPairCode(pairResult.code);
      if (webhookResult?.inviteCode) setInviteCode(webhookResult.inviteCode);
      setStatus("done");
    } catch (err) {
      setErrMsg((err as Error).message);
      setStatus("error");
    }
  };

  const wrap: React.CSSProperties = { minHeight: "100vh", background: "#0b1220", color: "#f6efe1", fontFamily: "Inter Tight, system-ui, sans-serif" };
  const container: React.CSSProperties = { maxWidth: isBilingual ? 1100 : 760, margin: "0 auto", padding: "32px 24px 96px" };

  if (status === "done") {
    const mailHref = `mailto:intake@gohomesooner.com?subject=${encodeURIComponent(ui.spamSubject)}&body=${encodeURIComponent(ui.spamMailBody)}`;
    return (
      <div style={wrap}><div style={container}>
        {pairCode && (
          <div style={{ background: "linear-gradient(135deg, #e8a04a 0%, #d4882c 100%)", color: "#0b1220", padding: 28, borderRadius: 12, marginBottom: 20, textAlign: "center", boxShadow: "0 8px 30px rgba(232,160,74,0.3)" }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, letterSpacing: 2, fontWeight: 700, opacity: 0.85 }}>
              {L === "es" ? "ABRA LA APP DETENCIONDEFENSA E INGRESE ESTE CÓDIGO" : L === "ht" ? "LOUVRI APP DETENCIONDEFENSA EPI ANTRE KÒD SA A" : "OPEN THE DETENCIONDEFENSA PHONE APP AND ENTER THIS CODE"}
            </p>
            <p style={{ margin: "8px 0 0", fontSize: 56, fontWeight: 900, letterSpacing: 12, fontVariantNumeric: "tabular-nums", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
              {pairCode}
            </p>
            <p style={{ margin: "12px 0 0", fontSize: 13, opacity: 0.8 }}>
              {L === "es" ? "Este código vincula su intake con la app NOTIFY FAMILY." : L === "ht" ? "Kòd sa a koneksyon antre w lan ak app NOTIFY FAMILY lan." : "This code links your intake to the NOTIFY FAMILY app."}
            </p>
          </div>
        )}
        {inviteCode && (
          <div style={{ background: "#1a2436", border: "2px solid #2d6a4f", padding: 24, borderRadius: 12, marginBottom: 20, textAlign: "center" }}>
            <p style={{ margin: "0 0 8px", fontSize: 12, letterSpacing: 2, fontWeight: 700, color: "#7fd9a8" }}>
              {L === "es" ? "SU CÓDIGO DE ACTIVACIÓN" : L === "ht" ? "KÒD AKTIVASYON OU" : "YOUR ACTIVATION CODE"}
            </p>
            <p style={{ margin: "8px 0", fontSize: 44, fontWeight: 900, letterSpacing: 10, color: "#fff5d6", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
              {inviteCode}
            </p>
            <a
              href={`defensasiempre://activate?code=${encodeURIComponent(inviteCode)}`}
              style={{
                display: "block",
                marginTop: 16,
                background: "#e8a04a",
                color: "#0b1220",
                padding: "18px 24px",
                borderRadius: 8,
                textDecoration: "none",
                fontWeight: 800,
                fontSize: 18,
              }}
            >
              {L === "es" ? "Abrir DefensaSiempre" : L === "ht" ? "Louvri DefensaSiempre" : "Open DefensaSiempre"}
            </a>
            <div style={{ display: "flex", gap: 12, marginTop: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href="#"
                style={{ flex: "1 1 160px", maxWidth: 220, background: "#0b1220", color: "#fff5d6", border: "1px solid #2d6a4f", padding: "12px 16px", borderRadius: 6, textDecoration: "none", fontSize: 13, fontWeight: 600 }}
              >
                Download on App Store
              </a>
              <a
                href="#"
                style={{ flex: "1 1 160px", maxWidth: 220, background: "#0b1220", color: "#fff5d6", border: "1px solid #2d6a4f", padding: "12px 16px", borderRadius: 6, textDecoration: "none", fontSize: 13, fontWeight: 600 }}
              >
                Get it on Google Play
              </a>
            </div>
            <p style={{ margin: "14px 0 4px", fontSize: 12, color: "#cfc8b8" }}>
              {L === "es"
                ? "¿Ya tienes la app? El código se llenará solo al tocar el botón."
                : L === "ht"
                  ? "Ou gen app la deja? Kòd la ap ranpli pou kont li lè w peze bouton an."
                  : "Already have the app? The code fills in automatically when you tap the button."}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#cfc8b8" }}>
              {L === "es"
                ? `Guarda tu código: ${inviteCode} — por si acaso.`
                : L === "ht"
                  ? `Sere kòd ou: ${inviteCode} — sizoka.`
                  : `Save your code: ${inviteCode} — just in case.`}
            </p>
          </div>
        )}
        <div style={{ background: "#0b1220", border: "2px solid #e8a04a", padding: 20, borderRadius: 8, marginBottom: 20, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff5d6" }}>POST DETENTION PLAN ENROLLED</p>
        </div>
        <div style={{ background: "#1a2436", padding: 32, borderRadius: 8, borderLeft: "4px solid #2d6a4f" }}>
          <h1 style={{ fontSize: 28, marginBottom: 16 }}>✓</h1>
          <p style={{ fontSize: 18, lineHeight: 1.6 }}>{ui.done}</p>
        </div>
        <a
          href="/download"
          style={{
            display: "block",
            marginTop: 24,
            background: "#dc2626",
            color: "#fff",
            padding: "20px 24px",
            borderRadius: 8,
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 13, letterSpacing: 1.5, opacity: 0.85, fontWeight: 700 }}>📱 INSTALL THE APP</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>Get NOTIFY FAMILY (iPhone & Android)</div>
          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4 }}>One-tap emergency alert. Install on the detainee's phone now.</div>
        </a>
        <div style={{ background: "#3a2a00", border: "2px solid #e8a04a", padding: 24, borderRadius: 8, marginTop: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff5d6", marginBottom: 12 }}>⚠ {ui.spamTitle}</h2>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: "#fff5d6", marginBottom: 20 }}>{ui.spamBody}</p>
          <a href={mailHref} style={{ display: "inline-block", background: "#e8a04a", color: "#0b1220", padding: "16px 28px", borderRadius: 6, fontSize: 17, fontWeight: 700, textDecoration: "none" }}>{ui.spamBtn}</a>
        </div>
        <div style={{ marginTop: 32 }}>
          <SentinelUpsellCards intakeSessionId={_session_id ?? ""} lang={L} />
        </div>
        <Link to="/" search={{ lang: L } as never} style={{ display: "inline-block", marginTop: 24, color: "#e8a04a" }}>{ui.backToSite}</Link>
      </div></div>
    );
  }

  return (
    <div style={wrap}>
      <div style={container}>
        <LangSwitcher current={L} />
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, fontFamily: "Fraunces, serif" }}>{ui.title}</h1>
        <p style={{ color: "#a8a59a", marginBottom: 16 }}>{ui.sub}</p>
        <div style={{ background: "#3a2a00", border: "1px solid #e8a04a", padding: 14, borderRadius: 4, marginBottom: 16, fontSize: 14, lineHeight: 1.5, color: "#fff5d6" }}>
          <strong>⚠ {ui.upl}</strong>
        </div>
        <form onSubmit={handleSubmit}>
          {sections.map((s) => (
            <section key={s.id} style={{ marginBottom: 32, background: "#1a2436", padding: 24, borderRadius: 6 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{s.title[L]}</h2>
              <p style={{ fontSize: 13, color: "#a8a59a", marginBottom: 20, fontStyle: "italic" }}>{s.intro[L]}</p>
              {s.id === "grounds" && (
                <>
                  <GroundsChecklist lang={L} answers={answers} setAnswers={setAnswers} />
                  <ReliefChecklist lang={L} answers={answers} setAnswers={setAnswers} />
                </>
              )}
              {s.fields.map((f) => {
                const isTextish = !f.type || f.type === "text" || f.type === "textarea";
                if (isTextish && !f.disabled) {
                  return (
                    <BilingualField
                      key={f.key}
                      fieldKey={f.key}
                      label={f.label[L]}
                      hint={f.hint?.[L]}
                      type={f.type === "textarea" ? "textarea" : "text"}
                      lang={L}
                      nativeValue={(answers[f.key] as string) || ""}
                      englishValue={englishAnswers[f.key] || ""}
                      approved={!!approvals[f.key]}
                      onChange={({ native, english, approved }) => {
                        setAnswers((a) => ({ ...a, [f.key]: native }));
                        setEnglishAnswers((a) => ({ ...a, [f.key]: english }));
                        setApprovals((a) => ({ ...a, [f.key]: approved }));
                      }}
                    />
                  );
                }
                return (
                  <div key={f.key} style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{f.label[L]}</label>
                    {f.hint && <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{f.hint[L]}</div>}
                    {f.type === "textarea" ? (
                      <textarea value={(answers[f.key] as string) || ""} onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))} rows={3} disabled={f.disabled} style={{ ...inputStyle, ...(f.disabled ? disabledStyle : null) }} />
                    ) : f.type === "checkbox" ? (
                      <>
                        <input type="checkbox" checked={!!answers[f.key]} onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.checked }))} disabled={f.disabled} />
                        {f.key === "serious_felony" && !!answers[f.key] && (
                          <div style={{ marginTop: 10, padding: 12, background: "#3a1f1f", border: "1px solid #ff8080", borderRadius: 4, color: "#ffd6d6", fontSize: 13, lineHeight: 1.5 }}>
                            {L === "es"
                              ? "Advertencia: Las personas condenadas por delitos graves deben considerar contactar a un abogado independiente o contratar a un abogado especializado en defensa de detención compleja. Este paquete no está destinado a personas con condenas por delitos graves."
                              : L === "ht"
                              ? "Avètisman: Moun ki te kondane pou krim grav yo ta dwe konsidere kontakte yon avoka endepandan oswa angaje yon avoka ki espesyalize nan defans detansyon konplèks. Pakè sa a pa fèt pou moun ki gen kondanasyon pou krim grav."
                              : "Warning: Persons convicted of serious felonies should consider contacting independent legal counsel or contracting with an attorney that specializes in complex detention defense. This package is not intended for persons with serious felony convictions."}
                          </div>
                        )}
                      </>
                    ) : (
                      <input type={f.type || "text"} value={(answers[f.key] as string) || ""} onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))} disabled={f.disabled} style={{ ...inputStyle, ...(f.disabled ? disabledStyle : null) }} />
                    )}
                  </div>
                );
              })}
            </section>
          ))}
          
          <label style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: 14, marginBottom: 16, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={smsConsent}
              onChange={(e) => setSmsConsent(e.target.checked)}
              style={{ marginTop: 4, width: 18, height: 18, flexShrink: 0 }}
            />
            <span style={{ fontSize: 13, lineHeight: 1.5, color: "#e8eef7" }}>
              {L === "es" ? (
                <>Acepto recibir mensajes SMS de <strong>DetencionDefensa.com, Inc.</strong> al número de teléfono proporcionado, incluyendo un código de activación y notificaciones de emergencia del caso. Pueden aplicar tarifas de mensajes y datos. La frecuencia varía. Responda STOP para cancelar la suscripción, HELP para ayuda. Consulte la <a href="/privacy" target="_blank" style={{ color: "#e8a04a" }}>Política de Privacidad</a> y los <a href="/terms" target="_blank" style={{ color: "#e8a04a" }}>Términos</a>.</>
              ) : L === "ht" ? (
                <>Mwen dakò pou m resevwa mesaj SMS soti nan <strong>DetencionDefensa.com, Inc.</strong> nan nimewo telefòn mwen bay la, ki gen ladann yon kòd aktivasyon ak notifikasyon ka ijans. Tarif mesaj ak done ka aplike. Frekans mesaj la varye. Reponn STOP pou w dezabòne, HELP pou èd. Gade <a href="/privacy" target="_blank" style={{ color: "#e8a04a" }}>Règleman Konfidansyalite</a> ak <a href="/terms" target="_blank" style={{ color: "#e8a04a" }}>Kondisyon yo</a>.</>
              ) : (
                <>I agree to receive SMS messages from <strong>DetencionDefensa.com, Inc.</strong> at the phone number provided, including an activation code and emergency-case notifications. Message and data rates may apply. Message frequency varies. Reply STOP to unsubscribe, HELP for help. See our <a href="/privacy" target="_blank" style={{ color: "#e8a04a" }}>Privacy Policy</a> and <a href="/terms" target="_blank" style={{ color: "#e8a04a" }}>Terms</a>.</>
              )}
            </span>
          </label>

          <button type="submit" disabled={status === "submitting" || !smsConsent} style={{ background: smsConsent ? "#e8a04a" : "#6b6b6b", color: "#0b1220", padding: "16px 32px", fontSize: 16, fontWeight: 700, border: "none", borderRadius: 4, cursor: smsConsent ? "pointer" : "not-allowed", width: "100%" }}>
            {status === "submitting" ? ui.submitting : ui.submit}
          </button>
          {errMsg && status === "error" && <p style={{ color: "#ff8080", marginTop: 12 }}>{errMsg}</p>}
        </form>
      </div>
    </div>
  );
}

function LangSwitcher({ current }: { current: Lang }) {
  const labels: Record<Lang, string> = { es: "Español", en: "English", ht: "Kreyòl" };
  const langs: Lang[] = ["es", "en", "ht"];
  const btn = (active: boolean): React.CSSProperties => ({
    padding: "6px 12px",
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 4,
    border: "1px solid #3a4458",
    background: active ? "#e8a04a" : "transparent",
    color: active ? "#0b1220" : "#f6efe1",
    cursor: "pointer",
    textDecoration: "none",
  });
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16, justifyContent: "flex-end" }}>
      {langs.map((l) => (
        <Link key={l} to="/intake" search={{ lang: l }} style={btn(l === current)}>
          {l.toUpperCase()} · {labels[l]}
        </Link>
      ))}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 15,
  border: "1px solid #3a4458",
  borderRadius: 3,
  background: "#0b1220",
  color: "#f6efe1",
  fontFamily: "inherit",
};
const disabledStyle: React.CSSProperties = { background: "#222", color: "#666", cursor: "not-allowed" };

const GROUNDS_OPTIONS: { id: string; label: Record<Lang, string> }[] = [
  { id: "not_convicted", label: { en: "I am not convicted of a serious crime making me deportable.", es: "No he sido condenado de un delito grave que me haga deportable.", ht: "Mwen pa kondane pou yon krim grav ki ta fè m depòtab." } },
  { id: "parole_no_hearing", label: { en: "I was released on Parole and have not had a hearing to determine if detainable.", es: "Fui liberado bajo libertad condicional y no he tenido audiencia.", ht: "Yo te lage m sou Parole epi mwen poko gen yon odyans." } },
  { id: "not_danger", label: { en: "I am not a danger to the community.", es: "No soy un peligro para la comunidad.", ht: "Mwen pa yon danje pou kominote a." } },
  { id: "not_flight_risk", label: { en: "I am not a flight risk.", es: "No soy un riesgo de fuga.", ht: "Mwen pa yon risk pou kouri ale." } },
  { id: "due_process", label: { en: "My detention violates my due process rights.", es: "Mi detención viola mis derechos al debido proceso.", ht: "Detansyon mwen vyole dwa pwosedi legal mwen yo." } },
  { id: "country_not_accepting", label: { en: "I am not deportable to my country — they are not accepting deportees.", es: "No soy deportable a mi país.", ht: "Mwen pa kapab depòte nan peyi mwen." } },
  { id: "not_mandatory", label: { en: "I am not legally subject to mandatory detention.", es: "No estoy sujeto a detención obligatoria.", ht: "Mwen pa sijè a detansyon obligatwa." } },
];

function GroundsChecklist({ lang, answers, setAnswers }: { lang: Lang; answers: Record<string, string | boolean>; setAnswers: React.Dispatch<React.SetStateAction<Record<string, string | boolean>>> }) {
  const otherChecked = !!answers["ground_other_checked"];
  const otherText = (answers["ground_other_text"] as string) || "";

  const recompute = (next: Record<string, string | boolean>) => {
    const selected = GROUNDS_OPTIONS.filter((o) => next[`ground_${o.id}`]);
    const groundOne = selected.map((o) => o.label.en).join(" ");
    const groundTwo = next["ground_other_checked"] && next["ground_other_text"] ? `Other: ${next["ground_other_text"] as string}` : "";
    return { ...next, ground_one: groundOne, ground_two: groundTwo };
  };
  const toggle = (key: string, val: boolean) => setAnswers((a) => recompute({ ...a, [key]: val }));

  return (
    <div style={{ marginBottom: 16 }}>
      {GROUNDS_OPTIONS.map((o) => (
        <label key={o.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8, fontSize: 14, lineHeight: 1.5, cursor: "pointer" }}>
          <input type="checkbox" checked={!!answers[`ground_${o.id}`]} onChange={(e) => toggle(`ground_${o.id}`, e.target.checked)} style={{ marginTop: 3 }} />
          <span>{o.label[lang]}</span>
        </label>
      ))}
      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8, fontSize: 14, cursor: "pointer" }}>
        <input type="checkbox" checked={otherChecked} onChange={(e) => toggle("ground_other_checked", e.target.checked)} style={{ marginTop: 3 }} />
        <span>{lang === "es" ? "Otro" : lang === "ht" ? "Lòt" : "Other"}</span>
      </label>
      {otherChecked && (
        <textarea value={otherText} onChange={(e) => setAnswers((a) => recompute({ ...a, ground_other_text: e.target.value }))} rows={2} style={{ ...inputStyle, marginBottom: 16 }} />
      )}
    </div>
  );
}

const RELIEF_OPTIONS: { id: string; label: Record<Lang, string> }[] = [
  { id: "release", label: { en: "Immediate release from custody.", es: "Liberación inmediata.", ht: "Lage imedyatman." } },
  { id: "bond_hearing", label: { en: "A bond hearing before an immigration judge.", es: "Audiencia de fianza.", ht: "Odyans kosyon." } },
  { id: "release_on_recognizance", label: { en: "Release on own recognizance or supervised release.", es: "Liberación bajo palabra.", ht: "Lage sou pwòp pawòl." } },
  { id: "declare_unlawful", label: { en: "That I not be transferred until the Court decides my Habeas Corpus.", es: "Declaración de que mi detención es ilegal.", ht: "Deklarasyon ke detansyon mwen ilegal." } },
  { id: "any_other_relief", label: { en: "Assignment of Appointed Attorney to handle this mater.", es: "Cualquier otra reparación.", ht: "Nenpòt lòt sekou." } },
];

function ReliefChecklist({ lang, answers, setAnswers }: { lang: Lang; answers: Record<string, string | boolean>; setAnswers: React.Dispatch<React.SetStateAction<Record<string, string | boolean>>> }) {
  const recompute = (next: Record<string, string | boolean>) => {
    const selected = RELIEF_OPTIONS.filter((o) => next[`relief_${o.id}`]);
    return { ...next, relief_requested: selected.map((o) => o.label.en).join(" ") };
  };
  const toggle = (key: string, val: boolean) => setAnswers((a) => recompute({ ...a, [key]: val }));
  const heading = lang === "es" ? "¿Qué reparación pide?" : lang === "ht" ? "Ki sekou w ap mande?" : "What relief are you asking for?";

  return (
    <div style={{ marginTop: 24, marginBottom: 8 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{heading}</div>
      {RELIEF_OPTIONS.map((o) => (
        <label key={o.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8, fontSize: 14, lineHeight: 1.5, cursor: "pointer" }}>
          <input type="checkbox" checked={!!answers[`relief_${o.id}`]} onChange={(e) => toggle(`relief_${o.id}`, e.target.checked)} style={{ marginTop: 3 }} />
          <span>{o.label[lang]}</span>
        </label>
      ))}
    </div>
  );
}

