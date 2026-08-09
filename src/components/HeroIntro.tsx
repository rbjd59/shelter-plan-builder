import { useEffect, useState } from "react";
import { useLang, type Lang } from "@/context/LanguageContext";
import logoAsset from "@/assets/dd-logo.png.asset.json";
import detentionNightAsset from "@/assets/ice-plane.png.asset.json";

const COPY = {
  es: {
    plan: "Plan de protección ante detención ICE ",
    price: "$199.",
    freeText: "Ahora gratis debido a la crisis comunitaria.",
    ice: "ICE ARRESTÓ A 51,000 PERSONAS EN JULIO",
    tagline1: "The secure one-click emergency alert system and pro se attorney-reviewed legal defense plan",
    secBoxHeading: "SEGURIDAD DE PRIMERA CLASE",
    secBoxBody: "Esta app fue diseñada con la privacidad y la seguridad en su núcleo.",
    appBoxHeading: "APP GRATUITA PARA EL TELÉFONO",
    appBoxBody: "Notifica al instante a tus contactos y abogado si enfrentas un arresto.",
    disclaimer:
      "DetencionDefensa.com proporciona software de admisión seguro, traducción y servicios automatizados de preparación de documentos. No somos una firma de abogados y no proporcionamos asesoramiento legal.",
  },
  en: {
    plan: "ICE detention protection plan ",
    price: "$199.",
    freeText: "Now free due to community crisis.",
    ice: "ICE arrests 51,000 people in July",
    tagline1: "The secure one-click emergency alert system and pro se attorney-reviewed legal defense plan",
    secBoxHeading: "BEST IN CLASS SECURITY",
    secBoxBody: "This app was designed with privacy and security at its very core.",
    appBoxHeading: "FREE APP FOR PHONE",
    appBoxBody: "Instantly notify contacts and attorney if you are faced with arrest.",
    disclaimer:
      "DetencionDefensa.com provides secure admission software, translation, and automated document preparation services. We are not a law firm and do not provide legal advice.",
  },
  ht: {
    plan: "Plan pwoteksyon pou arestasyon ICE ",
    price: "$199.",
    freeText: "Kounye a gratis akòz kriz kominotè a.",
    ice: "ICE arete 51,000 moun an jiyè",
    tagline1: "The secure one-click emergency alert system and pro se attorney-reviewed legal defense plan",
    secBoxHeading: "SEKIRITE PI BON KLAS",
    secBoxBody: "Aplikasyon sa a fèt ak vi prive ak sekirite kòm nwayo li.",
    appBoxHeading: "APP GRATIS POU TELEFÒN",
    appBoxBody: "Fè kontak ak avoka w konnen imedyatman si yo arete w.",
    disclaimer:
      "DetencionDefensa.com ofri lojisyèl admisyon ki an sekirite, tradiksyon, ak sèvis preparasyon dokiman otomatik. Nou pa yon kabinè avoka e nou pa bay konsèy legal.",
  },
} satisfies Record<Lang, { plan: string; price: string; freeText: string; ice: string; tagline1: string; secBoxHeading: string; secBoxBody: string; appBoxHeading: string; appBoxBody: string; disclaimer: string }>;

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
        minHeight: "78vh",
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
            padding: isMobile ? "0.75rem 0" : "1.25rem 0",
            gap: isMobile ? "0.9rem" : "1.1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: '"Roboto Slab", Georgia, serif',
                fontSize: isMobile ? (lang === "es" ? "1.3rem" : "1.1rem") : (lang === "es" ? "clamp(1.7rem, 3.4vw, 2.5rem)" : "clamp(1.25rem, 2.6vw, 1.9rem)"),
                fontWeight: 700,
                lineHeight: lang === "es" ? 1.05 : 1.1,
                margin: 0,
                letterSpacing: "-0.005em",
                textAlign: "center",
                color: "#e8a04a",
                textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                textTransform: "uppercase",
                maxWidth: 1000,
                marginInline: "auto",
              }}
            >
              {COPY[lang].ice}
            </h1>

            <p
              style={{
                fontFamily: '"Roboto Slab", Georgia, serif',
                fontSize: isMobile ? "0.7rem" : "0.8rem",
                lineHeight: 1.2,
                fontWeight: 400,
                color: "rgba(255,255,255,0.7)",
                margin: "0.1rem auto 0",
                textAlign: "center",
                textShadow: "0 1px 6px rgba(0,0,0,0.6)",
              }}
            >
              ABC News
            </p>
          </div>

          <div
            style={{
              fontFamily: '"Roboto Slab", Georgia, serif',
              maxWidth: 1240,
              margin: "0 auto",
              width: "100%",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: isMobile ? "0.5rem" : "0.75rem",
            }}
          >
            <p
              style={{
                fontSize: isMobile ? "1.5rem" : "clamp(2rem, 5vw, 3.4rem)",
                lineHeight: 1.15,
                fontWeight: 800,
                color: "#ffffff",
                margin: 0,
                whiteSpace: "normal",
                textShadow: "0 2px 10px rgba(0,0,0,0.6)",
              }}
            >
              <PriceWithX prefix={COPY[lang].plan} price={COPY[lang].price} />
            </p>

            <p
              style={{
                fontFamily: '"Roboto Slab", Georgia, serif',
                fontSize: isMobile ? "1.25rem" : "clamp(1.4rem, 3vw, 2.2rem)",
                lineHeight: 1.2,
                fontWeight: 800,
                color: "#ef4444",
                margin: 0,
                textShadow: "0 2px 10px rgba(0,0,0,0.6)",
              }}
            >
              {COPY[lang].freeText}
            </p>
          </div>

          <p
            style={{
              margin: isMobile ? "0.25rem auto 0.15rem" : "0.35rem auto 0.4rem",
              maxWidth: 1100,
              width: "100%",
              fontFamily: '"Roboto Slab", Georgia, serif',
              fontSize: isMobile ? "0.95rem" : "clamp(1.05rem, 1.7vw, 1.35rem)",
              lineHeight: 1.25,
              fontWeight: 700,
              color: "#e8a04a",
              textAlign: "center",
              textShadow: "0 2px 8px rgba(0,0,0,0.6)",
            }}
          >
            {COPY[lang].tagline1}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: isMobile ? "0.75rem" : "1.25rem",
              marginTop: "0.25rem",
            }}
          >
            <a
              href="#how-it-works-video"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: isMobile ? "0.7rem 1.6rem" : "0.95rem 2.4rem",
                borderRadius: 999,
                border: "2px solid #e8a04a",
                background: "#e8a04a",
                color: "#112e51",
                fontWeight: 800,
                fontSize: isMobile ? "0.9rem" : "1.05rem",
                letterSpacing: "0.01em",
                textDecoration: "none",
                fontFamily: "inherit",
                boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 22px rgba(0,0,0,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.35)";
              }}
            >
              How Protection Plan Works
            </a>
            <a
              href="#homeowner-video"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: isMobile ? "0.7rem 1.6rem" : "0.95rem 2.4rem",
                borderRadius: 999,
                border: "2px solid #ffffff",
                background: "transparent",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: isMobile ? "0.9rem" : "1.05rem",
                letterSpacing: "0.01em",
                textDecoration: "none",
                fontFamily: "inherit",
                boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 22px rgba(0,0,0,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.35)";
              }}
            >
              If You're a Homeowner
            </a>
          </div>

          {/* Feature boxes */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: isMobile ? "0.75rem" : "1.25rem",
              maxWidth: 1100,
              width: "100%",
              margin: "1rem auto 0",
            }}
          >
            <div
              style={{
                background: "rgba(17,46,81,0.55)",
                border: "2px solid #e8a04a",
                borderRadius: 16,
                padding: isMobile ? "1rem 1.1rem" : "1.35rem 1.6rem",
                textAlign: "left",
                boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: '"Roboto Slab", Georgia, serif',
                  fontWeight: 900,
                  fontSize: isMobile ? "0.95rem" : "1.15rem",
                  letterSpacing: "0.06em",
                  color: "#e8a04a",
                  textTransform: "uppercase",
                }}
              >
                {COPY[lang].secBoxHeading}
              </h3>
              <p
                style={{
                  margin: "0.4rem 0 0",
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 500,
                  fontSize: isMobile ? "0.85rem" : "0.98rem",
                  lineHeight: 1.35,
                  color: "#ffffff",
                }}
              >
                {COPY[lang].secBoxBody}
              </p>
            </div>

            <div
              style={{
                background: "rgba(17,46,81,0.55)",
                border: "2px solid #e8a04a",
                borderRadius: 16,
                padding: isMobile ? "1rem 1.1rem" : "1.35rem 1.6rem",
                textAlign: "left",
                boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: '"Roboto Slab", Georgia, serif',
                  fontWeight: 900,
                  fontSize: isMobile ? "0.95rem" : "1.15rem",
                  letterSpacing: "0.06em",
                  color: "#e8a04a",
                  textTransform: "uppercase",
                }}
              >
                {COPY[lang].appBoxHeading}
              </h3>
              <p
                style={{
                  margin: "0.4rem 0 0",
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 500,
                  fontSize: isMobile ? "0.85rem" : "0.98rem",
                  lineHeight: 1.35,
                  color: "#ffffff",
                }}
              >
                {COPY[lang].appBoxBody}
              </p>
            </div>
          </div>

        </div>

        {/* Bottom notice */}
        <div
          style={{
            padding: isMobile ? "0.75rem 0 0.5rem" : "1rem 0 0.5rem",
            marginTop: "auto",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <p
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "8pt",
              lineHeight: 1.4,
              color: "#ffffff",
              margin: 0,
              maxWidth: 900,
              marginInline: "auto",
              textShadow: "0 1px 3px rgba(0,0,0,0.6)",
            }}
          >
            {COPY[lang].disclaimer}
          </p>
        </div>
      </div>
    </section>
  );
}
