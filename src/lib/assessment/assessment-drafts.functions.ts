import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Answers } from "./questions";

const language = z.enum(["en", "es", "ht"]);
const answers = z.record(z.string().max(100), z.union([z.string().max(2000), z.array(z.string().max(200)).max(30)]));
const contacts = z.array(z.object({ n: z.string().max(160), p: z.string().max(60) })).max(3);

const saveSchema = z.object({
  language,
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(5).max(40),
  smsConsent: z.boolean(),
  answers,
  contacts,
  help: z.array(z.string().max(100)).max(200),
  currentStep: z.number().int().min(0).max(20),
  status: z.enum(["in_progress", "later"]),
});

export const loadAssessmentDraft = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("assessment_drafts")
      .select("language, full_name, email, phone, sms_consent, answers, contacts, help_requested, current_step, status, updated_at")
      .eq("user_id", context.userId).maybeSingle();
    if (error) throw new Error("Could not load your saved questions.");
    if (!data) return null;
    return {
      language: data.language as "en" | "es" | "ht",
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      smsConsent: data.sms_consent,
      answers: (data.answers ?? {}) as Answers,
      contacts: contacts.parse(data.contacts ?? []),
      help: data.help_requested ?? [],
      currentStep: data.current_step,
      status: data.status as "in_progress" | "later",
      updatedAt: data.updated_at,
    };
  });

export const saveAssessmentDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const data = saveSchema.parse(input);
    if (JSON.stringify(data).length > 100_000) throw new Error("Your saved answers are too large.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { data: existing, error: readError } = await context.supabase.from("assessment_drafts")
      .select("sms_consent_at").eq("user_id", context.userId).maybeSingle();
    if (readError) throw new Error("Could not save your progress. Please try again.");
    const consentAt = data.smsConsent ? existing?.sms_consent_at ?? new Date().toISOString() : null;
    const { error } = await context.supabase.from("assessment_drafts").upsert({
      user_id: context.userId,
      language: data.language,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      sms_consent: data.smsConsent,
      sms_consent_at: consentAt,
      answers: data.answers,
      contacts: data.contacts,
      help_requested: data.help,
      current_step: data.currentStep,
      status: data.status,
      reminder_sent_at: null,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error("Could not save your progress. Please try again.");
    return { ok: true as const, savedAt: new Date().toISOString() };
  });
