// Generates plain-text PDF copies of the four court forms in the user's
// native language (Spanish or Haitian Creole) FOR THEIR RECORDS ONLY.
// These are NOT court-filable — the English AcroForm-filled originals are
// what gets filed. We render with pdf-lib StandardFonts (no Unicode support
// beyond Latin-1), so we strip accents to keep glyphs in range.

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type A = Record<string, unknown>;
type Lang = "es" | "ht" | "en";

const STRIP = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x00-\x7F]/g, "?");

const T: Record<Lang, Record<string, string>> = {
  es: {
    notice: "COPIA PARA SUS REGISTROS — No para presentar. Use el original en ingles.",
    ao242: "AO 242 — Peticion de Habeas Corpus (28 U.S.C. § 2241)",
    ao240: "AO 240 — Solicitud para Proceder In Forma Pauperis",
    motion: "Mocion de Remision al Programa de Abogados Voluntarios",
    js44: "JS-44 — Hoja de Cubierta Civil",
    petitioner: "Peticionario",
    facility: "Centro de Detencion",
    inmateNo: "Numero de Recluso",
    address: "Direccion",
    grounds: "Motivos",
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
  },
  ht: {
    notice: "KOPI POU REKO OU — Pa pou depoze. Itilize orijinal Angle a.",
    ao242: "AO 242 — Petisyon pou Habeas Corpus (28 U.S.C. § 2241)",
    ao240: "AO 240 — Aplikasyon pou Pwosede In Forma Pauperis",
    motion: "Mosyon pou Refere nan Pwogram Avoka Volonte",
    js44: "JS-44 — Fey Kouvèti Sivil",
    petitioner: "Petisyone",
    facility: "Sant Detansyon",
    inmateNo: "Nimewo Prizonye",
    address: "Adres",
    grounds: "Rezon",
    relief: "Sekou yo mande",
    employer: "Anplwayè",
    income: "Revni chak mwa",
    cash: "Kob nan men",
    expenses: "Depans chak mwa",
    debts: "Det",
    dependents: "Depandan",
    plaintiff: "Plenyan",
    defendant: "Defandè",
    cause: "Koz aksyon an",
  },
  en: {
    notice: "COPY FOR YOUR RECORDS — Not for filing. Use the English original.",
    ao242: "AO 242 — Petition for Habeas Corpus (28 U.S.C. § 2241)",
    ao240: "AO 240 — Application to Proceed In Forma Pauperis",
    motion: "Motion for Referral to Volunteer Attorney Program",
    js44: "JS-44 — Civil Cover Sheet",
    petitioner: "Petitioner",
    facility: "Facility",
    inmateNo: "Inmate Number",
    address: "Address",
    grounds: "Grounds",
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
  },
};

const s = (v: unknown) => (v == null ? "" : String(v));
const firstText = (a: A, ...keys: string[]) => {
  for (const k of keys) {
    const v = s(a[k]).trim();
    if (v) return v;
  }
  return "";
};

async function makePage(
  title: string,
  notice: string,
  rows: Array<{ label: string; value: string }>,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const black = rgb(0, 0, 0);
  const gray = rgb(0.4, 0.4, 0.4);
  let y = 750;

  page.drawText(STRIP(notice), { x: 72, y, size: 9, font, color: gray });
  y -= 28;
  page.drawText(STRIP(title), { x: 72, y, size: 14, font: bold, color: black });
  y -= 24;

  const wrap = (text: string, max: number, size: number, f = font): string[] => {
    const words = text.split(/\s+/);
    const out: string[] = [];
    let cur = "";
    for (const w of words) {
      const t = cur ? cur + " " + w : w;
      if (f.widthOfTextAtSize(t, size) > max) {
        if (cur) out.push(cur);
        cur = w;
      } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  };

  for (const r of rows) {
    if (y < 80) break;
    page.drawText(STRIP(r.label) + ":", { x: 72, y, size: 11, font: bold, color: black });
    y -= 14;
    for (const ln of wrap(STRIP(r.value || "—"), 468, 11)) {
      if (y < 60) break;
      page.drawText(ln, { x: 90, y, size: 11, font, color: black });
      y -= 14;
    }
    y -= 6;
  }
  return await doc.save();
}

export interface NativeCopies {
  ao242: Uint8Array;
  ao240: Uint8Array;
  motion: Uint8Array;
  js44: Uint8Array;
}

export async function buildNativeCopies(a: A, lang: Lang): Promise<NativeCopies> {
  const t = T[lang] ?? T.en;
  const petitioner = firstText(a, "full_name", "mail_inmate_name");
  const facility = firstText(a, "facility_name", "mail_current_location");
  const facilityAddr = firstText(a, "facility_address", "mail_facility_address");
  const inmateNo = firstText(a, "booking_number", "mail_inmate_number", "a_number");

  const native = (k: string, en: string) => firstText(a, `${k}__native`) || s(a[en]);

  const [ao242, ao240, motion, js44] = await Promise.all([
    makePage(t.ao242, t.notice, [
      { label: t.petitioner, value: native("full_name", "full_name") },
      { label: t.facility, value: "" },
      { label: t.inmateNo, value: inmateNo },
      { label: t.address, value: "" },
      { label: t.grounds, value: native("ground_one", "ground_one") + " " + native("ground_two", "ground_two") },
      { label: t.relief, value: native("relief_requested", "relief_requested") },
    ]),
    makePage(t.ao240, t.notice, [
      { label: t.petitioner, value: petitioner },
      { label: t.employer, value: native("ifp_employer", "ifp_employer") },
      { label: t.income, value: s(a.ifp_monthly_pay) },
      { label: t.cash, value: s(a.ifp_cash_on_hand) },
      { label: t.expenses, value: s(a.ifp_monthly_expenses) },
      { label: t.debts, value: native("ifp_debts", "ifp_debts") },
      { label: t.dependents, value: native("ifp_dependents", "ifp_dependents") },
    ]),
    makePage(t.motion, t.notice, [
      { label: t.petitioner, value: petitioner },
      { label: t.facility, value: facility },
      { label: t.address, value: facilityAddr },
    ]),
    makePage(t.js44, t.notice, [
      { label: t.plaintiff, value: petitioner },
      { label: t.defendant, value: `Warden, ${facility}` },
      { label: t.cause, value: "28 U.S.C. § 2241" },
      { label: t.address, value: facilityAddr },
    ]),
  ]);

  return { ao242, ao240, motion, js44 };
}
