import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import {
  verifyReadinessPayment,
  submitReadinessIntake,
  generatePacketPDFs,
} from "@/lib/readiness.functions";
import { getStripeEnvironment } from "@/lib/stripe";

const search = z.object({
  packet_session: z.string().optional(),
  lang: z.enum(["en", "es", "ht"]).catch("es"),
});

export const Route = createFileRoute("/readiness/intake")({
  validateSearch: search,
  component: IntakePage,
  head: () => ({ meta: [{ title: "Sentinel Readiness — Intake" }] }),
});

type Lang = "en" | "es" | "ht";
type FieldDef = { key: string; label: Record<Lang, string>; type?: "text" | "textarea" | "tel" | "email" };
type StepDef = { id: string; title: Record<Lang, string>; intro: Record<Lang, string>; fields: FieldDef[] };

const STEPS: StepDef[] = [
  {
    id: "recipient",
    title: { en: "1. Trigger Recipient", es: "1. Receptor del Aviso", ht: "1. Moun ki resevwa Alèt la" },
    intro: {
      en: "Who do we send your sealed packet to the moment HELP NOW fires? Pick ONE person you trust completely.",
      es: "¿A quién enviamos su paquete sellado en el momento que se active AYUDA YA? Elija UNA persona de total confianza.",
      ht: "Pou kiyès n ap voye pakè sele a lè AYÈ KOUNYE A aktive? Chwazi YON moun ou fè konfyans nèt.",
    },
    fields: [
      { key: "recipient_name", label: { en: "Full name", es: "Nombre completo", ht: "Non konplè" } },
      { key: "recipient_email", type: "email", label: { en: "Email (where the packet will be sent)", es: "Correo (donde se enviará el paquete)", ht: "Imèl (kote pakè a ap voye)" } },
      { key: "recipient_phone", type: "tel", label: { en: "Phone", es: "Teléfono", ht: "Telefòn" } },
      { key: "recipient_relationship", label: { en: "Relationship to you", es: "Parentesco", ht: "Relasyon" } },
    ],
  },
  {
    id: "children",
    title: { en: "2. Children", es: "2. Hijos", ht: "2. Timoun" },
    intro: {
      en: "Names, dates of birth, schools, doctors, allergies, daily medications.",
      es: "Nombres, fechas de nacimiento, escuelas, médicos, alergias, medicamentos diarios.",
      ht: "Non, dat nesans, lekòl, doktè, alèji, medikaman chak jou.",
    },
    fields: [
      { key: "children_summary", type: "textarea", label: { en: "List each child (one per line): name, DOB, school, doctor, allergies, meds", es: "Liste cada hijo (uno por línea): nombre, fecha, escuela, médico, alergias, medicamentos", ht: "Liste chak timoun (yon liy chak): non, dat nesans, lekòl, doktè, alèji, medikaman" } },
    ],
  },
  {
    id: "financial",
    title: { en: "3. Financial Accounts", es: "3. Cuentas Financieras", ht: "3. Kont Finansye" },
    intro: {
      en: "List banks, credit unions, account purposes, and approximate balances. DO NOT enter passwords.",
      es: "Liste bancos, cooperativas, propósito y saldo aproximado. NO ingrese contraseñas.",
      ht: "Liste bank, kooperativ, rezon ak balans apwoksimatif. PA mete modpas.",
    },
    fields: [
      { key: "financial_accounts", type: "textarea", label: { en: "Accounts (one per line): bank, type, last 4 digits, approx balance", es: "Cuentas (una por línea): banco, tipo, últimos 4, saldo aprox", ht: "Kont (youn chak liy): bank, kalite, 4 dènye chif, balans apwoks" } },
    ],
  },
  {
    id: "property",
    title: { en: "4. Property & Document Locator", es: "4. Bienes y Ubicación de Documentos", ht: "4. Pwopriyete ak Kote Dokiman" },
    intro: {
      en: "Where physical documents (deeds, titles, passports, birth certificates) are kept.",
      es: "Dónde se guardan documentos físicos (escrituras, títulos, pasaportes, actas de nacimiento).",
      ht: "Kote dokiman fizik yo ye (papye kay, tit, paspò, batistè).",
    },
    fields: [
      { key: "property_inventory", type: "textarea", label: { en: "Real property + vehicles + valuables (address, VIN, where titles are stored)", es: "Inmuebles + vehículos + objetos de valor (dirección, VIN, dónde están los títulos)", ht: "Imobilye + machin + bagay valè (adrès, VIN, kote tit yo ye)" } },
      { key: "document_locator", type: "textarea", label: { en: "Where to find: passports, birth certs, marriage cert, deeds, titles", es: "Dónde encontrar: pasaportes, actas de nacimiento, matrimonio, escrituras, títulos", ht: "Kote pou jwenn: paspò, batistè, sètifika maryaj, papye kay, tit" } },
    ],
  },
  {
    id: "contacts",
    title: { en: "5. Emergency Contact Tree", es: "5. Árbol de Contactos", ht: "5. Ab Kontak Ijans" },
    intro: { en: "Three tiers: family, extended, attorney/community.", es: "Tres niveles: familia, extendida, abogado/comunidad.", ht: "Twa nivo: fanmi, fanmi laj, avoka/kominote." },
    fields: [
      { key: "contacts_immediate", type: "textarea", label: { en: "Immediate family (name, phone, email)", es: "Familia inmediata (nombre, teléfono, correo)", ht: "Fanmi pre (non, telefòn, imèl)" } },
      { key: "contacts_extended", type: "textarea", label: { en: "Extended family", es: "Familia extendida", ht: "Fanmi laj" } },
      { key: "contacts_legal", type: "textarea", label: { en: "Attorney, church, employer, community contacts", es: "Abogado, iglesia, empleador, comunidad", ht: "Avoka, legliz, anplwayè, kominote" } },
    ],
  },
  {
    id: "poa",
    title: { en: "6. Power of Attorney & Guardianship", es: "6. Poder Notarial y Tutela", ht: "6. Pouvwa Avoka ak Gad Legal" },
    intro: {
      en: "Who you want named for POA, who should have temporary guardianship of minor children.",
      es: "A quién designa para el poder, quién debe tener tutela temporal de los menores.",
      ht: "Kiyès w nonmen pou POA, kiyès dwe gen gad tanporè timoun yo.",
    },
    fields: [
      { key: "poa_state", label: { en: "State for POA (e.g. Texas, Florida)", es: "Estado del poder (ej. Texas, Florida)", ht: "Eta pou POA (egz. Texas, Florida)" } },
      { key: "poa_attorney_in_fact", label: { en: "Person you name as attorney-in-fact (POA holder)", es: "Persona designada como apoderado", ht: "Moun ou nonmen kòm reprezantan" } },
      { key: "guardian_for_minors", label: { en: "Person to take temporary guardianship of children", es: "Tutor temporal de los hijos", ht: "Gadyen tanporè pou timoun yo" } },
      { key: "guardian_backup", label: { en: "Backup guardian", es: "Tutor suplente", ht: "Gadyen ranplaseman" } },
    ],
  },
  {
    id: "letter",
    title: { en: "7. Letter to Children (optional)", es: "7. Carta a sus Hijos (opcional)", ht: "7. Lèt pou Timoun yo (opsyonèl)" },
    intro: {
      en: "Anything you want said in writing if you can't say it in person. We translate and type it.",
      es: "Lo que quiera decir por escrito si no puede hacerlo en persona. Lo traducimos y escribimos.",
      ht: "Sa ou ta vle di sou papye si ou pa kapab di l an pèsòn. Nou tradui e ekri l.",
    },
    fields: [
      { key: "letter_to_children", type: "textarea", label: { en: "Your letter (any language — we translate)", es: "Su carta (cualquier idioma — traducimos)", ht: "Lèt ou (nenpòt lang — n ap tradui)" } },
    ],
  },
];

