import { describe, expect, it } from "vitest";
import { dealerAlertText, dealerInterestSchema, dealerLeadFields } from "./dealer-interest";

const valid = {
  requestId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  dealershipName: "Example Motors",
  licenseNumber: "VF1234567",
  contactName: "Alex Dealer",
  phone: "(305) 555-0100",
  email: "alex@example.com",
  counties: "Miami-Dade, Broward",
  language: "en" as const,
  consent: true as const,
};

describe("dealer interest", () => {
  it("requires every field the dealer program needs", () => {
    expect(dealerInterestSchema.parse(valid)).toEqual(valid);
    expect(dealerInterestSchema.safeParse({ ...valid, licenseNumber: "" }).success).toBe(false);
    expect(dealerInterestSchema.safeParse({ ...valid, counties: "" }).success).toBe(false);
    expect(dealerInterestSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
  });

  it("stores only dealer-entered business and contact fields in the staff lead", () => {
    const row = dealerLeadFields(dealerInterestSchema.parse(valid));
    expect(row).toMatchObject({
      id: valid.requestId,
      full_name: "Alex Dealer",
      email: "alex@example.com",
      need: "Example Motors",
      city: "Miami-Dade, Broward",
      source: "dealer-interest",
      status: "new",
    });
    expect(row.message).toContain("Florida dealer license: VF1234567");
    expect(row.message).toContain("Counties served: Miami-Dade, Broward");
    expect(row.message).not.toContain("immigration status");
  });

  it("alerts staff with the dealership, contact, counties and reference but no fee amount", () => {
    const text = dealerAlertText(dealerInterestSchema.parse(valid));
    expect(text).toContain("Example Motors");
    expect(text).toContain("Alex Dealer");
    expect(text).toContain("Miami-Dade, Broward");
    expect(text).toContain("Ref AAAAAA");
    expect(text).not.toMatch(/\$\d/);
  });
});
