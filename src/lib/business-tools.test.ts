import { describe, expect, it } from "vitest";
import { calculateJobPrice, jobsToCsv } from "./business-tools";

describe("business tools", () => {
  it("adds labor, materials, overhead and desired profit to a job price", () => {
    const result = calculateJobPrice({ workers: 2, hours: 3, hourlyPay: 20, materials: 30, monthlyOverhead: 1600, monthlyWorkHours: 160, desiredProfit: 80 });
    expect(result).toEqual({ labor: 120, overhead: 30, totalCost: 180, price: 260, profitMargin: 30.77, markup: 44.44 });
  });

  it("does not divide by zero when monthly work hours are unknown", () => {
    expect(calculateJobPrice({ workers: 1, hours: 1, hourlyPay: 25, materials: 0, monthlyOverhead: 500, monthlyWorkHours: 0, desiredProfit: 10 }).price).toBe(35);
  });

  it("exports customer history with photo counts and escaped names", () => {
    const csv = jobsToCsv([{ id: "1", customer: 'Ana "A" client', phone: "305", service: "Lawn", workDate: "2026-11-17", amount: 75, paid: true, photos: ["photo"] }]);
    expect(csv).toContain('"Ana ""A"" client"');
    expect(csv).toContain('"2026-11-17","75","true","1"');
  });
});
