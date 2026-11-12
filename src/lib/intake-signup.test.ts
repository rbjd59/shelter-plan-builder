import { describe, expect, it } from "vitest";
import { canStartQuestionnaire, signupDetails } from "./intake-signup";

const details = { full_name: "Test Client", client_email: "client@example.com", client_mobile: "+13055550123", intake_terms_accepted: true };
describe("intake first stage", () => {
  it("requires name, email, phone, accepted terms and a signed-in account before the questionnaire", () => {
    expect(canStartQuestionnaire(details, true)).toBe(true);
    expect(canStartQuestionnaire(details, false)).toBe(false);
    expect(canStartQuestionnaire({ ...details, intake_terms_accepted: false }, true)).toBe(false);
    for (const key of ["full_name", "client_email", "client_mobile"]) {
      expect(canStartQuestionnaire({ ...details, [key]: "" }, true)).toBe(false);
    }
  });
  it("retains who assisted, church, pastor and where the client heard about the app without passwords", () => {
    expect(signupDetails({ ...details, referral_church: "Test Church", referral_pastor: "Test Pastor", signup_assisted_by: "Test Helper", heard_about_app: "WSRF", password: "must-not-persist", a_number: "A999999999" })).toEqual({ ...details, referral_church: "Test Church", referral_pastor: "Test Pastor", signup_assisted_by: "Test Helper", heard_about_app: "WSRF" });
  });
});