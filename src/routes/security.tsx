import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang, type Lang } from "@/context/LanguageContext";
import logoAsset from "@/assets/dd-logo.png.asset.json";

const COPY = {
  es: {
    title: "Seguridad y protección",
    metaDesc: "DetencionDefensa.com utiliza cifrado de grado bancario, verificación de identidad y privacidad para proteger a cada familia.",
    heading: "Su información está protegida",
    intro: "Entendemos lo delicado de su situación. Por eso utilizamos las mismas herramientas de seguridad que los bancos y hospitales.",
    items: [
      { label: "Cifrado de grado bancario", desc: "Toda la información se transmite y almacena cifrada con TLS 1.3 y AES-256." },
      { label: "Verificación de identidad", desc: "Confirmamos quién accede a cada cuenta para evitar suplantación." },
      { label: "Servidores seguros", desc: "Infraestructura auditada en centros de datos con certificaciones SOC 2." },
      { label: "Privacidad por diseño", desc: "No vendemos ni compartimos su información con terceros no autorizados." },
      { label: "Respuesta de emergencia", desc: "Solo usted, su abogado y sus contactos designados reciben alertas de SOS." },
    ],
    close: "Volver al inicio",
  },
  en: {
    title: "Security & protection",
    metaDesc: "DetencionDefensa.com uses bank-grade encryption, identity verification, and privacy safeguards to protect every family.",
    heading: "Your information is protected",
    intro: "We understand how sensitive your situation is. That is why we use the same security tools as banks and hospitals.",
    items: [
      { label: "Bank-grade encryption", desc: "All data is transmitted and stored encrypted with TLS 1.3 and AES-256." },
      { label: "Identity verification", desc: "We verify who accesses each account to prevent impersonation." },
      { label: "Secure servers", desc: "Audited infrastructure in data centers with SOC 2 certifications." },
      { label: "Privacy by design", desc: "We do not sell or share your information with unauthorized third parties." },
      { label: "Emergency response", desc: "Only you, your attorney, and your designated contacts receive SOS alerts." },
    ],
    close: "Back to home",
  },
  ht: {
    title: "Sekirite ak pwoteksyon",
    metaDesc: "DetencionDefensa.com itilize kriptaj klas bank, verifikasyon idantite, ak pwoteksyon vi prive pou pwoteje chak fanmi.",
    heading: "Enfòmasyon ou pwoteje",
    intro: "Nou konprann ki jan sitiyasyon ou sansib. Se poutèt sa nou itilize menm zouti sekirite ak bank ak lopital.",
    items: [
      { label: "Kriptaj klas bank", desc: "Tout done transmèt ak estoke kripte ak TLS 1.3 ak AES-256." },
      { label: "Verifikasyon idantite", desc: "Nou verifye ki moun ki aksede chak kont pou anpeche moun pran idantite ou." },
      { label: "Sèvè sekirè", desc: "Enfrastrikti revize nan sant done ki gen sètifika SOC 2." },
      { label: "Vi prive pa konsepsyon", desc: "Nou pa vann oswa pataje enfòmasyon ou ak twazyèm pati ki pa otorize." },
      { label: "Repons ijans", desc: "Se sèl ou, avoka ou, ak kontak ou designe yo ki resevwa alert SOS." },
    ],
    close: "Retounen nan paj dakèy",
  },
} satisfies Record<Lang, { title: string; metaDesc: string; heading: string; intro: string; items: { label: string; desc: string }[]; close: string }>;

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security & protection — DetencionDefensa.com" },
      { name: "description", content: "Bank-grade encryption, identity verification, and privacy safeguards for every family." },
      { property: "og:title", content: "Security & protection — DetencionDefensa.com" },
      { property: "og:description", content: "Bank-grade encryption, identity verification, and privacy safeguards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  const { lang } = useLang();
  const t = COPY[lang];
  const isMobile = typeof window !== "undefined" ? window.innerWidth <= 720 : false;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0d2c54",
        color: "#ffffff",
        fontFamily: '"Work Sans", -apple-system, Roboto, Helvetica, Arial, sans-serif',
        padding: isMobile ? "1rem 0.75rem" : "1.5rem 1rem",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: isMobile ? 24 : 32 }}>
          <img
            src={logoAsset.url}
            alt="DetencionDefensa logo"
            width={40}
            height={40}
            style={{ width: 40, height: 40, display: "block" }}
          />
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2, color: "#e8a04a" }}>
            DetencionDefensa.com
          </span>
        </header>

        <h1
          style={{
            fontFamily: '"Roboto Slab", Georgia, serif',
            fontSize: isMobile ? "1.85rem" : "clamp(2rem, 4vw, 2.75rem)",
            fontWeight: 700,
            color: "#e8a04a",
            margin: "0 0 1rem",
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          {t.heading}
        </h1>

        <p
          style={{
            fontSize: isMobile ? 15 : 17,
            lineHeight: 1.55,
            textAlign: "center",
            maxWidth: 640,
            margin: "0 auto 2rem",
            color: "rgba(255,255,255,0.92)",
          }}
        >
          {t.intro}
        </p>

        <div
          style={{
            display: "grid",
            gap: isMobile ? 14 : 18,
            gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
            marginBottom: isMobile ? 32 : 40,
          }}
        >
          {t.items.map((item, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(232,160,74,0.35)",
                borderRadius: 14,
                padding: isMobile ? "1rem" : "1.25rem",
              }}
            >
              <h3
                style={{
                  margin: "0 0 0.5rem",
                  fontSize: isMobile ? 15 : 17,
                  fontWeight: 800,
                  color: "#e8a04a",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {item.label}
              </h3>
              <p style={{ margin: 0, fontSize: isMobile ? 14 : 15, lineHeight: 1.5, color: "rgba(255,255,255,0.9)" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#e8a04a",
              color: "#0f1830",
              textDecoration: "none",
              fontWeight: 800,
              fontSize: isMobile ? 14 : 15,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: isMobile ? "12px 24px" : "14px 28px",
              borderRadius: 999,
            }}
          >
            {t.close}
          </Link>
        </div>
      </div>
    </main>
  );
}
