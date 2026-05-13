import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { verifyAndCreateIntake, submitIntakeAnswers } from "@/utils/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";

const searchSchema = z.object({
  session_id: z.string().optional(),
  lang: z.enum(["en", "es", "ht"]).catch("es"),
});

export const Route = createFileRoute("/intake")({
  validateSearch: searchSchema,
  component: IntakePage,
  head: () => ({ meta: [{ title: "Intake — DetencionDefensa.com" }] }),
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
    title: { en: "6. Where To Mail Forms", es: "6. Dónde Enviar los Formularios", ht: "6. Kote pou Voye Fòm yo" },
    intro: {
      en: "Tell us where the inmate is RIGHT NOW so we can mail the prepared forms.",
      es: "Díganos dónde está el recluso AHORA MISMO para enviar los formularios.",
      ht: "Di nou kote prizonye a ye KOUNYE A pou nou ka voye fòm yo.",
    },
    fields: [
      { key: "mail_inmate_name", label: { en: "Inmate full name (as on mail)", es: "Nombre completo del recluso", ht: "Non konplè prizonye a" } },
      { key: "mail_current_location", label: { en: "Where is inmate located now (facility name)", es: "¿Dónde está el recluso ahora?", ht: "Kote prizonye a ye kounye a" } },
      { key: "mail_inmate_number", label: { en: "Inmate / booking number", es: "Número de recluso", ht: "Nimewo prizonye" } },
      { key: "mail_facility_address", type: "textarea", label: { en: "Facility mailing address", es: "Dirección postal del centro", ht: "Adrès postal sant lan" } },
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
    done: "Thank you. We will email the prepared forms within 24 hours.",
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
    done: "Gracias. Enviaremos los formularios en 24 horas.",
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
    done: "Mèsi. N ap voye fòm yo nan 24 èdtan.",
    notpaid: "Nou pa kapab verifye peman ou.",
    backToSite: "Tounen lakay",
    verifying: "K ap verifye peman…",
  },
} as const;

function IntakePage() {
  const { session_id, lang } = Route.useSearch();
  const L = lang as Lang;
  const ui = UI[L];

  const verifyFn = useServerFn(verifyAndCreateIntake);
  const submitFn = useServerFn(submitIntakeAnswers);

  const [status, setStatus] = useState<"verifying" | "ready" | "notpaid" | "submitting" | "done" | "error">("verifying");
  const [errMsg, setErrMsg] = useState("");
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});

  useEffect(() => {
    if (!session_id) {
      setStatus("notpaid");
      return;
    }
    verifyFn({ data: { sessionId: session_id, environment: getStripeEnvironment() } })
      .then((res) => setStatus(res.paid ? "ready" : "notpaid"))
      .catch((e) => {
        setErrMsg(e.message);
        setStatus("notpaid");
      });
  }, [session_id, verifyFn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session_id) return;
    setStatus("submitting");
    try {
      await submitFn({ data: { sessionId: session_id, answers, environment: getStripeEnvironment() } });
      setStatus("done");
    } catch (err) {
      setErrMsg((err as Error).message);
      setStatus("error");
    }
  };

  const wrap: React.CSSProperties = { minHeight: "100vh", background: "#0b1220", color: "#f6efe1", fontFamily: "Inter Tight, system-ui, sans-serif" };
  const container: React.CSSProperties = { maxWidth: 760, margin: "0 auto", padding: "32px 24px 96px" };

  if (status === "verifying") return <div style={wrap}><div style={container}><p>{ui.verifying}</p></div></div>;
  if (status === "notpaid")
    return (
      <div style={wrap}><div style={container}>
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>{ui.notpaid}</h1>
        {errMsg && <p style={{ color: "#ff8080", fontSize: 13 }}>{errMsg}</p>}
        <Link to="/checkout" search={{ lang: L } as never} style={{ color: "#e8a04a" }}>→ /checkout</Link>
      </div></div>
    );
  if (status === "done")
    return (
      <div style={wrap}><div style={container}>
        <div style={{ background: "#1a2436", padding: 32, borderRadius: 8, borderLeft: "4px solid #2d6a4f" }}>
          <h1 style={{ fontSize: 28, marginBottom: 16 }}>✓</h1>
          <p style={{ fontSize: 18, lineHeight: 1.6 }}>{ui.done}</p>
          <Link to="/" search={{ lang: L } as never} style={{ display: "inline-block", marginTop: 24, color: "#e8a04a" }}>{ui.backToSite}</Link>
        </div>
      </div></div>
    );

  return (
    <div style={wrap}>
      <div style={container}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, fontFamily: "Fraunces, serif" }}>{ui.title}</h1>
        <p style={{ color: "#a8a59a", marginBottom: 16 }}>{ui.sub}</p>
        <div style={{ background: "#3a2a00", border: "1px solid #e8a04a", padding: 14, borderRadius: 4, marginBottom: 32, fontSize: 14, lineHeight: 1.5, color: "#fff5d6" }}>
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
              {s.fields.map((f) => (
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
              ))}
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
