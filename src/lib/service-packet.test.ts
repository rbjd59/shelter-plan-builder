import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { writeFile } from "node:fs/promises";
import { approvedBusinessTrustPacket, businessTrustPacket } from "./service-packet.server";
import { businessTrustApprovalTermsSchema } from "./business-trust";
import { businessTrustApprovedFormSections } from "./business-trust-approved-forms";

const client = {
  full_name: "José Pérez",
  answers: { businessName: "Pérez Cleaning", entity: "LLC", businessGoal: "Run from abroad" },
};
const file = {
  trustee: "Marie Joseph",
  backupTrustee: "Jean Joseph",
  beneficiaries: "Sofía Pérez — 100%",
  business: {
    name: "Pérez Cleaning",
    entity: "LLC",
    assets: "100% ownership and work tools",
    trustName: "Pérez Business Trust",
  },
};

const attorneyTerms = businessTrustApprovalTermsSchema.parse({
  reviewerName: "Rosario Kyle Sorrentino, Esq.",
  reviewerBarNumber: "Florida Bar No. 1049132",
  governingLaw: "Florida law",
  effectiveDate: "2026-11-17",
  amendmentAndRevocation:
    "The Settlor may amend or revoke in a signed writing delivered to the Trustee.",
  distributions: "Distribute according to Schedule B after documented debts and expenses.",
  trusteePowers:
    "Manage contracts and records, collect payments, and pay approved business expenses.",
  compensationAndExpenses:
    "No compensation without written approval; reasonable documented expenses may be reimbursed.",
  incapacityAndSuccession:
    "The named successor acts after written proof of death, resignation, or incapacity.",
  executionRequirements: "Settlor and Trustee sign before two witnesses and a Florida notary.",
  transferTerms:
    "Assign 100% of the ownership interest by a separately signed instrument with no assumed debts.",
});

describe("translated business trust PDF packets", () => {
  it.each(["en", "es", "ht"] as const)("creates a complete readable %s PDF", async (language) => {
    const bytes = await businessTrustPacket(client, file, language);
    expect(Buffer.from(bytes).subarray(0, 5).toString()).toBe("%PDF-");
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(9);
    await writeFile(`/tmp/business-trust-${language}.pdf`, bytes);
  });

  it.each(["en", "es", "ht"] as const)(
    "creates an attorney-approved %s execution packet with the exact final terms",
    async (language) => {
      const bytes = await approvedBusinessTrustPacket(
        client,
        file,
        language,
        attorneyTerms,
        "2026-11-17T12:00:00.000Z",
      );
      expect(Buffer.from(bytes).subarray(0, 5).toString()).toBe("%PDF-");
      const pdf = await PDFDocument.load(bytes);
      expect(pdf.getPageCount()).toBeGreaterThanOrEqual(9);
      const sections = businessTrustApprovedFormSections(
        language,
        {
          clientName: "José Pérez",
          businessName: "Pérez Cleaning",
          entity: "LLC",
          goal: "Run from abroad",
          assets: "100% ownership and work tools",
          trustName: "Pérez Business Trust",
          trustMode: "new",
          trustee: "Marie Joseph",
          backupTrustee: "Jean Joseph",
          beneficiaries: "Sofía Pérez — 100%",
          monthlyFee: 199,
          feeStatus: "proposed",
          startDate: "",
          paymentPlan: "Separate agreement",
          trustFee: 899,
        },
        attorneyTerms,
        "2026-11-17T12:00:00.000Z",
      );
      const text = sections.flatMap((section) => section.lines).join("\n");
      expect(text).toContain("Assign 100% of the ownership interest");
      expect(text).toContain("Florida Bar No. 1049132");
      expect(text).not.toMatch(/DO NOT SIGN|NO FIRMAR|PA SIYEN/);
      await writeFile(`/tmp/approved-business-trust-${language}.pdf`, bytes);
    },
  );
});
