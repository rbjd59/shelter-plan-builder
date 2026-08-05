import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLang, type Lang } from "@/context/LanguageContext";
import logoAsset from "@/assets/dd-logo.png.asset.json";
import detentionNightAsset from "@/assets/detention-night.png.asset.json";

const COPY = {
  es: {
    strikethrough: "Plan de defensa legal con asistencia de abogado $199.",
    freeText: "Ahora gratis debido a la crisis comunitaria.",
    ice: "ICE ARRESTA MÁS DE 2000 PERSONAS NO CIUDADANAS CADA DÍA",
    tagline:
      "Plan seguro de defensa legal con un solo clic y aplicación de alerta de emergencia para personas en riesgo de detención por inmigración",
  },
  en: {
    strikethrough: "Attorney-assisted legal defense plan $199.",
    freeText: "Now free due to community crisis.",
    ice: "ICE ARRESTS OVER 2000 NON-CITIZENS EVERY DAY",
    tagline:
      "Secure one-click legal defense plan and emergency alert application for people at risk of immigration enforcement detention",
  },
  ht: {
    strikethrough: "Plan defans legal avèk asistans avoka $199.",
    freeText: "Kounye a gratis akòz kriz kominotè a.",
    ice: "ICE ARETE PLIS PASE 2000 MOUN KI PA SITWAYEN CHAK JOU",
    tagline:
      "Plan defans legal sekirize an yon sèl klik ak aplikasyon alèt ijans pou moun ki an risk detansyon imigrasyon",
  },
} satisfies Record<Lang, { strikethrough: string; freeText: string; ice: string; tagline: string }>;


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
        backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${detentionNightAsset.url})`,
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

          <div
            style={{
              fontFamily: '"Roboto Slab", Georgia, serif',
              maxWidth: 720,
              margin: "0 auto",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: isMobile ? "0.35rem" : "0.5rem",
            }}
          >
            <p
              style={{
                fontSize: isMobile ? "2rem" : "clamp(2.1rem, 3.4vw, 2.7rem)",
                lineHeight: 1.2,
                fontWeight: 600,
                color: "#ffffff",
                margin: 0,
                textDecoration: "line-through",
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              {COPY[lang].strikethrough}
            </p>
            <p
              style={{
                fontSize: isMobile ? "1.45rem" : "clamp(1.6rem, 3vw, 2.25rem)",
                lineHeight: 1.15,
                fontWeight: 800,
                color: "#ef4444",
                margin: 0,
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              {COPY[lang].freeText}
            </p>
          </div>

          <p
            style={{
              margin: isMobile ? "2.5rem auto 0" : "3.5rem auto 0",
              maxWidth: 1100,
              width: "100%",
              fontFamily: '"Roboto Slab", Georgia, serif',
              fontSize: isMobile ? "1.05rem" : "clamp(1.15rem, 2vw, 1.6rem)",
              lineHeight: 1.3,
              fontWeight: 700,
              color: "#e8a04a",
              textAlign: "center",
              textShadow: "0 2px 8px rgba(0,0,0,0.6)",
            }}
          >
            {COPY[lang].tagline}
          </p>

        </div>
      </div>
    </section>
  );
}
