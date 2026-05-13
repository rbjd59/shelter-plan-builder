// Fills the OFFICIAL AO 242 (28 U.S.C. § 2241) and AO 240 (IFP) PDF forms
// from the U.S. Courts using pdf-lib AcroForm field filling.
//
// Templates were downloaded from uscourts.gov and embedded as base64 modules:
//   src/assets/forms/AO242.pdf.b64.ts
//   src/assets/forms/AO240.pdf.b64.ts

import { PDFDocument, PDFName, type PDFForm } from "pdf-lib";
import ao242b64 from "@/assets/forms/AO242.pdf.b64";
import ao240b64 from "@/assets/forms/AO240.pdf.b64";

type A = Record<string, unknown>;
const s = (v: unknown) => (v == null ? "" : String(v));

function b64ToBytes(b64: string): Uint8Array {
  if (typeof Buffer !== "undefined") return new Uint8Array(Buffer.from(b64, "base64"));
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function setText(form: PDFForm, name: string, value: string): void {
  try {
    form.getTextField(name).setText(value || "");
  } catch {
    /* field not present */
  }
}

function setCheckOption(form: PDFForm, name: string, optionOnValue: string): void {
  try {
    const cb = form.getCheckBox(name);
    const widgets = cb.acroField.getWidgets();
    const target = PDFName.of(optionOnValue);
    const off = PDFName.of("Off");
    let matched = false;
    for (const w of widgets) {
      const ap = w.dict.lookup(PDFName.of("AP"));
      const n = (ap as { lookup?: (k: PDFName) => unknown } | undefined)?.lookup?.(
        PDFName.of("N"),
      ) as { dict?: Map<PDFName, unknown> } | undefined;
      const keys: string[] = n?.dict ? [...n.dict.keys()].map((k) => String(k)) : [];
      const wDict = (w as unknown as { dict: { set: (k: PDFName, v: PDFName) => void } }).dict;
      if (keys.includes("/" + optionOnValue)) {
        wDict.set(PDFName.of("AS"), target);
        matched = true;
      } else {
        wDict.set(PDFName.of("AS"), off);
      }
    }
    if (matched) {
      (cb.acroField as unknown as { dict: { set: (k: PDFName, v: PDFName) => void } }).dict.set(
        PDFName.of("V"),
        target,
      );
    }
  } catch {
    /* ignore */
  }
}

function splitLines(text: string, n: number, perLine = 95): string[] {
  const out: string[] = [];
  if (!text) return Array(n).fill("");
  const words = String(text).split(/\s+/);
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > perLine && out.length < n - 1) {
      out.push(cur.trim());
      cur = w;
    } else {
      cur = (cur ? cur + " " : "") + w;
    }
  }
  if (cur) out.push(cur.trim());
  while (out.length < n) out.push("");
  return out.slice(0, n);
}

