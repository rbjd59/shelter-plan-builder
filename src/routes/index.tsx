import { createFileRoute, redirect } from "@tanstack/react-router";
import SiteShell from "@/components/SiteShell";
import PinGate from "@/components/PinGate";
import HeroVideo from "@/components/HeroVideo";

const DEFENDER_HOSTS = new Set([
  "defendermicasa.com",
  "www.defendermicasa.com",
]);

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { lang?: string } => {
    const lang = typeof search.lang === "string" ? search.lang : undefined;
    return lang ? { lang } : {};
  },
  beforeLoad: ({ location, search }) => {
    // Client-side: check window.location.hostname
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      if (DEFENDER_HOSTS.has(host)) {
        throw redirect({ to: "/coming-soon" });
      }
      // First-time visitors (no lang in URL, no stored preference) → splash
      const hasUrlLang =
        search?.lang === "es" || search?.lang === "en" || search?.lang === "ht";
      let hasStoredLang = false;
      try {
        const ls = window.localStorage.getItem("dd_lang");
        hasStoredLang = ls === "es" || ls === "en" || ls === "ht";
      } catch {
        // ignore storage errors
      }
      if (!hasUrlLang && !hasStoredLang) {
        throw redirect({ to: "/splash" });
      }
    }
    // SSR: location.href contains the full URL including host
    try {
      const url = new URL(location.href, "http://localhost");
      const host = url.hostname.toLowerCase();
      if (DEFENDER_HOSTS.has(host)) {
        throw redirect({ to: "/coming-soon" });
      }
    } catch {
      // ignore
    }
  },

  head: () => ({
    meta: [
      { title: "DetencionDefensa.com — Plan de Defensa Pre-Detención · $199" },
      {
        name: "description",
        content:
          "A pre-detention defense plan for immigrant working families. $199 today + $10/mo from month 3. NOT a law firm.",
      },
      { property: "og:title", content: "DetencionDefensa.com — Plan de Defensa Pre-Detención · $199" },
      {
        property: "og:description",
        content:
          "Pre-detention defense plan for immigrant working families. $199 today + $10/mo from month 3.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://detenciondefensa.com/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "DetencionDefensa.com — Plan de Defensa Pre-Detención · $199" },
      {
        name: "twitter:description",
        content: "Pre-detention defense plan for immigrant working families. $199 today.",
      },
    ],
    links: [{ rel: "canonical", href: "https://detenciondefensa.com/" }],
  }),
  component: () => (
    <PinGate>
      <SiteShell />
      <HeroVideo />
    </PinGate>
  ),
});
