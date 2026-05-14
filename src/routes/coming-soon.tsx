import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { DEFENDER_HTML } from "@/lib/defendermicasa-html";
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

function ComingSoonPage() {
  const ref = useRef<HTMLDivElement>(null);
  const submit = useServerFn(submitDefenderSignup);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

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
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : undefined,
        },
      });
      setStatus("ok");
      setMessage("You're on the list. We'll email you the moment Sentinel Trust opens.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Try again.");
    }
  }

  return (
    <div style={{ background: "#f4efe6", minHeight: "100vh" }}>
      {/* Coming Spring 2027 banner */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 60,
          background: "#0e1a2b",
          color: "#c9a961",
          textAlign: "center",
          padding: "10px 16px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          borderBottom: "1px solid rgba(201,169,97,0.3)",
        }}
      >
        ● Launching Spring 2027 · Preview only ·{" "}
        <a
          href="#notify"
          style={{ color: "#f4efe6", textDecoration: "underline", marginLeft: 8 }}
        >
          Get notified
        </a>
      </div>

      {/* Marketing site body */}
      <div ref={ref} className="dm-root" dangerouslySetInnerHTML={{ __html: DEFENDER_HTML }} />

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
            — Spring 2027
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
            Be the first to know{" "}
            <em style={{ fontStyle: "italic", color: "#c9a961" }}>when we open.</em>
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
            Sentinel Trust is a licensed Arizona law firm partnership opening Spring 2027. Leave
            your email and we'll let you know the moment intake is live.
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
              placeholder="your@email.com"
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
              {status === "submitting" ? "Sending…" : "Advise Me When Open"}
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
            EN · ES · HT · ZH · AR
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
        © 2026 Sentinel Trust · Concept site · Attorney advertising · Launching Spring 2027
      </footer>
    </div>
  );
}
