import { createServerFn } from "@tanstack/react-start";

type ChatMessage = { role: "user" | "assistant"; content: string };
type ChatInput = { language: "en" | "es" | "ht"; messages: ChatMessage[] };

const languageNames = { en: "English", es: "Spanish", ht: "Haitian Creole" } as const;

export const askBusinessAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: ChatInput) => {
    if (!input || !["en", "es", "ht"].includes(input.language) || !Array.isArray(input.messages)) throw new Error("Invalid question");
    const messages = input.messages.slice(-8).map((message) => ({
      role: message.role === "assistant" ? "assistant" as const : "user" as const,
      content: String(message.content ?? "").trim().slice(0, 1600),
    })).filter((message) => message.content);
    if (!messages.length || messages.at(-1)?.role !== "user") throw new Error("Write a question first");
    if (messages.reduce((sum, message) => sum + message.content.length, 0) > 8000) throw new Error("Please start a new question");
    return { language: input.language, messages };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI help is not available right now. Please call or text 305-773-7737.");

    const [{ createOpenAI }, { streamText }, { createLovableAiGatewayRunIdFetch }] = await Promise.all([
      import("@ai-sdk/openai"),
      import("ai"),
      import("./ai-run-id.server"),
    ]);
    const runIdFetch = createLovableAiGatewayRunIdFetch();
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runIdFetch.fetch,
    });
    const result = streamText({
      model: provider.responses("openai/gpt-6.1-sol"),
      instructions: `You are the simple business helper on Do Not Forget Your Business. Reply only in ${languageNames[data.language]}. Use short sentences and everyday words for a reader with a fifth-grade education. Help with customer lists, job history, photos, invoices, receipts, basic job prices, business records, selling a service business, running it from abroad, or having family run it. The site serves owners of HVAC, landscaping, painting, cleaning, pressure washing, plumbing, lawn care, tree care, commercial cleaning, window cleaning, electrical, pool service, junk removal, remodeling, construction, roofing, pest control and handyman businesses. Explain that estimates are starting points, never promises of value or sale. Do not give immigration, legal, tax, loan or investment advice. For those questions, tell the user to call or text the paralegal at 305-773-7737. Never ask for passwords, Social Security numbers, bank login details or full card numbers. If asked about program prices, state only: tools on the site are free; optional setup help starts at $199/month; the optional trust is $899 and can be paid monthly; Florida company filing costs and third-party registered-agent fees are separate; an optional local director is $50/month; a separate signed broker agreement has a 10% commission on the sale price if the business sells. Do not invent other fees or discounts. Do not claim that a company, trust, EIN, payment account or sale has already been completed. Keep answers under 180 words unless the user asks for steps.`,
      messages: data.messages,
      maxOutputTokens: 1000,
      maxRetries: 0,
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const answer = (await result.text).trim();
    if (!answer) throw new Error("AI did not answer. Please call or text 305-773-7737.");
    return { answer };
  });
