import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { writeFile } from "node:fs/promises";
import { businessTrustPacket } from "./service-packet.server";

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

describe("translated business trust PDF packets", () => {
  it.each(["en", "es", "ht"] as const)("creates a complete readable %s PDF", async (language) => {
    const bytes = await businessTrustPacket(client, file, language);
    expect(Buffer.from(bytes).subarray(0, 5).toString()).toBe("%PDF-");
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(9);
    await writeFile(`/tmp/business-trust-${language}.pdf`, bytes);
  });
});
