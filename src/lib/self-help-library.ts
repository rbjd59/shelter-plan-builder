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

// Per attorney revised opinion #10: a pro bono / low-cost legal-aid
// resource list MUST accompany every packet so the customer can attempt
// to find a real attorney. The Company authors NONE of these listings —
// every link points to the original directory (EOIR, state bars,
// established non-profits). National + Florida-specific entries are
// included because the SDFL is the venue of first resort.
export interface LegalAidResource {
  key: string;
  url: string;
  scope: "national" | "florida";
  title: { en: string; es: string; ht: string };
  description: { en: string; es: string; ht: string };
}

export const PRO_BONO_RESOURCES: LegalAidResource[] = [
  {
    key: "eoir_pro_bono",
    scope: "national",
    url: "https://www.justice.gov/eoir/list-pro-bono-legal-service-providers",
    title: {
      en: "EOIR — List of Pro Bono Legal Service Providers (official DOJ directory)",
      es: "EOIR — Lista de Proveedores de Servicios Legales Pro Bono (directorio oficial del DOJ)",
      ht: "EOIR — Lis Founisè Sèvis Legal Pro Bono (anyè ofisyèl DOJ)",
    },
    description: {
      en: "Department of Justice's official, state-by-state list of recognized pro bono providers for people in immigration proceedings. Updated quarterly.",
      es: "Lista oficial del Departamento de Justicia, por estado, de proveedores pro bono reconocidos para personas en procesos de inmigración. Se actualiza trimestralmente.",
      ht: "Lis ofisyèl Depatman Jistis la, eta pa eta, de founisè pro bono rekonèt pou moun ki nan pwosedi imigrasyon. Mete ajou chak trimès.",
    },
  },
  {
    key: "ian_directory",
    scope: "national",
    url: "https://www.immigrationadvocates.org/nonprofit/legaldirectory/",
    title: {
      en: "Immigration Advocates Network — National Legal Services Directory",
      es: "Immigration Advocates Network — Directorio Nacional de Servicios Legales",
      ht: "Immigration Advocates Network — Anyè Nasyonal Sèvis Legal",
    },
    description: {
      en: "Searchable national directory of free and low-cost non-profit immigration legal services. Filter by ZIP code, language, and detention status.",
      es: "Directorio nacional con búsqueda de servicios legales de inmigración gratuitos y de bajo costo. Filtre por código postal, idioma y estado de detención.",
      ht: "Anyè nasyonal ki ka chèche pou sèvis legal imigrasyon gratis ak ba pri. Filtre pa kòd postal, lang, ak sitiyasyon detansyon.",
    },
  },
  {
    key: "lsc_find_help",
    scope: "national",
    url: "https://www.lsc.gov/about-lsc/what-legal-aid/get-legal-help",
    title: {
      en: "Legal Services Corporation — Find Legal Aid (federally funded civil legal aid)",
      es: "Legal Services Corporation — Encuentre Ayuda Legal (asistencia civil financiada por el gobierno federal)",
      ht: "Legal Services Corporation — Jwenn Èd Legal (èd legal sivil finanse pa gouvènman federal)",
    },
    description: {
      en: "Federally funded directory of civil legal aid organizations nationwide. Useful for habeas filings and family / housing matters tied to detention.",
      es: "Directorio financiado por el gobierno federal de organizaciones de ayuda legal civil en todo el país. Útil para habeas y asuntos familiares / de vivienda vinculados a la detención.",
      ht: "Anyè finanse pa gouvènman federal de òganizasyon èd legal sivil nan tout peyi a. Itil pou habeas ak zafè fanmi / lojman ki lye ak detansyon.",
    },
  },
  {
    key: "ai_justice",
    scope: "florida",
    url: "https://www.aijustice.org/get-help/",
    title: {
      en: "Americans for Immigrant Justice (FL) — Get Help",
      es: "Americans for Immigrant Justice (FL) — Obtener Ayuda",
      ht: "Americans for Immigrant Justice (FL) — Jwenn Èd",
    },
    description: {
      en: "Miami-based non-profit serving detained immigrants in Florida, including Krome, BTC, and Glades. Free intake hotline.",
      es: "Organización sin fines de lucro con sede en Miami que atiende a inmigrantes detenidos en Florida, incluidos Krome, BTC y Glades. Línea de admisión gratuita.",
      ht: "Òganizasyon san bi likratif ki baze nan Miami k ap sèvi imigran ki detni nan Florida, ki gen ladann Krome, BTC, ak Glades. Liy admisyon gratis.",
    },
  },
  {
    key: "flrls",
    scope: "florida",
    url: "https://www.floridalawhelp.org/",
    title: {
      en: "Florida Law Help — statewide civil legal aid directory",
      es: "Florida Law Help — directorio estatal de ayuda legal civil",
      ht: "Florida Law Help — anyè èd legal sivil nan tout eta a",
    },
    description: {
      en: "Florida Bar Foundation directory of free civil legal aid programs across all 67 counties. Includes detention, housing, and family law referrals.",
      es: "Directorio de la Florida Bar Foundation de programas gratuitos de ayuda legal civil en los 67 condados. Incluye remisiones de detención, vivienda y derecho familiar.",
      ht: "Anyè Florida Bar Foundation pou pwogram èd legal sivil gratis nan tout 67 konte yo. Gen referans pou detansyon, lojman, ak dwa fanmi.",
    },
  },
  {
    key: "flbar_lrs",
    scope: "florida",
    url: "https://www.floridabar.org/public/lrs/",
    title: {
      en: "The Florida Bar — Lawyer Referral Service (low-cost consultations)",
      es: "Colegio de Abogados de Florida — Servicio de Referencia de Abogados (consultas de bajo costo)",
      ht: "Florida Bar — Sèvis Referans Avoka (konsiltasyon ba pri)",
    },
    description: {
      en: "Official Florida Bar referral line. Connects callers to vetted Florida attorneys; initial consult capped at a low flat fee.",
      es: "Línea oficial de referencias del Colegio de Abogados de Florida. Conecta a quienes llaman con abogados verificados; la consulta inicial tiene una tarifa plana baja.",
      ht: "Liy referans ofisyèl Florida Bar la. Konekte moun ki rele ak avoka Florida verifye; konsiltasyon inisyal la gen yon ti frè fiks.",
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

const PRO_BONO_HEADING: Record<Lang, string> = {
  en: "Pro Bono & Low-Cost Legal Aid — try a real attorney first",
  es: "Asistencia Legal Pro Bono y de Bajo Costo — intente primero con un abogado real",
  ht: "Èd Legal Pro Bono ak Ba Pri — eseye yon vrè avoka anvan",
};

const PRO_BONO_NOTE: Record<Lang, string> = {
  en: "DetencionDefensa.com, Inc. is the technology operator only, is not a law firm, and authored NONE of these directories. Always try to retain a licensed attorney before filing pro se. National listings + Florida-specific (SDFL is the default venue) are below.",
  es: "DetencionDefensa.com, Inc. es solo el operador tecnológico, no es una firma de abogados y NO redactó ninguno de estos directorios. Siempre intente contratar un abogado licenciado antes de presentar pro se. A continuación se incluyen listados nacionales + específicos de Florida (SDFL es la sede por defecto).",
  ht: "DetencionDefensa.com, Inc. se sèlman operatè teknoloji a, li pa yon kabinè avoka, epi li pa t ekri OKENN nan anyè sa yo. Toujou eseye anboche yon avoka ki gen lisans anvan ou depoze pro se. Anba a gen lis nasyonal + espesifik Florida (SDFL se sit pa defo a).",
};

const NATIONAL_LABEL: Record<Lang, string> = {
  en: "National",
  es: "Nacional",
  ht: "Nasyonal",
};
const FLORIDA_LABEL: Record<Lang, string> = {
  en: "Florida (SDFL venue)",
  es: "Florida (sede SDFL)",
  ht: "Florida (sit SDFL)",
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

  const renderGroup = (scope: "national" | "florida", label: string) => {
    const entries = PRO_BONO_RESOURCES.filter((r) => r.scope === scope)
      .map(
        (r) =>
          `<li style="margin:0 0 10px;font-size:13px;line-height:1.5;">
            <a href="${r.url}" style="color:#a16207;text-decoration:underline;font-weight:600;">${escapeHtml(r.title[lang])}</a><br/>
            <span style="color:#475569;">${escapeHtml(r.description[lang])}</span>
          </li>`,
      )
      .join("");
    return `<p style="margin:10px 0 6px;font-size:12px;font-weight:700;color:#78350f;text-transform:uppercase;letter-spacing:.5px;">${escapeHtml(label)}</p>
      <ul style="margin:0 0 6px;padding-left:20px;">${entries}</ul>`;
  };

  return `<div style="margin-top:18px;padding:18px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;">
      <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#075985;">${escapeHtml(HEADING[lang])}</p>
      <ul style="margin:0;padding-left:20px;">${items}</ul>
      <p style="margin:12px 0 0;font-size:11px;color:#0c4a6e;">${escapeHtml(NOTE[lang])}</p>
    </div>
    <div style="margin-top:14px;padding:18px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;">
      <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#78350f;">${escapeHtml(PRO_BONO_HEADING[lang])}</p>
      <p style="margin:0 0 10px;font-size:12px;color:#78350f;">${escapeHtml(PRO_BONO_NOTE[lang])}</p>
      ${renderGroup("national", NATIONAL_LABEL[lang])}
      ${renderGroup("florida", FLORIDA_LABEL[lang])}
    </div>`;
}

export function buildSelfHelpLibraryText(language: string): string {
  const lang = pickLang(language);
  const lines = SELF_HELP_LIBRARY.map(
    (d) => `- ${d.title[lang]}\n  ${d.url}`,
  ).join("\n");
  const proBonoLines = (scope: "national" | "florida") =>
    PRO_BONO_RESOURCES.filter((r) => r.scope === scope)
      .map((r) => `- ${r.title[lang]}\n  ${r.url}`)
      .join("\n");
  return `${HEADING[lang]}\n${lines}\n${NOTE[lang]}\n\n${PRO_BONO_HEADING[lang]}\n${PRO_BONO_NOTE[lang]}\n\n[${NATIONAL_LABEL[lang]}]\n${proBonoLines("national")}\n\n[${FLORIDA_LABEL[lang]}]\n${proBonoLines("florida")}`;
}
