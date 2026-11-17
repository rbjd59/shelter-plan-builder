import { createFileRoute, redirect } from "@tanstack/react-router";
import { HomepageSection } from "@/components/HomepageContent";
import HeroIntro from "@/components/HeroIntro";
import HowItWorksVideoSection from "@/components/HowItWorksVideoSection";
import AssessmentSection from "@/components/AssessmentSection";
import HomeServiceVideos from "@/components/HomeServiceVideos";
import VideoQuestionBox from "@/components/VideoQuestionBox";

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
          "Free pre-detention defense plan for immigrant working families. The emergency app has no fee or monthly charge, and a Florida attorney reviews your documents. DETENCIONDEFENSACOM, INC. is the technology operator only; Sorrentino Law Firm PLLC operates the site under license and provides all legal services.",
      },
      { property: "og:title", content: "DetencionDefensa.com — Plan de Defensa Pre-Detención · Gratis" },
      {
        property: "og:description",
        content:
          "Free emergency app with no monthly charge and attorney-reviewed federal documents. DETENCIONDEFENSACOM, INC. is the technology operator only; Sorrentino Law Firm PLLC operates the site under license and provides all legal services.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://detenciondefensa.com/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "DetencionDefensa.com — Plan de Defensa Pre-Detención · Gratis" },
      { name: "twitter:description", content: "Free emergency app with no monthly charge and attorney-reviewed federal documents." },
    ],
    links: [{ rel: "canonical", href: "https://detenciondefensa.com/" }],
  }),

  component: () => (
    <div className="home-redesign">
      <HeroIntro />
      <div className="home-video-section"><HowItWorksVideoSection /></div>
      <HomeServiceVideos />
      <VideoQuestionBox />
      <AssessmentSection />
      <HomepageSection section="steps" />
      <HomepageSection section="attorney" />
      <span id="app" />
      <HomepageSection section="footer" />
    </div>
  ),
});
