import { useEffect, useMemo, useRef, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { BUSINESS_PARALEGAL_PHONE, BUSINESS_PARALEGAL_PHONE_DISPLAY } from "@/lib/business-config";
import { CalendarDays, MessageCircle, Phone } from "lucide-react";
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
type ChatMessage = { id: number; sender: "visitor" | "staff" | "system"; body: string; created_at: string };
type ChatView = {
  conversation: {
    id: string;
    language: "en" | "es" | "ht";
    status: "waiting_staff" | "active" | "ai" | "closed";
    callback_at: string | null;
    callback_timezone: string | null;
    assigned_name: string | null;
  };
  messages: ChatMessage[];
};

const LIVE_COPY = {
  en: {
    heading: "Have questions before you set up your account?",
    intro: "Talk with our team about the process. You do not need an account.",
    call: "Call 305-337-7713",
    text: "Text us",
    schedule: "Set up a call",
    live: "Start live chat",
    holding: "Please hold while we connect you to the law office.",
    busy: "Our paralegals and law office staff are unable to answer this chat right now.",
    aiQuestion: "Would you like to chat with our AI assistant?",
    yesAi: "Yes, chat with the AI assistant",
    noAi: "No, I want a call",
    wait: "Keep waiting for a person",
    aiPrivacy: "The AI assistant gives general process information. Do not share private details.",
    placeholder: "Write a message to the law office",
    send: "Send",
    joined: "A law office staff member joined this chat.",
    waiting: "Waiting for a staff member. You can leave a message or choose a call.",
    name: "Your name",
    phone: "Phone number for the call",
    time: "Pick a day and time",
    saveCall: "Save my call",
    callSaved: "Your call is saved. A paralegal will call you at this time:",
    back: "Back to contact choices",
    closed: "This chat is closed. You can call or start a new chat.",
    newChat: "Start a new chat",
    error: "We could not connect. Please call or text us.",
  },
  es: {
    heading: "¿Tiene preguntas antes de crear su cuenta?",
    intro: "Hable con nuestro equipo sobre el proceso. No necesita una cuenta.",
    call: "Llame al 305-337-7713",
    text: "Envíenos un texto",
    schedule: "Programe una llamada",
    live: "Empiece el chat en vivo",
    holding: "Espere mientras le comunicamos con el bufete.",
    busy: "Nuestros asistentes legales y el personal del bufete no pueden responder este chat ahora.",
    aiQuestion: "¿Quiere hablar con nuestro asistente de AI?",
    yesAi: "Sí, hablar con el asistente de AI",
    noAi: "No, quiero una llamada",
    wait: "Seguir esperando a una persona",
    aiPrivacy: "El asistente de AI da información general del proceso. No comparta datos privados.",
    placeholder: "Escriba un mensaje al bufete",
    send: "Enviar",
    joined: "Una persona del bufete entró al chat.",
    waiting: "Esperando a una persona. Puede dejar un mensaje o elegir una llamada.",
    name: "Su nombre",
    phone: "Teléfono para la llamada",
    time: "Elija día y hora",
    saveCall: "Guardar mi llamada",
    callSaved: "Su llamada está guardada. Un asistente legal le llamará a esta hora:",
    back: "Volver a las opciones de contacto",
    closed: "Este chat terminó. Puede llamar o empezar otro chat.",
    newChat: "Empezar otro chat",
    error: "No pudimos conectar. Llámenos o envíe un texto.",
  },
  ht: {
    heading: "Ou gen kesyon anvan ou kreye kont ou?",
    intro: "Pale ak ekip nou an sou pwosesis la. Ou pa bezwen yon kont.",
    call: "Rele 305-337-7713",
    text: "Voye mesaj bay nou",
    schedule: "Pwograme yon apèl",
    live: "Kòmanse chat an dirèk",
    holding: "Tanpri tann pandan n ap konekte w ak biwo avoka a.",
    busy: "Paralegal nou yo ak moun nan biwo avoka a pa ka reponn chat sa a kounye a.",
    aiQuestion: "Èske ou vle pale ak asistan AI nou an?",
    yesAi: "Wi, pale ak asistan AI a",
    noAi: "Non, mwen vle yon apèl",
    wait: "Kontinye tann yon moun",
    aiPrivacy: "Asistan AI a bay enfòmasyon jeneral sou pwosesis la. Pa pataje detay prive.",
    placeholder: "Ekri yon mesaj pou biwo avoka a",
    send: "Voye",
    joined: "Yon moun nan biwo avoka a antre nan chat la.",
    waiting: "N ap tann yon moun. Ou ka kite yon mesaj oswa chwazi yon apèl.",
    name: "Non ou",
    phone: "Nimewo pou apèl la",
    time: "Chwazi jou ak lè",
    saveCall: "Sove apèl mwen",
    callSaved: "Apèl ou a sove. Yon paralegal pral rele w nan lè sa a:",
    back: "Retounen nan opsyon kontak yo",
    closed: "Chat sa a fini. Ou ka rele oswa kòmanse yon lòt chat.",
    newChat: "Kòmanse yon lòt chat",
    error: "Nou pa t ka konekte. Rele nou oswa voye yon mesaj.",
  },
} as const;

export default function VideoQuestionBox() {
  const { lang } = useLang();
  const copy = LIVE_COPY[lang];
  const [screen, setScreen] = useState<"choices" | "chat" | "callback" | "ai">("choices");
  const [session, setSession] = useState<{ id: string; key: string } | null>(null);
  const [view, setView] = useState<ChatView | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showFallback, setShowFallback] = useState(false);

  const action = async (body: Record<string, unknown>) => {
    const response = await fetch("/api/public/live-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || copy.error);
    return result;
  };
  const begin = async (destination: "chat" | "callback" = "chat") => {
    setBusy(true);
    setError("");
    try {
      if (!session) {
        const result = await action({ action: "start", language: lang });
        setSession({ id: result.conversation.id, key: result.key });
        setView({ conversation: result.conversation, messages: result.messages });
        setShowFallback(false);
      }
      setScreen(destination);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : copy.error);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!session || screen !== "chat") return;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch(`/api/public/live-chat?id=${session.id}&key=${session.key}`, { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json();
        if (active) setView(result);
      } catch { /* keep the current chat visible during a network retry */ }
    };
    void poll();
    const interval = window.setInterval(() => void poll(), 3000);
    const fallback = window.setTimeout(() => { if (active) setShowFallback(true); }, 7000);
    return () => { active = false; window.clearInterval(interval); window.clearTimeout(fallback); };
  }, [session, screen]);

  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === "#schedule-call") {
        document.getElementById("process-questions")?.scrollIntoView({ behavior: "smooth" });
        void begin("chat");
      }
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const staffActive = view?.conversation.status === "active";
  const callbackAt = view?.conversation.callback_at;
  return (
    <section id="process-questions" className="home-contact-section">
      <div className="home-contact-card">
        <div className="home-contact-heading">
          <MessageCircle aria-hidden="true" />
          <h2>{copy.heading}</h2>
          <p>{copy.intro}</p>
        </div>
        <div className="home-contact-actions">
          <Button asChild size="lg"><a href={`tel:${BUSINESS_PARALEGAL_PHONE}`}><Phone />{copy.call}</a></Button>
          <Button variant="secondary" size="lg" disabled={busy} onClick={() => void begin("chat")}><MessageCircle />{copy.live}</Button>
        </div>
        {error && <p role="alert" className="home-contact-error">{error}</p>}
        {screen === "chat" && <div className="home-live-panel">
          {!staffActive && !showFallback && <p role="status" className="home-hold-message">{copy.holding}</p>}
          {staffActive && <p role="status" className="home-joined-message">{copy.joined} {view?.conversation.assigned_name}</p>}
          {!staffActive && showFallback && <div className="home-fallback" role="status">
            <p><b>{copy.busy}</b></p>
            <p>{copy.aiQuestion}</p>
            <div className="home-contact-actions">
              <Button onClick={async () => {
                if (!session) return;
                setBusy(true);
                try { await action({ action: "mode", id: session.id, key: session.key, mode: "ai" }); setScreen("ai"); }
                catch (cause) { setError(cause instanceof Error ? cause.message : copy.error); }
                finally { setBusy(false); }
              }} disabled={busy}>{copy.yesAi}</Button>
              <Button variant="ghost" onClick={() => setShowFallback(false)}>{copy.wait}</Button>
            </div>
          </div>}
          {!staffActive && !showFallback && <p className="text-sm text-muted-foreground">{copy.waiting}</p>}
          <div className="home-staff-messages" aria-live="polite">
            {view?.messages.map((item) => <p key={item.id} className={item.sender === "staff" ? "home-staff-reply" : "home-visitor-reply"}>{item.body}</p>)}
          </div>
          {view?.conversation.status !== "closed" ? <form onSubmit={async (event) => {
            event.preventDefault();
            if (!session || !message.trim()) return;
            setBusy(true); setError("");
            try {
              const result = await action({ action: "message", id: session.id, key: session.key, text: message });
              setView(result); setMessage("");
            } catch (cause) { setError(cause instanceof Error ? cause.message : copy.error); }
            finally { setBusy(false); }
          }} className="home-staff-compose">
            <label className="sr-only" htmlFor="staff-chat-message">{copy.placeholder}</label>
            <textarea id="staff-chat-message" rows={2} maxLength={4000} placeholder={copy.placeholder} value={message} onChange={(event) => setMessage(event.target.value)} />
            <Button type="submit" disabled={busy || !message.trim()}>{copy.send}</Button>
          </form> : <p>{copy.closed}</p>}
          <Button variant="ghost" onClick={() => setScreen("choices")}>{copy.back}</Button>
        </div>}
        {screen === "callback" && <div className="home-callback-panel">
          {callbackAt ? <div role="status" className="home-callback-confirmation">
            <CalendarDays aria-hidden="true" />
            <p><b>{copy.callSaved}</b></p>
            <p>{new Date(callbackAt).toLocaleString(lang === "es" ? "es-US" : lang === "ht" ? "fr-HT" : "en-US")}</p>
            <Button variant="outline" onClick={() => setScreen("choices")}>{copy.back}</Button>
          </div> : <form onSubmit={async (event) => {
            event.preventDefault();
            if (!session) return;
            const form = new FormData(event.currentTarget);
            setBusy(true); setError("");
            try {
              const result = await action({
                action: "callback", id: session.id, key: session.key,
                name: String(form.get("name")), phone: String(form.get("phone")),
                startsAt: new Date(String(form.get("time"))).toISOString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              });
              setView(result);
            } catch (cause) { setError(cause instanceof Error ? cause.message : copy.error); }
            finally { setBusy(false); }
          }} className="home-callback-form">
            <label>{copy.name}<input name="name" required minLength={2} maxLength={200} autoComplete="name" /></label>
            <label>{copy.phone}<input name="phone" required minLength={7} maxLength={30} type="tel" autoComplete="tel" /></label>
            <label>{copy.time}<input name="time" required type="datetime-local" /></label>
            <Button type="submit" disabled={busy}>{copy.saveCall}</Button>
            <Button type="button" variant="ghost" onClick={() => setScreen("choices")}>{copy.back}</Button>
          </form>}
        </div>}
        {screen === "ai" && session && <div className="home-ai-panel">
          <SavedVideoChat key={`live-ai-${lang}`} id={`live-ai-${session.id}-${lang}`} messages={[]} anonymous />
          <p className="mt-3 text-center text-sm text-muted-foreground">{copy.aiPrivacy}</p>
          <Button variant="outline" className="mt-4" onClick={() => setScreen("choices")}>{copy.back}</Button>
        </div>}
      </div>
    </section>
  );
}
