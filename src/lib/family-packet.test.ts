import { describe, expect, it } from "vitest";
import { familyPacketPlan, PACKET_LINK_SECONDS } from "./family-packet";
describe("personalized family packet", () => {
  it("includes the three child documents only when minor children are selected", () => {
    expect(familyPacketPlan({ prep_children: "yes" }).documents).toEqual(expect.arrayContaining(["child-care", "temporary-custody", "international-travel"]));
    expect(familyPacketPlan({ prep_children: "no" }).documents).not.toContain("temporary-custody");
  });
  it("includes HSMV 82053 only for a titled vehicle", () => {
    expect(familyPacketPlan({ prep_vehicle: "yes" }).documents).toContain("vehicle-82053");
    expect(familyPacketPlan({ prep_vehicle: "no" }).documents).not.toContain("vehicle-82053");
  });
  it("does not unlock habeas based on six months or a client claimed approval", () => {
    expect(familyPacketPlan({ prep_detention: "sixplus", habeas_approved: true }).habeasUnlocked).toBe(false);
  });
  it("limits private links to 14 days", () => { expect(PACKET_LINK_SECONDS).toBe(1209600); });
});