import { createServerFn } from "@tanstack/react-start";
import { score } from "./score";
import type { Answers } from "./questions";

type Input = { language: string; answers: Answers; help: string[]; signedName: string };

export const submitAssessment = createServerFn({ method: "POST" })
  .inputValidator((d: Input) => {
    if (!d || typeof d.answers !== "object" || JSON.stringify(d).length > 50_000) throw new Error("Invalid");
    if (typeof d.signedName !== "string" || d.signedName.trim().length < 2) throw new Error("Signature needed");
    return { language: String(d.language).slice(0, 5), answers: d.answers, help: (d.help ?? []).map(String).slice(0, 60), signedName: d.signedName.trim().slice(0, 120) };
  })
  .handler(async ({ data }) => {
    const results = score(data.answers);
    const callAt = new Date(Date.now() + 2 * 24 * 3600 * 1000);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const s = (k: string) => (typeof data.answers[k] === "string" ? String(data.answers[k]).slice(0, 200) : null);
    const { error } = await supabaseAdmin.from("assessments").insert({
      language: data.language, full_name: s("name"), phone: s("phone"), email: s("email"),
      answers: data.answers as never, results: results as never, help_requested: data.help,
      authorization_signed_name: data.signedName, authorization_signed_at: new Date().toISOString(),
      paralegal_call_at: callAt.toISOString(),
    });
    if (error) throw new Error("Could not save. Please try again.");
    return { results, callAt: callAt.toISOString() };
  });
