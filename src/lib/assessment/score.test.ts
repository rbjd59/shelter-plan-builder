import { describe, it, expect } from "vitest";
import { score } from "./score";
import { SECTIONS } from "./questions";

describe("assessment rules", () => {
  it("home: 60% loan leaving at least $40,000 and covering 120 days qualifies Save My Home", () => {
    expect(score({ ownHome: "yes", estimatedValue: "350000", owed: "150000", monthly: "2500" }).home).toBe("save_my_home");
  });
  it("home: less than $40,000 cash back does not qualify even when 120-day carry is covered", () => {
    expect(score({ ownHome: "yes", estimatedValue: "250000", owed: "111000", monthly: "2000" }).home).toBe("trust_899");
  });
  it("home: $40,000 cash back is not enough when it cannot cover 120 days", () => {
    expect(score({ ownHome: "yes", estimatedValue: "350000", owed: "150000", monthly: "20000" }).home).toBe("trust_899");
  });
  it("home: owner without enough equity gets $899 trust", () => {
    expect(score({ ownHome: "yes", estimatedValue: "250000", owed: "250000", monthly: "1500" }).home).toBe("trust_899");
  });
  it("home: blank loan and payment answers are not treated as zero", () => {
    expect(score({ ownHome: "yes", estimatedValue: "500000", owed: "", monthly: "" }).home).toBe("trust_899");
  });
  it("home: no home, no trust", () => { expect(score({ ownHome: "no" }).home).toBe("none"); });
  it("final order means habeas not eligible", () => { expect(score({ court: "final" }).habeas).toBe("not_eligible"); });
  it("over 1 year without papers means 10-year bar", () => { expect(score({ now: "tps_ended", ended: "gt365" }).reentryBar).toBe("10yr"); });
  it("6-12 months means 3-year bar", () => { expect(score({ now: "tps_ended", ended: "180to365" }).reentryBar).toBe("3yr"); });
  it("illegal re-entry is permanent bar", () => { expect(score({ now: "tps_ended", ended: "gt365", sneakBack: "yes" }).reentryBar).toBe("permanent"); });
  it("no papers, no family is 0-15%", () => { expect(score({ papers: ["none"], entry: "ewi", family: ["none"] }).stayBand).toBe("low"); });
  it("legal entry with US citizen spouse is over 15%", () => { expect(score({ entry: "parole", family: ["usc_spouse"] }).stayBand).toBe("high"); });
  it("trade with 10+ weekly customers qualifies Save My Business", () => { expect(score({ trade: "lawn", customersWeek: "10to19" }).business).toBe(true); });
  it("repeat customers after the first year can qualify Save My Business", () => { expect(score({ trade: "pool", repeatCustomers: "yes", businessYears: "3to5" }).business).toBe(true); });
  it("habeas: no final order in Florida pre-qualifies", () => { expect(score({ court: "no", state: "florida", crime: "no", now: "tps_ended" }).habeas).toBe("prequalified"); });
  it("habeas: Texas (5th Circuit) needs attorney review", () => { expect(score({ court: "no", state: "texas", crime: "no" }).habeas).toBe("review"); });
  it("missed court counts as final order", () => { expect(score({ now: "missed" }).habeas).toBe("not_eligible"); });
  it("deported twice is 20-year wait", () => { expect(score({ removed: "twice" }).reentryBar).toBe("20yr"); });
  it("under 6 months without papers: no wait", () => { expect(score({ now: "parole_ended", ended: "lt180" }).reentryBar).toBe("none"); });
});

describe("assessment flow", () => {
  it("puts family forms before home and business", () => {
    const ids = SECTIONS.map((s) => s.id);
    expect(ids.indexOf("familyForms")).toBeLessThan(ids.indexOf("home"));
    expect(ids.indexOf("home")).toBeLessThan(ids.indexOf("business"));
  });
  it("collects every home input needed for valuation, loan review, and the owner's goal", () => {
    const home = SECTIONS.find((s) => s.id === "home")!;
    const ids = home.questions.map((q) => q.id);
    for (const required of ["homeAddress", "bought", "purchasePrice", "mortgages", "owed", "monthly", "late", "owners", "bedrooms", "bathrooms", "homeAge", "condition", "liens", "homePlan"]) {
      expect(ids).toContain(required);
    }
  });
  it("collects business value, repeat customers, company type, and the owner's goal", () => {
    const business = SECTIONS.find((s) => s.id === "business")!;
    const ids = business.questions.map((q) => q.id);
    for (const required of ["monthlyIncome", "businessYears", "customersWeek", "repeatCustomers", "workers", "advertising", "entity", "records", "businessGoal"]) {
      expect(ids).toContain(required);
    }
  });
});
