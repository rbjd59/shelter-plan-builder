/**
 * AssetProtectionComingSoon
 * -------------------------------------------------------------------
 * Standalone "Coming Soon" upsell card for the $899 Asset Protection
 * Trust handled by our partner attorney through Arizona's ABA-approved
 * Alternative Business Structure (ABS) program (the only US program
 * that lets a law firm be co-owned with a non-lawyer company).
 *
 * Self-contained: pure React + inline styles. No Tailwind, no
 * @tanstack/react-router, no project imports. Drop this file into a
 * Remix app (or any React app) and render <AssetProtectionComingSoon />.
 * -------------------------------------------------------------------
 */

import type { CSSProperties } from "react";

export type AssetProtectionLang = "en" | "es" | "ht";

const COPY: Record<AssetProtectionLang, {
  eyebrow: string;
  badge: string;
  title: string;
  price: string;
  priceNote: string;
  intro: string;
  bullets: string[];
  programLabel: string;
  programLine: string;
  cta: string;
  disclaimer: string;
}> = {
  en: {
    eyebrow: "Coming Soon — Asset Protection",
    badge: "Spring 2027 launch",
    title: "Asset Protection Trust",
    price: "$899 one-time",
    priceNote: "Flat attorney fee. No hourly billing.",
    intro:
      "A licensed Arizona attorney drafts a protective trust that holds your home, vehicle, and US accounts — managed, rented, or sold on your direction even if you are detained, removed, or living abroad.",
    bullets: [
      "Irrevocable spendthrift trust drafted by a US attorney",
      "Optional Wyoming / Nevada LLC layer for business assets",
      "US-based trustee continues mortgage, rent, and bills while you are gone",
      "Beneficiary distributions can be paid across borders",
      "Coordinates with the Sentinel Readiness Packet POA you already signed",
    ],
    programLabel: "How it is legal",
    programLine:
      "Handled through Arizona's ABA-approved Alternative Business Structure (ABS) program — the only US framework that lets a law firm be co-owned with our company while keeping all legal work under a supervising Arizona-licensed attorney.",
    cta: "Notify me when it opens",
    disclaimer:
      "This page is informational only and is not legal advice or an offer to provide legal services. Engagement begins only after a written retainer with the supervising attorney.",
  },
  es: {
    eyebrow: "Próximamente — Protección de Activos",
    badge: "Lanzamiento Primavera 2027",
    title: "Fideicomiso de Protección de Activos",
    price: "$899 pago único",
    priceNote: "Honorario fijo de abogado. Sin cobro por hora.",
    intro:
      "Un abogado licenciado en Arizona redacta un fideicomiso protector que toma custodia de su casa, vehículo y cuentas en EE.UU. — administrado, alquilado o vendido según sus instrucciones aunque esté detenido, deportado o viviendo en el extranjero.",
    bullets: [
      "Fideicomiso irrevocable con cláusula spendthrift redactado por abogado de EE.UU.",
      "Capa opcional de LLC en Wyoming / Nevada para activos de negocio",
      "Fiduciario en EE.UU. sigue pagando hipoteca, renta y cuentas cuando usted no esté",
      "Distribuciones a beneficiarios pueden enviarse a través de fronteras",
      "Se coordina con el Poder Notarial del Paquete Sentinel Readiness que usted ya firmó",
    ],
    programLabel: "Por qué es legal",
    programLine:
      "Gestionado a través del programa Alternative Business Structure (ABS) aprobado por la ABA en Arizona — el único marco en EE.UU. que permite que un bufete sea copropiedad de nuestra empresa, manteniendo todo el trabajo legal bajo un abogado supervisor licenciado en Arizona.",
    cta: "Avísenme cuando abra",
    disclaimer:
      "Esta página es informativa, no es asesoría legal ni una oferta de servicios legales. La representación comienza solo tras un contrato escrito con el abogado supervisor.",
  },
  ht: {
    eyebrow: "Ap Vini Talè — Pwoteksyon Byen",
    badge: "Lansman Prentan 2027",
    title: "Trast Pwoteksyon Byen",
    price: "$899 yon sèl fwa",
    priceNote: "Frè fiks avoka. Pa gen faktirasyon pa lè.",
    intro:
      "Yon avoka ki gen lisans nan Arizona ekri yon trast pwoteksyon ki kenbe kay ou, machin ou, ak kont US ou — jere, lwe, oswa vann selon enstriksyon w menm si yo detni w, depòte w, oswa w ap viv aletranje.",
    bullets: [
      "Trast irevokab spendthrift ekri pa yon avoka US",
      "Kouch LLC opsyonèl nan Wyoming / Nevada pou byen biznis",
      "Trustee US kontinye peye prè kay, lwaye, ak bòdwo lè ou pa la",
      "Distribisyon bay benefisyè ka voye atravè fwontyè",
      "Kowòdone ak POA Pakè Sentinel Readiness ou te deja siyen",
    ],
    programLabel: "Poukisa li legal",
    programLine:
      "Jere atravè pwogram Alternative Business Structure (ABS) ABA-apwouve nan Arizona — sèl ankadreman nan US ki pèmèt yon kabinè avoka gen ko-pwopriyetè ak konpayi nou an, pandan tout travay legal rete anba yon avoka sipèvizè ki gen lisans Arizona.",
    cta: "Avize m lè li louvri",
    disclaimer:
      "Paj sa enfòmasyon sèlman, se pa konsèy legal ni yon òf sèvis legal. Reprezantasyon kòmanse sèlman apre yon kontra ekri ak avoka sipèvizè a.",
  },
};

