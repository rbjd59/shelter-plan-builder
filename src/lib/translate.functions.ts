// Batch field translation via Lovable AI Gateway (Gemini Flash).
// Used by the bilingual intake form: native → English (and English → native
// for the final review step).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const LANG_NAMES: Record<string, string> = {
  es: "Spanish",
  ht: "Haitian Creole",
  en: "English",
};

const inputSchema = z.object({
  sourceLang: z.enum(["es", "ht", "en"]),
  targetLang: z.enum(["es", "ht", "en"]),
  fields: z.record(z.string().min(1).max(64), z.string().max(8000)).refine(
    (o) => Object.keys(o).length > 0 && Object.keys(o).length <= 60,
    "1–60 fields per request",
  ),
});

export const translateFields = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => inputSchema.parse(d))
  .handler(async ({ data }) => {
    const { sourceLang, targetLang, fields } = data;
    if (sourceLang === targetLang) return { translations: fields };

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        translations: fields,
        error: "Translation service not configured",
      };
    }

    const src = LANG_NAMES[sourceLang] ?? sourceLang;
    const tgt = LANG_NAMES[targetLang] ?? targetLang;

    const system =
      `You are a certified legal translator for U.S. federal court forms ` +
      `(28 U.S.C. § 2241 habeas petitions and IFP applications). Translate ` +
      `the JSON field values from ${src} to ${tgt}. Preserve legal terms of ` +
      `art, proper nouns, addresses, dates, numbers, and money amounts ` +
      `exactly. Keep the same JSON keys. If a value is empty or only ` +
      `whitespace, return it unchanged. Return ONLY a valid JSON object ` +
      `mapping each input key to its translated string value. No markdown, ` +
      `no code fences, no commentary.`;

    const userMsg = JSON.stringify(fields);

    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: userMsg },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!resp.ok) {
        const body = await resp.text();
        console.error("translateFields gateway error:", resp.status, body);
        return {
          translations: fields,
          error: resp.status === 402 ? "Translation credits exhausted" : "Translation failed",
        };
      }

      const json = (await resp.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      let content = json.choices?.[0]?.message?.content ?? "";
      if (!content) return { translations: fields, error: "Empty translation response" };
      // Strip code fences if the model added them despite instructions.
      content = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(content);
      } catch {
        return { translations: fields, error: "Invalid translation JSON" };
      }
      const out: Record<string, string> = { ...fields };
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === "string" && k in fields) out[k] = v;
      }
      return { translations: out };
    } catch (e) {
      console.error("translateFields error:", e);
      return {
        translations: fields,
        error: e instanceof Error ? e.message : "Translation error",
      };
    }
  });

