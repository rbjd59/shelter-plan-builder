// Memorandum of Law in Support of Petition for Writ of Habeas Corpus
// (28 U.S.C. § 2241). Built from scratch with pdf-lib so the attorney
// can drop intake answers in and get a courtroom-ready draft.
//
// Where intake data is missing, the PDF prints a bracketed placeholder
// like [FACT: date of arrest] so the reviewer immediately sees what
// still needs to be filled in. No silent blanks.

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

type A = Record<string, unknown>;
const s = (v: unknown) => (v == null ? "" : String(v).trim());
const firstText = (a: A, ...keys: string[]) => {
  for (const k of keys) {
    const v = s(a[k]);
    if (v) return v;
  }
  return "";
};
const need = (val: string, hint: string) => (val ? val : `[FACT: ${hint}]`);

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 72;
const LINE_H = 14;
const BODY_SIZE = 11;
const HEADING_SIZE = 12;

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const out: string[] = [];
  for (const para of text.split(/\n/)) {
    if (!para.trim()) { out.push(""); continue; }
    const words = para.split(/\s+/);
    let cur = "";
    for (const w of words) {
      const trial = cur ? `${cur} ${w}` : w;
      if (font.widthOfTextAtSize(trial, size) > maxWidth) {
        if (cur) out.push(cur);
        cur = w;
      } else {
        cur = trial;
      }
    }
    if (cur) out.push(cur);
  }
  return out;
}

class Writer {
  doc: PDFDocument;
  font: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  page!: PDFPage;
  y = 0;

  constructor(doc: PDFDocument, font: PDFFont, bold: PDFFont, italic: PDFFont) {
    this.doc = doc; this.font = font; this.bold = bold; this.italic = italic;
    this.newPage();
  }
  newPage() {
    this.page = this.doc.addPage([PAGE_W, PAGE_H]);
    this.y = PAGE_H - MARGIN;
  }
  ensure(n: number) {
    if (this.y - n < MARGIN) this.newPage();
  }
  blank(n = LINE_H) { this.y -= n; }
  drawLine(text: string, font: PDFFont, size: number, x = MARGIN) {
    this.ensure(LINE_H);
    this.page.drawText(text, { x, y: this.y, font, size, color: rgb(0, 0, 0) });
    this.y -= LINE_H;
  }
  paragraph(text: string, opts: { indent?: boolean; bold?: boolean; size?: number } = {}) {
    const size = opts.size ?? BODY_SIZE;
    const f = opts.bold ? this.bold : this.font;
    const indent = opts.indent ? 24 : 0;
    const maxW = PAGE_W - MARGIN * 2 - indent;
    const lines = wrap(text, f, size, maxW);
    for (let i = 0; i < lines.length; i++) {
      this.ensure(LINE_H);
      const x = MARGIN + (i === 0 ? indent : 0);
      this.page.drawText(lines[i], { x, y: this.y, font: f, size, color: rgb(0, 0, 0) });
      this.y -= LINE_H;
    }
    this.blank(4);
  }
  heading(text: string) {
    this.ensure(LINE_H * 2);
    this.blank(6);
    this.paragraph(text, { bold: true, size: HEADING_SIZE });
  }
  center(text: string, font: PDFFont, size: number) {
    this.ensure(LINE_H);
    const w = font.widthOfTextAtSize(text, size);
    this.page.drawText(text, { x: (PAGE_W - w) / 2, y: this.y, font, size, color: rgb(0, 0, 0) });
    this.y -= LINE_H;
  }
}

export interface MemoNarrativeOverride {
  statement_of_facts?: string;
  community_ties_argument?: string;
  dangerousness_rebuttal?: string;
  aiModel?: string;
}

