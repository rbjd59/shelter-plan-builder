import { z } from "zod";

export const REVIEW_NEED_LABELS = {
  legal: "Legal Screener",
  home: "Home Protection",
  business: "Business/Route Preservation",
  family: "Emergency Family Plan",
} as const;

export type ReviewNeed = keyof typeof REVIEW_NEED_LABELS;

export const requestReviewSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(40)
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 7 && digits.length <= 15;
    }),
  email: z.string().trim().email().max(254),
  language: z.enum(["en", "es", "ht"]),
  need: z.enum(["legal", "home", "business", "family"]),
  website: z.literal("").optional(),
});

export type RequestReviewInput = z.infer<typeof requestReviewSchema>;
