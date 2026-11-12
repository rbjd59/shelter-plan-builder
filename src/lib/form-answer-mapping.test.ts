import { describe, expect, it } from "vitest";
import { mapFormAnswers } from "./form-answer-mapping";

describe("form answer mapping", () => {
  it("puts Josh's name in every principal/petitioner alias, not Rick's", () => {
    const mapped = mapFormAnswers({ full_name: "Josh Pastor", full_legal_name: "Wrong name", emergency_contact_name: "Rick Behar" });
    expect(mapped.full_legal_name).toBe("Josh Pastor");
    expect(mapped.mail_inmate_name).toBe("Josh Pastor");
    expect(mapped.emergency_contact_name).toBe("Rick Behar");
  });
  it("uses the locate desk custody date and booking ID rather than stale intake", () => {
    const mapped = mapFormAnswers({ arrest_date: "2026-11-12", date_taken_into_custody: "2020-01-01", federal_id: "TEST-JOSH-001", booking_number: "wrong" });
    expect(mapped.date_taken_into_custody).toBe("2026-11-12");
    expect(mapped.booking_number).toBe("TEST-JOSH-001");
  });
  it("maps the attorney's district and family ties to memorandum fields", () => {
    const mapped = mapFormAnswers({ district_court: "Test district", family_ties: "Fictional spouse and child" });
    expect(mapped.filing_district).toBe("Test district");
    expect(mapped.community_ties).toBe("Fictional spouse and child");
  });
  it("preserves deliberate attorney blanks in aliases", () => {
    expect(mapFormAnswers({ full_name: "", mail_inmate_name: "Stale name" }).mail_inmate_name).toBe("");
  });
});