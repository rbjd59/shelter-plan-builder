import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const search = z.object({ lang: z.enum(["en", "es", "ht"]).catch("es") });

export const Route = createFileRoute("/family-forms")({
  validateSearch: search,
  component: FamilyFormsPage,
  head: () => ({
    meta: [
      { title: "Family Preparedness Forms — Print, Sign & Notarize | DetenciónDefensa" },
      {
        name: "description",
        content:
          "Download the blank Florida authorization forms, sign and notarize them, and leave them sealed with a trusted family member to be opened only if you are detained.",
      },
      { property: "og:title", content: "Family Preparedness Forms — DetenciónDefensa" },
      {
        property: "og:description",
        content: "Print, sign and notarize your family authorization forms before an emergency.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Lang = "en" | "es" | "ht";

const FORMS: Array<{ type: string; label: Record<Lang, string> }> = [
  {
    type: "blank_power_of_attorney",
    label: {
      en: "Florida Durable Power of Attorney",
      es: "Poder Notarial Duradero de Florida",
      ht: "Pouvwa Avoka Dirab Florid",
    },
  },
  {
    type: "blank_school_pickup",
    label: {
      en: "School / Concurrent Custody Consent (FL 12.970(d))",
      es: "Consentimiento de Custodia Concurrente / Escuela (FL 12.970(d))",
      ht: "Konsantman Gad Konkouran / Lekòl (FL 12.970(d))",
    },
  },
  {
    type: "blank_vehicle_impound_release",
    label: {
      en: "Vehicle Power of Attorney (FLHSMV 82053)",
      es: "Poder para Vehículo (FLHSMV 82053)",
      ht: "Pouvwa pou Machin (FLHSMV 82053)",
    },
  },
  {
    type: "blank_bank_account_access",
    label: {
      en: "Bank Account Access Affidavit (Fla. Stat. 709.2119)",
      es: "Declaración de Acceso a Cuenta Bancaria (Fla. Stat. 709.2119)",
      ht: "Afidavi Aksè Kont Bank (Fla. Stat. 709.2119)",
    },
  },
  {
    type: "blank_property_access",
    label: {
      en: "Temporary Custody of Minor Children (FL 12.970(c))",
      es: "Custodia Temporal de Menores (FL 12.970(c))",
      ht: "Gad Tanporè pou Timoun Minè (FL 12.970(c))",
    },
  },
];

const T = {
  en: {
    kicker: "FAMILY PREPAREDNESS",
    h1: "Print, sign, notarize — before anything happens",
    intro:
      "These forms are NOT stored in the app and are never pre-signed. Most of them must be signed in front of a notary to be valid. Download them now, complete them, have them notarized, and put them in a sealed envelope with a family member you trust.",
    stepsHeading: "What to do",
    steps: [
      "Download each form below in your language.",
      "Print them. Do not sign yet.",
      "Fill in the names, addresses, and details in your own words.",
      "Take them to any notary (UPS Store, bank, or notary public — usually $5–$15 each) and sign them in front of the notary.",
      "Put the signed and notarized originals in an envelope. Write on it: OPEN ONLY IF I AM DETAINED.",
      "Give the envelope to the family member or friend you trust most. Tell them where it is.",
    ],
    downloads: "Download the forms",
    disclaimer:
      "Document preparation and translation only. This is NOT legal advice. Have an attorney licensed in your state review the power of attorney and guardianship forms before signing.",
  },
  es: {
    kicker: "PREPARACIÓN FAMILIAR",
    h1: "Imprima, firme y notarice — antes de que pase algo",
    intro:
      "Estos formularios NO se guardan en la aplicación y nunca se firman por adelantado. La mayoría deben firmarse ante un notario para tener validez. Descárguelos ahora, complételos, notarícelos y déjelos en un sobre sellado con un familiar de confianza.",
    stepsHeading: "Qué hacer",
    steps: [
      "Descargue cada formulario a continuación en su idioma.",
      "Imprímalos. Todavía no los firme.",
      "Complete los nombres, direcciones y detalles con sus propias palabras.",
      "Llévelos a cualquier notario (UPS Store, banco o notario público — normalmente $5–$15 cada uno) y fírmelos frente al notario.",
      "Ponga los originales firmados y notarizados en un sobre. Escriba encima: ABRIR SOLO SI ME DETIENEN.",
      "Entregue el sobre al familiar o amigo de mayor confianza. Dígale dónde está.",
    ],
    downloads: "Descargar los formularios",
    disclaimer:
      "Solo preparación y traducción de documentos. Esto NO es asesoría legal. Pida a un abogado con licencia en su estado que revise el poder notarial y los formularios de tutela antes de firmarlos.",
  },
  ht: {
    kicker: "PREPARASYON FANMI",
    h1: "Enprime, siyen, notarye — anvan anyen rive",
    intro:
      "Fòm sa yo PA estoke nan app la e yo pa janm pre-siyen. Pifò ladan yo dwe siyen devan yon notè pou yo valab. Telechaje yo kounye a, ranpli yo, fè yo notarye, epi mete yo nan yon anvlòp sele ak yon fanmi ou fè konfyans.",
    stepsHeading: "Sa pou w fè",
    steps: [
      "Telechaje chak fòm anba a nan lang ou.",
      "Enprime yo. Pa siyen ankò.",
      "Ranpli non, adrès, ak detay yo nan pwòp mo pa w.",
      "Pote yo bay nenpòt notè (UPS Store, bank, oswa notè piblik — anjeneral $5–$15 chak) epi siyen yo devan notè a.",
      "Mete orijinal siyen ak notarye yo nan yon anvlòp. Ekri sou li: LOUVRI SÈLMAN SI YO DETNI M.",
      "Bay anvlòp la ak fanmi oswa zanmi ou fè plis konfyans. Di yo kote li ye.",
    ],
    downloads: "Telechaje fòm yo",
    disclaimer:
      "Sèlman preparasyon ak tradiksyon dokiman. Sa a PA konsèy legal. Fè yon avoka ki gen lisans nan eta w revize pouvwa avoka a ak fòm gad yo anvan ou siyen.",
  },
} as const;

function FamilyFormsPage() {
  const { lang } = Route.useSearch();
  const L = lang as Lang;
  const t = T[L];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0e1a2b",
        color: "#f4efe6",
        fontFamily: "Inter Tight, system-ui, sans-serif",
        padding: "40px 20px 64px",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            letterSpacing: "0.18em",
            color: "#e8a04a",
            marginBottom: 10,
          }}
        >
          {t.kicker}
        </div>
        <h1 style={{ fontSize: 32, lineHeight: 1.15, fontWeight: 800, margin: "0 0 14px" }}>{t.h1}</h1>
        <p style={{ fontSize: 16, lineHeight: 1.65, margin: "0 0 28px", color: "#dcd6c8" }}>{t.intro}</p>

        <section
          style={{
            background: "#16233a",
            border: "1px solid #2a3853",
            borderRadius: 8,
            padding: 22,
            marginBottom: 26,
          }}
        >
          <h2 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 14px" }}>{t.stepsHeading}</h2>
          <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7, fontSize: 15 }}>
            {t.steps.map((s) => (
              <li key={s} style={{ marginBottom: 8 }}>
                {s}
              </li>
            ))}
          </ol>
        </section>

        <section
          style={{
            background: "#16233a",
            border: "1px solid #2a3853",
            borderRadius: 8,
            padding: 22,
          }}
        >
          <h2 style={{ fontSize: 19, fontWeight: 700, margin: "0 0 14px" }}>{t.downloads}</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
            {FORMS.map((f) => (
              <li key={f.type}>
                <a
                  href={`/api/public/forms/blank?type=${f.type}&lang=${L}`}
                  style={{
                    display: "block",
                    background: "#0e1a2b",
                    border: "1px solid #3a4458",
                    borderRadius: 6,
                    padding: "14px 16px",
                    color: "#f4efe6",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: 15,
                  }}
                >
                  <span style={{ color: "#e8a04a", marginRight: 10 }}>↓</span>
                  {f.label[L]}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <p
          style={{
            fontSize: 12,
            color: "#9aa4b5",
            marginTop: 28,
            lineHeight: 1.6,
            borderTop: "1px solid #2a3853",
            paddingTop: 14,
          }}
        >
          {t.disclaimer}
        </p>
      </div>
    </main>
  );
}