async function fillAO242(a: A): Promise<Uint8Array> {
  const doc = await PDFDocument.load(b64ToBytes(ao242b64));
  const form = doc.getForm();

  const petitionerName = s(a.full_name);
  const respondent =
    s(a.warden_name) +
    (a.warden_title ? `, ${s(a.warden_title)}` : "") +
    (a.facility_name ? `\nWarden, ${s(a.facility_name)}` : "");

  setText(form, "a  Your full name", petitionerName);
  setText(form, "b  Other names you have used", s(a.other_names_used));
  setText(form, "Petitioner", petitionerName);
  setText(form, "Respondent", respondent || "Warden of the facility of confinement");

  setText(form, "a  Name of institution", s(a.facility_name));
  setText(form, "b  Address", s(a.facility_address));
  setText(form, "c Your identification number", s(a.booking_number) || s(a.a_number));

  setCheckOption(form, "personal3", "federal");
  setCheckOption(form, "personal4", "immigration");
  setCheckOption(form, "personal5", "immigration");

  setText(form, "Date you were taken into immigration custody", s(a.date_taken_into_custody));
  setText(form, "Date of the removal or reinstatement order", s(a.detainer_date));

  setCheckOption(form, "personal11", "No");
  setCheckOption(form, "personal11c", "No");
  setCheckOption(form, "personal11d", "No");
  setCheckOption(form, "personal12", "No");

  const groundOneTitle = s(a.ground_one) || s(a.grounds_requested);
  setText(form, "GROUND ONE", groundOneTitle);
  const g1Lines = splitLines(s(a.prior_immigration_proceedings), 5);
  for (let i = 0; i < 5; i++) {
    setText(form, `a  Supporting facts Be brief  Do not cite cases or law ${i + 1}`, g1Lines[i]);
  }

  const groundTwo = s(a.ground_two);
  if (groundTwo) {
    const g2 = splitLines(groundTwo, 4);
    for (let i = 0; i < 4; i++) setText(form, `GROUND TWO ${i + 1}`, g2[i]);
  }

  const relief = s(a.relief_requested);
  const rLines = splitLines(relief, 4);
  setText(form, "Request for Relief", rLines[0]);
  for (let i = 0; i < 4; i++) {
    setText(form, `15  State exactly what you want the court to do ${i + 1}`, rLines[i]);
  }

  setText(form, "Petitionersig", "");
  setText(form, "Date", "");

  // District: dynamic per case, falls back to SDFL.
  try {
    const dd = form.getDropdown("district");
    const opts = dd.getOptions();
    const wanted = s(a.court_district) || "Florida Southern";
    const re = new RegExp(wanted.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const match = opts.find((o) => re.test(o));
    if (match) dd.select(match);
  } catch {
    /* ignore */
  }

  try {
    form.flatten();
  } catch {
    /* leave editable */
  }
  return await doc.save();
}

async function fillAO240(a: A): Promise<Uint8Array> {
  const doc = await PDFDocument.load(b64ToBytes(ao240b64));
  const form = doc.getForm();

  const name = s(a.full_name);
  setText(form, "Plaintiff", name);
  setText(
    form,
    "Defendant",
    s(a.warden_name) || (a.facility_name ? `Warden, ${s(a.facility_name)}` : ""),
  );
  setText(form, "Location held", s(a.facility_name));
  setText(form, "Applican'tsNameTitle", name);

  const employed = !!s(a.ifp_employer);
  setCheckOption(form, "Check Box1", employed ? "Yes" : "No");
  setText(form, "Employer's name and address", s(a.ifp_employer) || "None");
  setText(form, "Gross pay amount", s(a.ifp_monthly_pay) || "$0");
  setText(form, "Take-home pay amount", s(a.ifp_monthly_pay) || "$0");
  setText(form, "Specify pay period", employed ? "monthly" : "N/A");

  const hasOtherIncome = !!s(a.ifp_other_income);
  setCheckOption(form, "Check Box2", hasOtherIncome ? "Yes" : "No");
  setCheckOption(form, "Check Box3", "No");
  setCheckOption(form, "Check Box4", "No");
  setCheckOption(form, "Check Box5", "No");
  setCheckOption(form, "Check Box6", "No");
  setText(form, "Amount and source of other income", s(a.ifp_other_income) || "None");

  setText(form, "Amount of money in cash/checking/savings", s(a.ifp_cash_on_hand) || "$0");
  setText(form, "Value of property owned", s(a.ifp_property) || "None");
  setText(form, "Monthly expenses", s(a.ifp_monthly_expenses) || "$0");
  setText(form, "Dependents, and how much paid for support", s(a.ifp_dependents) || "None");
  setText(form, "Other financial debts or obligations", s(a.ifp_debts) || "None");

  setText(form, "Applicant'sSignature", "");
  setText(form, "Date2", "");

  try {
    form.flatten();
  } catch {
    /* ignore */
  }
  return await doc.save();
}

export interface IntakePdfs {
  habeas: Uint8Array;
  ifp: Uint8Array;
}

export async function buildIntakePdfs(answers: A): Promise<IntakePdfs> {
  const [habeas, ifp] = await Promise.all([fillAO242(answers), fillAO240(answers)]);
  return { habeas, ifp };
}
