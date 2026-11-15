import HowItWorksVideoSection from "@/components/HowItWorksVideoSection";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { HomepageSection } from "@/components/HomepageContent";
import HeroIntro from "@/components/HeroIntro";
import { PaidSolutions } from "@/components/ProblemSolutionSection";
import { PreparednessVideos, PreparednessDisclosures } from "@/components/PreparednessSections";
import HomeReviewSections from "@/components/HomeReviewSections";
import "@/home-review.css";

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
      { title: "Don’t Wait for an ICE Detention — DetencionDefensa.com" },
      {
        name: "description",
        content:
          "Sorrentino Law Firm PLLC’s educational website for Detención Defensa, licensed by DetencionDefensa.com, Inc. Free screening and SOS app; home and business services cost extra.",
      },
      { property: "og:title", content: "Don’t Wait for an ICE Detention — DetencionDefensa.com" },
      {
        property: "og:description",
        content:
          "An educational website from Sorrentino Law Firm PLLC, operated under license from DetencionDefensa.com, Inc. Free screening, SOS app and family preparedness.",
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
      <HowItWorksVideoSection />
      <HomeReviewSections />
      <PreparednessVideos />
      <HomepageSection section="steps" />
      <HomepageSection section="roles" />
      <HomepageSection section="attorney" />
      <div className="home-band home-paid-section"><PaidSolutions /></div>
      <PreparednessDisclosures />
      <HomepageSection section="faq" />
      <span id="app" />
      <HomepageSection section="footer" />
    </div>
  ),
});
