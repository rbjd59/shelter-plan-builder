import { describe, expect, it } from "vitest";
import { parseAssessmentLead } from "./lead";

const valid = {
  fullName: "Test Person",
  email: "test@example.com",
  phone: "305-555-0100",
  language: "en",
  next: "questions",
};

describe("homepage assessment contact details", () => {
  it("requires name, email and phone before either next step", () => {
    for (const field of ["fullName", "email", "phone"] as const) {
      expect(() => parseAssessmentLead({ ...valid, [field]: "" })).toThrow();
    }
  });

  it("accepts complete contact details for the questions or videos path", () => {
    expect(parseAssessmentLead(valid).next).toBe("questions");
    expect(parseAssessmentLead({ ...valid, next: "videos" }).next).toBe("videos");
  });

  it("rejects an invalid email address", () => {
    expect(() => parseAssessmentLead({ ...valid, email: "not-an-email" })).toThrow();
  });
});
