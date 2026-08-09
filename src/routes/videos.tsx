import { createFileRoute, Link } from "@tanstack/react-router";
import NarrativeVideoSection from "@/components/NarrativeVideoSection";
import AdVideoSection from "@/components/AdVideoSection";
import EmployerVideoSection from "@/components/EmployerVideoSection";
import { useLang } from "@/context/LanguageContext";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title: "Videos — DetencionDefensa.com" },
      {
        name: "description",
        content:
          "Watch how DetencionDefensa works: attorney-reviewed documents at no charge and a $10/month emergency app for immigrant working families.",
      },
      { property: "og:title", content: "Videos — DetencionDefensa.com" },
      {
        property: "og:description",
        content:
          "Watch how DetencionDefensa works: attorney-reviewed documents at no charge and a $10/month emergency app.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Videos — DetencionDefensa.com" },
      {
        name: "twitter:description",
        content: "Watch how DetencionDefensa works — documents at no charge, app $10/month.",
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
      <NarrativeVideoSection />
      <AdVideoSection />
      <EmployerVideoSection />
    </main>
  );
}
