import { describe, expect, it } from "vitest";
import { BUSINESS_INTAKE_ASSIGNEE, businessIntakeSchema } from "./business-intake";

const input = {
  requestId: "925c93da-bd9b-4aba-b0cb-de85b71ce40b",
  fullName: "Test Owner",
  phone: "+1 305 555 0100",
  work: "Lawn care",
  language: "en",
  consent: true,
};
describe("Business call intake", () => {
  it("assigns requests to the owner-confirmed real team member", () => {
    expect(BUSINESS_INTAKE_ASSIGNEE.name).toBe("Ricky Bitelman-Behar JD");
    expect(BUSINESS_INTAKE_ASSIGNEE.userId).toBe("e4561f24-6366-4257-9510-8ff666ec7210");
  });
  it.each(["en", "es", "ht"])("accepts %s without an account or email", (language) => {
    expect(businessIntakeSchema.parse({ ...input, language }).email).toBe("");
  });
  it("requires contact permission", () => {
    expect(businessIntakeSchema.safeParse({ ...input, consent: false }).success).toBe(false);
  });
  it("rejects missing call details", () => {
    expect(businessIntakeSchema.safeParse({ ...input, phone: "abc" }).success).toBe(false);
    expect(businessIntakeSchema.safeParse({ ...input, work: "" }).success).toBe(false);
  });
});