const UI = {
  en: { back: "← Back", next: "Next →", submit: "Send to Sentinel team", submitting: "Sending…", done: "Got it. Our team will translate, type, and deliver your packet to your secure vault within 48 hours. We'll email you when it's ready to download, sign, and notarize.", verifying: "Verifying payment…", notpaid: "We could not verify your payment.", step: "Step", of: "of" },
  es: { back: "← Atrás", next: "Siguiente →", submit: "Enviar al equipo Sentinel", submitting: "Enviando…", done: "Recibido. Nuestro equipo traducirá, escribirá y entregará su paquete en su bóveda segura en 48 horas. Le avisaremos por correo cuando esté listo para descargar, firmar y notarizar.", verifying: "Verificando pago…", notpaid: "No pudimos verificar su pago.", step: "Paso", of: "de" },
  ht: { back: "← Tounen", next: "Pwochen →", submit: "Voye bay ekip Sentinel", submitting: "K ap voye…", done: "Resevwa. Ekip nou ap tradui, ekri, e livre pakè w nan kòfrefò sekirite w nan 48 èdtan. N ap voye imèl ba ou lè li pare pou telechaje, siyen, e notaryze.", verifying: "K ap verifye peman…", notpaid: "Nou pa kapab verifye peman ou.", step: "Etap", of: "sou" },
} as const;

