export type FamilyPacketAnswers = Record<string, string | boolean>;
export const PACKET_LINK_SECONDS = 14 * 24 * 60 * 60;
export function familyPacketPlan(a: FamilyPacketAnswers) {
  const children = a.prep_children === "yes";
  const vehicle = a.prep_vehicle === "yes";
  return { children, vehicle, habeasUnlocked: false, documents: ["signing-guide", "emergency-plan", ...(children ? ["child-care", "temporary-custody", "international-travel"] : []), ...(vehicle ? ["vehicle-82053"] : []), ...(String(a.prep_declaration ?? "").trim() ? ["federal-declaration"] : [])] };
}