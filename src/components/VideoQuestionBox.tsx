import { useEffect, useMemo, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Conversation, ConversationContent } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useLang } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { processQuestionSchema } from "@/lib/process-question-schema";
const COPY = {
  en: {
    heading: "Have questions before you set up your account?",
    intro: "If you have questions about the process before you set up your account, ask them here.",
    privacy: "Do not share private details. These questions are not saved to your account.",
    placeholder: "Ask a question",
    new: "New conversation",
    sign: "Sign in to ask Claude",
    waiting: "Claude is answering…",
    send: "Send question",
    stop: "Stop",
    saved: "Your conversations",
    empty: "Ask Claude",
  },
  es: {
    heading: "¿Tiene preguntas antes de crear su cuenta?",
    intro: "Si tiene preguntas sobre el proceso antes de crear su cuenta, hágalas aquí.",
    privacy: "No comparta datos privados. Estas preguntas no se guardan en su cuenta.",
    placeholder: "Escriba una pregunta",
    new: "Nueva conversación",
    sign: "Inicie sesión para preguntar a Claude",
    waiting: "Claude está respondiendo…",
    send: "Enviar pregunta",
    stop: "Detener",
    saved: "Sus conversaciones",
    empty: "Pregunte a Claude",
  },
  ht: {
    heading: "Ou gen kesyon anvan ou kreye kont ou?",
    intro: "Si ou gen kesyon sou pwosesis la anvan ou kreye kont ou, poze yo isit la.",
    privacy: "Pa pataje detay prive. Kesyon sa yo pa sere nan kont ou.",
    placeholder: "Poze yon kesyon",
    new: "Nouvo konvèsasyon",
    sign: "Konekte pou poze Claude kesyon",
    waiting: "Claude ap reponn…",
    send: "Voye kesyon",
    stop: "Sispann",
    saved: "Konvèsasyon ou yo",
    empty: "Poze Claude kesyon",
  },
};
export function SavedVideoChat({
  id,
  messages: initial,
  anonymous = false,
}: {
  id: string;
  messages: UIMessage[];
  anonymous?: boolean;
}) {
  const { lang } = useLang();
  const copy = COPY[lang];
  const ref = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/public/video-questions",
        body: { conversationId: anonymous ? undefined : id, language: lang },
        headers: async (): Promise<Record<string, string>> => {
          if (anonymous) return {};
          const { data } = await supabase.auth.getSession();
          return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
        },
      }),
    [anonymous, id, lang],
  );
  const { messages, sendMessage, status, stop, error } = useChat({
    id,
    messages: initial,
    transport,
  });
  const busy = status === "submitted" || status === "streaming";
  useEffect(() => {
    if (status === "ready" && document.activeElement?.tagName !== "INPUT")
      ref.current?.focus({ preventScroll: true });
  }, [status]);
  return (
    <div className="text-left">
      <Conversation className="h-64" aria-label="Claude" aria-live="polite">
        <ConversationContent>
          {messages.map((message) => (
            <Message from={message.role} key={message.id}>
              <MessageContent>
                {message.parts.map((part, i) =>
                  part.type === "text" ? (
                    <MessageResponse key={i} skipHtml rehypePlugins={[]}>
                      {part.text}
                    </MessageResponse>
                  ) : null,
                )}
              </MessageContent>
            </Message>
          ))}
          {busy && <Shimmer>{copy.waiting}</Shimmer>}
        </ConversationContent>
      </Conversation>
      {error && (
        <p role="alert" className="text-destructive">
          {error.message}
        </p>
      )}
      <PromptInput
        onSubmit={async ({ text }) => {
          if (
            !busy &&
            text.trim() &&
            processQuestionSchema.safeParse({
              language: lang,
              messages: [{ id: "question", role: "user", parts: [{ type: "text", text }] }],
            }).success
          ) {
            await sendMessage({ text });
            ref.current?.focus({ preventScroll: true });
          }
        }}
      >
        <PromptInputTextarea
          ref={ref}
          aria-label={copy.placeholder}
          placeholder={copy.placeholder}
          maxLength={4000}
          disabled={busy}
        />
        <PromptInputFooter className="justify-end">
          <PromptInputSubmit
            status={status}
            disabled={status === "submitted"}
            onStop={() => void stop()}
            aria-label={status === "streaming" ? copy.stop : copy.send}
          />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
export default function VideoQuestionBox() {
  const { lang } = useLang();
  const copy = COPY[lang];
  return (
    <section
      id="process-questions"
      className="mx-auto w-full max-w-3xl px-4 py-8 text-left text-foreground"
    >
      <h2 className="mb-3 text-xl font-semibold">{copy.heading}</h2>
      <p className="mb-4">{copy.intro}</p>
      <div className="rounded-lg border border-border bg-background p-4">
        <SavedVideoChat key={lang} id={`process-help-${lang}`} messages={[]} anonymous />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{copy.privacy}</p>
    </section>
  );
}
