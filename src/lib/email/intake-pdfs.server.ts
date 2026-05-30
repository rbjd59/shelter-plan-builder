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
const firstText = (a: A, ...keys: string[]) => {
  for (const key of keys) {
    const value = s(a[key]).trim();
    if (value) return value;
  }
  return "";
};

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

  const petitionerName = firstText(a, "full_name", "mail_inmate_name");
  const facilityName = firstText(a, "facility_name", "mail_current_location");
  const facilityAddress = firstText(a, "facility_address", "mail_facility_address");
  const inmateNumber = firstText(a, "booking_number", "mail_inmate_number", "a_number");
  const respondent =
    s(a.warden_name) +
    (a.warden_title ? `, ${s(a.warden_title)}` : "") +
    (facilityName ? `\nWarden, ${facilityName}` : "");

  setText(form, "a  Your full name", petitionerName);
  setText(form, "b  Other names you have used", s(a.other_names_used));
  setText(form, "Petitioner", petitionerName);
  setText(form, "Respondent", respondent || "Warden of the facility of confinement");

  // Question 2: name of institution / address. Intentionally left BLANK —
  // the petitioner fills these in after detention, since the facility is
  // not known until ICE designates one.
  setText(form, "a  Name of institution", "");
  setText(form, "b  Address", "");
  setText(form, "c Your identification number", inmateNumber);

  setCheckOption(form, "personal3", "federal");
  setCheckOption(form, "personal4", "immigration");
  setCheckOption(form, "personal5", "immigration");

  setText(form, "Date you were taken into immigration custody", s(a.date_taken_into_custody));
  setText(form, "Date of the removal or reinstatement order", s(a.detainer_date));

  // Item 11: "Are you challenging a decision in immigration proceedings?"
  // Answer = No. A 28 U.S.C. § 2241 petition challenges the legality of
  // DHS/ICE custody itself, not the underlying removal proceedings.
  // Under the REAL ID Act, 8 U.S.C. § 1252(a)(5), challenges to removal
  // orders go to the Court of Appeals via petition for review; what
  // survives in district court is the detention challenge (Zadvydas,
  // Demore, Jennings).
  setCheckOption(form, "personal11", "No");
  setCheckOption(form, "personal11c", "No");
  setCheckOption(form, "personal11d", "No");
  setCheckOption(form, "personal12", "No");

  // Grounds: split each selected ground into its own Ground (1..4) with the
  // petitioner's narrative facts as supporting facts.
  const allGrounds: string[] = [];
  const gOne = s(a.ground_one);
  if (gOne) {
    // ground_one comes from intake as labels joined by ". " — split back out.
    allGrounds.push(...gOne.split(/(?<=\.)\s+/).map((g) => g.trim()).filter(Boolean));
  }
  const gTwo = s(a.ground_two);
  if (gTwo) allGrounds.push(gTwo);
  if (allGrounds.length === 0) {
    // Safe default so the petition is never filed with empty grounds.
    allGrounds.push(
      "Petitioner's continued immigration detention violates the Due Process Clause of the Fifth Amendment and 8 U.S.C. § 1226 because Petitioner has been held without an individualized bond hearing and without a constitutionally adequate justification for continued confinement.",
      "Petitioner is not subject to mandatory detention, is not a danger to the community, and is not a flight risk; therefore continued detention is not reasonably related to any legitimate immigration purpose under Zadvydas v. Davis, 533 U.S. 678 (2001).",
    );
  }

  const facts = s(a.prior_immigration_proceedings) ||
    "Petitioner is held in immigration custody.";

  const groundFieldMap: Array<{ titleFields: string[]; factFields: string[] }> = [
    {
      titleFields: ["GROUND ONE"],
      factFields: [1, 2, 3, 4, 5].map((i) => `a  Supporting facts Be brief  Do not cite cases or law ${i}`),
    },
    {
      titleFields: ["GROUND TWO 1", "GROUND TWO 2", "GROUND TWO 3", "GROUND TWO 4"],
      factFields: [1, 2, 3, 4, 5].map((i) => `a  Supporting facts Be brief  Do not cite cases or law ${i}_2`),
    },
    {
      titleFields: ["GROUND THREE 1", "GROUND THREE 2", "GROUND THREE 3"],
      factFields: [1, 2, 3, 4, 5].map((i) => `a  Supporting facts Be brief  Do not cite cases or law ${i}_3`),
    },
    {
      titleFields: ["GROUND FOUR 1", "GROUND FOUR 2", "GROUND FOUR 3"],
      factFields: [1, 2, 3, 4, 5].map((i) => `a  Supporting facts Be brief  Do not cite cases or law ${i}_4`),
    },
  ];

  for (let g = 0; g < Math.min(allGrounds.length, 4); g++) {
    const slot = groundFieldMap[g];
    const titleParts = splitLines(allGrounds[g], slot.titleFields.length, 80);
    slot.titleFields.forEach((f, i) => setText(form, f, titleParts[i] || ""));
    const factParts = splitLines(facts, slot.factFields.length);
    slot.factFields.forEach((f, i) => setText(form, f, factParts[i] || ""));
  }

  const relief = s(a.relief_requested) ||
    "Petitioner respectfully requests that this Court: (1) issue a writ of habeas corpus; (2) order Petitioner's immediate release from custody, or in the alternative order an individualized bond hearing before an immigration judge at which the government bears the burden of justifying continued detention; (3) declare Petitioner's continued detention unlawful; and (4) grant any other relief the Court deems just and proper.";
  const rLines = splitLines(relief, 4);
  setText(form, "Request for Relief", rLines[0]);
  for (let i = 0; i < 4; i++) {
    setText(form, `15  State exactly what you want the court to do ${i + 1}`, rLines[i]);
  }

  setText(form, "Petitionersig", "");
  setText(form, "Date", "");

  // District (venue): The Company does NOT select venue on the customer's
  // behalf. The dropdown is intentionally left UNSET so the customer
  // handwrites the correct district after detention. See the federal
  // district court list provided separately for venue instructions.
  // (Historical behavior pre-filled "Florida Southern" — removed per
  // legal guidance.)

  // Remove interactive Print / SaveAs / Reset buttons before flatten so they
  // do not render as red boxes in the final document.
  for (const f of form.getFields()) {
    if (f.constructor.name === "PDFButton") {
      try { form.removeField(f); } catch { /* ignore */ }
    }
  }

  try {
    form.flatten();
  } catch {
    /* leave editable */
  }
  return await doc.save();
}

async function fillAO240(_a: A): Promise<Uint8Array> {
  // Per attorney revised opinion #8: AO 240 must be delivered BLANK.
  // The customer fills it in by hand at the time of filing. We load the
  // official template and return it unchanged — no field pre-fill, no flatten.
  const doc = await PDFDocument.load(b64ToBytes(ao240b64));
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
