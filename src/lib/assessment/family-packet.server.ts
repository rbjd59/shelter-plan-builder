import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { generateBlankForms } from "@/lib/blank-forms-pdf";
import type { Answers } from "./questions";

const value = (v: string | string[] | undefined) => Array.isArray(v) ? v.join(", ") : v || "Not given";

export async function buildAssessmentFamilyPacket(answers: Answers, fullName: string): Promise<Uint8Array> {
  const output = await PDFDocument.create();
  output.setTitle(`Family forms draft — ${fullName || "client"}`);
  output.setProducer("DetencionDefensa.com — attorney review required");
  const font = await output.embedFont(StandardFonts.Helvetica);
  const bold = await output.embedFont(StandardFonts.HelveticaBold);
  let page = output.addPage([612, 792]);
  let y = 740;

  const line = (text: string, size = 11, isBold = false) => {
    const selected = isBold ? bold : font;
    const words = text.split(/\s+/);
    let current = "";
    const lines: string[] = [];
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (selected.widthOfTextAtSize(next, size) > 504 && current) {
        lines.push(current);
        current = word;
      } else current = next;
    }
    if (current) lines.push(current);
    for (const item of lines) {
      if (y < 60) { page = output.addPage([612, 792]); y = 740; }
      page.drawText(item, { x: 54, y, size, font: selected, color: rgb(0.12, 0.16, 0.22) });
      y -= size + 6;
    }
  };

  line("FAMILY FORMS PACKET — DRAFT", 18, true);
  y -= 8;
  line("DRAFT — ATTORNEY REVIEW REQUIRED BEFORE SIGNING OR USE", 11, true);
  y -= 10;
  line("Prepared from the client's questionnaire answers. The attached forms are not final legal documents. The attorney must check the names, choices, state rules, witnesses and notary steps before the client signs.", 11);
  y -= 12;
  line(`Client: ${fullName || value(answers.name)}`, 12, true);
  line(`Phone: ${value(answers.phone)}`);
  line(`Email: ${value(answers.email)}`);
  line(`Husband or wife: ${value(answers.spouseName)}`);
  line(`Children under 18: ${value(answers.childrenNames)}`);
  line(`ID shown: ${value(answers.id)}`);
  line(`Forms requested: ${value(answers.formsNeeded)}`);
  line(`Emergency contacts: ${value(answers.contacts)}`);
  y -= 10;
  line("NEXT STEPS AFTER ATTORNEY REVIEW", 12, true);
  line("1. The firm emails the reviewed forms to the client.");
  line("2. The client downloads and prints them. Do not sign before the notary asks.");
  line("3. Sign in front of a notary and any required witnesses.");
  line("4. Keep the signed originals in a safe place. Tell the trusted emergency contact where they are.");
  line("5. If the client is detained, the trusted person can use the signed forms as directed.");

  const blanks = await generateBlankForms("en");
  for (const form of blanks) {
    const source = await PDFDocument.load(form.bytes);
    const pages = await output.copyPages(source, source.getPageIndices());
    for (const copied of pages) output.addPage(copied);
  }
  return output.save();
}
