import { describe, it, expect } from "vitest";
import { score } from "./score";

describe("assessment rules", () => {
  it("home: 60% loan covering 120 days of carry qualifies Save My Home", () => {
    expect(score({ ownHome: "yes", homeValue: "350", owed: "150", monthly: "2500" }).home).toBe("save_my_home");
  });
  it("home: owner without enough equity gets $899 trust", () => {
    expect(score({ ownHome: "yes", homeValue: "250", owed: "250", monthly: "1500" }).home).toBe("trust_899");
  });
  it("home: no home, no trust", () => { expect(score({ ownHome: "no" }).home).toBe("none"); });
  it("final order means habeas not eligible", () => { expect(score({ court: "final" }).habeas).toBe("not_eligible"); });
  it("over 1 year without papers means 10-year bar", () => { expect(score({ now: "tps_ended", ended: "gt365" }).reentryBar).toBe("10yr"); });
  it("6-12 months means 3-year bar", () => { expect(score({ now: "tps_ended", ended: "180to365" }).reentryBar).toBe("3yr"); });
  it("illegal re-entry is permanent bar", () => { expect(score({ now: "tps_ended", ended: "gt365", sneakBack: "yes" }).reentryBar).toBe("permanent"); });
  it("no papers, no family is 0-15%", () => { expect(score({ papers: ["none"], entry: "ewi", family: ["none"] }).stayBand).toBe("low"); });
  it("legal entry with US citizen spouse is over 15%", () => { expect(score({ entry: "parole", family: ["usc_spouse"] }).stayBand).toBe("high"); });
  it("trade with 10+ customers qualifies Save My Business", () => { expect(score({ trade: "lawn", customers: "30plus" }).business).toBe(true); });
  it("habeas: no final order in Florida pre-qualifies", () => { expect(score({ court: "no", state: "florida", crime: "no", now: "tps_ended" }).habeas).toBe("prequalified"); });
  it("habeas: Texas (5th Circuit) needs attorney review", () => { expect(score({ court: "no", state: "texas", crime: "no" }).habeas).toBe("review"); });
  it("missed court counts as final order", () => { expect(score({ now: "missed" }).habeas).toBe("not_eligible"); });
  it("deported twice is 20-year wait", () => { expect(score({ removed: "twice" }).reentryBar).toBe("20yr"); });
  it("under 6 months without papers: no wait", () => { expect(score({ now: "parole_ended", ended: "lt180" }).reentryBar).toBe("none"); });
});
