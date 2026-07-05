import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LangSchema = z.enum(["en", "es", "ht"]);
const JsonRecord = z.record(z.string(), z.union([z.string(), z.boolean(), z.number(), z.null()]));

const SaveSchema = z.object({
  answers: JsonRecord,
  englishAnswers: z.record(z.string(), z.string()).default({}),
  approvals: z.record(z.string(), z.boolean()).default({}),
  language: LangSchema,
  sessionId: z.string().optional().nullable(),
});

export const loadIntakeDraft = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("intake_drafts")
      .select("answers, english_answers, approvals, language, session_id, updated_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data
      ? {
          answers: (data.answers ?? {}) as Record<string, string | boolean>,
          englishAnswers: (data.english_answers ?? {}) as Record<string, string>,
          approvals: (data.approvals ?? {}) as Record<string, boolean>,
          language: (data.language ?? "en") as "en" | "es" | "ht",
          sessionId: data.session_id ?? null,
          updatedAt: data.updated_at,
        }
      : null;
  });

export const saveIntakeDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => SaveSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("intake_drafts").upsert({
      user_id: userId,
      answers: data.answers,
      english_answers: data.englishAnswers,
      approvals: data.approvals,
      language: data.language,
      session_id: data.sessionId ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const clearIntakeDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("intake_drafts").delete().eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
