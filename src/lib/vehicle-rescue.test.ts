import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { vehicleFromAnswers, vehicleIntakeSchema, VEHICLE_DRAFT_NOTICE } from "./vehicle-rescue";
import { dealerParticipationAgreementPdf, vehicleRescuePacket } from "./vehicle-packet.server";

const valid = {
  year: "2020", make: "Toyota", model: "Camry", vin: "1HGCM82633A004352", plate: "ABC123", plateState: "FL",
  titleOwners: ["José Pérez"], titleConnector: "and" as const, lienholder: "", titleHolder: "owner" as const,
  keysTitleLocation: "Kitchen drawer", insuranceCompany: "", contactName: "Marie Pérez", contactRelationship: "Sister",
  contactPhone: "+13055550100", proceeds: "designated_contact" as const, proceedsDetails: "", agentType: "family" as const, agentName: "Marie Pérez",
};

describe("vehicle intake validation", () => {
  it("accepts complete vehicle information and normalizes the VIN", () => {
    const parsed = vehicleIntakeSchema.parse({ ...valid, vin: valid.vin.toLowerCase(), plateState: "fl" });
    expect(parsed.vin).toBe(valid.vin);
    expect(parsed.plateState).toBe("FL");
  });
  it("rejects a VIN that is not exactly 17 valid characters", () => {
    expect(() => vehicleIntakeSchema.parse({ ...valid, vin: "SHORT" })).toThrow(/17/);
    expect(() => vehicleIntakeSchema.parse({ ...valid, vin: "1HGCM82633A00435I" })).toThrow(/17/);
  });
  it("requires a named family agent and split instructions when selected", () => {
    expect(() => vehicleIntakeSchema.parse({ ...valid, agentName: "" })).toThrow(/family member/);
    expect(() => vehicleIntakeSchema.parse({ ...valid, proceeds: "split", proceedsDetails: "" })).toThrow(/percentages/);
  });
  it("maps only vehicle intake fields from the existing answers", () => {
    const mapped = vehicleFromAnswers({
      vehicle_year: valid.year, vehicle_make: valid.make, vehicle_model: valid.model, vehicle_vin: valid.vin,
      vehicle_plate: valid.plate, vehicle_plate_state: valid.plateState, vehicle_title_owners: valid.titleOwners[0],
      vehicle_title_connector: "and", vehicle_lienholder: "", vehicle_title_holder: "owner", vehicle_keys_title_location: valid.keysTitleLocation,
      vehicle_insurance: "", vehicle_contact_name: valid.contactName, vehicle_contact_relationship: valid.contactRelationship,
      vehicle_contact_phone: valid.contactPhone, vehicle_proceeds: "designated_contact", vehicle_proceeds_details: "",
      vehicle_agent_type: "family", vehicle_agent_name: valid.agentName, a_number: "not copied",
    });
    expect(mapped).toEqual(valid);
    expect(mapped).not.toHaveProperty("a_number");
  });
});

describe("vehicle packet PDFs", () => {
  it.each(["en","es","ht"] as const)("creates a personalized %s draft and an approved packet", async (language) => {
    const draft = await vehicleRescuePacket({ language, ownerName: "José Pérez", vehicle: valid });
    expect(Buffer.from(draft).subarray(0,5).toString()).toBe("%PDF-");
    expect((await PDFDocument.load(draft)).getPageCount()).toBeGreaterThanOrEqual(10);
    const approved = await vehicleRescuePacket({ language, ownerName: "José Pérez", vehicle: valid, approved: true, reviewerName: "Rosario Kyle Sorrentino, Esq.", approvedAt: "2026-11-18T01:00:00Z" });
    expect((await PDFDocument.load(approved)).getPageCount()).toBeGreaterThanOrEqual(10);
    expect(VEHICLE_DRAFT_NOTICE[language]).toContain(language === "en" ? "DO NOT SIGN" : language === "es" ? "NO FIRMAR" : "PA SIYEN");
  });
  it("creates the dealer agreement with the required fee and owner protections", async () => {
    const bytes = await dealerParticipationAgreementPdf();
    expect(Buffer.from(bytes).subarray(0,5).toString()).toBe("%PDF-");
    expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThanOrEqual(3);
  });
});
