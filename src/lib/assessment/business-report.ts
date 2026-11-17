import type { Answers } from "./questions";

export type BusinessValuationInput = {
  monthlyRevenue: number | null;
  monthlyCosts: number | null;
  equipmentValue: number | null;
  repeatCustomers: boolean | null;
  years: "lt1" | "1to3" | "3to5" | "5plus" | "dk";
  records: "yes" | "some" | "cash" | "dk";
  entity: "sole" | "llc" | "corporation" | "dk";
};

export type BusinessValuation = {
  status: "ready" | "needs_info" | "review";
  monthlyRevenue: number | null;
  monthlyProfit: number | null;
  annualProfit: number | null;
  low: number | null;
  high: number | null;
  multiple: number | null;
  equipmentValue: number | null;
};

export type BusinessReport = {
  valuation: BusinessValuation;
  marketingPlan: string[];
  documents: string[];
};

export function calculateBusinessValue(input: BusinessValuationInput): BusinessValuation {
  const monthlyProfit = input.monthlyRevenue !== null && input.monthlyCosts !== null
    ? input.monthlyRevenue - input.monthlyCosts
    : null;
  const base = {
    monthlyRevenue: input.monthlyRevenue,
    monthlyProfit,
    annualProfit: monthlyProfit !== null ? monthlyProfit * 12 : null,
    equipmentValue: input.equipmentValue,
  };
  if (monthlyProfit === null || input.equipmentValue === null || input.repeatCustomers === null) {
    return { ...base, status: "needs_info", low: null, high: null, multiple: null };
  }
  if (monthlyProfit <= 0) {
    return { ...base, status: "review", low: null, high: null, multiple: null };
  }

  let multiple = 1.5;
  if (input.repeatCustomers) multiple += 0.25;
  if (input.years === "3to5" || input.years === "5plus") multiple += 0.25;
  if (input.records === "yes") multiple += 0.25;
  if (input.records === "cash") multiple -= 0.25;
  if (input.entity === "llc" || input.entity === "corporation") multiple += 0.25;
  multiple = Math.max(0.75, Math.min(3, multiple));

  const annualProfit = monthlyProfit * 12;
  return {
    ...base,
    status: "ready",
    multiple,
    low: Math.round(annualProfit * Math.max(0.75, multiple - 0.25) + input.equipmentValue),
    high: Math.round(annualProfit * (multiple + 0.5) + input.equipmentValue),
  };
}

const income: Record<string, number | null> = {
  lt1000: 750, "1000to3000": 2000, "3000to6000": 4500,
  "6000to10000": 8000, "10000plus": 12000, dk: null,
};
const costs: Record<string, number | null> = {
  none: 0, lt1000: 750, "1000to3000": 2000, "3000to6000": 4500,
  "6000to10000": 8000, "10000plus": 12000, dk: null,
};
const equipment: Record<string, number | null> = {
  none: 0, lt5000: 2500, "5000to15000": 10000,
  "15000to50000": 32500, "50000plus": 50000, dk: null,
};
const value = (map: Record<string, number | null>, raw: unknown) => typeof raw === "string" && raw in map ? map[raw]! : null;

export function buildBusinessReport(a: Answers): BusinessReport {
  const valuation = calculateBusinessValue({
    monthlyRevenue: value(income, a.monthlyIncome),
    monthlyCosts: value(costs, a.monthlyCosts),
    equipmentValue: value(equipment, a.equipmentValue),
    repeatCustomers: a.repeatCustomers === "yes" ? true : a.repeatCustomers === "no" || a.repeatCustomers === "some" ? false : null,
    years: typeof a.businessYears === "string" ? a.businessYears as BusinessValuationInput["years"] : "dk",
    records: typeof a.records === "string" ? a.records as BusinessValuationInput["records"] : "dk",
    entity: typeof a.entity === "string" ? a.entity as BusinessValuationInput["entity"] : "dk",
  });

  const marketingPlan = ["records", "customer_list", "proof", "reviews", "online"];
  if (a.records === "cash" || a.records === "some") marketingPlan.unshift("accounting");
  if (a.businessGoal === "sell") marketingPlan.push("sale_packet", "broker");
  if (a.businessGoal === "abroad") marketingPlan.push("manager", "remote_reports");
  if (a.businessGoal === "family") marketingPlan.push("family_manager", "signing_authority");
  if (a.advertising === "none" || (Array.isArray(a.advertising) && a.advertising.includes("none"))) marketingPlan.push("simple_ads");

  const documents = ["customer_list", "money_records", "worker_list", "equipment_list", "job_photos", "insurance"];
  if (a.entity === "llc" || a.entity === "corporation") documents.push("company_papers");
  else documents.push("company_formation");
  if (a.businessGoal === "sell") documents.push("sale_authorization");

  return { valuation, marketingPlan, documents };
}
