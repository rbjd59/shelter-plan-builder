import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

const search = z.object({ lang: z.enum(["en", "es", "ht"]).catch("en") });

export const Route = createFileRoute("/own-property")({
  validateSearch: search,
  component: OwnPropertyPage,
  head: () => ({
    meta: [
      { title: "Own Property — Sentinel Trust Property Management Group" },
      {
        name: "description",
        content:
          "No family in the U.S. to manage your real estate? Sentinel Trust Property Management Group manages, rents, and sells foreign-owned property under licensed legal supervision.",
      },
      { property: "og:title", content: "Own Property — Sentinel Trust Property Management Group" },
      {
        property: "og:description",
        content:
          "Property management, rental, and sale services for non-citizen owners — supervised by a licensed law group.",
      },
    ],
  }),
});

const COPY = {
  en: {
    kicker: "SENTINEL — PROPERTY DIVISION",
    title: "Own Property",
    subtitle:
      "No family in the United States? No one you trust with your property? No one capable of managing real estate?",
    intro: (
      <>
        <strong>Sentinel Trust Property Management Group</strong> is an option to have your
        property <em>managed</em>, <em>rented</em>, or <em>sold</em> under the supervision of a
        licensed law group designed to handle foreign-owned real estate.
      </>
    ),
    cards: [
      {
        h: "Managed",
        p: "Ongoing oversight of your home or building — taxes paid, maintenance arranged, tenants vetted, accounting reported across borders.",
      },
      {
        h: "Rented",
        p: "Income-producing leasing handled end-to-end so your property continues to support your family even while you are outside the United States.",
      },
      {
        h: "Sold",
        p: "When the time comes to liquidate, sales are conducted under attorney supervision with proceeds routed to the trust or beneficiary you designate.",
      },
    ],
    visit: "Visit Sentinel Trust Services Group at:",
    linkLabel: "www.defendermicasa.com →",
    disclaimer:
      "Sentinel Trust Property Management Group is operated in partnership with a licensed Arizona law firm (launching Spring 2027). This page is informational only and is not legal advice or an offer to provide legal services.",
    home: "← Return home",
  },
  es: {
    kicker: "SENTINEL — DIVISIÓN DE PROPIEDADES",
    title: "Sea Propietario",
    subtitle:
      "¿No tiene familia en los Estados Unidos? ¿No hay nadie de confianza para su propiedad? ¿Nadie capaz de administrar bienes raíces?",
    intro: (
      <>
        <strong>Sentinel Trust Property Management Group</strong> es una opción para que su
        propiedad sea <em>administrada</em>, <em>alquilada</em> o <em>vendida</em> bajo la
        supervisión de un grupo legal con licencia diseñado para manejar bienes raíces
        propiedad de extranjeros.
      </>
    ),
    cards: [
      {
        h: "Administrada",
        p: "Supervisión continua de su casa o edificio: pago de impuestos, mantenimiento coordinado, inquilinos verificados y contabilidad reportada a través de fronteras.",
      },
      {
        h: "Alquilada",
        p: "El arrendamiento generador de ingresos se maneja de principio a fin para que su propiedad siga apoyando a su familia incluso mientras usted está fuera de los Estados Unidos.",
      },
      {
        h: "Vendida",
        p: "Cuando llegue el momento de liquidar, las ventas se realizan bajo la supervisión de un abogado, con las ganancias enviadas al fideicomiso o beneficiario que usted designe.",
      },
    ],
    visit: "Visite Sentinel Trust Services Group en:",
    linkLabel: "www.defendermicasa.com →",
    disclaimer:
      "Sentinel Trust Property Management Group opera en asociación con un bufete de abogados con licencia en Arizona (lanzamiento en primavera de 2027). Esta página es solo informativa y no constituye asesoría legal ni una oferta de servicios legales.",
    home: "← Volver al inicio",
  },
  ht: {
    kicker: "SENTINEL — DIVIZYON PWOPRIYETE",
    title: "Posede Pwopriyete",
    subtitle:
      "Ou pa gen fanmi ozetazini? Ou pa gen pèsòn ou fè konfyans ak pwopriyete w? Pèsòn ki kapab jere byen imobilye?",
    intro: (
      <>
        <strong>Sentinel Trust Property Management Group</strong> se yon opsyon pou fè
        pwopriyete w <em>jere</em>, <em>lwe</em>, oswa <em>vann</em> anba sipèvizyon yon gwoup
        legal ki gen lisans e ki fèt pou jere byen imobilye ki pou moun ki pa sitwayen.
      </>
    ),
    cards: [
      {
        h: "Jere",
        p: "Sipèvizyon kontinyèl sou kay oswa bilding ou — taks peye, antretyen òganize, lokatè verifye, kontablite rapòte atravè fwontyè.",
      },
      {
        h: "Lwe",
        p: "Lokasyon ki jenere revni jere depi kòmansman jiska fen pou pwopriyete w ka kontinye sipòte fanmi w menm lè ou deyò Etazini.",
      },
      {
        h: "Vann",
        p: "Lè lè a rive pou likide, vant yo fèt anba sipèvizyon yon avoka ak lajan an voye nan trust oswa benefisyè ou chwazi.",
      },
    ],
    visit: "Vizite Sentinel Trust Services Group nan:",
    linkLabel: "www.defendermicasa.com →",
    disclaimer:
      "Sentinel Trust Property Management Group opere an patenarya avèk yon biwo avoka ki gen lisans nan Arizona (k ap lanse nan Prentan 2027). Paj sa a se sèlman pou enfòmasyon e li pa yon konsèy legal ni yon òf pou bay sèvis legal.",
    home: "← Retounen lakay",
  },
} as const;

