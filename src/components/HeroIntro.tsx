import { useEffect, useState } from "react";
import { useLang, type Lang } from "@/context/LanguageContext";

import logoAsset from "@/assets/dd-logo.png.asset.json";
import detentionNightAsset from "@/assets/hero-family.jpg.asset.json";

const COPY = {
  es: {
    plan: "Plan de protección ante detención ICE ",
    price: "$199.",
    freeText: "Ahora gratis debido a la crisis comunitaria.",
    tagline: "Alerta de emergencia",
    btn1: "Cómo funciona el plan de protección",
    btn2: "Si eres propietario de una vivienda",
    watchVideo: "Mira un video de un minuto",
    secBoxHeading: "Seguridad de primera clase",
    secBoxBody: "Diseñada con la privacidad y la seguridad en su núcleo.",
    secBoxBtn: "Más sobre seguridad",
    appBoxHeading: "App gratuita para el teléfono",
    appBoxBody: "Notifica al instante a tus contactos y abogado si enfrentas un arresto.",
    appBoxBtn: "Mira el video",
    homeBox: "Video de Protección para Propietarios",
    homeBoxHeading: "Proteja su casa",
    homeBoxBody: "Protección de fideicomiso de bajo costo diseñada por un abogado para proteger su casa.",
    disclaimer:
      "DetencionDefensa.com proporciona software de admisión seguro, traducción y servicios automatizados de preparación de documentos. No somos una firma de abogados y no proporcionamos asesoramiento legal.",
  },
  en: {
    plan: "ICE detention protection plan ",
    price: "$199.",
    freeText: "Now free due to community crisis.",
    tagline: "Alerta de emergencia",
    btn1: "How Protection Plan Works",
    btn2: "If You're a Homeowner",
    watchVideo: "Watch a one-minute video",
    secBoxHeading: "Best in class security",
    secBoxBody: "Designed with privacy and security at its very core.",
    secBoxBtn: "More on security",
    appBoxHeading: "Free app for phone",
    appBoxBody: "Instantly notify contacts and attorney if faced with arrest.",
    appBoxBtn: "Watch the video",
    homeBox: "Homeowner Protection Video",
    homeBoxHeading: "Protect your home",
    homeBoxBody: "Low-cost trust protection designed by an attorney to protect your home.",
    disclaimer:
      "DetencionDefensa.com provides secure admission software, translation, and automated document preparation services. We are not a law firm and do not provide legal advice.",
  },
  ht: {
    plan: "Plan pwoteksyon pou arestasyon ICE ",
    price: "$199.",
    freeText: "Kounye a gratis akòz kriz kominotè a.",
    tagline: "Alerta de emergencia",
    btn1: "Ki jan plan pwoteksyon an fonksyone",
    btn2: "Si w se yon pwopriyetè kay",
    watchVideo: "Gade yon videyo yon minit",
    secBoxHeading: "Sekirite pi bon klas",
    secBoxBody: "Fèt ak vi prive ak sekirite kòm nwayo li.",
    secBoxBtn: "Plis sou sekirite",
    appBoxHeading: "App gratis pou telefòn",
    appBoxBody: "Fè kontak ak avoka w konnen imedyatman si yo arete w.",
    appBoxBtn: "Gade videyo a",
    homeBox: "Videyo Pwoteksyon Pwopriyetè Kay",
    homeBoxHeading: "Pwoteje kay ou",
    homeBoxBody: "Pwoteksyon fidisyè ki ba pri ki fèt pa yon avoka pou pwoteje kay ou.",
    disclaimer:
      "DetencionDefensa.com ofri lojisyèl admisyon ki an sekirite, tradiksyon, ak sèvis preparasyon dokiman otomatik. Nou pa yon kabinè avoka e nou pa bay konsèy legal.",
  },
} satisfies Record<
  Lang,
  { plan: string; price: string; freeText: string; tagline: string; btn1: string; btn2: string; watchVideo: string; secBoxHeading: string; secBoxBody: string; secBoxBtn: string; appBoxHeading: string; appBoxBody: string; appBoxBtn: string; homeBox: string; homeBoxHeading: string; homeBoxBody: string; disclaimer: string }
