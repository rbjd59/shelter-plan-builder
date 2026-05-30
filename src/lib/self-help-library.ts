// Public URLs for the federal forms + NILC/NIPNLG pro se manuals that
// every customer receives. Hosted in the public `self-help-library`
// Supabase storage bucket so they can be linked from emails, the App,
// and the /venues page without signed-URL expiry.

const BUCKET_BASE =
  "https://viyoqmjullnuzptnawtk.supabase.co/storage/v1/object/public/self-help-library";

export interface SelfHelpDoc {
  key:
    | "uscourts_repself"
    | "uscourts_forms"
    | "nijc"
    | "nipnlg"
    | "js44"
    | "ao240";
  url: string;
  title: { en: string; es: string; ht: string };
  description: { en: string; es: string; ht: string };
}

// Per attorney revised opinion #9: the Pro Se reference library consists
// EXCLUSIVELY of publicly available federal publications and established
// non-profit pro se manuals. The Company authors NONE of this material —
// every link below points to the original publisher (U.S. Courts, NIJC,
// NIPNLG, or the official federal form template). This is a reading aid;
// the Company gives no legal advice.
export const SELF_HELP_LIBRARY: SelfHelpDoc[] = [
  {
    key: "uscourts_repself",
    url: "https://www.uscourts.gov/about-federal-courts/types-cases/civil-cases/representing-yourself",
    title: {
      en: "U.S. Courts — Representing Yourself (official Pro Se Litigant Guide)",
      es: "Tribunales de EE. UU. — Representarse a Sí Mismo (Guía Oficial del Litigante Pro Se)",
      ht: "Tribinal Etazini — Reprezante Tèt Ou (Gid Ofisyèl Litijan Pro Se)",
    },
    description: {
      en: "Federal Judiciary's official guide for people filing without a lawyer. Published by U.S. Courts (uscourts.gov).",
      es: "Guía oficial del Poder Judicial Federal para personas que litigan sin abogado. Publicada por los Tribunales de EE. UU. (uscourts.gov).",
      ht: "Gid ofisyèl Sistèm Jidisyè Federal pou moun k ap depoze san avoka. Pibliye pa Tribinal Etazini (uscourts.gov).",
    },
  },
  {
    key: "uscourts_forms",
    url: "https://www.uscourts.gov/forms-rules/forms",
    title: {
      en: "U.S. Courts — Official Federal Court Forms & Instructions",
      es: "Tribunales de EE. UU. — Formularios e Instrucciones Oficiales de la Corte Federal",
      ht: "Tribinal Etazini — Fòm ak Enstriksyon Ofisyèl Tribinal Federal",
    },
    description: {
      en: "Master index of every official federal court form with instructions. Use the original form instructions as your reading aid.",
      es: "Índice maestro de todos los formularios oficiales de la corte federal con instrucciones. Use las instrucciones del formulario original como guía de lectura.",
      ht: "Endèks prensipal tout fòm ofisyèl tribinal federal yo ak enstriksyon. Itilize enstriksyon fòm orijinal yo kòm gid lekti ou.",
    },
  },
  {
    key: "nijc",
    url: `${BUCKET_BASE}/NIJC-Pro-Se-Manual-EN.pdf`,
    title: {
      en: "NIJC — Pro Se Immigration Detention Manual (non-profit, public)",
      es: "NIJC — Manual Pro Se sobre Detención de Inmigración (sin fines de lucro, público)",
      ht: "NIJC — Manyèl Pro Se sou Detansyon Imigrasyon (òganizasyon san bi likratif, piblik)",
    },
    description: {
      en: "National Immigrant Justice Center step-by-step guide for detained people without a lawyer. Authored and published by NIJC.",
      es: "Guía paso a paso del NIJC para personas detenidas sin abogado. Redactada y publicada por el NIJC.",
      ht: "Gid etap pa etap NIJC pou moun ki detni san avoka. Ekri epi pibliye pa NIJC.",
    },
  },
  {
    key: "nipnlg",
    url: `${BUCKET_BASE}/NIPNLG-Release-Guide-EN.pdf`,
    title: {
      en: "NIPNLG — Pro Se Release Guide (Habeas / § 2241) (non-profit, public)",
      es: "NIPNLG — Guía Pro Se de Liberación (Habeas / § 2241) (sin fines de lucro, pública)",
      ht: "NIPNLG — Gid Pro Se pou Liberasyon (Habeas / § 2241) (òganizasyon san bi likratif, piblik)",
    },
    description: {
      en: "National Immigration Project / NLG pro se habeas corpus and release guide. Authored and published by NIPNLG.",
      es: "Guía pro se de habeas corpus y liberación del NIPNLG. Redactada y publicada por el NIPNLG.",
      ht: "Gid pro se NIPNLG pou habeas corpus ak liberasyon. Ekri epi pibliye pa NIPNLG.",
    },
  },
  {
    key: "js44",
    url: `${BUCKET_BASE}/JS44-Civil-Cover-Sheet-Blank.pdf`,
    title: {
      en: "JS-44 — Civil Cover Sheet (blank official federal form)",
      es: "JS-44 — Hoja de Carátula Civil (formulario oficial federal en blanco)",
      ht: "JS-44 — Fèy Kouvèti Sivil (fòm ofisyèl federal vid)",
    },
    description: {
      en: "Official federal civil cover sheet filed with every new district court case. Published by U.S. Courts.",
      es: "Hoja de carátula civil federal oficial requerida con cada nuevo caso. Publicada por los Tribunales de EE. UU.",
      ht: "Fèy kouvèti sivil federal ofisyèl pou chak nouvo dosye. Pibliye pa Tribinal Etazini.",
    },
  },
  {
    key: "ao240",
    url: `${BUCKET_BASE}/AO240-Application-IFP-Blank.pdf`,
    title: {
      en: "AO 240 — Application to Proceed In Forma Pauperis (blank official federal form)",
      es: "AO 240 — Solicitud para Proceder In Forma Pauperis (formulario oficial federal en blanco)",
      ht: "AO 240 — Aplikasyon pou Pwosede In Forma Pauperis (fòm ofisyèl federal vid)",
    },
    description: {
      en: "Blank federal IFP form. Customer fills in by hand at the time of filing. Published by U.S. Courts.",
      es: "Formulario IFP federal en blanco. El cliente lo completa a mano al presentar. Publicado por los Tribunales de EE. UU.",
      ht: "Fòm IFP federal vid. Kliyan an ranpli li alamen lè li depoze. Pibliye pa Tribinal Etazini.",
    },
  },
];

