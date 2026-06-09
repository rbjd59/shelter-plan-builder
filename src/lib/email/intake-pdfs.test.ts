// Regression test: AO 242 + AO 240 generate cleanly when attorney-only
// intake fields are blank, and the "Pending facility lookup" notice
// (which lives only in the HTML notification email) never leaks into
// the PDF body.

import { describe, it, expect } from "vitest";
import zlib from "node:zlib";
import { buildIntakePdfs } from "./intake-pdfs.server";

// Phrases that must NEVER appear inside the official court PDFs.
// They belong to the HTML notification email only.
const FORBIDDEN_PHRASES = [
  "Pending facility lookup",
  "DetencionDefensa.com will locate",
  "attorney's office before the printed",
  "forward those details to the",
];

/**
 * Extract every byte of human-readable text from a PDF, including text
 * inside FlateDecode-compressed streams. We do not need a perfect text
 * extractor — we only need to prove a specific phrase is absent.
 */
function extractAllText(pdf: Uint8Array): string {
  const buf = Buffer.from(pdf);
  let acc = buf.toString("latin1"); // capture uncompressed text + dictionary keys

  // Walk every "stream ... endstream" block and try to inflate it.
  const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let m: RegExpExecArray | null;
  while ((m = streamRe.exec(acc)) !== null) {
    const raw = Buffer.from(m[1], "latin1");
    for (const inflater of [zlib.inflateSync, zlib.inflateRawSync]) {
      try {
        const out = inflater(raw);
        acc += "\n" + out.toString("latin1");
        break;
      } catch {
        /* not flate-encoded or wrong wrapper; try next */
      }
    }
  }
  return acc;
}

const BLANK_ATTORNEY_FIELDS = {
  // user-fillable
  full_name: "Jane Q. Petitioner",
  other_names_used: "Juana P.",
  a_number: "A123-456-789",
  dob: "1985-04-12",
  country_of_citizenship: "Haiti",
  mail_inmate_name: "Jane Q. Petitioner",
  prior_immigration_proceedings:
    "Petitioner entered the US in 2010 and has a pending asylum claim.",
  contact_name: "Marie Family",
  contact_email: "fam@example.com",
  // attorney-only / disabled — all blank
  court_district: "",
  facility_name: "",
  facility_address: "",
  booking_number: "",
  date_taken_into_custody: "",
  warden_name: "",
  warden_title: "",
  mail_current_location: "",
  mail_inmate_number: "",
  mail_facility_address: "",
};

describe("intake PDFs — attorney-only fields blank", () => {
  it("AO 242 generates and contains no email-notice leakage", async () => {
    const { habeas } = await buildIntakePdfs(BLANK_ATTORNEY_FIELDS);
    expect(habeas.byteLength).toBeGreaterThan(50_000);

    const text = extractAllText(habeas);

    // Petitioner data made it in
    expect(text).toContain("Jane Q. Petitioner");
    expect(text).toContain("A123-456-789");

    // Respondent falls back cleanly when warden fields are blank
    expect(text).toContain("Warden of the facility of confinement");
    expect(text).not.toMatch(/Warden,\s*\n/); // no dangling "Warden, <blank>"

    for (const phrase of FORBIDDEN_PHRASES) {
      expect(text).not.toContain(phrase);
    }
  });

  it("AO 240 generates blank and contains no email-notice leakage", async () => {
    const { ifp } = await buildIntakePdfs(BLANK_ATTORNEY_FIELDS);
    expect(ifp.byteLength).toBeGreaterThan(50_000);

    const text = extractAllText(ifp);
    for (const phrase of FORBIDDEN_PHRASES) {
      expect(text).not.toContain(phrase);
    }

    // AO 240 must remain blank per attorney guidance — no petitioner data
    // pre-filled into the official template.
    expect(text).not.toContain("Jane Q. Petitioner");
    expect(text).not.toContain("A123-456-789");
  });
});
