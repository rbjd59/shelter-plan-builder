// Regression test: AO 242 + AO 240 generate cleanly when attorney-only
// intake fields are blank, and the "Pending facility lookup" notice
// (which lives only in the HTML notification email) never leaks into
// the PDF body.
//
// On failure, generated PDFs and the matching HTML email fixture are
// written to test-artifacts/intake-pdfs/ so CI can upload them for
// inspection (see .github/workflows/test.yml).

import { describe, it, expect } from "vitest";
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { buildIntakePdfs } from "./intake-pdfs.server";

// Phrases that must NEVER appear inside the official court PDFs.
// They belong to the HTML notification email only.
const FORBIDDEN_PHRASES = [
  "Pending facility lookup",
  "DetencionDefensa.com will locate",
  "attorney's office before the printed",
  "forward those details to the",
];

const ARTIFACT_DIR = path.resolve(
  process.cwd(),
  "test-artifacts/intake-pdfs",
);

function dumpArtifacts(name: string, files: Record<string, Uint8Array | string>) {
  try {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
    for (const [fname, data] of Object.entries(files)) {
      fs.writeFileSync(
        path.join(ARTIFACT_DIR, `${name}__${fname}`),
        typeof data === "string" ? data : Buffer.from(data),
      );
    }
  } catch {
    /* best-effort; do not mask the real test failure */
  }
}

/**
 * Reproduces the inmate-label HTML block from
 * `intake-notification.server.ts` for the BLANK_ATTORNEY_FIELDS case.
 * Saved alongside the PDFs so a failing CI run captures exactly what
 * the email would have rendered.
 */
function buildEmailFixtureHtml(a: Record<string, string>): string {
  const hasInmateAddress =
    Boolean(a.mail_current_location) && Boolean(a.mail_facility_address);
  const inmateBlock = hasInmateAddress
    ? `<pre>${a.mail_inmate_name}\n${a.mail_current_location}\n${a.mail_facility_address}</pre>`
    : `<div style="border:1px dashed #999;padding:8px">
        <strong>Pending facility lookup.</strong> DetencionDefensa.com will locate
        the inmate and forward those details to the attorney's office before the
        printed File Now Packet is mailed.
      </div>`;
  return `<!doctype html><html><body>
    <h2>Intake — fixture (BLANK_ATTORNEY_FIELDS)</h2>
    <p>Petitioner: ${a.full_name || ""}</p>
    ${inmateBlock}
  </body></html>`;
}

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
    const { habeas, ifp } = await buildIntakePdfs(BLANK_ATTORNEY_FIELDS);
    try {
      expect(habeas.byteLength).toBeGreaterThan(50_000);
      const text = extractAllText(habeas);
      for (const phrase of FORBIDDEN_PHRASES) {
        expect(text).not.toContain(phrase);
      }
    } catch (err) {
      dumpArtifacts("ao242", {
        "AO242.pdf": habeas,
        "AO240.pdf": ifp,
        "email-fixture.html": buildEmailFixtureHtml(BLANK_ATTORNEY_FIELDS),
      });
      throw err;
    }
  });

  it("AO 240 generates blank and contains no email-notice leakage", async () => {
    const { habeas, ifp } = await buildIntakePdfs(BLANK_ATTORNEY_FIELDS);
    try {
      expect(ifp.byteLength).toBeGreaterThan(50_000);
      const text = extractAllText(ifp);
      for (const phrase of FORBIDDEN_PHRASES) {
        expect(text).not.toContain(phrase);
      }
    } catch (err) {
      dumpArtifacts("ao240", {
        "AO240.pdf": ifp,
        "AO242.pdf": habeas,
        "email-fixture.html": buildEmailFixtureHtml(BLANK_ATTORNEY_FIELDS),
      });
      throw err;
    }
    // AO 240 is returned unmodified from the official blank template —
    // no fillAO240() pre-fill is allowed.
  });
});