function IntakePage() {
  const { packet_session, lang } = Route.useSearch();
  const L = lang as Lang;
  const ui = UI[L];
  const verifyFn = useServerFn(verifyReadinessPayment);
  const submitFn = useServerFn(submitReadinessIntake);

  const [status, setStatus] = useState<"verifying" | "ready" | "notpaid" | "submitting" | "done">("verifying");
  const [packetId, setPacketId] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!packet_session) { setStatus("notpaid"); return; }
    verifyFn({ data: { sessionId: packet_session, environment: getStripeEnvironment() } })
      .then((res) => {
        if (res.paid && res.packet) { setPacketId(res.packet.id); setStatus("ready"); }
        else setStatus("notpaid");
      })
      .catch(() => setStatus("notpaid"));
  }, [packet_session, verifyFn]);

  const handleNext = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = async () => {
    if (!packetId) return;
    setStatus("submitting");
    try {
      await submitFn({
        data: {
          packetId,
          designatedRecipient: {
            name: answers.recipient_name || "",
            email: answers.recipient_email || "",
            phone: answers.recipient_phone || "",
            relationship: answers.recipient_relationship || "",
          },
          formAnswers: answers,
        },
      });
      setStatus("done");
    } catch {
      setStatus("ready");
    }
  };

  const wrap: React.CSSProperties = { minHeight: "100vh", background: "#f4efe6", color: "#0e1a2b", fontFamily: "Inter Tight, system-ui, sans-serif", padding: "32px 20px" };
  const container: React.CSSProperties = { maxWidth: 720, margin: "0 auto" };

  if (status === "verifying") return <div style={wrap}><div style={container}><p>{ui.verifying}</p></div></div>;
  if (status === "notpaid") return <div style={wrap}><div style={container}><h1>{ui.notpaid}</h1><Link to="/" style={{ color: "#b8551f" }}>Home</Link></div></div>;
  if (status === "done") {
    return (
      <div style={wrap}><div style={container}>
        <div style={{ background: "#fff", padding: 32, borderLeft: "4px solid #2d5a3d", borderRadius: 6 }}>
          <h1 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 28, marginBottom: 12 }}>✓</h1>
          <p style={{ fontSize: 16, lineHeight: 1.6 }}>{ui.done}</p>
        </div>
        <Link to="/" style={{ display: "inline-block", marginTop: 22, color: "#b8551f" }}>← Home</Link>
      </div></div>
    );
  }

  const s = STEPS[step];
  return (
    <div style={wrap}>
      <div style={container}>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: "0.12em", color: "#8a3c11", marginBottom: 6 }}>
          SENTINEL READINESS · {ui.step} {step + 1} {ui.of} {STEPS.length}
        </div>
        <h1 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 28, fontWeight: 600, margin: "0 0 6px" }}>{s.title[L]}</h1>
        <p style={{ color: "#6b6b6b", marginBottom: 22 }}>{s.intro[L]}</p>

        <div style={{ background: "#fff", border: "1px solid rgba(14,26,43,0.12)", borderRadius: 6, padding: 22 }}>
          {s.fields.map((f) => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{f.label[L]}</label>
              {f.type === "textarea" ? (
                <textarea
                  value={answers[f.key] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))}
                  rows={4}
                  style={{ width: "100%", padding: 10, fontFamily: "inherit", fontSize: 14, border: "1px solid rgba(14,26,43,0.2)", borderRadius: 4, background: "#faf8f3" }}
                />
              ) : (
                <input
                  type={f.type ?? "text"}
                  value={answers[f.key] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))}
                  style={{ width: "100%", padding: 10, fontFamily: "inherit", fontSize: 14, border: "1px solid rgba(14,26,43,0.2)", borderRadius: 4, background: "#faf8f3" }}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
          <button onClick={handleBack} disabled={step === 0} style={{ background: "transparent", border: "1px solid #0e1a2b", color: "#0e1a2b", padding: "10px 18px", borderRadius: 4, cursor: step === 0 ? "default" : "pointer", opacity: step === 0 ? 0.4 : 1 }}>{ui.back}</button>
          {step < STEPS.length - 1 ? (
            <button onClick={handleNext} style={{ background: "#0e1a2b", color: "#fff", padding: "10px 22px", borderRadius: 4, border: 0, cursor: "pointer", fontWeight: 600 }}>{ui.next}</button>
          ) : (
            <button onClick={handleSubmit} disabled={status === "submitting"} style={{ background: "#b8551f", color: "#fff", padding: "10px 22px", borderRadius: 4, border: 0, cursor: "pointer", fontWeight: 600 }}>
              {status === "submitting" ? ui.submitting : ui.submit}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
