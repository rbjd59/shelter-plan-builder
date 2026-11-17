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
  it("over 1 year without papers means 10-year bar", () => { expect(score({ statusEnded: "gt12" }).reentryBar).toBe("10yr"); });
  it("6-12 months means 3-year bar", () => { expect(score({ statusEnded: "6to12" }).reentryBar).toBe("3yr"); });
  it("illegal re-entry is permanent bar", () => { expect(score({ reentry: "yes" }).reentryBar).toBe("permanent"); });
  it("no papers, no family is 0-15%", () => { expect(score({ status: "none", entry: "ewi", family: ["none"] }).stayBand).toBe("low"); });
  it("legal entry with US citizen spouse is over 15%", () => { expect(score({ entry: "inspected", family: ["usc_spouse"] }).stayBand).toBe("high"); });
  it("trade with 10+ customers qualifies Save My Business", () => { expect(score({ trade: "lawn", customers: "30plus" }).business).toBe(true); });
});
