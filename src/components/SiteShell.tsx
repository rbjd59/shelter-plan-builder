import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { SITE_HTML } from "@/lib/markup";
import { useLang, type Lang } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { PARTNERS } from "@/lib/partners-content";

/**
 * Renders the main marketing page from the reference HTML markup.
 * Wires up: language toggle buttons, FAQ accordion, smooth-scroll anchors,
 * checkout CTAs, and reveal-on-scroll animations.
 */
export default function SiteShell() {
  const ref = useRef<HTMLDivElement>(null);
  const { lang, setLang } = useLang();
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsAuthed(!!data.session));
    const sub = supabase.auth.onAuthStateChange((_e, session) => setIsAuthed(!!session));
    return () => sub.data.subscription.unsubscribe();
  }, []);

  // Sync active class on lang-toggle buttons whenever lang changes
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll<HTMLButtonElement>(".lang-toggle button").forEach((b) => {
      b.classList.toggle("active", b.id === `btn-${lang}`);
    });
  }, [lang]);

  // Populate churches-bar text
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const churchesBar = root.querySelector<HTMLAnchorElement>(".churches-bar");
    if (churchesBar) {
      churchesBar.textContent = PARTNERS[lang].cta.churches;
    }
  }, [lang]);

  // Remove any previously injected account link from nav-right
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const acct = root.querySelector(".nav-right a.account-link");
    if (acct) acct.remove();
  }, [isAuthed]);

  // Inject a floating language toggle into the hero-price-line band
  // (replacement for the removed top nav toggle).
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const host = root.querySelector<HTMLElement>(".hero-price-line");
    if (!host) return;
    let float = host.querySelector<HTMLDivElement>("#pp-lang-float");
    if (!float) {
      float = document.createElement("div");
      float.id = "pp-lang-float";
      float.innerHTML = `
        <button data-lang="es">Español</button>
        <button data-lang="en">English</button>
        <button data-lang="ht">Kreyòl</button>
      `;
      float.addEventListener("click", (e) => {
        const b = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-lang]");
        if (!b) return;
        const next = b.dataset.lang as Lang;
        if (next === "es" || next === "en" || next === "ht") setLang(next);
      });
      host.prepend(float);
    }
    float.querySelectorAll<HTMLButtonElement>("button").forEach((b) => {
      b.classList.toggle("active", b.dataset.lang === lang);
    });
  }, [lang, setLang]);




  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Language toggle buttons
      const langBtn = target.closest<HTMLButtonElement>(".lang-toggle button");
      if (langBtn) {
        const id = langBtn.id; // btn-es | btn-en | btn-ht
        const next = id.replace("btn-", "") as Lang;
        if (next === "es" || next === "en" || next === "ht") setLang(next);
        return;
      }

      // FAQ accordion (legacy + ddfaq)
      const q = target.closest(".faq-q, .ddfaq-q");
      if (q) {
        if (q.classList.contains("ddfaq-q")) {
          const wasActive = q.classList.contains("active");
          root.querySelectorAll(".ddfaq-q").forEach((el) => {
            el.classList.remove("active");
            el.nextElementSibling?.classList.remove("show");
          });
          if (!wasActive) {
            q.classList.add("active");
            q.nextElementSibling?.classList.add("show");
          }
        } else {
          q.parentElement?.classList.toggle("open");
        }
        return;
      }


      // Anchor links — smooth scroll
      const a = target.closest<HTMLAnchorElement>("a");
      if (a) {
        const href = a.getAttribute("href") || "";
        if (href.startsWith("#")) {
          const el = document.querySelector(href);
          if (el) {
            e.preventDefault();
            (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
          }
          return;
        }
        if (href === "/checkout") {
          e.preventDefault();
          navigate({ to: "/checkout", search: { lang } as never });
          return;
        }
        if (href === "/intake" || href.startsWith("/intake?")) {
          e.preventDefault();
          navigate({ to: "/intake", search: { lang } as never });
          return;
        }
        if (href === "/login") {
          e.preventDefault();
          navigate({ to: "/login" });
          return;
        }
        if (href === "/dashboard") {
          e.preventDefault();
          navigate({ to: "/dashboard" });
          return;
        }
        if (href === "/partners") {
          e.preventDefault();
          navigate({ to: "/partners" });
          return;
        }
        if (href === "/" || href.startsWith("/?")) {
          e.preventDefault();
          navigate({ to: "/" });
          return;
        }
      }
    };

    root.addEventListener("click", onClick);

    // Reveal-on-scroll
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    return () => {
      root.removeEventListener("click", onClick);
      io.disconnect();
    };
  }, [navigate, setLang, lang]);

  return (
    <div ref={ref} dangerouslySetInnerHTML={{ __html: SITE_HTML }} />
  );
}

function AdminPinBox() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "working" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("working");
    setErrMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setErrMsg(error.message);
      setStatus("error");
      return;
    }
    // Wait a tick for session to persist, then client-side navigate
    await supabase.auth.getSession();
    navigate({ to: "/admin" });
  };


  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 1000,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(232,160,74,0.4)",
          borderRadius: 10,
          padding: "8px 14px",
          color: "#e8a04a",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.5,
          cursor: "pointer",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        ADMIN SIGN IN
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        width: 260,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        border: `1px solid ${status === "error" ? "#ef4444" : "rgba(232,160,74,0.4)"}`,
        borderRadius: 10,
        padding: 12,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "#e8a04a", fontSize: 11, fontWeight: 700, letterSpacing: 1.5 }}>
          ADMIN SIGN IN
        </span>
        <button
          type="button"
          onClick={() => { setOpen(false); setErrMsg(""); setStatus("idle"); }}
          style={{ background: "none", border: "none", color: "#a1a1aa", fontSize: 16, cursor: "pointer", padding: 0, lineHeight: 1 }}
        >×</button>
      </div>
      <input
        type="email"
        required
        autoComplete="email"
        placeholder="admin email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: "8px 10px",
          borderRadius: 6,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(0,0,0,0.4)",
          color: "#fff",
          fontSize: 13,
          outline: "none",
        }}
      />
      <input
        type="password"
        required
        autoComplete="current-password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          padding: "8px 10px",
          borderRadius: 6,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(0,0,0,0.4)",
          color: "#fff",
          fontSize: 13,
          outline: "none",
        }}
      />
      <button
        type="submit"
        disabled={status === "working"}
        style={{
          padding: "8px 12px",
          borderRadius: 6,
          border: "none",
          background: "#e8a04a",
          color: "#0b0b0e",
          fontSize: 12,
          fontWeight: 700,
          cursor: status === "working" ? "wait" : "pointer",
        }}
      >
        {status === "working" ? "Signing in…" : "Sign in → Admin"}
      </button>
      {errMsg && (
        <p style={{ color: "#fca5a5", fontSize: 11, margin: "2px 0 0", lineHeight: 1.4 }}>{errMsg}</p>
      )}
      <a
        href="/login"
        style={{ color: "#a1a1aa", fontSize: 10, textAlign: "center", textDecoration: "underline" }}
      >
        Use email magic link instead
      </a>
    </form>
  );
}