export interface AssetProtectionComingSoonProps {
  lang?: AssetProtectionLang;
  /** Optional email-capture URL. If omitted, button renders as mailto:. */
  notifyUrl?: string;
  /** Optional mailto fallback / contact address. */
  contactEmail?: string;
  style?: CSSProperties;
}

export function AssetProtectionComingSoon({
  lang = "en",
  notifyUrl,
  contactEmail = "intake@detenciondefensa.com",
  style,
}: AssetProtectionComingSoonProps) {
  const c = COPY[lang];
  const href =
    notifyUrl ||
    `mailto:${contactEmail}?subject=${encodeURIComponent("Notify me — Asset Protection Trust ($899)")}`;

  return (
    <article
      style={{
        background: "#0e1a2b",
        color: "#f4efe6",
        padding: "26px 26px",
        borderRadius: 6,
        borderTop: "3px solid #c9a961",
        fontFamily: "Inter Tight, system-ui, sans-serif",
        position: "relative",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 14,
          right: 16,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#0e1a2b",
          background: "#c9a961",
          padding: "4px 10px",
          borderRadius: 999,
        }}
      >
        {c.badge}
      </div>

      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#c9a961",
          marginBottom: 10,
        }}
      >
        {c.eyebrow}
      </div>

      <h3
        style={{
          fontFamily: "Fraunces, Georgia, serif",
          fontSize: 26,
          fontWeight: 600,
          margin: "0 0 6px",
          color: "#f4efe6",
          letterSpacing: "-0.01em",
        }}
      >
        {c.title}
      </h3>
      <div style={{ fontSize: 17, fontWeight: 600, color: "#c9a961", marginBottom: 4 }}>
        {c.price}
      </div>
      <div style={{ fontSize: 12.5, color: "#8a9bb0", marginBottom: 18 }}>{c.priceNote}</div>

      <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.6, color: "#e6e0d2" }}>
        {c.intro}
      </p>

      <ul
        style={{
          margin: "0 0 18px",
          paddingLeft: 20,
          fontSize: 14, lineHeight: 1.65, color: "#e6e0d2",
        }}
      >
        {c.bullets.map((b) => (
          <li key={b} style={{ marginBottom: 4 }}>{b}</li>
        ))}
      </ul>

      <div
        style={{
          background: "#1a2940",
          border: "1px solid rgba(201,169,97,0.3)",
          borderRadius: 4,
          padding: "14px 16px",
          marginBottom: 22,
        }}
      >
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#c9a961",
            marginBottom: 6,
          }}
        >
          {c.programLabel}
        </div>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: "#e6e0d2" }}>
          {c.programLine}
        </p>
      </div>

      <a
        href={href}
        style={{
          display: "inline-block",
          background: "#c9a961",
          color: "#0e1a2b",
          padding: "13px 26px",
          fontWeight: 700,
          fontSize: 14.5,
          textDecoration: "none",
          borderRadius: 4,
          letterSpacing: "0.02em",
        }}
      >
        {c.cta}
      </a>

      <p
        style={{
          marginTop: 18,
          fontSize: 11.5,
          lineHeight: 1.5,
          color: "#8a9bb0",
          fontStyle: "italic",
        }}
      >
        {c.disclaimer}
      </p>
    </article>
  );
}

export default AssetProtectionComingSoon;
