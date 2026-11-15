import { PDFDocument, StandardFonts, type PDFPage } from "pdf-lib";
import vehicleB64 from "@/assets/forms/FL-HSMV-82053-power-of-attorney.pdf.b64";
import custodyB64 from "@/assets/forms/FL-12.970c-consent-temporary-custody.pdf.b64";
import { PREPAREDNESS_COPY } from "./preparedness-content";
import { familyPacketPlan, type FamilyPacketAnswers } from "./family-packet";

function bytes(b64: string) { return Uint8Array.from(atob(b64), c => c.charCodeAt(0)); }
export async function buildFamilyPacket(a: FamilyPacketAnswers, lang: "en" | "es" | "ht") {
  const plan = familyPacketPlan(a);
  const t = PREPAREDNESS_COPY[lang];
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const name = String(a.full_name || "____________________");
  const caregiver = String(a.prep_caregiver || "____________________");
  const children = String(a.prep_child_names || "____________________");
  const clean = (v: string) => [...v].map(c => { try { font.encodeText(c); return c; } catch { return "?"; } }).join("");
  let page: PDFPage; let y = 0;
  const next = () => { page = doc.addPage([612, 792]); y = 745; };
  const write = (text: string, size = 11) => {
    const words = clean(text).split(/\s+/); let line = "";
    const draw = () => { if (y < 60) next(); page.drawText(line, { x: 42, y, font, size }); y -= size + 6; };
    for (const word of words) {
      // Split a single long identifier as well as normal prose.
      const parts = word.match(/.{1,55}/g) ?? [word];
      for (const part of parts) { if (font.widthOfTextAtSize(`${line} ${part}`, size) > 528 && line) { draw(); line = ""; } line = line ? `${line} ${part}` : part; }
    }
    if (line) draw(); y -= 8;
  };
  next(); write(t.packetHeading, 17); write(name); write(t.packetNote); write(t.habeas);
  write(t.identityHeading, 15); for (const paragraph of [t.federal, t.witnesses, t.passport]) write(paragraph);
  write(t.commercial);
  next(); write(lang === "es" ? "Plan de emergencia" : lang === "ht" ? "Plan ijans" : "Emergency plan", 17);
  write(`${name} | ${String(a.client_mobile || "____________________")}`);
  for (const key of ["emergency_contact_name", "emergency_contact_phone", "emergency_contact_email", "emergency_contact_2_name", "emergency_contact_2_phone"]) write(`${key}: ${String(a[key] || "____________________")}`);
  if (plan.children) {
    next(); write(lang === "es" ? "BORRADOR — Autorización limitada de cuidado infantil" : lang === "ht" ? "BOUYON — Otorizasyon limite swen timoun" : "DRAFT — Limited Child Care Power of Attorney", 16);
    write(lang === "es" ? `Yo, ${name}, designo a ${caregiver} para el cuidado diario de ${children}, sujeto a revisión legal y requisitos aplicables. No concede tutela, custodia judicial ni poderes médicos irrestrictos.` : lang === "ht" ? `Mwen, ${name}, chwazi ${caregiver} pou swen chak jou pou ${children}, anba revizyon legal ak kondisyon ki aplikab. Sa pa bay tit gadyen, gad tribinal ni pouvwa medikal san limit.` : `I, ${name}, designate ${caregiver} for day-to-day care of ${children}, subject to legal review and applicable execution requirements. This does not grant guardianship, a court custody order or unrestricted medical powers.`);
    write(`${t.careRelation}: ${String(a.prep_care_relation || "____________________")}`); write(`${t.kidsDob}: ${String(a.prep_child_dobs || "____________________")}`);
    write("Scope / duration: ____________________"); write("Parent signature: ____________________  Date: __________"); write("Witness 1: ____________________  Witness 2: ____________________"); write("Notary acknowledgment: complete with a qualified notary after legal review.");
    const custody = await PDFDocument.load(bytes(custodyB64)); const form = custody.getForm();
    for (const [field, value] of [["I full legal name", name], ["names", children], ["Children", children], ["voluntarily consent to the Petition filed by Petitioners full legal name", caregiver], ["Printed Name", name], ["Address", String(a.prep_address || "")]] as const) { const f = form.getTextField(field); f.setText(clean(value)); f.setFontSize(0); }
    form.updateFieldAppearances(await custody.embedFont(StandardFonts.Helvetica)); form.flatten();
    const pages = await doc.copyPages(custody, custody.getPageIndices()); pages.forEach(p => doc.addPage(p));
    next(); write(lang === "es" ? "BORRADOR — Permiso de viaje internacional" : lang === "ht" ? "BOUYON — Pèmisyon vwayaj entènasyonal" : "DRAFT — International Travel Permission", 16);
    write(`${t.kids}: ${children}`); write(`${t.kidsDob}: ${String(a.prep_child_dobs || "____________________")}`); write(`${t.care}: ${caregiver}`); write(`${t.destination}: ${String(a.prep_destination || "____________________")}`); write(`${t.travelDates}: ${String(a.prep_travel_dates || "____________________")}`); write(`${t.otherParent}: ${String(a.prep_other_parent || "____________________")}`);
    write(t.packetNote); write("Parent 1 signature: ____________________ Date: __________"); write("Parent 2 signature: ____________________ Date: __________"); write("Notary / required consular formalities: ____________________");
  }
  if (plan.vehicle) {
    const vehicle = await PDFDocument.load(bytes(vehicleB64)); const form = vehicle.getForm();
    const fields: Record<string, string> = { "Full Legibly Printed Name is required": caregiver, "Legibly Printed Name of Owner Grantor": name, "Owners Address": String(a.prep_address || ""), City: String(a.prep_city || ""), State: String(a.prep_state || ""), "Zip Code": String(a.prep_zip || ""), YearRow1: String(a.prep_vehicle_year || ""), MakeManufacturerRow1: String(a.prep_vehicle_make || ""), "Body TypeRow1": String(a.prep_vehicle_body || ""), "Title NumberRow1": String(a.prep_vehicle_title || ""), "Vehicle Identification Number VIN Hull Identification Number HINRow1": String(a.prep_vehicle_vin || ""), "Driver License Identification Card or FEID Number of Owner": String(a.prep_owner_id || ""), "Date of Birth of Owner if applicable": String(a.dob || "") };
    for (const [field, value] of Object.entries(fields)) { const f = form.getTextField(field); f.setText(clean(value)); f.setFontSize(0); }
    form.getCheckBox("Motor Vehicle").check(); form.updateFieldAppearances(await vehicle.embedFont(StandardFonts.Helvetica)); form.flatten();
    const pages = await doc.copyPages(vehicle, vehicle.getPageIndices()); pages.forEach(p => doc.addPage(p));
  }
  if (String(a.prep_declaration || "").trim()) {
    next(); write("28 U.S.C. § 1746 — UNSWORN DECLARATION", 16); write(`${name}`); write(String(a.prep_declaration));
    write(a.prep_abroad === "yes" ? "I declare (or certify, verify, or state) under penalty of perjury under the laws of the United States of America that the foregoing is true and correct. Executed on (date)." : "I declare (or certify, verify, or state) under penalty of perjury that the foregoing is true and correct. Executed on (date).");
    write("Signature: ____________________ Date: __________"); write(t.federal);
  }
  doc.setTitle(`${name} — Family Preparedness Package`);
  return { bytes: await doc.save(), documents: plan.documents };
}