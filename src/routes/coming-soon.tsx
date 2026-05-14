import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { getDefenderHtml, type DefenderLang } from "@/lib/defendermicasa-html";
import { submitDefenderSignup } from "@/lib/defendermicasa.functions";

export const Route = createFileRoute("/coming-soon")({
  component: ComingSoonPage,
  head: () => ({
    meta: [
      { title: "Sentinel Trust — Coming Spring 2027 | DefenderMiCasa.com" },
      {
        name: "description",
        content:
          "Sentinel Trust: asset protection, property management, and vehicle recovery for families facing removal. Launching Spring 2027 — be the first to know.",
      },
      { property: "og:title", content: "Sentinel Trust — Coming Spring 2027" },
      {
        property: "og:description",
        content: "Asset protection for families facing removal. Launching Spring 2027.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=Inter+Tight:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
});

const LS_KEY = "dm_lang";

const T: Record<DefenderLang, {
  banner: string;
  bannerCta: string;
  notifyEyebrow: string;
  notifyHeadA: string;
  notifyHeadEm: string;
  notifyLede: string;
  emailPlaceholder: string;
  submit: string;
  submitting: string;
  success: string;
  error: string;
  footer: string;
}> = {
  en: {
    banner: "● Launching Spring 2027 · Preview only ·",
    bannerCta: "Get notified",
    notifyEyebrow: "— Spring 2027",
    notifyHeadA: "Be the first to know ",
    notifyHeadEm: "when we open.",
    notifyLede: "Sentinel Trust is a licensed Arizona law firm partnership opening Spring 2027. Leave your email and we'll let you know the moment intake is live.",
    emailPlaceholder: "your@email.com",
    submit: "Advise Me When Open",
    submitting: "Sending…",
    success: "You're on the list. We'll email you the moment Sentinel Trust opens.",
    error: "Something went wrong. Try again.",
    footer: "© 2026 Sentinel Trust · Concept site · Attorney advertising · Launching Spring 2027",
  },
  es: {
    banner: "● Apertura Primavera 2027 · Solo vista previa ·",
    bannerCta: "Avísame",
    notifyEyebrow: "— Primavera 2027",
    notifyHeadA: "Sé el primero en saber ",
    notifyHeadEm: "cuándo abrimos.",
    notifyLede: "Sentinel Trust es una firma de abogados licenciada en Arizona que abrirá en la Primavera de 2027. Deja tu correo y te avisaremos en el momento que la inscripción esté abierta.",
    emailPlaceholder: "tu@correo.com",
    submit: "Avísame Cuando Abran",
    submitting: "Enviando…",
    success: "Estás en la lista. Te avisaremos por correo en el momento que Sentinel Trust abra.",
    error: "Algo salió mal. Inténtalo de nuevo.",
    footer: "© 2026 Sentinel Trust · Sitio conceptual · Publicidad legal · Apertura Primavera 2027",
  },
  ht: {
    banner: "● Ouvèti Prentan 2027 · Apèsi sèlman ·",
    bannerCta: "Avize m",
    notifyEyebrow: "— Prentan 2027",
    notifyHeadA: "Se premye konnen ",
    notifyHeadEm: "lè nou ouvè.",
    notifyLede: "Sentinel Trust se yon kabinè avoka lisansye Arizona k ap ouvè Prentan 2027. Kite imèl ou epi nou avize w nan moman enskripsyon ouvri.",
    emailPlaceholder: "ou@imel.com",
    submit: "Avize M Lè L Ouvè",
    submitting: "Voye…",
    success: "Ou nan lis la. N ap voye imèl ba ou nan moman Sentinel Trust ouvè.",
    error: "Yon bagay mal pase. Eseye ankò.",
    footer: "© 2026 Sentinel Trust · Sit konsèp · Piblisite avoka · Ouvèti Prentan 2027",
  },
};

function readInitialLang(): DefenderLang {
  if (typeof window === "undefined") return "en";
  const url = new URLSearchParams(window.location.search).get("lang");
  if (url === "en" || url === "es" || url === "ht") return url;
  const ls = window.localStorage.getItem(LS_KEY);
  if (ls === "en" || ls === "es" || ls === "ht") return ls as DefenderLang;
  const nav = (typeof navigator !== "undefined" ? navigator.language : "").toLowerCase();
  if (nav.startsWith("es")) return "es";
  if (nav.startsWith("ht") || nav.startsWith("fr")) return "ht";
  return "en";
}

function ComingSoonPage() {
  const ref = useRef<HTMLDivElement>(null);
  const submit = useServerFn(submitDefenderSignup);
  const [lang, setLang] = useState<DefenderLang>("en");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setLang(readInitialLang());
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.setAttribute("lang", lang);
    try {
      window.localStorage.setItem(LS_KEY, lang);
    } catch {}
  }, [lang]);

  const t = T[lang];
  const html = useMemo(() => getDefenderHtml(lang), [lang]);

  // Smooth-scroll for in-page anchor links inside the dangerouslySetInnerHTML markup
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("#")) {
        const el = document.querySelector(href);
        if (el) {
          e.preventDefault();
          (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("submitting");
    try {
      await submit({
        data: {
          email,
          source: lang,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : undefined,
        },
      });
      setStatus("ok");
      setMessage(t.success);
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : t.error);
    }
  }

  const langs: DefenderLang[] = ["en", "es", "ht"];
  const langLabels: Record<DefenderLang, string> = { en: "EN", es: "ES", ht: "HT" };

  return (
    <div style={{ background: "#f4efe6", minHeight: "100vh" }}>
      {/* Banner with language toggle */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 60,
          background: "#0e1a2b",
          color: "#c9a961",
          padding: "10px 16px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          borderBottom: "1px solid rgba(201,169,97,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span style={{ textAlign: "center" }}>
          {t.banner}{" "}
          <a
            href="#notify"
            style={{ color: "#f4efe6", textDecoration: "underline", marginLeft: 8 }}
          >
            {t.bannerCta}
          </a>
        </span>
        <span
          role="group"
          aria-label="Language"
          style={{ display: "inline-flex", gap: 4, marginLeft: "auto" }}
        >
          {langs.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
              style={{
                background: lang === l ? "#c9a961" : "transparent",
                color: lang === l ? "#0e1a2b" : "#c9a961",
                border: "1px solid rgba(201,169,97,0.5)",
                padding: "4px 10px",
                fontFamily: "inherit",
                fontSize: 11,
                letterSpacing: "0.12em",
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {langLabels[l]}
            </button>
          ))}
        </span>
      </div>

      {/* Marketing site body — re-rendered on lang change */}
      <div
        key={lang}
        ref={ref}
        className="dm-root"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Notify-me signup */}
      <section
        id="notify"
        style={{
          background: "#0e1a2b",
          color: "#f4efe6",
          padding: "7rem 1.5rem",
          textAlign: "center",
          fontFamily: "'Inter Tight', sans-serif",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#c9a961",
              marginBottom: 24,
            }}
          >
            {t.notifyEyebrow}
          </div>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 300,
              fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              margin: "0 0 18px",
            }}
          >
            {t.notifyHeadA}
            <em style={{ fontStyle: "italic", color: "#c9a961" }}>{t.notifyHeadEm}</em>
          </h2>
          <p
            style={{
              color: "rgba(244,239,230,0.7)",
              fontSize: "1.05rem",
              lineHeight: 1.6,
              margin: "0 auto 36px",
              maxWidth: 480,
            }}
          >
            {t.notifyLede}
          </p>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "center",
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            <input
              type="email"
              required
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "submitting"}
              style={{
                flex: "1 1 260px",
                padding: "16px 18px",
                fontSize: 15,
                background: "rgba(244,239,230,0.08)",
                border: "1px solid rgba(244,239,230,0.25)",
                color: "#f4efe6",
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              style={{
                background: "#c9a961",
                color: "#0e1a2b",
                padding: "16px 28px",
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                border: "none",
                cursor: status === "submitting" ? "wait" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {status === "submitting" ? t.submitting : t.submit}
            </button>
          </form>

          {message && (
            <p
              style={{
                marginTop: 20,
                fontSize: 14,
                color: status === "ok" ? "#c9a961" : "#e88a7a",
              }}
            >
              {message}
            </p>
          )}

          <p
            style={{
              marginTop: 48,
              fontSize: 12,
              color: "rgba(244,239,230,0.5)",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.05em",
            }}
          >
            EN · ES · HT
          </p>
        </div>
      </section>

      <footer
        style={{
          background: "#0e1a2b",
          color: "rgba(244,239,230,0.6)",
          padding: "2rem 1.5rem",
          fontSize: 13,
          textAlign: "center",
          borderTop: "1px solid rgba(244,239,230,0.1)",
          fontFamily: "'Inter Tight', sans-serif",
        }}
      >
        {t.footer}
      </footer>
    </div>
  );
}
