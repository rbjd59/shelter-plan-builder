import { z } from "zod";

export const screeningSchema = z
  .object({
    status: z.enum([
      "valid_tps",
      "expired_tps",
      "daca",
      "pending_asylum",
      "overstay",
      "undocumented",
      "valid_visa",
      "green_card",
      "other",
      "unknown",
    ]),
    time: z.enum(["under1", "1to10", "10plus"]),
    prior: z.enum(["yes", "no", "unknown"]),
    family: z.enum(["usc_spouse", "usc_child21", "lpr_family", "none", "unknown"]),
    entry: z.enum(["inspected", "parole", "without_check", "unknown"]).optional(),
    missed: z.enum(["court", "ice", "both", "no", "unknown"]).optional(),
    fear: z.enum(["yes", "no", "unknown"]).optional(),
    changed: z.enum(["yes", "no", "unknown"]).optional(),
    asylumFiled: z.enum(["yes", "no", "unknown"]).optional(),
    returned: z.enum(["yes", "no", "unknown"]).optional(),
    hardship: z.enum(["yes", "no", "unknown"]).optional(),
    crime: z.enum(["yes", "no", "unknown"]).optional(),
    departure: z.enum(["considering", "no", "unknown"]).optional(),
    funds: z.enum(["yes", "no", "unknown"]).optional(),
    documents: z.enum(["yes", "no", "unknown"]).optional(),
    children: z.enum(["yes", "no", "unknown"]).optional(),
    vehicle: z.enum(["yes", "no", "unknown"]).optional(),
    detention: z.enum(["none", "undersix", "sixplus", "unknown"]).optional(),
    assets: z
      .array(z.enum(["home", "business", "equipment"]))
      .max(3)
      .refine((a) => new Set(a).size === a.length),
  })
  .strict();

export type ScreeningAnswers = z.infer<typeof screeningSchema>;
export type ScreeningFinding =
  | "status"
  | "tps"
  | "daca"
  | "pending"
  | "asylum_timely"
  | "asylum_deadline"
  | "cancellation10"
  | "cancellation_short"
  | "prior"
  | "prior_unknown"
  | "immediate"
  | "lpr"
  | "no_family"
  | "entry"
  | "missed"
  | "fear"
  | "changed"
  | "filed"
  | "returned"
  | "hardship"
  | "crime"
  | "departure"
  | "valid_status"
  | "status_unknown"
  | "family_unknown";

export function assessLegalScreening(input: ScreeningAnswers) {
  const a = screeningSchema.parse(input);
  const potential =
    a.status === "valid_tps" ||
    a.status === "pending_asylum" ||
    a.family === "usc_spouse" ||
    a.family === "usc_child21";
  const indicator =
    a.prior !== "no" ||
    ["court", "ice", "both", "unknown"].includes(a.missed ?? "no") ||
    a.crime === "yes"
      ? "urgent_review"
      : potential
        ? "potential_review"
        : "limited_information";
  const findings: ScreeningFinding[] = [];
  if (["expired_tps", "overstay", "undocumented"].includes(a.status)) findings.push("status");
  if (a.status === "valid_tps") findings.push("tps");
  if (a.status === "daca") findings.push("daca");
  if (a.status === "pending_asylum") findings.push("pending");
  findings.push(a.time === "under1" ? "asylum_timely" : "asylum_deadline");
  findings.push(a.time === "10plus" ? "cancellation10" : "cancellation_short");
  if (a.prior === "yes") findings.push("prior");
  if (a.prior === "unknown") findings.push("prior_unknown");
  findings.push(
    a.family === "usc_spouse" || a.family === "usc_child21"
      ? "immediate"
      : a.family === "lpr_family"
        ? "lpr"
        : a.family === "unknown"
          ? "family_unknown"
          : "no_family",
  );
  if (a.entry) findings.push("entry");
  if (a.missed && a.missed !== "no") findings.push("missed");
  if (a.fear === "yes" || a.fear === "unknown") findings.push("fear");
  if (a.changed === "yes") findings.push("changed");
  if (a.asylumFiled === "yes") findings.push("filed");
  if (a.returned === "yes") findings.push("returned");
  if (a.hardship === "yes") findings.push("hardship");
  if (a.crime === "yes" || a.crime === "unknown") findings.push("crime");
  if (a.departure === "considering") findings.push("departure");
  if (["green_card", "valid_visa"].includes(a.status)) findings.push("valid_status");
  if (["other", "unknown"].includes(a.status)) findings.push("status_unknown");
  return {
    version: "2026-11-15",
    indicator,
    findings,
    probability: null,
    eligibilityDetermined: false,
    counselReviewRequired: true,
    economicPlanningPriority: indicator === "limited_information" && a.assets.length > 0,
    home: a.assets.includes("home"),
    business: a.assets.includes("business"),
    equipment: a.assets.includes("equipment"),
    childDocuments: a.children === "yes",
    vehicleDocument: a.vehicle === "yes",
    habeasUnlocked: false,
    departurePlanning: a.departure === "considering",
  } as const;
}
export type ScreeningAssessment = ReturnType<typeof assessLegalScreening>;
