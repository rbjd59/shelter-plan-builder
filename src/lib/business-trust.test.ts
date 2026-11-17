import { describe, expect, it } from "vitest";
import {
  businessFileSchema,
  businessTrustDetails,
  isTrustDocument,
  BUSINESS_TRUST_FEE,
} from "./business-trust";

describe("business client packages", () => {
  it("keeps the offered new business trust fee at $899 separate from the monthly fee", () => {
    expect(BUSINESS_TRUST_FEE).toBe(899);
  });
  it("records the offered $199 monthly fee without activating billing", () => {
    expect(businessFileSchema.parse({})).toMatchObject({
      monthlyFee: 199,
      feeStatus: "proposed",
      startDate: "",
      paymentPlan: "",
    });
    expect(businessFileSchema.safeParse({ monthlyFee: 200 }).success).toBe(false);
  });
  it("uses the client's existing home trust only when selected", () => {
    const client = {
      full_name: "Owner A",
      answers: { businessName: "A Cleaning", entity: "sole" },
    };
    expect(
      businessTrustDetails(client, {
        trustName: "A Home Trust",
        business: { trustMode: "existing_home" },
      }).trustName,
    ).toBe("A Home Trust");
    expect(
      businessTrustDetails(client, {
        trustName: "A Home Trust",
        business: { trustName: "A Business Trust" },
      }).trustName,
    ).toBe("A Business Trust");
  });
  it("restricts emailed downloads to home and business trust documents", () => {
    expect(isTrustDocument("service_business_trust")).toBe(true);
    expect(isTrustDocument("service_trust")).toBe(true);
    expect(isTrustDocument("service_business")).toBe(false);
    expect(isTrustDocument("service_family")).toBe(false);
  });
  it("preserves a client's fee status and agreed payment notes", () => {
    expect(
      businessFileSchema.parse({ feeStatus: "cancelled", paymentPlan: "Await attorney agreement" })
        .feeStatus,
    ).toBe("cancelled");
    expect(businessFileSchema.safeParse({ feeStatus: "paid" }).success).toBe(false);
  });
});
