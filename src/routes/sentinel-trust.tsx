import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

const search = z.object({ lang: z.enum(["en", "es", "ht"]).catch("es") });

export const Route = createFileRoute("/sentinel-trust")({
  validateSearch: search,
  component: SentinelTrustPage,
  head: () => ({
    meta: [
      { title: "Sentinel Trust — Asset Protection for Families Facing Removal" },
      { name: "description", content: "Irrevocable spendthrift trust + LLC structure designed to protect your home, business, and savings during ICE removal proceedings." },
      { property: "og:title", content: "Sentinel Trust — Asset Protection" },
      { property: "og:description", content: "Keep your home, business, and savings intact across borders." },
    ],
  }),
});

const COPY = {
  en: {
    eyebrow: "Sentinel — Premium Tier",
    title: "Sentinel Trust",
    sub: "Asset protection for families facing removal.",
    body: "An irrevocable spendthrift trust paired with a Wyoming or Nevada LLC, structured so that — even if you are detained, removed, or relocated — your home, business, savings, and children's inheritance remain intact and accessible across borders.",
    pillars: [
      { h: "Spendthrift protection", p: "Trust assets are not reachable by creditors, civil judgments, or government collection actions tied to your removal." },
      { h: "Cross-border continuity", p: "A US-based trustee continues to manage US property, pay mortgages, and distribute funds to your family even after you've left the country." },
      { h: "Successor guardianship", p: "Aligns with your Sentinel Readiness Packet — same designated trustee can hold POA, school authority, and custody continuity." },
    ],
    cta: "Schedule a private consultation",
    note: "Trust formation: $1,500–$5,000 attorney fees + state filing. Handled by attorney referral. This page is informational only and is not legal advice or an offer to provide legal services.",
    back: "← Return home",
  },
  es: {
    eyebrow: "Sentinel — Nivel Premium",
    title: "Sentinel Trust",
    sub: "Protección de activos para familias frente a la deportación.",
    body: "Fideicomiso irrevocable con cláusula spendthrift junto con una LLC de Wyoming o Nevada, estructurado para que — aunque sea detenido, deportado o reubicado — su casa, negocio, ahorros y la herencia de sus hijos permanezcan intactos y accesibles a través de fronteras.",
    pillars: [
      { h: "Protección spendthrift", p: "Los activos no son alcanzables por acreedores, juicios civiles ni acciones de cobro del gobierno relacionadas con su deportación." },
      { h: "Continuidad transfronteriza", p: "Un fiduciario en EE.UU. sigue administrando la propiedad, pagando hipotecas y distribuyendo fondos a su familia aún después de que usted salga del país." },
      { h: "Tutela sucesora", p: "Se alinea con su Paquete Sentinel Readiness — el mismo designado puede tener el poder, autoridad escolar y continuidad de custodia." },
    ],
    cta: "Agendar consulta privada",
    note: "Constitución del fideicomiso: $1,500–$5,000 en honorarios + tasas estatales. Mediante referencia legal. Esta página es informativa, no es asesoría legal ni oferta de servicios legales.",
    back: "← Volver al inicio",
  },
  ht: {
    eyebrow: "Sentinel — Nivo Premium",
    title: "Sentinel Trust",
    sub: "Pwoteksyon byen pou fanmi k ap fè fas ak depòtasyon.",
    body: "Yon trast irevokab ak yon LLC nan Wyoming oswa Nevada, estriktire pou — menm si yo detni w, depòte w, oswa relokalize w — kay ou, biznis ou, ekonomi w, ak eritaj timoun yo ret an plas e aksesib atravè fwontyè.",
    pillars: [
      { h: "Pwoteksyon spendthrift", p: "Byen yo pa ka pran pa kreditè, jijman sivil, oswa aksyon kolèksyon gouvènman ki gen rapò ak depòtasyon w." },
      { h: "Kontinwite transfwontalye", p: "Yon trustee Ozetazini kontinye jere pwopriyete, peye prè kay, e bay fanmi w lajan menm apre w fin kite peyi a." },
      { h: "Gad sukseseur", p: "Aliyen ak Pakè Sentinel Readiness ou — menm moun ka kenbe POA, otorite lekòl, ak kontinwite gad timoun." },
    ],
    cta: "Pran yon randevou prive",
    note: "Fòmasyon trast: $1,500–$5,000 frè avoka + frè eta. Pa referans avoka. Paj sa enfòmasyon sèlman, se pa konsèy legal ni yon òf sèvis legal.",
    back: "← Tounen lakay",
  },
} as const;

function SentinelTrustPage() {
  const { lang } = Route.useSearch();
  const c = COPY[lang as keyof typeof COPY];
  return (
    <div style={{ minHeight: "100vh", background: "#0e1a2b", color: "#f4efe6", fontFamily: "Inter Tight, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "60px 24px 80px" }}>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: "0.15em", color: "#c9a961", marginBottom: 10 }}>{c.eyebrow}</div>
        <h1 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 56, fontWeight: 500, margin: "0 0 12px", letterSpacing: "-0.02em", lineHeight: 1.05 }}>{c.title}</h1>
        <p style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 22, fontStyle: "italic", color: "#c9a961", margin: "0 0 28px" }}>{c.sub}</p>
        <p style={{ fontSize: 17, lineHeight: 1.65, maxWidth: 680, color: "#e6e0d2" }}>{c.body}</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18, marginTop: 40 }}>
          {c.pillars.map((p) => (
            <div key={p.h} style={{ background: "#1a2940", padding: "22px 24px", borderRadius: 6, borderLeft: "3px solid #c9a961" }}>
              <h3 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 20, fontWeight: 600, margin: "0 0 6px", color: "#c9a961" }}>{p.h}</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: 0, color: "#e6e0d2" }}>{p.p}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 44 }}>
          <a
            href="mailto:intake@detenciondefensa.com?subject=Sentinel%20Trust%20consultation"
            style={{ display: "inline-block", background: "#c9a961", color: "#0e1a2b", padding: "16px 30px", fontWeight: 700, textDecoration: "none", borderRadius: 4, letterSpacing: "0.02em" }}
          >{c.cta}</a>
        </div>

        <p style={{ marginTop: 36, fontSize: 12, color: "#8a9bb0", lineHeight: 1.55, maxWidth: 600 }}>{c.note}</p>
        <Link to="/" style={{ display: "inline-block", marginTop: 20, color: "#c9a961", textDecoration: "none" }}>{c.back}</Link>
      </div>
    </div>
  );
}
