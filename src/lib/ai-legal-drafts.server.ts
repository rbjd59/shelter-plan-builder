// AI-generated legal narrative for the Memorandum of Law.
// Uses Lovable AI Gateway → OpenAI GPT-5 to draft fact-driven sections
// (Statement of Facts, community ties argument, dangerousness rebuttal).
//
// CRITICAL: Citations, statutes, and case names are NOT AI-generated.
// Only prose narrative from the client's own intake answers is drafted here.
// Everything comes back marked DRAFT and requires attorney review.

import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const MODEL_ID = "openai/gpt-5";

const MemoNarrativeSchema = z.object({
  statement_of_facts: z
    .string()
    .describe(
      "3-6 numbered paragraphs restating ONLY the facts the client provided in intake. " +
        "Do not add facts. Do not embellish. Use neutral third-person legal prose. " +
        "If a fact is missing, write [FACT: <what is missing>] in brackets so the attorney sees the gap.",
    ),
  community_ties_argument: z
    .string()
    .describe(
      "1-2 paragraphs arguing petitioner is not a flight risk, based on the family, employment, " +
        "residence, and community ties from intake. Do not cite cases. Do not invent details.",
    ),
  dangerousness_rebuttal: z
    .string()
    .describe(
      "1-2 paragraphs arguing petitioner is not a danger to the community, based on criminal " +
        "history (or absence thereof) from intake. Do not cite cases. Do not invent priors.",
    ),
});

export type MemoNarrative = z.infer<typeof MemoNarrativeSchema>;

const EMPTY_NARRATIVE: MemoNarrative = {
  statement_of_facts: "[AI DRAFT UNAVAILABLE — attorney to draft Statement of Facts from intake answers.]",
  community_ties_argument: "[AI DRAFT UNAVAILABLE — attorney to draft community ties argument.]",
  dangerousness_rebuttal: "[AI DRAFT UNAVAILABLE — attorney to draft dangerousness rebuttal.]",
};

function buildPrompt(answers: Record<string, unknown>): string {
  const g = (k: string) => {
    const v = answers[k];
    return v == null || v === "" ? "(not provided)" : String(v);
  };
  return `You are a paralegal drafting the fact-driven narrative sections of a Memorandum of Law
supporting a Petition for Writ of Habeas Corpus under 28 U.S.C. § 2241, for an immigration
detainee. An attorney will review, correct, and finalize your draft.

STRICT RULES:
- Use ONLY the facts below. Do not invent names, dates, jobs, family members, or events.
- Do not include legal citations, case names, statutes, or Latin phrases. The attorney inserts those.
- Where a required fact is missing, write "[FACT: description]" in brackets so the attorney sees the gap.
- Use neutral third-person legal prose ("Petitioner"). Do not use "I" or "you".
- Do not repeat these instructions in the output.

CLIENT INTAKE ANSWERS:
- Full name: ${g("full_name")}
- A-number: ${g("a_number")}
- Date of birth: ${g("date_of_birth")}
- Place of birth: ${g("place_of_birth")}
- Country of origin: ${g("country_of_origin")}
- Years in the United States: ${g("years_in_us")}
- Date taken into ICE custody: ${g("date_taken_into_custody")}
- Detention facility: ${g("facility_name")}
- Community ties / family in US: ${g("community_ties")}
- Employer / employment history: ${g("employer")}
- Criminal history: ${g("criminal_history")}
- Prior immigration proceedings: ${g("prior_immigration_proceedings")}
- Emergency contact: ${g("emergency_contact_name")} (${g("emergency_contact_relation")})
- Secondary contact: ${g("emergency_contact_2_name")} (${g("emergency_contact_2_relation")})

Draft the three sections now.`;
}

export async function generateMemoNarrative(
  answers: Record<string, unknown>,
): Promise<{ narrative: MemoNarrative; model: string; ok: boolean; error?: string }> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) {
    return { narrative: EMPTY_NARRATIVE, model: MODEL_ID, ok: false, error: "Missing LOVABLE_API_KEY" };
  }

  try {
    const gateway = createLovableAiGatewayProvider(key, { structuredOutputs: true });
    const model = gateway(MODEL_ID);
    const { output } = await generateText({
      model,
      output: Output.object({ schema: MemoNarrativeSchema }),
      prompt: buildPrompt(answers),
    });
    return { narrative: output, model: MODEL_ID, ok: true };
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      // Try to salvage raw text if the schema round-trip failed.
      const raw = (error as { text?: string }).text ?? "";
      return {
        narrative: {
          ...EMPTY_NARRATIVE,
          statement_of_facts: raw || EMPTY_NARRATIVE.statement_of_facts,
        },
        model: MODEL_ID,
        ok: false,
        error: "AI response did not match schema; raw text preserved for attorney review.",
      };
    }
    const message = error instanceof Error ? error.message : String(error);
    return { narrative: EMPTY_NARRATIVE, model: MODEL_ID, ok: false, error: message };
  }
}
