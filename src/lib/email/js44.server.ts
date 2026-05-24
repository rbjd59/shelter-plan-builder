// Fills the JS-44 Civil Cover Sheet AcroForm with the pro se petitioner's
// information. The template was uploaded by the user and lives at
// src/assets/forms/JS44.pdf. We read it from the filesystem-free environment
// via a base64 module written alongside it.

import { PDFDocument, PDFName, type PDFForm } from "pdf-lib";
import js44b64 from "@/assets/forms/JS44.pdf.b64";

type A = Record<string, unknown>;
const s = (v: unknown) => (v == null ? "" : String(v));
const firstText = (a: A, ...keys: string[]) => {
  for (const k of keys) {
    const v = s(a[k]).trim();
    if (v) return v;
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

function setText(form: PDFForm, name: string, value: string) {
  try { form.getTextField(name).setText(value || ""); } catch { /* missing */ }
}
function check(form: PDFForm, name: string) {
  try {
    const cb = form.getCheckBox(name);
    cb.check();
  } catch {
    // Some checkboxes use radio-style widgets; try AS=Yes directly.
    try {
      const cb = form.getCheckBox(name);
      const w = cb.acroField.getWidgets()[0] as unknown as { dict: { set: (k: PDFName, v: PDFName) => void } };
      w.dict.set(PDFName.of("AS"), PDFName.of("Yes"));
    } catch { /* ignore */ }
  }
}

function detectCountyCheckbox(address: string): string | null {
  const a = address.toLowerCase();
  if (/\bmiami|dade\b/.test(a)) return "MIAMIDADE";
  if (/\bbroward|fort lauderdale|hollywood\b/.test(a)) return "BROWARD";
  if (/\bpalm beach\b/.test(a)) return "PALM BEACH";
  if (/\bmonroe|key west\b/.test(a)) return "MONROE";
  if (/\bmartin\b/.test(a)) return "MARTIN";
  if (/\bst\.?\s*lucie\b/.test(a)) return "ST LUCIE";
  if (/\bindian river\b/.test(a)) return "INDIAN RIVER";
  if (/\bokeechobee\b/.test(a)) return "OKEECHOBEE";
  if (/\bhighlands\b/.test(a)) return "HIGHLANDS";
  return null;
}

export async function buildJs44Pdf(a: A): Promise<Uint8Array> {
  const doc = await PDFDocument.load(b64ToBytes(js44b64));
  const form = doc.getForm();

  const petitioner = firstText(a, "full_name", "mail_inmate_name");
  const facility = firstText(a, "facility_name", "mail_current_location");
  const wardenName = firstText(a, "warden_name");
  const facilityAddr = firstText(a, "facility_address", "mail_facility_address");
  const defendant = wardenName
    ? `${wardenName}${facility ? `, Warden, ${facility}` : ""}`
    : facility
    ? `Warden, ${facility}`
    : "Warden of the Facility of Confinement";

  setText(form, "Plaintiffs", petitioner);
  setText(form, "Defendants", defendant);
  setText(form, "Attorneys", "PRO SE");
  setText(form, "Firm Name", "PRO SE");

  // Habeas / immigration detention nature-of-suit boxes.
  check(form, "463 Alien Detainee");
  check(form, "540 Mandamus  Other");

  // Origin = 1 Original Proceeding.
  check(form, "V ORIGIN");

  setText(
    form,
    "Cause of Action",
    "28 U.S.C. § 2241 — Petition for Writ of Habeas Corpus challenging immigration detention.",
  );

  // County checkbox based on facility address.
  const county = detectCountyCheckbox(facilityAddr);
  if (county) check(form, county);

  // Strip the interactive Save/Print/Reset buttons so they don't render as
  // red boxes after flatten.
  for (const f of form.getFields()) {
    if (f.constructor.name === "PDFButton") {
      try { form.removeField(f); } catch { /* ignore */ }
    }
  }

  try { form.flatten(); } catch { /* ignore */ }
  return await doc.save();
}
