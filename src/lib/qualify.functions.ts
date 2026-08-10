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

function computeSignals(data: IntakeInput) {
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
  return { monthlyIncome, monthlyExpenses, fpl, ratio };
}

type AssessResult = {
  qualifies: boolean;
  tier: "nocost" | "reduced" | "standard";
  discountPct: number;
  reasoning: string;
  signals: ReturnType<typeof computeSignals>;
};

async function aiAssess(data: IntakeInput): Promise<AssessResult> {
  const signals = computeSignals(data);
  const fallback = (reason: string): AssessResult => {
    const hasKids = data.usCitizenChildren && data.dependentsCount > 0;
    let tier: "nocost" | "reduced" | "standard" = "standard";
    let discountPct = 0;
    if (signals.ratio <= 1.0 && hasKids && data.primaryEarner) {
      tier = "nocost";
      discountPct = 100;
    } else if (signals.ratio <= 1.5) {
      tier = "reduced";
      discountPct = 10;
    }
    return {
      qualifies: tier !== "standard",
      tier,
      discountPct,
      reasoning: `${reason} Your income is about ${Math.round(signals.ratio * 100)}% of the federal poverty line for a household of ${data.householdSize}.`,
      signals,
    };
  };

  const key = process.env.LOVABLE_API_KEY;
  if (!key) return fallback("Automatic estimate (AI unavailable).");

  try {
    const { generateText, Output } = await import("ai");
    const { z: zod } = await import("zod");
    const { createLovableAiGatewayProvider } = await import("@/lib/ai-gateway.server");

    const schema = zod.object({
      tier: zod.enum(["nocost", "reduced", "standard"]),
      qualifies: zod.boolean(),
      discount_pct: zod.number(),
      reasoning: zod.string(),
    });

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-2.5-flash");

    const prompt = `You are an eligibility screener for a low-cost immigration legal defense program.

Applicant data:
- Household size: ${data.householdSize} (${data.dependentsCount} dependents). US-citizen/resident children: ${data.usCitizenChildren ? "yes" : "no"}.
- Primary household earner: ${data.primaryEarner ? "yes" : "no"}.
- Monthly income (computed): $${Math.round(signals.monthlyIncome)}.
- Federal poverty line (FPL) for this household size: $${signals.fpl}/month.
- Income is ${Math.round(signals.ratio * 100)}% of FPL.
- Monthly reported expenses total: $${Math.round(signals.monthlyExpenses)}.
- Job type: ${data.jobType || "(unspecified)"}. Years in US: ${data.yearsInUsSelf}. Years working: ${data.yearsWorking}. State: ${data.state || "(unspecified)"}.

Assign a tier:
- "nocost" — income at or below 100% of FPL AND has US-citizen/resident children AND is primary earner. Sets qualifies=true, discount_pct=100.
- "reduced" — income at or below 150% of FPL (or borderline cases where expenses eat income). Sets qualifies=true, discount_pct=10 (a 10% discount off the standard package).
- "standard" — clearly above 150% of FPL. Sets qualifies=false, discount_pct=0. They will be offered the standard package, which is currently free (pro bono).

Write a warm 2-3 sentence reasoning addressed to the applicant ("you"), plain English, no legal jargon. If they don't qualify for no-cost, still be encouraging.`;

    const { output } = await generateText({
      model,
      output: Output.object({ schema }),
      prompt,
    });

    const tier = output.tier;
    const discountPct = tier === "nocost" ? 100 : tier === "reduced" ? 10 : 0;
    return {
      qualifies: tier !== "standard",
      tier,
      discountPct,
      reasoning: output.reasoning,
      signals,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return fallback(`Using automatic rules (${msg}).`);
  }
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
    const result = await aiAssess(data);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("qualify_submissions")
      .insert({
        full_name: data.firstName,
        household_size: data.householdSize,
        dependents_count: data.dependentsCount,
        us_citizen_children: data.usCitizenChildren,
        primary_earner: data.primaryEarner,
        monthly_income_cents: Math.round(result.signals.monthlyIncome * 100),
        household_state: data.state || null,
        tier: result.tier,
        qualifies: result.qualifies,
        assessment_reasoning: result.reasoning,
        intake_data: data as any,
        status: result.qualifies ? "prequalified" : "declined_prequalification",
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);

    return {
      submissionId: row.id as string,
      qualifies: result.qualifies,
      tier: result.tier,
      discountPct: result.discountPct,
      reasoning: result.reasoning,
      monthlyIncome: Math.round(result.signals.monthlyIncome),
      fpl: result.signals.fpl,
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
        email: z.union([z.string().trim().email().max(200), z.literal("")]).optional().default(""),
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
