import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { buildFamilyPacket } from "./family-packet.server";
describe("family packet PDF generation", () => {
  it.each(["en", "es", "ht"] as const)("bundles official child and vehicle forms in %s without a habeas petition", async lang => {
    const packet = await buildFamilyPacket({ full_name: "Test Parent", prep_caregiver: "Test Agent", prep_child_names: "Test Child", prep_children: "yes", prep_vehicle: "yes", prep_vehicle_vin: "1TESTVIN1234567890" }, lang);
    const pdf = await PDFDocument.load(packet.bytes);
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(7);
    expect(packet.documents).toEqual(["signing-guide", "emergency-plan", "child-care", "temporary-custody", "international-travel", "vehicle-82053"]);
  });
});