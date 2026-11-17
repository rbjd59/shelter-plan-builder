import { z } from "zod";

export const processQuestionSchema = z
  .object({
    conversationId: z.string().uuid().optional(),
    language: z.enum(["en", "es", "ht"]),
    messages: z
      .array(
        z.object({
          id: z.string().max(200),
          role: z.enum(["user", "assistant"]),
          parts: z
            .array(
              z.union([
                z.object({ type: z.literal("text"), text: z.string().max(4000) }),
                z.object({ type: z.literal("reasoning"), text: z.string().max(16000) }),
                z.object({ type: z.literal("step-start") }),
                z.object({ type: z.literal("custom") }),
              ]),
            )
            .max(20)
            .transform((parts) =>
              parts.filter((part): part is { type: "text"; text: string } => part.type === "text"),
            ),
        }),
      )
      .min(1)
      .max(50),
  })
  .refine(
    (input) =>
      input.messages.at(-1)?.role === "user" && JSON.stringify(input.messages).length <= 40000,
  );
