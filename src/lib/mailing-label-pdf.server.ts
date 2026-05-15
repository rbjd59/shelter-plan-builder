// Server-only: generate a USPS-style mailing label PDF (4x6) for the
// detained-person packet. Pure pdf-lib — Worker safe.

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface MailingLabelInput {
  // TO (detainee)
  inmateName: string;
  aNumber?: string | null;
  facilityName?: string | null;
  facilityAddress?: string | null; // multi-line
  // FROM (office)
  fromName?: string;
  fromAddress?: string;
  // Header
  caseId: string;
}

const PT = (n: number) => n;
const W = 4 * 72; // 4 inch
const H = 6 * 72; // 6 inch

export async function buildMailingLabelPdf(input: MailingLabelInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Mailing Label — ${input.inmateName}`);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([W, H]);

  let y = H - PT(28);
  // Header bar
  page.drawRectangle({ x: 0, y: H - PT(38), width: W, height: PT(38), color: rgb(0, 0, 0) });
  page.drawText("USPS — FIRST CLASS MAIL", {
    x: PT(14), y: H - PT(24), size: 11, font: bold, color: rgb(1, 1, 1),
  });
  y -= PT(28);

  // FROM block
  y -= PT(8);
  page.drawText("FROM:", { x: PT(14), y, size: 8, font: bold, color: rgb(0.3, 0.3, 0.3) });
  y -= PT(12);
  for (const line of (input.fromName || "DetencionDefensa.com").split("\n")) {
    page.drawText(line, { x: PT(14), y, size: 9, font });
    y -= PT(11);
  }
  for (const line of (input.fromAddress || "PO Box on file").split("\n")) {
    page.drawText(line, { x: PT(14), y, size: 9, font });
    y -= PT(11);
  }

  // Big TO block (centered, prominent)
  y -= PT(18);
  page.drawLine({
    start: { x: PT(14), y }, end: { x: W - PT(14), y },
    thickness: 1, color: rgb(0, 0, 0),
  });
  y -= PT(22);
  page.drawText("TO:", { x: PT(14), y, size: 10, font: bold, color: rgb(0.2, 0.2, 0.2) });
  y -= PT(20);

  // Inmate name (bold, large)
  page.drawText(input.inmateName, { x: PT(14), y, size: 16, font: bold });
  y -= PT(20);

  if (input.aNumber) {
    page.drawText(`A# ${input.aNumber}`, { x: PT(14), y, size: 12, font: bold });
    y -= PT(18);
  }

  if (input.facilityName) {
    page.drawText(input.facilityName, { x: PT(14), y, size: 12, font: bold });
    y -= PT(16);
  }

  if (input.facilityAddress) {
    for (const line of input.facilityAddress.split("\n")) {
      page.drawText(line, { x: PT(14), y, size: 11, font });
      y -= PT(14);
    }
  }

  // Footer: case id (small, bottom)
  page.drawText(`Case: ${input.caseId.slice(0, 18)}`, {
    x: PT(14), y: PT(18), size: 7, font, color: rgb(0.4, 0.4, 0.4),
  });
  page.drawText(new Date().toLocaleDateString(), {
    x: W - PT(80), y: PT(18), size: 7, font, color: rgb(0.4, 0.4, 0.4),
  });

  return await doc.save();
}
