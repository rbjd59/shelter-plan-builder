// Builds bilingual side-by-side PDFs: each page is landscape US Letter
// (792x612 pt) with the filled English form on the left half and a translated
// reference panel (labels + answers in the petitioner's language) on the
// right half. FOR PETITIONER REFERENCE ONLY — the English original is what
// gets filed with the court.

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

type A = Record<string, unknown>;
type Lang = "es" | "ht" | "en";

const STRIP = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x00-\x7F]/g, "?");

const s = (v: unknown) => (v == null ? "" : String(v));
const firstText = (a: A, ...keys: string[]) => {
  for (const k of keys) {
    const v = s(a[k]).trim();
    if (v) return v;
  }
  return "";
};

const T: Record<Lang, Record<string, string>> = {
  es: {
    notice: "TRADUCCION DE REFERENCIA - El formulario en ingles a la izquierda es lo que se presenta ante el tribunal. Este panel es solo para entender lo que dice.",
    ao242: "AO 242 - Peticion de Habeas Corpus (28 U.S.C. § 2241)",
    ao240: "AO 240 - Solicitud para Proceder In Forma Pauperis",
    motion: "Mocion de Remision al Programa de Abogados Voluntarios",
    js44: "JS-44 - Hoja de Cubierta Civil",
    petitioner: "Peticionario",
    facility: "Centro de Detencion",
    inmateNo: "Numero de Recluso / A-Number",
    address: "Direccion",
    grounds: "Motivos de la Peticion",
    relief: "Reparacion solicitada",
    employer: "Empleador",
    income: "Ingresos mensuales",
    cash: "Efectivo en mano",
    expenses: "Gastos mensuales",
    debts: "Deudas",
    dependents: "Dependientes",
    plaintiff: "Demandante",
    defendant: "Demandado",
    cause: "Causa de la accion",
    page: "pagina",
  },
  ht: {
    notice: "TRADIKSYON REFERANS - Fom Angle a sou bo goch la se sa ki depoze nan tribinal la. Panel sa a se sèlman pou ou konprann sa li di.",
    ao242: "AO 242 - Petisyon pou Habeas Corpus (28 U.S.C. § 2241)",
    ao240: "AO 240 - Aplikasyon pou Pwosede In Forma Pauperis",
    motion: "Mosyon pou Refere nan Pwogram Avoka Volonte",
    js44: "JS-44 - Fey Kouveti Sivil",
    petitioner: "Petisyone",
    facility: "Sant Detansyon",
    inmateNo: "Nimewo Prizonye / A-Number",
    address: "Adres",
    grounds: "Rezon Petisyon an",
    relief: "Sekou yo mande",
    employer: "Anplwaye",
    income: "Revni chak mwa",
    cash: "Kob nan men",
    expenses: "Depans chak mwa",
    debts: "Det",
    dependents: "Depandan",
    plaintiff: "Plenyan",
    defendant: "Defande",
    cause: "Koz aksyon an",
    page: "paj",
  },
  en: {
    notice: "REFERENCE TRANSLATION - The English form on the left is what gets filed with the court. This panel is for understanding only.",
    ao242: "AO 242 - Petition for Habeas Corpus (28 U.S.C. § 2241)",
    ao240: "AO 240 - Application to Proceed In Forma Pauperis",
    motion: "Motion for Referral to Volunteer Attorney Program",
    js44: "JS-44 - Civil Cover Sheet",
    petitioner: "Petitioner",
    facility: "Facility",
    inmateNo: "Inmate Number / A-Number",
    address: "Address",
    grounds: "Grounds for the Petition",
    relief: "Relief Requested",
    employer: "Employer",
    income: "Monthly Income",
    cash: "Cash on Hand",
    expenses: "Monthly Expenses",
    debts: "Debts",
    dependents: "Dependents",
    plaintiff: "Plaintiff",
    defendant: "Defendant",
    cause: "Cause of Action",
    page: "page",
  },
};

interface Row { label: string; value: string }

function wrap(text: string, max: number, size: number, font: PDFFont): string[] {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? cur + " " + w : w;
    if (font.widthOfTextAtSize(t, size) > max) {
      if (cur) out.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) out.push(cur);
  return out;
}

function drawRightPanel(
  page: PDFPage,
  font: PDFFont,
  bold: PDFFont,
  opts: { title: string; notice: string; rows: Row[]; pageNum: number; totalPages: number; t: Record<string, string> },
) {
  const x0 = 410;
  const maxW = 370;
  let y = 590;
  const gray = rgb(0.45, 0.45, 0.45);
  const black = rgb(0, 0, 0);

  // Notice band (wrapped)
  for (const ln of wrap(STRIP(opts.notice), maxW, 8, font)) {
    if (y < 60) return;
    page.drawText(ln, { x: x0, y, size: 8, font, color: gray });
    y -= 10;
  }
  y -= 8;

  // Title
  for (const ln of wrap(STRIP(opts.title), maxW, 12, bold)) {
    if (y < 60) return;
    page.drawText(ln, { x: x0, y, size: 12, font: bold, color: black });
    y -= 14;
  }
  y -= 4;

  // Page indicator
  page.drawText(
    STRIP(`${opts.t.page} ${opts.pageNum} / ${opts.totalPages}`),
    { x: x0, y, size: 8, font, color: gray },
  );
  y -= 14;

  // Rows
  for (const r of opts.rows) {
    if (y < 60) break;
    page.drawText(STRIP(r.label) + ":", { x: x0, y, size: 10, font: bold, color: black });
    y -= 12;
    for (const ln of wrap(STRIP(r.value || "—"), maxW - 12, 10, font)) {
      if (y < 50) break;
      page.drawText(ln, { x: x0 + 12, y, size: 10, font, color: black });
      y -= 12;
    }
    y -= 4;
  }
}

