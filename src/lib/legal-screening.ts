import { z } from "zod";

export const screeningSchema = z.object({
  status: z.enum(["valid_tps", "expired_tps", "daca", "pending_asylum", "overstay", "undocumented"]),
  time: z.enum(["under1", "1to10", "10plus"]),
  prior: z.enum(["yes", "no", "unknown"]),
  family: z.enum(["usc_spouse", "usc_child21", "lpr_family", "none"]),
  assets: z.array(z.enum(["home", "business", "equipment"])).max(3).refine(a => new Set(a).size === a.length),
}).strict();

export type ScreeningAnswers = z.infer<typeof screeningSchema>;
export type ScreeningFinding = "status" | "tps" | "daca" | "pending" | "asylum_timely" | "asylum_deadline" | "cancellation10" | "cancellation_short" | "prior" | "prior_unknown" | "immediate" | "lpr" | "no_family";

export function assessLegalScreening(input: ScreeningAnswers) {
  const a = screeningSchema.parse(input);
  const potential = a.status === "valid_tps" || a.status === "pending_asylum" || a.family === "usc_spouse" || a.family === "usc_child21";
  const indicator = a.prior !== "no" ? "urgent_review" : potential ? "potential_review" : "limited_information";
  const findings: ScreeningFinding[] = [];
  if (["expired_tps", "overstay", "undocumented"].includes(a.status)) findings.push("status");
  if (a.status === "valid_tps") findings.push("tps");
  if (a.status === "daca") findings.push("daca");
  if (a.status === "pending_asylum") findings.push("pending");
  findings.push(a.time === "under1" ? "asylum_timely" : "asylum_deadline");
  findings.push(a.time === "10plus" ? "cancellation10" : "cancellation_short");
  if (a.prior === "yes") findings.push("prior");
  if (a.prior === "unknown") findings.push("prior_unknown");
  findings.push(a.family === "usc_spouse" || a.family === "usc_child21" ? "immediate" : a.family === "lpr_family" ? "lpr" : "no_family");
  return {
    version: "2026-11-14",
    indicator,
    findings,
    probability: null,
    eligibilityDetermined: false,
    counselReviewRequired: true,
    economicPlanningPriority: indicator === "limited_information" && a.assets.length > 0,
    home: a.assets.includes("home"),
    business: a.assets.includes("business"),
    equipment: a.assets.includes("equipment"),
  } as const;
}
export type ScreeningAssessment = ReturnType<typeof assessLegalScreening>;