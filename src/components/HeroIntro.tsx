import { useEffect, useState } from "react";
import { useLang, type Lang } from "@/context/LanguageContext";
import logoAsset from "@/assets/dd-logo.png.asset.json";
import detentionNightAsset from "@/assets/detention-night.png.asset.json";

const COPY = {
  es: {
    headline: "Protéjase antes de la detención.\nActúe hoy — no mañana.",
    subline: "Documentos legales creados y revisados por abogados — SIN COSTO.\nApp de emergencia para su teléfono: $10/mes.",
    ice: "ICE ARRESTA MÁS DE 2000 PERSONAS NO CIUDADANOS CADA DÍA",
    getStarted: "Regístrese ahora",
    watchVideos: "Ver videos",
  },
  en: {
    headline: "Protect yourself before detention.\nAct today — not tomorrow.",
    subline: "Legal documents created & reviewed by attorneys — NO CHARGE.\nEmergency app for your phone: $10/month.",
    ice: "ICE ARRESTS OVER 2000 NON-CITIZENS EVERY DAY",
    getStarted: "Get Started",
    watchVideos: "Watch videos",
  },
  ht: {
    headline: "Pwoteje tèt ou anvan arestasyon.\nAji jodi a — pa demen.",
    subline: "Dokiman legal avoka kreye ak revize — GRATIS.\nApp ijans pou telefòn ou: $10/mwa.",
    ice: "ICE ARETE PLIS PASE 2000 MOUN KI PA SITWAYEN CHAK JOU",
    getStarted: "Kòmanse",
    watchVideos: "Gade videyo yo",
  },
} satisfies Record<Lang, { headline: string; subline: string; ice: string; getStarted: string; watchVideos: string }>;

export default function HeroIntro() {
  const { lang, setLang } = useLang();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 720px)");
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return (
    <section
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.75)), url(${detentionNightAsset.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "#ffffff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily:
          '"Work Sans", -apple-system, Roboto, Helvetica, Arial, sans-serif',
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: isMobile ? "0.75rem" : "1rem",
          position: "relative",
        }}
      >
        {/* Nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            paddingTop: 4,
          }}
        >
          <a
            href="/"
            aria-label="DetencionDefensa home"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              color: "#ffffff",
              minWidth: 0,
            }}
          >
            <img
              src={logoAsset.url}
              alt="DetencionDefensa logo"
              width={40}
              height={40}
              style={{
                width: isMobile ? 32 : 40,
                height: isMobile ? 32 : 40,
                display: "block",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: isMobile ? 16 : 20,
                fontWeight: 700,
                letterSpacing: -0.3,
                color: "#ffffff",
                whiteSpace: "nowrap",
              }}
            >
              DetencionDefensa
            </span>
          </a>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                gap: 4,
                background: "#fff",
                border: "1px solid rgba(10,22,51,0.15)",
                borderRadius: 999,
                padding: 3,
                flexShrink: 0,
              }}
            >
              {(["es", "en", "ht"] as Lang[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setLang(code);
                  }}
                  style={{
                    background: lang === code ? "#112e51" : "transparent",
                    color: lang === code ? "#fff" : "#112e51",
                    border: "none",
                    borderRadius: 999,
                    padding: isMobile ? "6px 10px" : "8px 16px",
                    fontSize: isMobile ? 12 : 13,
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {code === "es" ? "Español" : code === "en" ? "English" : "Kreyòl"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hero content over the image */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: isMobile ? "2rem 0" : "3rem 0",
            gap: isMobile ? "1.25rem" : "1.75rem",
          }}
        >
          <span
            style={{
              fontFamily: '"Roboto Slab", Georgia, serif',
              fontSize: isMobile ? "0.95rem" : "clamp(1.1rem, 2vw, 1.6rem)",
              fontWeight: 700,
              color: "#e8a04a",
              letterSpacing: isMobile ? 1 : 2,
              textTransform: "uppercase",
              lineHeight: 1.3,
              display: "block",
              textShadow: "0 2px 8px rgba(0,0,0,0.6)",
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            {COPY[lang].ice}
          </span>

          <h1
            style={{
              fontFamily: '"Roboto Slab", Georgia, serif',
              fontSize: isMobile ? "1.9rem" : "clamp(2.25rem, 5.4vw, 3.75rem)",
              fontWeight: 700,
              lineHeight: 1.08,
              margin: 0,
              letterSpacing: "-0.005em",
              whiteSpace: "pre-line",
              textAlign: "center",
            }}
          >
            {(() => {
              const [line1, line2] = COPY[lang].headline.split("\n");
              return (
                <>
                  <span style={{ color: "#ffffff" }}>{line1}</span>
                  {"\n"}
                  <span style={{ color: "#e85d3a" }}>{line2}</span>
                </>
              );
            })()}
          </h1>

          <p
            style={{
              fontFamily: '"Roboto Slab", Georgia, serif',
              fontSize: isMobile ? "1rem" : "clamp(1.05rem, 1.7vw, 1.35rem)",
              lineHeight: 1.4,
              maxWidth: 720,
              margin: "0 auto",
              fontWeight: 500,
              color: "#ffffff",
              whiteSpace: "pre-line",
              textAlign: "center",
            }}
          >
            {COPY[lang].subline}
          </p>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <a
              href="/terms"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#e8a04a",
                color: "#0f1830",
                textDecoration: "none",
                fontWeight: 800,
                fontSize: isMobile ? 14 : 16,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: isMobile ? "12px 22px" : "14px 28px",
                borderRadius: 999,
                boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {COPY[lang].getStarted} →
            </a>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <a
              href="/videos"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: "#e8a04a",
                color: "#0f1830",
                textDecoration: "none",
                fontWeight: 800,
                fontSize: isMobile ? 15 : 17,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: isMobile ? "14px 24px" : "16px 32px",
                borderRadius: 999,
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                fontFamily: "inherit",
              }}
            >
              <span
                aria-hidden
                style={{
                  display: "inline-block",
                  width: 0,
                  height: 0,
                  borderTop: "9px solid transparent",
                  borderBottom: "9px solid transparent",
                  borderLeft: "14px solid #0f1830",
                }}
              />
              {COPY[lang].watchVideos}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
