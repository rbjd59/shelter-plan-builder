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
          parts: z.array(z.object({ type: z.literal("text"), text: z.string().max(4000) })).max(10),
        }),
      )
      .min(1)
      .max(50),
  })
  .refine(
    (input) =>
      input.messages.at(-1)?.role === "user" && JSON.stringify(input.messages).length <= 40000,
  );
