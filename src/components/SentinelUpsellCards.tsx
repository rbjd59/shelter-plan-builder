import { Link } from "@tanstack/react-router";

type Lang = "en" | "es" | "ht";

const COPY: Record<Lang, {
  eyebrow: string;
  packetTitle: string;
  packetBlurb: string;
  packetCta: string;
  trustTitle: string;
  trustBlurb: string;
  trustCta: string;
  badge: string;
}> = {
  en: {
    eyebrow: "Sentinel — Asset & Family Protection",
    badge: "Powered by Sentinel",
    packetTitle: "Sentinel Readiness Packet — $100",
    packetBlurb: "We translate, type, and vault the documents your family will need the moment ICE acts: power of attorney, guardianship, school pickup, medical authorization, financial inventory, and an emergency contact tree. Stays sealed until you trigger HELP NOW.",
    packetCta: "Add Readiness Packet — $100",
    trustTitle: "Sentinel Trust — premium",
    trustBlurb: "Asset protection structure for families facing removal: irrevocable spendthrift trust + LLC, designed to keep your home, business, and savings intact across borders.",
    trustCta: "Learn about Sentinel Trust →",
  },
  es: {
    eyebrow: "Sentinel — Protección de Activos y Familia",
    badge: "Por Sentinel",
    packetTitle: "Paquete Sentinel Readiness — $100",
    packetBlurb: "Traducimos, escribimos y guardamos los documentos que su familia necesitará en el momento que actúe ICE: poder notarial, tutela, autorización escolar, autorización médica, inventario financiero y árbol de contactos de emergencia. Permanecen sellados hasta que active AYUDA YA.",
    packetCta: "Agregar Paquete Readiness — $100",
    trustTitle: "Sentinel Trust — premium",
    trustBlurb: "Estructura de protección de activos para familias frente a la deportación: fideicomiso irrevocable + LLC, diseñado para mantener su casa, negocio y ahorros intactos a través de fronteras.",
    trustCta: "Conozca Sentinel Trust →",
  },
  ht: {
    eyebrow: "Sentinel — Pwoteksyon Byen ak Fanmi",
    badge: "Pa Sentinel",
    packetTitle: "Pakè Sentinel Readiness — $100",
    packetBlurb: "Nou tradui, ekri, e mete an sekirite dokiman fanmi w ap bezwen lè ICE aji: pouvwa avoka, tit gad, otorizasyon lekòl, otorizasyon medikal, envantè finansye, ak yon ab kontak ijans. Yo ret sele jiskaske ou aktive AYÈ KOUNYE A.",
    packetCta: "Ajoute Pakè Readiness — $100",
    trustTitle: "Sentinel Trust — premium",
    trustBlurb: "Estrikti pwoteksyon byen pou fanmi k ap fè fas ak depòtasyon: trast irevokab + LLC, fèt pou kenbe kay, biznis, ak ekonomi w an plas atravè fwontyè.",
    trustCta: "Aprann sou Sentinel Trust →",
  },
};

export function SentinelUpsellCards({ intakeSessionId, lang, customerEmail }: {
  intakeSessionId: string;
  lang: Lang;
  customerEmail?: string | null;
}) {
  const c = COPY[lang];
  return (
    <section style={{
      marginTop: 28,
      padding: "32px 28px",
      background: "linear-gradient(180deg, #f4efe6 0%, #ebe3d4 100%)",
      borderRadius: 10,
      borderLeft: "4px solid #b8551f",
      color: "#0e1a2b",
      fontFamily: "Inter Tight, system-ui, sans-serif",
    }}>
      <div style={{
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#8a3c11",
        marginBottom: 14,
      }}>{c.eyebrow}</div>

      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "1fr" }}>
        {/* Card 1 — Readiness Packet */}
        <article style={{
          background: "#fff",
          border: "1px solid rgba(14,26,43,0.15)",
          borderTop: "3px solid #b8551f",
          padding: "22px 24px",
          borderRadius: 6,
        }}>
          <h3 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 22, fontWeight: 600, margin: "0 0 8px", color: "#0e1a2b" }}>
            {c.packetTitle}
          </h3>
          <p style={{ margin: "0 0 18px", fontSize: 14.5, lineHeight: 1.55, color: "#1a2940" }}>
            {c.packetBlurb}
          </p>
          <Link
            to="/readiness/start"
            search={{ session: intakeSessionId, lang, email: customerEmail || undefined } as never}
            style={{
              display: "inline-block",
              background: "#b8551f",
              color: "#fff",
              padding: "12px 22px",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
              borderRadius: 4,
              letterSpacing: "0.02em",
            }}
          >{c.packetCta}</Link>
        </article>

        {/* Card 2 — Sentinel Trust */}
        <article style={{
          background: "#0e1a2b",
          color: "#f4efe6",
          padding: "22px 24px",
          borderRadius: 6,
          borderTop: "3px solid #c9a961",
        }}>
          <div style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#c9a961",
            marginBottom: 8,
          }}>{c.badge}</div>
          <h3 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 22, fontWeight: 600, margin: "0 0 8px" }}>
            {c.trustTitle}
          </h3>
          <p style={{ margin: "0 0 18px", fontSize: 14.5, lineHeight: 1.55, color: "#e6e0d2" }}>
            {c.trustBlurb}
          </p>
          <Link
            to="/sentinel-trust"
            search={{ lang } as never}
            style={{
              display: "inline-block",
              border: "1px solid #c9a961",
              color: "#c9a961",
              padding: "11px 22px",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
              borderRadius: 4,
              letterSpacing: "0.02em",
            }}
          >{c.trustCta}</Link>
        </article>
      </div>
    </section>
  );
}
