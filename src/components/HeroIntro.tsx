import { useEffect, useState } from "react";
import { useLang, type Lang } from "@/context/LanguageContext";
import logoAsset from "@/assets/dd-logo.png.asset.json";
import detentionNightAsset from "@/assets/detention-night.png.asset.json";

const COPY = {
  es: {
    plan: "Plan de defensa legal con asistencia de abogado ",
    price: "$199.",
    freeText: "Ahora gratis debido a la crisis comunitaria.",
    ice: "ICE ARRESTA MÁS DE 2000 PERSONAS NO CIUDADANAS CADA DÍA",
    tagline1: "Plan seguro de defensa legal con aplicación de emergencia",
  },
  en: {
    plan: "Attorney-assisted legal defense plan ",
    price: "$199.",
    freeText: "Now free due to community crisis.",
    ice: "ICE ARRESTS OVER 2000 NON-CITIZENS EVERY DAY",
    tagline1: "Secure legal defense plan with emergency application",
  },
  ht: {
    plan: "Plan defans legal avèk asistans avoka ",
    price: "$199.",
    freeText: "Kounye a gratis akòz kriz kominotè a.",
    ice: "ICE ARETE PLIS PASE 2000 MOUN KI PA SITWAYEN CHAK JOU",
    tagline1: "Plan defans legal sekirize ak aplikasyon ijans",
  },
} satisfies Record<Lang, { plan: string; price: string; freeText: string; ice: string; tagline1: string }>;

function PriceWithX({ prefix, price }: { prefix: string; price: string }) {
  return (
    <>
      {prefix}
      <span
        style={{
          position: "relative",
          display: "inline-block",
          color: "inherit",
        }}
      >
        {price}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#ef4444",
            fontWeight: 900,
            fontSize: "1.25em",
            lineHeight: 1,
            pointerEvents: "none",
            textShadow: "0 1px 3px rgba(0,0,0,0.5)",
          }}
        >
          ✕
        </span>
      </span>
    </>
  );
}


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
            aria-label="DetencionDefensa.com home"
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
                fontSize: isMobile ? 14 : 16,
                fontWeight: 700,
                letterSpacing: -0.2,
                color: "#ffffff",
                whiteSpace: "nowrap",
                lineHeight: 1.2,
                textAlign: "left",
              }}
            >
              DetencionDefensa.com
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
                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
              }}
            >
              <PriceWithX prefix={COPY[lang].plan} price={COPY[lang].price} />
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
            {COPY[lang].tagline1}
            <br />
            {COPY[lang].tagline2}
          </p>

        </div>
      </div>
    </section>
  );
}
