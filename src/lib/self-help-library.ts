// Public URLs for the federal forms + NILC/NIPNLG pro se manuals that
// every customer receives. Hosted in the public `self-help-library`
// Supabase storage bucket so they can be linked from emails, the App,
// and the /venues page without signed-URL expiry.

const BUCKET_BASE =
  "https://viyoqmjullnuzptnawtk.supabase.co/storage/v1/object/public/self-help-library";

export interface SelfHelpDoc {
  key: "nijc" | "nipnlg" | "js44" | "ao240";
  url: string;
  title: { en: string; es: string; ht: string };
  description: { en: string; es: string; ht: string };
}

export const SELF_HELP_LIBRARY: SelfHelpDoc[] = [
  {
    key: "nijc",
    url: `${BUCKET_BASE}/NIJC-Pro-Se-Manual-EN.pdf`,
    title: {
      en: "NIJC — Pro Se Immigration Detention Manual",
      es: "NIJC — Manual Pro Se sobre Detención de Inmigración",
      ht: "NIJC — Manyèl Pro Se sou Detansyon Imigrasyon",
    },
    description: {
      en: "National Immigrant Justice Center step-by-step guide for detained people without a lawyer.",
      es: "Guía paso a paso del NIJC para personas detenidas sin abogado.",
      ht: "Gid etap pa etap NIJC pou moun ki detni san avoka.",
    },
  },
  {
    key: "nipnlg",
    url: `${BUCKET_BASE}/NIPNLG-Release-Guide-EN.pdf`,
    title: {
      en: "NIPNLG — Pro Se Release Guide (Habeas / § 2241)",
      es: "NIPNLG — Guía Pro Se de Liberación (Habeas / § 2241)",
      ht: "NIPNLG — Gid Pro Se pou Liberasyon (Habeas / § 2241)",
    },
    description: {
      en: "National Immigration Project / NLG pro se habeas corpus and release guide.",
      es: "Guía pro se de habeas corpus y liberación del NIPNLG.",
      ht: "Gid pro se NIPNLG pou habeas corpus ak liberasyon.",
    },
  },
  {
    key: "js44",
    url: `${BUCKET_BASE}/JS44-Civil-Cover-Sheet-Blank.pdf`,
    title: {
      en: "JS-44 — Civil Cover Sheet (blank official form)",
      es: "JS-44 — Hoja de Carátula Civil (formulario oficial en blanco)",
      ht: "JS-44 — Fèy Kouvèti Sivil (fòm ofisyèl vid)",
    },
    description: {
      en: "Official federal civil cover sheet filed with every new district court case.",
      es: "Hoja de carátula civil federal oficial requerida con cada nuevo caso.",
      ht: "Fèy kouvèti sivil federal ofisyèl pou chak nouvo dosye.",
    },
  },
  {
    key: "ao240",
    url: `${BUCKET_BASE}/AO240-Application-IFP-Blank.pdf`,
    title: {
      en: "AO 240 — Application to Proceed In Forma Pauperis (blank)",
      es: "AO 240 — Solicitud para Proceder In Forma Pauperis (en blanco)",
      ht: "AO 240 — Aplikasyon pou Pwosede In Forma Pauperis (vid)",
    },
    description: {
      en: "Blank federal IFP form. The customer fills this in by hand at the time of filing.",
      es: "Formulario IFP federal en blanco. El cliente lo completa a mano al presentar.",
      ht: "Fòm IFP federal vid. Kliyan an ranpli li alamen lè li depoze.",
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
  en: "Self-Help Library (free, public, never expires)",
  es: "Biblioteca de Autoayuda (gratuita, pública, no caduca)",
  ht: "Bibliyotèk Èd Tèt Ou (gratis, piblik, pa janm ekspire)",
};

const NOTE: Record<Lang, string> = {
  en: "These links never expire. Save them. Share them.",
  es: "Estos enlaces no caducan. Guárdelos. Compártalos.",
  ht: "Lyen sa yo pa janm ekspire. Sove yo. Pataje yo.",
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
