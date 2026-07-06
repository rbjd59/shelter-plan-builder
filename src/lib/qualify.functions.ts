import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const householdSchema = z.object({
  fullName: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().default(""),
  householdSize: z.coerce.number().int().min(1).max(20),
  dependentsCount: z.coerce.number().int().min(0).max(20),
  usCitizenChildren: z.boolean(),
  primaryEarner: z.boolean(),
  monthlyIncomeUsd: z.coerce.number().min(0).max(1_000_000),
  state: z.string().trim().max(4).optional().default(""),
});

function computeTier(input: {
  householdSize: number;
  monthlyIncomeUsd: number;
  usCitizenChildren: boolean;
  primaryEarner: boolean;
}): "nocost" | "reduced" | "standard" {
  // 2025 federal poverty line (approx), monthly.
  // 1 person ~ $1,304 ; +$460 per additional person.
  const fpl = 1304 + Math.max(0, input.householdSize - 1) * 460;
  const ratio = input.monthlyIncomeUsd / fpl;

  const eligibleFamily = input.usCitizenChildren && input.primaryEarner;

  if (eligibleFamily && ratio <= 1.5) return "nocost";
  if (eligibleFamily && ratio <= 2.5) return "reduced";
  if (ratio <= 2.0) return "reduced";
  return "standard";
}

/**
 * Creates a new qualification submission draft. Returns the row id so the
 * client can attach documents, Plaid, and attestation to it.
 */
export const createQualifySubmission = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => householdSchema.parse(data))
  .handler(async ({ data }) => {
    const tier = computeTier({
      householdSize: data.householdSize,
      monthlyIncomeUsd: data.monthlyIncomeUsd,
      usCitizenChildren: data.usCitizenChildren,
      primaryEarner: data.primaryEarner,
    });

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("qualify_submissions")
      .insert({
        full_name: data.fullName,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        household_size: data.householdSize,
        dependents_count: data.dependentsCount,
        us_citizen_children: data.usCitizenChildren,
        primary_earner: data.primaryEarner,
        monthly_income_cents: Math.round(data.monthlyIncomeUsd * 100),
        household_state: data.state || null,
        tier,
        status: "draft",
      })
      .select("id, tier")
      .single();

    if (error) throw new Error(error.message);
    return { submissionId: row.id as string, tier: row.tier as string };
  });

/**
 * Finalizes a submission after Plaid + documents + attestation.
 */
export const finalizeQualifySubmission = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        submissionId: z.string().uuid(),
        attestationSignature: z.string().trim().min(2).max(200),
        idDocumentUrl: z.string().trim().max(1024).optional().default(""),
        incomeDocumentUrl: z.string().trim().max(1024).optional().default(""),
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
        id_document_url: data.idDocumentUrl || null,
        income_document_url: data.incomeDocumentUrl || null,
        status: "submitted",
      })
      .eq("id", data.submissionId)
      .select("tier")
      .single();

    if (error) throw new Error(error.message);
    return { ok: true, tier: row.tier as string };
  });
