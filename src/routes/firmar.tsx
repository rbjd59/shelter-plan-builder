import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const search = z.object({
  code: z.string().optional(),
  lang: z.enum(["en", "es", "ht"]).catch("es"),
});

export const Route = createFileRoute("/firmar")({
  validateSearch: search,
  component: ComingSoonPage,
  head: () => ({
    meta: [
      { title: "Firma electrónica de formularios | DetencionDefensa" },
      {
        name: "description",
        content:
          "Firma electrónica de formularios de autorización. Próximamente disponible.",
      },
      { property: "og:title", content: "Firma electrónica de formularios" },
      {
        property: "og:description",
        content:
          "Firme sus formularios de autorización en blanco y envíelos a su contacto principal. Próximamente disponible.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Lang = "en" | "es" | "ht";

const T = {
  en: {
    kicker: "COMING SOON",
    h1: "Electronic signing is coming soon",
    lede: "We are building secure electronic signing and notarization for your authorization forms. Check back soon.",
  },
  es: {
    kicker: "PRÓXIMAMENTE",
    h1: "La firma electrónica estará disponible pronto",
    lede: "Estamos construyendo la firma electrónica segura y notarización de sus formularios de autorización. Vuelva pronto.",
  },
  ht: {
    kicker: "PRETO",
    h1: "Siyati elektwonik ap vini byento",
    lede: "N ap bati siyati elektwonik sekirite ak notarizasyon pou fòm otorizasyon ou yo. Tounen byento.",
  },
} as const;

function ComingSoonPage() {
  const { lang } = Route.useSearch();
  const t = T[(lang ?? "es") as Lang];

  const wrap: React.CSSProperties = {
    minHeight: "100vh",
    background: "#f4efe6",
    color: "#0e1a2b",
    fontFamily: "Inter Tight, system-ui, sans-serif",
    padding: "36px 20px 80px",
  };
  const container: React.CSSProperties = { maxWidth: 760, margin: "0 auto" };

  return (
    <div style={wrap}>
      <div style={container}>
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            letterSpacing: "0.14em",
            color: "#8a3c11",
            marginBottom: 8,
          }}
        >
          {t.kicker}
        </div>
        <h1
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 32,
            fontWeight: 600,
            margin: "0 0 10px",
            lineHeight: 1.15,
          }}
        >
          {t.h1}
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: "#1a2940", marginBottom: 26, maxWidth: 640 }}>
          {t.lede}
        </p>
      </div>
    </div>
  );
}
