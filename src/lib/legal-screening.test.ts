import { describe, expect, it } from "vitest";
import { assessLegalScreening, screeningSchema, type ScreeningAnswers } from "./legal-screening";
const base: ScreeningAnswers = { status: "expired_tps", time: "1to10", prior: "no", family: "none", assets: [] };

describe("statutory screening assessment", () => {
  it("prioritizes missed court dates and ICE visits for urgent review", () => {
    for (const missed of ["court", "ice", "both", "unknown"] as const) {
      const r = assessLegalScreening({ ...base, missed });
      expect(r.indicator).toBe("urgent_review");
      expect(r.findings).toContain("missed");
    }
    expect(assessLegalScreening({ ...base, missed: "no" }).findings).not.toContain("missed");
  });
  it("flags changed asylum circumstances without granting eligibility or resetting the deadline", () => {
    const r = assessLegalScreening({ ...base, changed: "yes", fear: "yes" });
    expect(r.findings).toEqual(expect.arrayContaining(["changed", "fear", "asylum_deadline"]));
    expect(r.eligibilityDetermined).toBe(false);
  });
  it("records a prior asylum filing as a review fact rather than declaring it late", () => {
    expect(assessLegalScreening({ ...base, asylumFiled: "yes" }).findings).toContain("filed");
    expect(assessLegalScreening({ ...base, asylumFiled: "no" }).findings).not.toContain("filed");
  });
  it("flags entry and reentry history without automatically establishing a bar", () => {
    const r = assessLegalScreening({ ...base, entry: "without_check", returned: "yes" });
    expect(r.findings).toEqual(expect.arrayContaining(["entry", "returned"]));
    expect(r.eligibilityDetermined).toBe(false);
  });
  it("offers departure planning only when requested and never grants departure eligibility or odds", () => {
    const r = assessLegalScreening({ ...base, departure: "considering", funds: "yes", documents: "yes" });
    expect(r.departurePlanning).toBe(true);
    expect(r.findings).toContain("departure");
    expect(r.eligibilityDetermined).toBe(false);
    expect(r.probability).toBeNull();
    expect(assessLegalScreening({ ...base, departure: "no" }).departurePlanning).toBe(false);
  });
  it("selects child and vehicle document planning without unlocking habeas for six months", () => {
    const r = assessLegalScreening({ ...base, children: "yes", vehicle: "yes", detention: "sixplus" });
    expect(r.childDocuments).toBe(true); expect(r.vehicleDocument).toBe(true); expect(r.habeasUnlocked).toBe(false);
    expect(assessLegalScreening({ ...base, children: "no", vehicle: "no" }).childDocuments).toBe(false);
  });
  it("flags expired TPS for status-bar review rather than an easy status switch", () => {
    expect(assessLegalScreening(base).findings).toContain("status");
    expect(assessLegalScreening(base).indicator).toBe("limited_information");
  });
  it("flags the one-year asylum deadline at 1–10 and 10+ years", () => {
    expect(assessLegalScreening({ ...base, time: "under1" }).findings).toContain("asylum_timely");
    for (const time of ["1to10", "10plus"] as const) expect(assessLegalScreening({ ...base, time }).findings).toContain("asylum_deadline");
  });
  it("uses 10+ years only as a cancellation review flag, not eligibility", () => {
    expect(assessLegalScreening({ ...base, time: "10plus" }).findings).toContain("cancellation10");
    expect(assessLegalScreening(base).findings).toContain("cancellation_short");
    expect(assessLegalScreening({ ...base, time: "10plus" }).eligibilityDetermined).toBe(false);
  });
  it("prioritizes prior orders over TPS or immediate-relative indicators", () => {
    expect(assessLegalScreening({ ...base, prior: "yes", status: "valid_tps", family: "usc_spouse" }).indicator).toBe("urgent_review");
    expect(assessLegalScreening({ ...base, prior: "unknown" }).indicator).toBe("urgent_review");
    expect(assessLegalScreening({ ...base, prior: "yes" }).findings).toContain("prior");
  });
  it("identifies USC spouses and adult children 21+ for review", () => {
    for (const family of ["usc_spouse", "usc_child21"] as const) expect(assessLegalScreening({ ...base, family }).indicator).toBe("potential_review");
    expect(assessLegalScreening({ ...base, family: "lpr_family" }).indicator).toBe("limited_information");
  });
  it("valid TPS and pending asylum trigger review but do not guarantee relief", () => {
    for (const status of ["valid_tps", "pending_asylum"] as const) {
      const r = assessLegalScreening({ ...base, status });
      expect(r.indicator).toBe("potential_review");
      expect(r.eligibilityDetermined).toBe(false);
    }
  });
  it("DACA does not automatically establish a path", () => {
    expect(assessLegalScreening({ ...base, status: "daca" }).indicator).toBe("limited_information");
    expect(assessLegalScreening({ ...base, status: "daca" }).findings).toContain("daca");
  });
  it("offers home, business and equipment planning only for selected assets", () => {
    const r = assessLegalScreening({ ...base, assets: ["home", "business", "equipment"] });
    expect([r.home, r.business, r.equipment, r.economicPlanningPriority]).toEqual([true, true, true, true]);
    expect(assessLegalScreening(base).economicPlanningPriority).toBe(false);
    expect(assessLegalScreening(base).home).toBe(false);
    expect(assessLegalScreening({ ...base, family: "usc_spouse", assets: ["home"] }).economicPlanningPriority).toBe(false);
  });
  it("never fabricates individual 10–15% odds or denies all relief", () => {
    expect(assessLegalScreening(base).probability).toBeNull();
    expect(assessLegalScreening(base).counselReviewRequired).toBe(true);
  });
  it("rejects unknown values, extra identity fields and duplicate assets", () => {
    expect(screeningSchema.safeParse({ ...base, status: "anything" }).success).toBe(false);
    expect(screeningSchema.safeParse({ ...base, name: "private" }).success).toBe(false);
    expect(screeningSchema.safeParse({ ...base, assets: ["home", "home"] }).success).toBe(false);
    expect(() => assessLegalScreening({ ...base, time: "bad" } as unknown as ScreeningAnswers)).toThrow();
  });
});