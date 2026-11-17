import { z } from "zod";

const assessmentLeadSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name").max(120),
  email: z.string().trim().email("Enter a valid email address").max(200),
  phone: z.string().trim().min(5, "Enter your phone number").max(40),
  language: z.enum(["en", "es", "ht"]),
  next: z.enum(["questions", "videos"]),
});

export type AssessmentLeadInput = z.input<typeof assessmentLeadSchema>;

export function parseAssessmentLead(input: unknown) {
  return assessmentLeadSchema.parse(input);
}
