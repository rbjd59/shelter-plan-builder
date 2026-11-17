import { describe, expect, it } from "vitest";
import { calculateBusinessValue, buildBusinessReport } from "./business-report";

describe("business valuation", () => {
  it("uses yearly money left after costs, business history and equipment", () => {
    const result = calculateBusinessValue({
      monthlyRevenue: 5000, monthlyCosts: 2000, equipmentValue: 10000,
      repeatCustomers: true, years: "5plus", records: "yes", entity: "llc",
    });
    expect(result).toMatchObject({ status: "ready", monthlyProfit: 3000, annualProfit: 36000, multiple: 2.5, low: 91000, high: 118000 });
  });

  it("does not invent a value when profit or equipment is unknown", () => {
    const result = calculateBusinessValue({ monthlyRevenue: 5000, monthlyCosts: null, equipmentValue: null, repeatCustomers: true, years: "3to5", records: "some", entity: "sole" });
    expect(result.status).toBe("needs_info");
    expect(result.low).toBeNull();
    expect(result.high).toBeNull();
  });

  it("sends a business with no money left after costs for review instead of a price", () => {
    const result = calculateBusinessValue({ monthlyRevenue: 2000, monthlyCosts: 2500, equipmentValue: 0, repeatCustomers: false, years: "lt1", records: "cash", entity: "sole" });
    expect(result.status).toBe("review");
    expect(result.low).toBeNull();
  });

  it("builds the marketing plan and document checklist from the chosen goal", () => {
    const report = buildBusinessReport({ monthlyIncome: "3000to6000", monthlyCosts: "1000to3000", equipmentValue: "5000to15000", repeatCustomers: "yes", businessYears: "3to5", records: "cash", entity: "sole", businessGoal: "sell" });
    expect(report.marketingPlan).toContain("sale_packet");
    expect(report.marketingPlan).toContain("accounting");
    expect(report.documents).toContain("company_formation");
    expect(report.documents).toContain("sale_authorization");
  });
});
