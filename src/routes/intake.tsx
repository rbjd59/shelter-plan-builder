import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { submitDemoIntake } from "@/utils/payments.functions";
import { DisclosureGate } from "@/components/DisclosureGate";
import { SentinelUpsellCards } from "@/components/SentinelUpsellCards";
import { BilingualField } from "@/components/intake/BilingualField";

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
    title: { en: "1. About the Petitioner", es: "1. Sobre el Peticionario", ht: "1. Konsènan Petisyonè a" },
    intro: {
      en: "Form AO 242 — Petition for Writ of Habeas Corpus under 28 U.S.C. § 2241.",
      es: "Formulario AO 242 — Petición de Habeas Corpus bajo 28 U.S.C. § 2241.",
      ht: "Fòm AO 242 — Petisyon pou Habeas Corpus dapre 28 U.S.C. § 2241.",
    },
    fields: [
      { key: "full_name", label: { en: "Full legal name", es: "Nombre legal completo", ht: "Non legal konplè" } },
      { key: "other_names_used", label: { en: "Other names used", es: "Otros nombres usados", ht: "Lòt non yo te itilize" } },
      { key: "a_number", label: { en: "Alien Registration Number (A#)", es: "Número de Registro de Extranjero (A#)", ht: "Nimewo Anrejistreman Etranje (A#)" } },
      { key: "dob", label: { en: "Date of birth", es: "Fecha de nacimiento", ht: "Dat nesans" }, type: "date" },
      { key: "country_of_citizenship", label: { en: "Country of citizenship", es: "País de ciudadanía", ht: "Peyi sitwayènte" } },
      { key: "court_district", label: { en: "U.S. District Court (e.g. Florida Southern, New York Southern)", es: "Tribunal de Distrito (ej. Florida Sur, Nueva York Sur)", ht: "Tribinal Distri (egz. Florid Sid, New York Sid)" }, hint: { en: "Where the petition will be filed", es: "Donde se presentará la petición", ht: "Kote petisyon an ap depoze" } },
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
      { key: "warden_title", disabled: true, label: { en: "Warden's title", es: "Título del director", ht: "Tit Direktè a" }, hint: { en: "Leave blank", es: "Dejar en blanco", ht: "Kite vid" } },
    ],
  },
  {
    id: "detainer",
    title: { en: "3. ICE Detainer", es: "3. Detención de ICE", ht: "3. Detainer ICE" },
    intro: {
      en: "Information about the immigration hold.",
      es: "Información sobre la retención migratoria.",
      ht: "Enfòmasyon sou kenbe imigrasyon an.",
    },
    fields: [
      { key: "ice_form_known", type: "checkbox", label: { en: "Do you have a copy of the I-247 form?", es: "¿Tiene copia del formulario I-247?", ht: "Èske w gen kopi fòm I-247?" } },
      { key: "prior_immigration_proceedings", type: "textarea", label: { en: "Briefly describe any prior immigration proceedings", es: "Describa procedimientos migratorios anteriores", ht: "Dekri pwosedi imigrasyon anvan" } },
    ],
  },
  {
    id: "grounds",
    title: { en: "4. Grounds for the Petition", es: "4. Motivos de la Petición", ht: "4. Rezon pou Petisyon an" },
    intro: {
      en: "Check the grounds that apply. We do NOT choose your legal grounds.",
      es: "Marque los motivos que apliquen. NOSOTROS NO elegimos sus motivos legales.",
      ht: "Tcheke rezon yo. Nou PA chwazi rezon legal pou ou.",
    },
    fields: [],
  },
  {
    id: "ifp",
    title: { en: "5. AO 240 — In Forma Pauperis", es: "5. AO 240 — In Forma Pauperis", ht: "5. AO 240 — In Forma Pauperis" },
    intro: {
      en: "If the petitioner cannot pay the $5 filing fee, this asks the court to waive it. Enter 0 if none.",
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
      en: "6. Emergency Contact for the HELP NOW App + Mailing Address if Detained",
      es: "6. Contacto de Emergencia para la App AYUDA YA + Dirección Postal si está Detenido",
      ht: "6. Kontak Ijans pou App AYÈ KOUNYE A + Adrès Postal si Detni",
    },
    intro: {
      en: "If the petitioner is detained, this is where we'll mail a printed copy of the File Now Packet (AO 242 + AO 240). The same person is also notified by email — with a copy of the forms attached — the moment the petitioner activates the HELP NOW button on the mobile app.",
      es: "Si el peticionario es detenido, aquí enviaremos por correo una copia impresa del Paquete File Now (AO 242 + AO 240). Esta misma persona recibe un aviso por correo electrónico — con copia de los formularios adjunta — en el momento en que el peticionario active el botón AYUDA YA en la app móvil.",
      ht: "Si yo detni petisyonè a, se la nou pral voye yon kopi enprime nan File Now Packet la (AO 242 + AO 240). Menm moun sa a resevwa yon notifikasyon imèl — ak yon kopi fòm yo — lè petisyonè a aktive bouton AYÈ KOUNYE A nan app la.",
    },
    fields: [
      { key: "emergency_contact_name", label: { en: "Emergency contact full name (notified by the app)", es: "Nombre completo del contacto de emergencia (notificado por la app)", ht: "Non konplè kontak ijans (app la notifye)" } },
      { key: "emergency_contact_email", label: { en: "Emergency contact email — receives the activation alert + form copies", es: "Correo del contacto de emergencia — recibe la alerta + copia de los formularios", ht: "Imèl kontak ijans — resevwa alèt la + kopi fòm yo" } },
      { key: "mail_inmate_name", label: { en: "Inmate full name (as on mail)", es: "Nombre completo del recluso", ht: "Non konplè prizonye a" } },
      { key: "mail_current_location", label: { en: "Where is inmate located now (facility name)", es: "¿Dónde está el recluso ahora?", ht: "Kote prizonye a ye kounye a" } },
      { key: "mail_inmate_number", label: { en: "Inmate / booking number", es: "Número de recluso", ht: "Nimewo prizonye" } },
      { key: "mail_facility_address", type: "textarea", label: { en: "Facility mailing address (for printed File Now Packet)", es: "Dirección postal del centro (para el Paquete File Now impreso)", ht: "Adrès postal sant lan (pou File Now Packet enprime)" } },
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
    title: "Intake — 28 U.S.C. § 2241 + In Forma Pauperis",
    sub: "Pro se forms used by U.S. District Court Clerks.",
    upl: "We are NOT a law firm. We do not give legal advice or choose forms. The petitioner signs and files.",
    submit: "Submit answers",
    submitting: "Submitting…",
    done: "Check your email. We just sent you your prepared AO 242 + AO 240 PDFs and a one-tap link to install the HELP NOW button on the at-risk person's phone, with step-by-step instructions in your chosen language.",
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
    title: "Formulario de Admisión — 28 U.S.C. § 2241 + In Forma Pauperis",
    sub: "Formularios pro se usados por Secretarios del Tribunal de Distrito de EE.UU.",
    upl: "NO somos un bufete de abogados. No damos consejos legales. El peticionario firma y presenta.",
    submit: "Enviar respuestas",
    submitting: "Enviando…",
    done: "Revise su correo electrónico. Acabamos de enviarle sus formularios AO 242 + AO 240 en PDF y un enlace de un solo toque para instalar el botón AYUDA YA en el teléfono de la persona en riesgo, con instrucciones paso a paso en su idioma.",
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
    title: "Fòm Antre — 28 U.S.C. § 2241 + In Forma Pauperis",
    sub: "Fòm pro se Klèk Tribinal Distri Etazini itilize.",
    upl: "Nou PA yon kabinè avoka. Nou pa bay konsèy legal. Petisyonè a siyen e depoze.",
    submit: "Voye repons",
    submitting: "K ap voye…",
    done: "Tcheke imèl ou. Nou fenk voye fòm AO 242 + AO 240 PDF ou yo ak yon lyen yon-tap pou enstale bouton AYÈ KOUNYE A sou telefòn moun ki an risk la, ak enstriksyon etap-pa-etap nan lang ou chwazi a.",
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
  const L = lang as Lang;
  const ui = UI[L];
  return (
    <DisclosureGate lang={L} storageKey="dd_disclosure_intake_v1">
      <IntakeInner sessionId={session_id} L={L} ui={ui} />
    </DisclosureGate>
  );
}

function IntakeInner({ sessionId: _session_id, L, ui }: { sessionId: string | undefined; L: Lang; ui: typeof UI[Lang] }) {

  const submitFn = useServerFn(submitDemoIntake);

  const [status, setStatus] = useState<"ready" | "submitting" | "done" | "error">("ready");
  const [errMsg, setErrMsg] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [englishAnswers, setEnglishAnswers] = useState<Record<string, string>>({});
  const [approvals, setApprovals] = useState<Record<string, boolean>>({});
  const [showGuide, setShowGuide] = useState(false);

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
    setStatus("submitting");
    try {
      // Merge: English-approved values overwrite native values for PDF filling;
      // preserve the native originals under "<key>__native" for record copies.
      const merged: Record<string, string | boolean> = { ...answers };
      if (isBilingual) {
        for (const [k, v] of Object.entries(answers)) {
          if (typeof v === "string" && englishAnswers[k]) {
            merged[`${k}__native`] = v;
            merged[k] = englishAnswers[k];
          }
        }
      }
      await submitFn({ data: { answers: merged, language: L } });
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
        <div style={{ background: "#0b1220", border: "2px solid #e8a04a", padding: 20, borderRadius: 8, marginBottom: 20, textAlign: "center" }}>
          <p style={{ margin: "0 0 4px", fontSize: 11, letterSpacing: 2, color: "#e8a04a", fontWeight: 700 }}>DEMO · INVESTOR PREVIEW</p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff5d6" }}>ASSET PROTECTION ACTIVATED</p>
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
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>Get HELP NOW (iPhone & Android)</div>
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
      {showGuide && (
        <div
          onClick={() => setShowGuide(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", flexDirection: "column", padding: 16 }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, color: "#fff" }}>
            <strong style={{ fontSize: 14 }}>
              Habeas Explainer — {L === "es" ? "Español" : "English"}
            </strong>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setShowGuide(false); }}
              style={{ background: "#fff", color: "#000", border: "none", padding: "6px 14px", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}
            >
              {L === "es" ? "Cerrar ✕" : L === "ht" ? "Fèmen ✕" : "Close ✕"}
            </button>
          </div>
          <iframe
            onClick={(e) => e.stopPropagation()}
            src={L === "es" ? "/forms/Habeas-Explainer-ES.pdf" : "/forms/Habeas-Explainer-EN.pdf"}
            title="Habeas Explainer"
            style={{ flex: 1, width: "100%", border: "none", background: "#fff", borderRadius: 4 }}
          />
        </div>
      )}
      <div style={container}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, fontFamily: "Fraunces, serif" }}>{ui.title}</h1>
        <p style={{ color: "#a8a59a", marginBottom: 16 }}>{ui.sub}</p>
        <div style={{ background: "#3a2a00", border: "1px solid #e8a04a", padding: 14, borderRadius: 4, marginBottom: 16, fontSize: 14, lineHeight: 1.5, color: "#fff5d6" }}>
          <strong>⚠ {ui.upl}</strong>
        </div>
        <div style={{ background: "#0f2436", border: "1px solid #4a9eff", padding: 14, borderRadius: 4, marginBottom: 32, fontSize: 14, lineHeight: 1.5, color: "#e6f1ff" }}>
          <strong style={{ display: "block", marginBottom: 6 }}>
            {L === "es" ? "📘 LECTURA OBLIGATORIA antes de continuar" : L === "ht" ? "📘 LEKTI OBLIGATWA anvan ou kontinye" : "📘 REQUIRED READING before you continue"}
          </strong>
          <p style={{ margin: "0 0 8px" }}>
            {L === "es"
              ? "Toda persona detenida por ICE que presenta su propia petición de habeas DEBE leer esta guía del National Immigration Project. Explica qué es una petición de habeas, cuándo se puede presentar, y cómo llenar los formularios paso a paso."
              : L === "ht"
              ? "Tout moun ICE detni ki ap depoze pwòp petisyon habeas li DWE li gid sa a nan National Immigration Project. Li eksplike sa yon petisyon habeas ye, kilè ou ka depoze li, ak kijan pou ranpli fòm yo etap pa etap. (Sèlman disponib an anglè pou kounye a.)"
              : "Every person in ICE detention filing their own habeas petition MUST read this National Immigration Project guide. It explains what a habeas petition is, when you can file one, and how to fill out the forms step by step."}
          </p>
          {(() => {
            const pdfHref = L === "es" ? "/forms/Habeas-Explainer-ES.pdf" : "/forms/Habeas-Explainer-EN.pdf";
            const openLabel = L === "es"
              ? "Abrir guía: Habeas Explainer (Español, PDF) ↗"
              : L === "ht"
              ? "Louvri gid: Habeas Explainer (Anglè, PDF) ↗"
              : "Open guide: Habeas Explainer (NIP, PDF) ↗";
            const viewerLabel = L === "es"
              ? "Ver aquí mismo (si Chrome bloquea la pestaña nueva)"
              : L === "ht"
              ? "Gade la a (si Chrome bloke nouvo tab la)"
              : "View here instead (if Chrome blocks the new tab)";
            return (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <a
                  href={pdfHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-block", background: "#4a9eff", color: "#0b1220", padding: "8px 14px", borderRadius: 4, textDecoration: "none", fontWeight: 700, fontSize: 13 }}
                >
                  {openLabel}
                </a>
                <button
                  type="button"
                  onClick={() => setShowGuide(true)}
                  style={{ display: "inline-block", background: "transparent", color: "#4a9eff", padding: "8px 14px", borderRadius: 4, border: "1px solid #4a9eff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                >
                  {viewerLabel}
                </button>
              </div>
            );
          })()}
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#a8c4e6" }}>
            {L === "es"
              ? "Esta guía se adjunta automáticamente a su paquete de formularios impreso cuando lo enviamos por correo."
              : L === "ht"
              ? "Gid sa a ap atache otomatikman nan pakè fòm ou yo lè nou voye yo pa lapòs."
              : "This guide is automatically attached to your printed forms packet when we mail it."}
          </p>
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
                      <input type="checkbox" checked={!!answers[f.key]} onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.checked }))} disabled={f.disabled} />
                    ) : (
                      <input type={f.type || "text"} value={(answers[f.key] as string) || ""} onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))} disabled={f.disabled} style={{ ...inputStyle, ...(f.disabled ? disabledStyle : null) }} />
                    )}
                  </div>
                );
              })}
            </section>
          ))}
          <button type="submit" disabled={status === "submitting"} style={{ background: "#e8a04a", color: "#0b1220", padding: "16px 32px", fontSize: 16, fontWeight: 700, border: "none", borderRadius: 4, cursor: "pointer", width: "100%" }}>
            {status === "submitting" ? ui.submitting : ui.submit}
          </button>
          {errMsg && status === "error" && <p style={{ color: "#ff8080", marginTop: 12 }}>{errMsg}</p>}
        </form>
      </div>
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
  { id: "declare_unlawful", label: { en: "A declaration that my detention is unlawful.", es: "Declaración de que mi detención es ilegal.", ht: "Deklarasyon ke detansyon mwen ilegal." } },
  { id: "any_other_relief", label: { en: "Any other relief the court deems just and proper.", es: "Cualquier otra reparación.", ht: "Nenpòt lòt sekou." } },
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
