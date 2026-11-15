import { createFileRoute, redirect } from "@tanstack/react-router";
import { HomepageSection } from "@/components/HomepageContent";
import HeroIntro from "@/components/HeroIntro";
import ProblemSolutionSection, { PaidSolutions } from "@/components/ProblemSolutionSection";
import { PreparednessVideos, PreparednessDisclosures } from "@/components/PreparednessSections";
import EmergencyReadiness from "@/components/EmergencyReadiness";

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
      { title: "Protect the American Dream — DetencionDefensa.com" },
      {
        name: "description",
        content:
          "Know your rights, explore statutory issues for licensed review, and prepare your family documents with Detención Defensa's free screening and SOS app. Home and business structuring are separate paid services.",
      },
      { property: "og:title", content: "Protect the American Dream — DetencionDefensa.com" },
      {
        property: "og:description",
        content:
          "Free statutory screening, SOS app and family preparedness. Explore home and business planning with separate professional fees and licensed legal review.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://detenciondefensa.com/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "DetencionDefensa.com — Plan de Defensa Pre-Detención · Gratis" },
      { name: "twitter:description", content: "No fee, no monthly charge. Free emergency app plus pro bono attorney-reviewed federal documents." },
    ],
    links: [{ rel: "canonical", href: "https://detenciondefensa.com/" }],
  }),

  component: () => (
    <div className="home-redesign">
      <HeroIntro />
      <PreparednessVideos />
      <EmergencyReadiness />
      <ProblemSolutionSection />
      <HomepageSection section="steps" />
      <HomepageSection section="roles" />
      <HomepageSection section="attorney" />
      <HomepageSection section="features" />
      <div className="home-band home-paid-section"><PaidSolutions /></div>
      <PreparednessDisclosures />
      <HomepageSection section="faq" />
      <span id="app" />
      <HomepageSection section="footer" />
    </div>
  ),
});
