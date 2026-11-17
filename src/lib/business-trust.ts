import { z } from "zod";

export const BUSINESS_MONTHLY_FEE = 199;
export const BUSINESS_TRUST_FEE = 899;
export const businessFileSchema = z
  .object({
    name: z.string().max(200).default(""),
    entity: z.string().max(200).default(""),
    assets: z.string().max(3000).default(""),
    trustMode: z.enum(["new", "existing_home"]).default("new"),
    trustName: z.string().max(200).default(""),
    monthlyFee: z.literal(BUSINESS_MONTHLY_FEE).default(BUSINESS_MONTHLY_FEE),
    feeStatus: z.enum(["proposed", "agreed", "active", "cancelled"]).default("proposed"),
    startDate: z
      .string()
      .refine(
        (value) =>
          value === "" || (/^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value))),
        "Choose a valid date.",
      )
      .default(""),
    paymentPlan: z.string().max(2000).default(""),
  })
  .default({});
export type BusinessFile = z.infer<typeof businessFileSchema>;
export const emptyBusinessFile = businessFileSchema.parse({});
export function isTrustDocument(type: string) {
  return type === "service_trust" || type === "service_business_trust";
}
export function businessTrustDetails(
  client: { full_name: string | null; answers: unknown },
  file: Record<string, unknown>,
) {
  const business = businessFileSchema.parse(file.business ?? {});
  const answers = (client.answers ?? {}) as Record<string, unknown>;
  return {
    ...business,
    name: business.name || String(answers.businessName ?? ""),
    entity: business.entity || String(answers.entity ?? ""),
    trustName:
      business.trustMode === "existing_home" ? String(file.trustName ?? "") : business.trustName,
  };
}
