import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { SITE_HTML } from "@/lib/markup";
import { useLang, type Lang } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

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

  // Inject account link into nav-right based on auth state
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const navRight = root.querySelector(".nav-right");
    if (!navRight) return;
    let acct = navRight.querySelector<HTMLAnchorElement>("a.account-link");
    if (!acct) {
      acct = document.createElement("a");
      acct.className = "account-link";
      acct.style.cssText = "color:var(--gold,#e8a04a);font-size:13px;text-decoration:none;margin-right:12px;";
      navRight.insertBefore(acct, navRight.firstChild);
    }
    if (isAuthed) {
      acct.textContent = "My account";
      acct.setAttribute("href", "/dashboard");
    } else {
      acct.textContent = "Sign in";
      acct.setAttribute("href", "/login");
    }
  }, [isAuthed]);

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

      // FAQ accordion
      const q = target.closest(".faq-q");
      if (q) {
        q.parentElement?.classList.toggle("open");
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