>;

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
        backgroundImage: `linear-gradient(155deg, rgba(8,22,45,0.55) 0%, rgba(8,22,45,0.35) 32%, rgba(8,22,45,0.30) 58%, rgba(8,22,45,0.62) 100%), url(${detentionNightAsset.url})`,
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
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            justifyContent: isMobile ? "center" : "space-between",
            gap: isMobile ? 10 : 12,
            flexWrap: "wrap",
            paddingTop: 4,
            textAlign: "center",
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
              justifyContent: "center",
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
                textAlign: isMobile ? "center" : "left",
              }}
            >
              DetencionDefensa.com
            </span>
          </a>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
              flexWrap: "wrap",
              justifyContent: "center",
              width: isMobile ? "100%" : "auto",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                justifyContent: "center",
                gap: 4,
                background: "#fff",
                border: "1px solid rgba(10,22,51,0.15)",
                borderRadius: 999,
                padding: 3,
                flexShrink: 0,
                maxWidth: "100%",
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
                    letterSpacing: isMobile ? "0.04em" : "0.14em",
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
                textShadow: "0 1px 2px rgba(255,255,255,0.6)",
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
              fontFamily: '"Work Sans", sans-serif',
              fontSize: isMobile ? "1.55rem" : "clamp(1.5rem, 2.6vw, 2.1rem)",
              lineHeight: 1.35,
              fontWeight: 800,
              color: "#ffffff",
              margin: 0,
              maxWidth: 900,
              marginInline: "auto",
              textShadow: "0 1px 2px rgba(255,255,255,0.6)",
            }}
          >
            {COPY[lang].tagline}
          </p>

          {/* Feature boxes */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: isMobile ? "0.6rem" : "0.9rem",
              maxWidth: 1100,
              width: "100%",
              margin: "1rem auto 0",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(232,160,74,0.7)",
                borderRadius: 12,
                padding: isMobile ? "0.75rem 0.9rem" : "0.85rem 1.1rem",
                textAlign: "center",
                boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: '"Roboto Slab", Georgia, serif',
                  fontWeight: 900,
                  fontSize: isMobile ? "1.4rem" : "clamp(1.25rem, 2.4vw, 1.6rem)",
                  letterSpacing: "0.06em",
                  color: "#ff3b3b",
                  textTransform: "uppercase",
                  width: "100%",
                  lineHeight: 1.2,
                }}
              >
                {COPY[lang].appBoxHeading}
              </h3>
              <p
                style={{
                  margin: "0.25rem 0 0",
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  fontSize: isMobile ? "0.95rem" : "0.9rem",
                  lineHeight: 1.3,
                  color: "#ffffff",
                }}
              >
                {COPY[lang].appBoxBody}
              </p>
              <a
                href="#how-it-works-video"
                style={{
                  display: "inline-block",
                  marginTop: "0.55rem",
                  background: "#e8a04a",
                  color: "#0f1830",
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: isMobile ? "0.85rem" : "0.78rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  padding: "7px 16px",
                  borderRadius: 999,
                }}
              >
                {COPY[lang].appBoxBtn}
              </a>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(232,160,74,0.7)",
                borderRadius: 12,
                padding: isMobile ? "0.75rem 0.9rem" : "0.85rem 1.1rem",
                textAlign: "center",
                boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  justifyContent: "center",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontFamily: '"Roboto Slab", Georgia, serif',
                    fontWeight: 900,
                    fontSize: isMobile ? "1.4rem" : "clamp(1.25rem, 2.4vw, 1.6rem)",
                    letterSpacing: "0.06em",
                    color: "#ff3b3b",
                    textTransform: "uppercase",
                    width: "100%",
                    lineHeight: 1.2,
                  }}
                >
                  {COPY[lang].homeBoxHeading}
                </h3>
              </div>
              <p
                style={{
                  margin: "0.25rem 0 0",
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 600,
                  fontSize: isMobile ? "0.95rem" : "0.9rem",
                  lineHeight: 1.3,
                  color: "#ffffff",
                }}
              >
                {COPY[lang].homeBoxBody}
              </p>
              <a
                href="#homeowner-video"
                style={{
                  display: "inline-block",
                  marginTop: "0.55rem",
                  background: "#e8a04a",
                  color: "#0f1830",
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: isMobile ? "0.85rem" : "0.78rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  padding: "7px 16px",
                  borderRadius: 999,
                }}
              >
                {COPY[lang].appBoxBtn}
              </a>
            </div>
          </div>

          {/* Security box */}
          <a
            href="/security-faq"
            style={{
              display: "block",
              textDecoration: "none",
              background: "rgba(255,255,255,0.10)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(232,160,74,0.7)",
              borderRadius: 12,
              padding: isMobile ? "0.75rem 0.9rem" : "0.85rem 1.1rem",
              textAlign: "center",
              maxWidth: 1100,
              width: "100%",
              margin: "0.9rem auto 0",
              boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              WebkitTapHighlightColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <h3
              style={{
                margin: 0,
                fontFamily: '"Roboto Slab", Georgia, serif',
                fontWeight: 900,
                fontSize: isMobile ? "1.4rem" : "clamp(1.25rem, 2.4vw, 1.6rem)",
                letterSpacing: "0.06em",
                color: "#ff3b3b",
                textTransform: "uppercase",
                width: "100%",
                lineHeight: 1.2,
              }}
            >
              {COPY[lang].secBoxHeading}
            </h3>
            <p
              style={{
                margin: "0.25rem 0 0",
                fontFamily: '"Work Sans", sans-serif',
                fontWeight: 600,
                fontSize: isMobile ? "0.95rem" : "0.9rem",
                lineHeight: 1.3,
                color: "#ffffff",
              }}
            >
              {COPY[lang].secBoxBody}
            </p>
            <span
              style={{
                display: "inline-block",
                marginTop: "0.55rem",
                background: "#e8a04a",
                color: "#0f1830",
                textDecoration: "none",
                fontWeight: 800,
                fontSize: isMobile ? "0.85rem" : "0.78rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                padding: "7px 16px",
                borderRadius: 999,
              }}
            >
              {COPY[lang].secBoxBtn}
            </span>
          </a>

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