async function buildBilingual(
  sourceBytes: Uint8Array,
  opts: { title: string; notice: string; rows: Row[]; t: Record<string, string> },
): Promise<Uint8Array> {
  const src = await PDFDocument.load(sourceBytes);
  const out = await PDFDocument.create();
  const font = await out.embedFont(StandardFonts.TimesRoman);
  const bold = await out.embedFont(StandardFonts.TimesRomanBold);

  const pageCount = src.getPageCount();
  const indices = Array.from({ length: pageCount }, (_, i) => i);
  const embeds = await out.embedPdf(sourceBytes, indices);

  // Landscape US Letter
  const PAGE_W = 792;
  const PAGE_H = 612;
  const LEFT_W = 396;
  const PAD = 8;

  for (let i = 0; i < pageCount; i++) {
    const page = out.addPage([PAGE_W, PAGE_H]);
    const emb = embeds[i];
    const sw = emb.width;
    const sh = emb.height;
    const targetW = LEFT_W - PAD * 2;
    const targetH = PAGE_H - PAD * 2;
    const scale = Math.min(targetW / sw, targetH / sh);
    const drawW = sw * scale;
    const drawH = sh * scale;
    page.drawPage(emb, {
      x: PAD + (targetW - drawW) / 2,
      y: PAD + (targetH - drawH) / 2,
      width: drawW,
      height: drawH,
    });

    // Divider
    page.drawLine({
      start: { x: LEFT_W, y: 10 },
      end: { x: LEFT_W, y: PAGE_H - 10 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });

    // Right panel: full translation on page 1, condensed header on subsequent pages
    if (i === 0) {
      drawRightPanel(page, font, bold, {
        title: opts.title,
        notice: opts.notice,
        rows: opts.rows,
        pageNum: 1,
        totalPages: pageCount,
        t: opts.t,
      });
    } else {
      page.drawText(STRIP(opts.title), { x: 410, y: 590, size: 11, font: bold, color: rgb(0, 0, 0) });
      page.drawText(
        STRIP(`${opts.t.page} ${i + 1} / ${pageCount}`),
        { x: 410, y: 574, size: 9, font, color: rgb(0.45, 0.45, 0.45) },
      );
      page.drawText(
        STRIP(opts.notice),
        { x: 410, y: 556, size: 8, font, color: rgb(0.45, 0.45, 0.45) },
      );
    }
  }

  return await out.save();
}

export interface BilingualForms {
  ao242: Uint8Array;
  ao240: Uint8Array;
  motion: Uint8Array;
  js44: Uint8Array;
}

export interface SourcePdfs {
  ao242: Uint8Array;
  ao240: Uint8Array;
  motion: Uint8Array;
  js44: Uint8Array | null;
}

export async function buildBilingualForms(
  a: A,
  lang: Lang,
  sources: SourcePdfs,
): Promise<Partial<BilingualForms>> {
  const t = T[lang] ?? T.en;
  const petitioner = firstText(a, "full_name", "mail_inmate_name");
  const facility = firstText(a, "facility_name", "mail_current_location");
  const facilityAddr = firstText(a, "facility_address", "mail_facility_address");
  const inmateNo = firstText(a, "booking_number", "mail_inmate_number", "a_number");
  const native = (k: string, en: string) => firstText(a, `${k}__native`) || s(a[en]);

  const out: Partial<BilingualForms> = {};

  out.ao242 = await buildBilingual(sources.ao242, {
    t,
    title: t.ao242,
    notice: t.notice,
    rows: [
      { label: t.petitioner, value: petitioner },
      { label: t.facility, value: facility },
      { label: t.inmateNo, value: inmateNo },
      { label: t.address, value: facilityAddr },
      { label: t.grounds, value: [native("ground_one", "ground_one"), native("ground_two", "ground_two"), native("ground_three", "ground_three")].filter(Boolean).join(" / ") },
      { label: t.relief, value: native("relief_requested", "relief_requested") },
    ],
  });

  out.ao240 = await buildBilingual(sources.ao240, {
    t,
    title: t.ao240,
    notice: t.notice,
    rows: [
      { label: t.petitioner, value: petitioner },
      { label: t.employer, value: native("ifp_employer", "ifp_employer") },
      { label: t.income, value: s(a.ifp_monthly_pay) },
      { label: t.cash, value: s(a.ifp_cash_on_hand) },
      { label: t.expenses, value: s(a.ifp_monthly_expenses) },
      { label: t.debts, value: native("ifp_debts", "ifp_debts") },
      { label: t.dependents, value: native("ifp_dependents", "ifp_dependents") },
    ],
  });

  out.motion = await buildBilingual(sources.motion, {
    t,
    title: t.motion,
    notice: t.notice,
    rows: [
      { label: t.petitioner, value: petitioner },
      { label: t.facility, value: facility },
      { label: t.address, value: facilityAddr },
    ],
  });

  if (sources.js44) {
    out.js44 = await buildBilingual(sources.js44, {
      t,
      title: t.js44,
      notice: t.notice,
      rows: [
        { label: t.plaintiff, value: petitioner },
        { label: t.defendant, value: facility ? `Warden, ${facility}` : "Warden" },
        { label: t.cause, value: "28 U.S.C. § 2241" },
        { label: t.address, value: facilityAddr },
      ],
    });
  }

  return out;
}
