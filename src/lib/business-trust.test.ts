import { describe, expect, it } from "vitest";
import {
  businessFileSchema,
  businessTrustDetails,
  isTrustDocument,
  BUSINESS_TRUST_FEE,
  trustDocumentLanguage,
} from "./business-trust";
import {
  BUSINESS_TRUST_LANGUAGES,
  businessTrustFormSections,
  type BusinessTrustFormValues,
} from "./business-trust-forms";

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
  it("keeps the email language tied to the immutable PDF language", () => {
    expect(trustDocumentLanguage("Business trust forms (Español) [es]", "en")).toBe("es");
    expect(trustDocumentLanguage("Business trust forms (Kreyòl) [ht]", "en")).toBe("ht");
    expect(trustDocumentLanguage("Older business trust draft", "es")).toBe("es");
  });
  it.each(BUSINESS_TRUST_LANGUAGES)(
    "includes every required form and a paralegal signature placeholder in %s",
    (language) => {
      const values: BusinessTrustFormValues = {
        clientName: "Client A",
        businessName: "A Cleaning",
        entity: "LLC",
        goal: "Run from abroad",
        assets: "100% ownership",
        trustName: "A Business Trust",
        trustMode: "new",
        trustee: "Trustee A",
        backupTrustee: "Trustee B",
        beneficiaries: "Family A",
        monthlyFee: 199,
        feeStatus: "proposed",
        startDate: "[to be completed]",
        paymentPlan: "[to be completed]",
        trustFee: 899,
      };
      const sections = businessTrustFormSections(language, values);
      expect(sections).toHaveLength(9);
      expect(sections.map((section) => section.heading).join(" ")).toMatch(/Anexo|Anèks|Schedule/);
      const text = sections.flatMap((section) => section.lines).join("\n");
      expect(text).toMatch(/Paralegal|paralegal/);
      expect(text).toContain("________________________________");
      expect(text).toMatch(/199/);
      expect(text).toMatch(/899/);
      expect(text).toMatch(/Do not sign|NO FIRMAR|PA SIYEN/);
    },
  );
});
