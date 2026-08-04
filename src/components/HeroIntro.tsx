import { useEffect, useState } from "react";
import { useLang, type Lang } from "@/context/LanguageContext";
import logoAsset from "@/assets/dd-logo.png.asset.json";
import detentionNightAsset from "@/assets/detention-night.png.asset.json";

const COPY = {
  es: {
    subline: "Plan de defensa contra detención por ICE GRATIS*.\nApp de emergencia, $10 al mes.",
    ice: "ICE ARRESTA MÁS DE 2000 PERSONAS NO CIUDADANOS CADA DÍA",
    getStarted: "Regístrese ahora",
    watchVideos: "Ver videos",
  },
  en: {
    subline: "Free ICE Detention defense plan*.\nEmergency app, $10 a month.",
    ice: "ICE ARRESTS OVER 2000 NON-CITIZENS EVERY DAY",
    getStarted: "Get Started",
    watchVideos: "Watch videos",
  },
  ht: {
    subline: "Plan defans kont detansyon ICE gratis*.\nApp ijans, $10 pa mwa.",
    ice: "ICE ARETE PLIS PASE 2000 MOUN KI PA SITWAYEN CHAK JOU",
    getStarted: "Kòmanse",
    watchVideos: "Gade videyo yo",
  },
} satisfies Record<Lang, { subline: string; ice: string; getStarted: string; watchVideos: string }>;

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
        minHeight: "70vh",
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
            aria-label="Community Service Program home"
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
              alt="Community Service Program logo"
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
                fontSize: isMobile ? 12 : 15,
                fontWeight: 700,
                letterSpacing: -0.3,
                color: "#ffffff",
                whiteSpace: "normal",
                lineHeight: 1.2,
                textAlign: "left",
                maxWidth: isMobile ? 180 : 320,
              }}
            >
              Community Service Program — Developed and funded by DetencionDefensa.com, offered through Refuge Outreach, a 501(c)(3) charity.
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
          <h1
            style={{
              fontFamily: '"Roboto Slab", Georgia, serif',
              fontSize: isMobile ? "1.9rem" : "clamp(2.25rem, 5.4vw, 3.75rem)",
              fontWeight: 700,
              lineHeight: 1.08,
              margin: 0,
              letterSpacing: "-0.005em",
              textAlign: "center",
              color: "#e8a04a",
              textShadow: "0 2px 8px rgba(0,0,0,0.6)",
              textTransform: "uppercase",
              maxWidth: 900,
              marginInline: "auto",
            }}
          >
            {COPY[lang].ice}
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


          <div style={{ display: "flex", justifyContent: "center", marginTop: isMobile ? "2rem" : "3rem" }}>
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