function OwnPropertyPage() {
  const { lang } = Route.useSearch();
  const t = COPY[lang];
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0e1a2b",
        color: "#f4efe6",
        fontFamily: "Inter Tight, system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "60px 24px 80px" }}>
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            letterSpacing: "0.15em",
            color: "#c9a961",
            marginBottom: 10,
          }}
        >
          {t.kicker}
        </div>
        <h1
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 56,
            fontWeight: 500,
            margin: "0 0 12px",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          {t.title}
        </h1>
        <p
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 22,
            fontStyle: "italic",
            color: "#c9a961",
            margin: "0 0 28px",
          }}
        >
          {t.subtitle}
        </p>

        <p style={{ fontSize: 17, lineHeight: 1.65, maxWidth: 680, color: "#e6e0d2" }}>
          {t.intro}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18, marginTop: 40 }}>
          {t.cards.map((p) => (
            <div
              key={p.h}
              style={{
                background: "#1a2940",
                padding: "22px 24px",
                borderRadius: 6,
                borderLeft: "3px solid #c9a961",
              }}
            >
              <h3
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  fontSize: 20,
                  fontWeight: 600,
                  margin: "0 0 6px",
                  color: "#c9a961",
                }}
              >
                {p.h}
              </h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, margin: 0, color: "#e6e0d2" }}>{p.p}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 44 }}>
          <p style={{ fontSize: 15, color: "#e6e0d2", margin: "0 0 14px" }}>
            {t.visit}
          </p>
          <a
            href="https://www.defendermicasa.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              background: "#c9a961",
              color: "#0e1a2b",
              padding: "16px 30px",
              fontWeight: 700,
              textDecoration: "none",
              borderRadius: 4,
              letterSpacing: "0.02em",
            }}
          >
            {t.linkLabel}
          </a>
        </div>

        <p
          style={{
            marginTop: 36,
            fontSize: 12,
            color: "#8a9bb0",
            lineHeight: 1.55,
            maxWidth: 600,
          }}
        >
          {t.disclaimer}
        </p>
        <Link
          to="/"
          style={{ display: "inline-block", marginTop: 20, color: "#c9a961", textDecoration: "none" }}
        >
          {t.home}
        </Link>
      </div>
    </div>
  );
}
