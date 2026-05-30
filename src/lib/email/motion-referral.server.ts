// Generates the SDFL "Motion for Referral to Volunteer Attorney Program"
// PDF from scratch using pdf-lib. Source text from SDFL public form
// 14-09-16MotionforReferraltoVolunteerAttorneyProgram.pdf.

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type A = Record<string, unknown>;
const s = (v: unknown) => (v == null ? "" : String(v));
const firstText = (a: A, ...keys: string[]) => {
  for (const k of keys) {
    const v = s(a[k]).trim();
    if (v) return v;
  }
  return "";
};

export async function buildMotionReferralPdf(a: A): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]); // US Letter
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);

  const name = firstText(a, "full_name", "mail_inmate_name");
  const facilityName = firstText(a, "facility_name", "mail_current_location");
  const facilityAddress = firstText(a, "facility_address", "mail_facility_address");
  const inmateNumber = firstText(a, "booking_number", "mail_inmate_number", "a_number");

  const left = 72;
  const right = 540;
  const black = rgb(0, 0, 0);
  let y = 740;

  const draw = (text: string, x: number, yy: number, opts: { font?: typeof font; size?: number } = {}) => {
    page.drawText(text, { x, y: yy, size: opts.size ?? 11, font: opts.font ?? font, color: black });
  };

  const line = (yy: number, x1 = left, x2 = right) => {
    page.drawLine({ start: { x: x1, y: yy }, end: { x: x2, y: yy }, thickness: 0.5, color: black });
  };

  const center = (text: string, yy: number, f = bold, size = 11) => {
    const w = f.widthOfTextAtSize(text, size);
    draw(text, (612 - w) / 2, yy, { font: f, size });
  };

  // Header — venue (district) is intentionally left blank for the
  // customer to handwrite. The Company does NOT select venue on the
  // customer's behalf. See the federal district court list provided
  // separately for venue instructions.
  center("UNITED STATES DISTRICT COURT", y, bold, 12); y -= 16;
  // Blank district line for the customer to write in
  line(y + 3, left + 120, right - 120); y -= 28;

  // Caption block
  draw(name || "", left, y);
  line(y - 3, left, left + 260);
  draw(", Plaintiff,", left + 262, y);
  y -= 22;
  draw("vs.", left + 40, y);
  draw("Case No.", left + 300, y, { font: bold });
  line(y - 3, left + 360, right);
  y -= 22;
  line(y, left, left + 260);
  draw(", Defendant(s)", left + 262, y + 2);
  y -= 36;

  // Title
  center("Motion For Referral To Volunteer Attorney Program", y, bold, 12);
  y -= 28;

  const body =
    `I, ${name}, am a pro se party representing myself in this case, and have ` +
    `requested authorization to proceed in forma pauperis pursuant to 28 U.S.C. § 1915 ` +
    `or am otherwise unable to afford a lawyer.  Therefore, I request that the Court ` +
    `refer my request to the Court's Volunteer Attorney Program.`;
  const body2 =
    `I understand that it will be up to volunteer attorneys, not the Court, to determine ` +
    `whether they wish to represent me.  If a volunteer attorney agrees to take my ` +
    `representation, I will cooperate with that counsel in the preparation and ` +
    `presentation of my case.`;

  const wrap = (text: string, maxWidth: number, size = 11, f = font): string[] => {
    const words = text.split(/\s+/);
    const out: string[] = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? cur + " " + w : w;
      if (f.widthOfTextAtSize(test, size) > maxWidth) {
        if (cur) out.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) out.push(cur);
    return out;
  };

  for (const para of [body, body2]) {
    for (const ln of wrap(para, right - left)) {
      draw(ln, left, y);
      y -= 15;
    }
    y -= 8;
  }

  y -= 20;
  draw("Signature:", left, y);
  line(y - 2, left + 70, left + 320);
  y -= 22;
  draw("Printed name:", left, y);
  draw(name, left + 88, y);
  line(y - 2, left + 80, left + 320);
  y -= 22;
  draw("Address:", left, y);
  const addrLines = [facilityName, inmateNumber ? `#${inmateNumber}` : "", facilityAddress]
    .filter(Boolean)
    .join("\n")
    .split("\n");
  let ay = y;
  for (let i = 0; i < Math.max(2, addrLines.length); i++) {
    draw(addrLines[i] || "", left + 80, ay);
    line(ay - 2, left + 80, left + 320);
    ay -= 18;
  }
  y = ay - 6;

  // Certificate of Service
  y -= 6;
  center("Certificate of Service", y, bold, 11);
  y -= 20;
  const cosBody =
    `I hereby certify that a true and correct copy of the foregoing was served by ` +
    `[hand delivery / U.S. Mail / other] on [date] on all counsel or parties of record ` +
    `on the Service List below.`;
  for (const ln of wrap(cosBody, right - left)) {
    draw(ln, left, y);
    y -= 15;
  }
  y -= 12;
  draw("Signature:", left, y);
  line(y - 2, left + 70, left + 320);
  y -= 22;
  draw("Printed name:", left, y);
  draw(name, left + 88, y);
  line(y - 2, left + 80, left + 320);
  y -= 28;

  center("SERVICE LIST", y, bold, 11);
  y -= 18;
  const svc = [
    "Attorney or Party Name: ____________________________________",
    "Attorney or Party E-mail Address: ___________________________",
    "Firm Name: _________________________________________________",
    "Street Address, City, State, Zip: ___________________________",
    "Telephone: (___) ___-______   Facsimile: (___) ___-______",
    "Attorneys for Plaintiff / Defendant",
  ];
  for (const ln of svc) {
    draw(ln, left, y);
    y -= 16;
  }

  return await doc.save();
}
