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
      `You are a certified legal translator working on U.S. federal court forms ` +
      `(28 U.S.C. § 2241 habeas petitions and in forma pauperis applications). ` +
      `Translate the field values from ${src} to ${tgt}. Preserve legal terms ` +
      `of art, proper nouns, addresses, dates, numbers, and money amounts exactly. ` +
      `Do not add commentary. Do not translate field keys. Return ONLY the JSON ` +
      `object via the provided tool. If a value is empty or just whitespace, ` +
      `return it unchanged.`;

    const userMsg = `Translate these field values:\n${JSON.stringify(fields, null, 2)}`;

    try {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: system },
            { role: "user", content: userMsg },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_translations",
                description: "Return the translated field values.",
                parameters: {
                  type: "object",
                  properties: {
                    translations: {
                      type: "object",
                      description: "Map of fieldKey → translated value.",
                      additionalProperties: { type: "string" },
                    },
                  },
                  required: ["translations"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "return_translations" },
          },
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
        choices?: Array<{
          message?: {
            tool_calls?: Array<{ function?: { arguments?: string } }>;
          };
        }>;
      };
      const argStr = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      if (!argStr) return { translations: fields, error: "Empty translation response" };
      const parsed = JSON.parse(argStr) as { translations?: Record<string, string> };
      const out: Record<string, string> = { ...fields };
      for (const [k, v] of Object.entries(parsed.translations ?? {})) {
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
