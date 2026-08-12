import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { getDefenderHtml, type DefenderLang } from "@/lib/defendermicasa-html";
import { readSiteLang } from "@/lib/site-lang";

export const Route = createFileRoute("/coming-soon")({
  validateSearch: (search: Record<string, unknown>): { lang?: DefenderLang } => {
    const l = search.lang;
    return l === "es" || l === "en" || l === "ht" ? { lang: l } : {};
  },
  component: ComingSoonPage,
  head: () => ({
    meta: [
      { title: "Sentinel Trust — Asset Protection for Families Facing Removal" },
      {
        name: "description",
        content:
          "Sentinel Trust establishes a legal vehicle that takes custody of your home, vehicle, and assets — managed, rented, or sold on your direction, wherever in the world you are.",
      },
      { property: "og:title", content: "Sentinel Trust — Asset Protection for Families Facing Removal" },
      {
        property: "og:description",
        content:
          "A legal shield for families facing detention or removal. Trust structure built for the moment you can't act.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://defendermicasa.com/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Sentinel Trust — Asset Protection for Families Facing Removal" },
      {
        name: "twitter:description",
        content:
          "A legal shield for families facing detention or removal. Trust structure built for the moment you can't act.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://defendermicasa.com/" },
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
  const { lang: urlLang } = Route.useSearch();
  const [lang, setLang] = useState<DefenderLang>(urlLang ?? "en");
  const html = getDefenderHtml(lang);

  // Carry the visitor's language across from detenciondefensa.com (?lang=)
  // or fall back to the site-wide preference stored in the browser.
  useEffect(() => {
    const next: DefenderLang = urlLang ?? (readSiteLang() as DefenderLang);
    setLang(next);
    document.documentElement.setAttribute("lang", next);
    try {
      window.localStorage.setItem("dd_lang", next);
    } catch { /* storage blocked */ }
  }, [urlLang]);

  useEffect(() => {
    if (!ref.current) return;
    const root = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in");
        });
      },
      { threshold: 0.12 },
    );
    const reveals = root.querySelectorAll(".reveal");
    reveals.forEach((el) => observer.observe(el));

    // Stagger reveals within sections
    root.querySelectorAll(".problem-grid, .pillars, .process-steps").forEach((grid) => {
      grid.querySelectorAll(".reveal").forEach((item, i) => {
        (item as HTMLElement).style.transitionDelay = `${i * 0.08}s`;
      });
    });

    return () => observer.disconnect();
  }, [html]);

  return (
    <div
      ref={ref}
      className="dm-root"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