type Lang = "en" | "es" | "ht";
const pickLang = (l: string): Lang =>
  l === "es" || l === "ht" || l === "en" ? l : "es";

function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const HEADING: Record<Lang, string> = {
  en: "Pro Se Reference Library — publicly available federal & non-profit publications",
  es: "Biblioteca de Referencia Pro Se — publicaciones federales y sin fines de lucro de acceso público",
  ht: "Bibliyotèk Referans Pro Se — piblikasyon federal ak òganizasyon san bi likratif ki disponib piblikman",
};

const NOTE: Record<Lang, string> = {
  en: "Reading aid only. The Company authored NONE of this material. Every link points to the original publisher (U.S. Courts, NIJC, NIPNLG). These links never expire — save them and share them.",
  es: "Solo guía de lectura. La Compañía NO redactó ninguno de estos materiales. Cada enlace apunta al editor original (Tribunales de EE. UU., NIJC, NIPNLG). Estos enlaces no caducan — guárdelos y compártalos.",
  ht: "Sèlman gid lekti. Konpayi an pa t ekri OKENN nan materyèl sa yo. Chak lyen pwente sou piblikatè orijinal la (Tribinal Etazini, NIJC, NIPNLG). Lyen sa yo pa janm ekspire — sove yo epi pataje yo.",
};

export function buildSelfHelpLibraryHtml(language: string): string {
  const lang = pickLang(language);
  const items = SELF_HELP_LIBRARY.map(
    (d) =>
      `<li style="margin:0 0 10px;font-size:13px;line-height:1.5;">
        <a href="${d.url}" style="color:#0a58ca;text-decoration:underline;font-weight:600;">${escapeHtml(d.title[lang])}</a><br/>
        <span style="color:#475569;">${escapeHtml(d.description[lang])}</span>
      </li>`,
  ).join("");
  return `<div style="margin-top:18px;padding:18px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;">
      <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#075985;">${escapeHtml(HEADING[lang])}</p>
      <ul style="margin:0;padding-left:20px;">${items}</ul>
      <p style="margin:12px 0 0;font-size:11px;color:#0c4a6e;">${escapeHtml(NOTE[lang])}</p>
    </div>`;
}

export function buildSelfHelpLibraryText(language: string): string {
  const lang = pickLang(language);
  const lines = SELF_HELP_LIBRARY.map(
    (d) => `- ${d.title[lang]}\n  ${d.url}`,
  ).join("\n");
  return `${HEADING[lang]}\n${lines}\n${NOTE[lang]}`;
}
