import { createFileRoute, redirect } from "@tanstack/react-router";
import SiteShell from "@/components/SiteShell";
import HeroIntro from "@/components/HeroIntro";
import ProblemSolutionSection from "@/components/ProblemSolutionSection";
import HowItWorksVideoSection from "@/components/HowItWorksVideoSection";
import AdVideoSection from "@/components/AdVideoSection";
import SecurityVideoSection from "@/components/SecurityVideoSection";

const DEFENDER_HOSTS = new Set([
  "defendermicasa.com",
  "www.defendermicasa.com",
]);

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { lang?: string } => {
    const lang = typeof search.lang === "string" ? search.lang : undefined;
    return lang ? { lang } : {};
  },
  beforeLoad: ({ location }) => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      if (DEFENDER_HOSTS.has(host)) {
        throw redirect({ to: "/coming-soon" });
      }
    }
    try {
      const url = new URL(location.href, "http://localhost");
      const host = url.hostname.toLowerCase();
      if (DEFENDER_HOSTS.has(host)) {
        throw redirect({ to: "/coming-soon" });
      }
    } catch {
      /* ignore */
    }
  },
  head: () => ({
    meta: [
      { title: "DetencionDefensa.com — Plan de Defensa Pre-Detención · Gratis" },
      {
        name: "description",
        content:
          "Free pre-detention defense plan for immigrant working families: emergency app and attorney-reviewed documents at no cost during the community crisis. We are not a law firm.",
      },
      { property: "og:title", content: "DetencionDefensa.com — Plan de Defensa Pre-Detención · Gratis" },
      {
        property: "og:description",
        content:
          "Free pre-detention defense plan for immigrant working families. Emergency app and attorney-reviewed documents at no cost. We are not a law firm.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://detenciondefensa.com/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "DetencionDefensa.com — Plan de Defensa Pre-Detención · Gratis" },
      { name: "twitter:description", content: "Free pre-detention defense plan for immigrant working families. Emergency app and attorney-reviewed documents at no cost." },
    ],
    links: [{ rel: "canonical", href: "https://detenciondefensa.com/" }],
  }),

  component: () => (
    <>
      <HeroIntro />
      <HowItWorksVideoSection />
      <AdVideoSection />
      <SecurityVideoSection />
      <ProblemSolutionSection />

      <SiteShell />
    </>
  ),
});
