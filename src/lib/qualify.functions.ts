import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*  Schemas                                                                    */
/* -------------------------------------------------------------------------- */

const intakeSchema = z.object({
  // Identity — minimal at this stage
  firstName: z.string().trim().min(1).max(80),
  state: z.string().trim().max(4),

  // Household
  householdSize: z.coerce.number().int().min(1).max(20),
  dependentsCount: z.coerce.number().int().min(0).max(20),
  childrenAges: z.string().trim().max(200).optional().default(""),
  usCitizenChildren: z.boolean(),
  primaryEarner: z.boolean(),

  // Time in U.S. / employment
  yearsInUsSelf: z.coerce.number().min(0).max(80).optional().default(0),
  yearsInUsChildren: z.coerce.number().min(0).max(80).optional().default(0),
  yearsWorking: z.coerce.number().min(0).max(60).optional().default(0),
  jobType: z.string().trim().max(120).optional().default(""),

  // Income
  payFrequency: z.enum(["daily", "weekly", "biweekly", "monthly"]),
  payAmountUsd: z.coerce.number().min(0).max(1_000_000),

  // Monthly expenses (USD)
  rent: z.coerce.number().min(0).max(100_000).optional().default(0),
  food: z.coerce.number().min(0).max(100_000).optional().default(0),
  medicine: z.coerce.number().min(0).max(100_000).optional().default(0),
  daycare: z.coerce.number().min(0).max(100_000).optional().default(0),
  schoolSupplies: z.coerce.number().min(0).max(100_000).optional().default(0),
  transportation: z.coerce.number().min(0).max(100_000).optional().default(0),
  restaurants: z.coerce.number().min(0).max(100_000).optional().default(0),
  childrenEntertainment: z.coerce.number().min(0).max(100_000).optional().default(0),
  otherExpenses: z.coerce.number().min(0).max(100_000).optional().default(0),
});

export type IntakeInput = z.infer<typeof intakeSchema>;

/* -------------------------------------------------------------------------- */
/*  Deterministic assessment                                                   */
/* -------------------------------------------------------------------------- */

function toMonthly(freq: IntakeInput["payFrequency"], amount: number): number {
  switch (freq) {
    case "daily":
      return amount * 21.7; // avg working days/month
    case "weekly":
      return amount * 4.333;
    case "biweekly":
      return amount * 2.1667;
    case "monthly":
      return amount;
  }
}

function fplMonthly(householdSize: number): number {
  // 2025 federal poverty guideline (contiguous 48), monthly.
  // 1 person ~ $1,304; +$460 per additional person.
  return 1304 + Math.max(0, householdSize - 1) * 460;
}

function assess(data: IntakeInput): {
  qualifies: boolean;
  tier: "nocost" | "reduced" | "standard";
  monthlyIncome: number;
  monthlyExpenses: number;
  fpl: number;
  ratio: number;
  reasoning: string;
} {
  const monthlyIncome = toMonthly(data.payFrequency, data.payAmountUsd);
  const monthlyExpenses =
    data.rent +
    data.food +
    data.medicine +
    data.daycare +
    data.schoolSupplies +
    data.transportation +
    data.restaurants +
    data.childrenEntertainment +
    data.otherExpenses;

  const fpl = fplMonthly(data.householdSize);
  const ratio = monthlyIncome / fpl;

  const hasKids = data.usCitizenChildren && data.dependentsCount > 0;
  const eligibleFamily = hasKids && data.primaryEarner;

  let tier: "nocost" | "reduced" | "standard" = "standard";
  if (eligibleFamily && ratio <= 1.5) tier = "nocost";
  else if (eligibleFamily && ratio <= 2.5) tier = "reduced";
  else if (ratio <= 2.0 && hasKids) tier = "reduced";

  const qualifies = tier !== "standard";

  const reasoning = [
    `Household of ${data.householdSize}. Monthly income ≈ $${Math.round(monthlyIncome)}.`,
    `Federal poverty line (monthly) for this size ≈ $${fpl}. Income is ${Math.round(ratio * 100)}% of FPL.`,
    `US-citizen children: ${data.usCitizenChildren ? "yes" : "no"} (${data.dependentsCount} dependents). Primary earner: ${data.primaryEarner ? "yes" : "no"}.`,
    `Reported monthly expenses ≈ $${Math.round(monthlyExpenses)}.`,
    qualifies
      ? `Meets criteria for ${tier.toUpperCase()} tier.`
      : `Does not meet the 150%-of-FPL threshold for reduced/no-cost pricing.`,
  ].join(" ");

  return { qualifies, tier, monthlyIncome, monthlyExpenses, fpl, ratio, reasoning };
}

/* -------------------------------------------------------------------------- */
/*  Server functions                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Step 1: comprehensive intake + pre-qualification assessment.
 * Saves the full questionnaire, computes a deterministic tier, and returns
 * whether the caller should proceed to document upload + Plaid.
 */
export const assessQualification = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => intakeSchema.parse(data))
  .handler(async ({ data }) => {
    const result = assess(data);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("qualify_submissions")
      .insert({
        full_name: data.firstName, // first name only at this stage
        household_size: data.householdSize,
        dependents_count: data.dependentsCount,
        us_citizen_children: data.usCitizenChildren,
        primary_earner: data.primaryEarner,
        monthly_income_cents: Math.round(result.monthlyIncome * 100),
        household_state: data.state || null,
        tier: result.tier,
        qualifies: result.qualifies,
        assessment_reasoning: result.reasoning,
        intake_data: data as unknown as Record<string, unknown>,
        status: result.qualifies ? "prequalified" : "declined_prequalification",
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    return {
      submissionId: row.id as string,
      qualifies: result.qualifies,
      tier: result.tier,
      reasoning: result.reasoning,
      monthlyIncome: Math.round(result.monthlyIncome),
      fpl: result.fpl,
    };
  });

/**
 * Step 2: user's full legal name + document URLs (uploads land in a separate
 * private bucket in a follow-up change).
 */
export const attachQualifyIdentity = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        submissionId: z.string().uuid(),
        fullName: z.string().trim().min(2).max(200),
        email: z.string().trim().email().max(200).optional().default(""),
        phone: z.string().trim().max(40).optional().default(""),
        idDocumentUrl: z.string().trim().max(1024).optional().default(""),
        incomeDocumentUrl: z.string().trim().max(1024).optional().default(""),
        supportLetterUrl: z.string().trim().max(1024).optional().default(""),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("qualify_submissions")
      .update({
        full_name: data.fullName,
        email: data.email ? data.email.toLowerCase() : null,
        phone: data.phone || null,
        id_document_url: data.idDocumentUrl || null,
        income_document_url: data.incomeDocumentUrl || null,
        support_letter_url: data.supportLetterUrl || null,
      })
      .eq("id", data.submissionId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Final step: sworn attestation, marks submission as submitted.
 */
export const finalizeQualifySubmission = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        submissionId: z.string().uuid(),
        attestationSignature: z.string().trim().min(2).max(200),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("qualify_submissions")
      .update({
        attestation_signed: true,
        attestation_signed_at: new Date().toISOString(),
        attestation_signature: data.attestationSignature,
        status: "submitted",
      })
      .eq("id", data.submissionId)
      .select("tier")
      .single();

    if (error) throw new Error(error.message);
    return { ok: true, tier: row.tier as string };
  });