export async function buildMemorandumOfLawPdf(
  a: A,
  narrative?: MemoNarrativeOverride,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const italic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const w = new Writer(doc, font, bold, italic);


  // -------- Pull values --------
  const petitioner = need(firstText(a, "full_name", "mail_inmate_name"), "petitioner full name");
  const aNumber = need(firstText(a, "a_number", "mail_inmate_number", "booking_number"), "A-number");
  const facility = need(firstText(a, "facility_name", "mail_current_location"), "detention facility name");
  const facilityAddress = firstText(a, "facility_address", "mail_facility_address");
  const warden = need(s(a.warden_name) || "Warden", "warden name");
  const countryOfOrigin = need(firstText(a, "country_of_origin", "country_of_citizenship"), "country of origin");
  const dateCustody = need(s(a.date_taken_into_custody), "date taken into ICE custody");
  const district = need(firstText(a, "filing_district", "federal_district"), "federal judicial district");

  const familyTies = firstText(a, "community_ties", "family_in_us", "us_relatives");
  const employer = firstText(a, "employer", "employment", "work_history");
  const yearsInUs = firstText(a, "years_in_us", "time_in_us");
  const priorCriminal = s(a.criminal_history) || s(a.prior_convictions);
  const noCriminal =
    !priorCriminal || /none|n\/a|no convictions?/i.test(priorCriminal);

  // -------- Caption --------
  w.center("UNITED STATES DISTRICT COURT", w.bold, 12);
  w.center(`FOR THE ${district.toUpperCase()}`, w.bold, 12);
  w.blank(8);

  // Caption box: Petitioner v. Respondent | Case No.
  const captionTop = w.y;
  w.page.drawText(petitioner.toUpperCase() + ",", { x: MARGIN, y: captionTop, font: w.bold, size: 11 });
  w.page.drawText("Petitioner,", { x: MARGIN + 18, y: captionTop - LINE_H, font: w.font, size: 11 });
  w.page.drawText("v.", { x: MARGIN + 18, y: captionTop - LINE_H * 3, font: w.font, size: 11 });
  w.page.drawText(`${warden.toUpperCase()}, in his/her official`, { x: MARGIN, y: captionTop - LINE_H * 5, font: w.bold, size: 11 });
  w.page.drawText(`capacity as Warden of ${facility};`, { x: MARGIN, y: captionTop - LINE_H * 6, font: w.font, size: 11 });
  w.page.drawText("et al.,", { x: MARGIN, y: captionTop - LINE_H * 7, font: w.font, size: 11 });
  w.page.drawText("Respondents.", { x: MARGIN + 18, y: captionTop - LINE_H * 8, font: w.font, size: 11 });

  // Right side of caption — case no. line
  const captionRightX = 360;
  w.page.drawText("Case No.: ____________________", { x: captionRightX, y: captionTop, font: w.font, size: 11 });
  w.page.drawText("PETITION UNDER 28 U.S.C. § 2241", { x: captionRightX, y: captionTop - LINE_H * 2, font: w.bold, size: 11 });

  // Caption divider
  w.page.drawLine({
    start: { x: MARGIN, y: captionTop - LINE_H * 9 - 4 },
    end: { x: PAGE_W - MARGIN, y: captionTop - LINE_H * 9 - 4 },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  w.y = captionTop - LINE_H * 10 - 8;

  // Title
  w.center("MEMORANDUM OF LAW IN SUPPORT OF", w.bold, 12);
  w.center("PETITION FOR WRIT OF HABEAS CORPUS", w.bold, 12);
  w.blank(8);

  // -------- I. Introduction --------
  w.heading("I.  INTRODUCTION");
  w.paragraph(
    `Petitioner ${petitioner} (A# ${aNumber}), a native and citizen of ${countryOfOrigin}, ` +
    `has been held in the civil immigration custody of U.S. Immigration and Customs ` +
    `Enforcement (ICE) at ${facility} since on or about ${dateCustody}. Petitioner ` +
    `seeks a writ of habeas corpus pursuant to 28 U.S.C. § 2241 because his/her continued ` +
    `detention—without an individualized bond hearing at which the Government bears the ` +
    `burden of justification—violates the Due Process Clause of the Fifth Amendment, the ` +
    `governing immigration statutes, and binding Supreme Court precedent including ` +
    `Zadvydas v. Davis, 533 U.S. 678 (2001), and Demore v. Kim, 538 U.S. 510 (2003).`,
    { indent: true },
  );

  // -------- II. Jurisdiction & Venue --------
  w.heading("II.  JURISDICTION AND VENUE");
  w.paragraph(
    "This Court has subject-matter jurisdiction under 28 U.S.C. § 2241, Article I, Section 9, " +
    "Clause 2 of the United States Constitution (the Suspension Clause), and 28 U.S.C. § 1331. " +
    "The REAL ID Act, 8 U.S.C. § 1252(a)(5), strips district courts of jurisdiction to review " +
    "final orders of removal, but it does NOT strip jurisdiction over challenges to the " +
    "lawfulness of ICE detention itself. See Hernandez v. Gonzales, 424 F.3d 42 (1st Cir. 2005).",
    { indent: true },
  );
  w.paragraph(
    `Venue is proper in this District because Petitioner is confined within its territorial ` +
    `boundaries at ${facility}${facilityAddress ? `, ${facilityAddress}` : ""}, and the immediate ` +
    `custodian — the Warden — is located here. See Rumsfeld v. Padilla, 542 U.S. 426 (2004).`,
    { indent: true },
  );

  // -------- III. Statement of Facts --------
  w.heading("III.  STATEMENT OF FACTS");
  if (narrative?.statement_of_facts && narrative.statement_of_facts.trim()) {
    // AI-drafted paragraphs (attorney will review and correct).
    for (const para of narrative.statement_of_facts.split(/\n\s*\n/)) {
      const trimmed = para.trim();
      if (trimmed) w.paragraph(trimmed, { indent: true });
    }
    w.paragraph(
      `[Draft generated by AI (${narrative.aiModel ?? "assist"}) from client intake — attorney to verify every fact before filing.]`,
      { size: 9 },
    );
  } else {
    w.paragraph(
      `1.  Petitioner is a native and citizen of ${countryOfOrigin}.`,
    );
    w.paragraph(
      `2.  On or about ${dateCustody}, Petitioner was taken into ICE civil immigration custody and ` +
      `transferred to ${facility}.`,
    );
    w.paragraph(`3.  Petitioner remains detained at ${facility} as of the date of this filing.`);
    if (yearsInUs) {
      w.paragraph(`4.  Petitioner has resided in the United States for approximately ${yearsInUs}.`);
    } else {
      w.paragraph(`4.  Petitioner has resided in the United States for ${need("", "years in the United States")}.`);
    }
    w.paragraph(`5.  Community ties: ${familyTies ? familyTies : need("", "family / community ties in the U.S.")}.`);
    w.paragraph(`6.  Employment: ${employer ? employer : need("", "employment / sponsor")}.`);
    w.paragraph(
      `7.  Criminal history: ${noCriminal ? "Petitioner has no qualifying convictions that would render detention mandatory under 8 U.S.C. § 1226(c)." : priorCriminal}.`,
    );
  }


  // -------- IV. Procedural Posture --------
  w.heading("IV.  PROCEDURAL POSTURE");
  w.paragraph(
    `Petitioner is detained pursuant to 8 U.S.C. § 1226(a) pending the outcome of removal ` +
    `proceedings. To date, Petitioner has not received an individualized bond hearing at which ` +
    `the Government has been required to demonstrate, by clear and convincing evidence, that ` +
    `continued detention is justified by flight risk or danger to the community. ` +
    `${s(a.prior_immigration_proceedings) ? "Additional procedural history: " + s(a.prior_immigration_proceedings) : ""}`,
    { indent: true },
  );

  // -------- V. Argument --------
  w.heading("V.  ARGUMENT");

  w.paragraph("A.  Petitioner Is Entitled to an Individualized Bond Hearing Under 8 U.S.C. § 1226(a).", { bold: true });
  w.paragraph(
    "Section 1226(a) authorizes — but does not require — the detention of noncitizens during the " +
    "pendency of removal proceedings. The Attorney General \"may\" detain or release on bond. " +
    "Where, as here, mandatory detention under § 1226(c) does not apply, the Government must " +
    "afford the noncitizen an individualized custody determination. Continued detention without " +
    "such a hearing — particularly when prolonged — raises serious constitutional concerns under " +
    "the Due Process Clause. See Zadvydas, 533 U.S. at 690; Demore, 538 U.S. at 532 (Kennedy, J., " +
    "concurring) (recognizing that prolonged detention triggers due process scrutiny).",
    { indent: true },
  );

  w.paragraph("B.  Petitioner Is Not a Flight Risk.", { bold: true });
  w.paragraph(
    `Petitioner has substantial community ties to the United States: ${familyTies || need("", "list of U.S. family / sponsor / address")}. ` +
    `These ties — combined with Petitioner's stable address, ongoing relationship with counsel, ` +
    `and willingness to appear at all future hearings — establish that release on reasonable ` +
    `conditions of supervision is sufficient to ensure appearance. See, e.g., Diop v. ICE/Homeland ` +
    `Security, 656 F.3d 221 (3d Cir. 2011).`,
    { indent: true },
  );

  w.paragraph("C.  Petitioner Is Not a Danger to the Community.", { bold: true });
  w.paragraph(
    noCriminal
      ? "Petitioner has no qualifying convictions and no record of violence or threatening conduct. " +
        "The Government cannot meet its burden of showing dangerousness by clear and convincing " +
        "evidence on this record."
      : `Petitioner's criminal history is limited to: ${priorCriminal}. None of the foregoing ` +
        `constitutes an aggravated felony or crime of violence sufficient to support a finding of ` +
        `dangerousness by clear and convincing evidence.`,
    { indent: true },
  );

  // -------- VI. Prayer for Relief --------
  w.heading("VI.  PRAYER FOR RELIEF");
  w.paragraph("WHEREFORE, Petitioner respectfully requests that this Court:", { indent: true });
  w.paragraph("1.  Issue a writ of habeas corpus directing Respondents to bring Petitioner before this Court;");
  w.paragraph("2.  Order Petitioner's immediate release from custody, or in the alternative, order an individualized bond hearing before an Immigration Judge at which the Government bears the burden of justifying continued detention by clear and convincing evidence;");
  w.paragraph("3.  Declare that Petitioner's continued detention without such a hearing violates the Due Process Clause of the Fifth Amendment and 8 U.S.C. § 1226(a); and");
  w.paragraph("4.  Grant such other and further relief as this Court deems just and proper.");

  // -------- Signature block --------
  w.blank(20);
  w.paragraph("Respectfully submitted,");
  w.blank(28);
  w.paragraph("_________________________________");
  w.paragraph("Rosario Sorrentino, Esq.");
  w.paragraph("Counsel for Petitioner");
  w.paragraph("DetencionDefensa.com, Inc.");
  w.paragraph(`Dated: ${need("", "date")}`);

  return await doc.save();
}
