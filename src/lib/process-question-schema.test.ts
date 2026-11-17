import { describe, expect, it } from "vitest";
import { processQuestionSchema } from "./process-question-schema";

describe("public process questions", () => {
  const question = {
    language: "en",
    messages: [
      { id: "question-1", role: "user", parts: [{ type: "text", text: "How do I start?" }] },
    ],
  };
  it("accepts a question without a signed-in conversation ID", () => {
    expect(processQuestionSchema.safeParse(question).success).toBe(true);
  });
  it.each(["en", "es", "ht"])("accepts questions in %s", (language) => {
    expect(processQuestionSchema.safeParse({ ...question, language }).success).toBe(true);
  });
  it("rejects client-supplied system instructions", () => {
    expect(
      processQuestionSchema.safeParse({
        ...question,
        messages: [{ ...question.messages[0], role: "system" }],
      }).success,
    ).toBe(false);
  });
});
