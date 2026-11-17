import { createFileRoute, Link } from "@tanstack/react-router";
import NarrativeVideoSection from "@/components/NarrativeVideoSection";
import AdVideoSection from "@/components/AdVideoSection";
import EmployerVideoSection from "@/components/EmployerVideoSection";
import { useLang } from "@/context/LanguageContext";
import AssessmentVideo from "@/components/AssessmentVideo";
import businessEn from "@/assets/videos/save-my-business-en-v1.mp4.asset.json";
import businessEs from "@/assets/videos/save-my-business-es-v1.mp4.asset.json";
import businessHt from "@/assets/videos/save-my-business-ht-v1.mp4.asset.json";

export const Route = createFileRoute("/videos")({
  validateSearch: (search: Record<string, unknown>): { lang?: string } => {
    const lang = search.lang;
    return lang === "en" || lang === "es" || lang === "ht" ? { lang } : {};
  },
  head: () => ({
    meta: [
      { title: "Videos — DetencionDefensa.com" },
      {
        name: "description",
        content:
          "Watch how DetencionDefensa works: attorney-reviewed documents and the emergency app at no cost for immigrant working families.",
      },
      { property: "og:title", content: "Videos — DetencionDefensa.com" },
      {
        property: "og:description",
        content:
          "Watch how DetencionDefensa works: attorney-reviewed documents and the emergency app at no cost.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Videos — DetencionDefensa.com" },
      {
        name: "twitter:description",
        content: "Watch how DetencionDefensa works — documents and the emergency app at no cost.",
      },
    ],
  }),
  component: VideosPage,
});

const BACK: Record<string, string> = {
  en: "← Back to home",
  es: "← Volver al inicio",
  ht: "← Retounen nan paj dakèy",
};

function VideosPage() {
  const { lang } = useLang();
  const businessVideos = { en: businessEn.url, es: businessEs.url, ht: businessHt.url };
  return (
    <main style={{ background: "#0d2c54", minHeight: "100vh", paddingBottom: "2rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "1.25rem 1rem 0" }}>
        <Link
          to="/"
          style={{
            color: "#e8a04a",
            fontWeight: 700,
            textDecoration: "none",
            fontFamily: '"Work Sans", -apple-system, Roboto, Helvetica, Arial, sans-serif',
          }}
        >
          {BACK[lang] ?? BACK.en}
        </Link>
      </div>
      <section id="save-my-business" className="home-redesign">
        <div className="asmt"><div className="asmt-wrap">
          <h1 className="asmt-title">Save My Business</h1>
          <AssessmentVideo src={businessVideos[lang]} lang={lang} title="Save My Business" onEnded={() => {}} />
        </div></div>
      </section>
      <NarrativeVideoSection />
      <AdVideoSection />
      <EmployerVideoSection />
    </main>
  );
}
