import { useEffect, useState } from "react";
import { useLang, type Lang } from "@/context/LanguageContext";
import logoAsset from "@/assets/dd-logo.png.asset.json";
import detentionNightAsset from "@/assets/ice-detention-facility.jpg.asset.json";

const COPY = {
  es: {
    plan: "Plan de protección ante detención ICE ",
    price: "$199.",
    freeText: "Ahora gratis debido a la crisis comunitaria.",
    tagline: "Alerta de emergencia de un clic y plan de defensa legal revisado por un abogado",
    btn1: "Cómo funciona el plan de protección",
    btn2: "Si eres propietario de una vivienda",
    watchVideo: "Mira un video de un minuto",
    secBoxHeading: "Seguridad de primera clase",
    secBoxBody: "Diseñada con la privacidad y la seguridad en su núcleo.",
    appBoxHeading: "App gratuita para el teléfono",
    appBoxBody: "Notifica al instante a tus contactos y abogado si enfrentas un arresto.",
    disclaimer:
      "DetencionDefensa.com proporciona software de admisión seguro, traducción y servicios automatizados de preparación de documentos. No somos una firma de abogados y no proporcionamos asesoramiento legal.",
  },
  en: {
    plan: "ICE detention protection plan ",
    price: "$199.",
    freeText: "Now free due to community crisis.",
    tagline: "One-click emergency alert and attorney-reviewed legal defense plan",
    btn1: "How Protection Plan Works",
    btn2: "If You're a Homeowner",
    watchVideo: "Watch a one-minute video",
    secBoxHeading: "Best in class security",
    secBoxBody: "Designed with privacy and security at its very core.",
    appBoxHeading: "Free app for phone",
    appBoxBody: "Instantly notify contacts and attorney if faced with arrest.",
    disclaimer:
      "DetencionDefensa.com provides secure admission software, translation, and automated document preparation services. We are not a law firm and do not provide legal advice.",
  },
  ht: {
    plan: "Plan pwoteksyon pou arestasyon ICE ",
    price: "$199.",
    freeText: "Kounye a gratis akòz kriz kominotè a.",
    tagline: "Sijè a alèt dijans yon sèl kli epi plan defans legal revize pa yon avoka",
    btn1: "Ki jan plan pwoteksyon an fonksyone",
    btn2: "Si w se yon pwopriyetè kay",
    watchVideo: "Gade yon videyo yon minit",
    secBoxHeading: "Sekirite pi bon klas",
    secBoxBody: "Fèt ak vi prive ak sekirite kòm nwayo li.",
    appBoxHeading: "App gratis pou telefòn",
    appBoxBody: "Fè kontak ak avoka w konnen imedyatman si yo arete w.",
    disclaimer:
      "DetencionDefensa.com ofri lojisyèl admisyon ki an sekirite, tradiksyon, ak sèvis preparasyon dokiman otomatik. Nou pa yon kabinè avoka e nou pa bay konsèy legal.",
  },
} satisfies Record<
  Lang,
  { plan: string; price: string; freeText: string; tagline: string; btn1: string; btn2: string; watchVideo: string; secBoxHeading: string; secBoxBody: string; appBoxHeading: string; appBoxBody: string; disclaimer: string }
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
        backgroundImage: `radial-gradient(1200px 600px at 15% -10%, rgba(232,160,74,0.14) 0%, rgba(232,160,74,0) 55%), radial-gradient(1000px 700px at 90% 110%, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0) 60%), linear-gradient(160deg, #0a2a54 0%, #0d3466 45%, #0b2c57 100%)`,
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
              fontSize: isMobile ? "0.95rem" : "1.15rem",
              lineHeight: 1.35,
              fontWeight: 500,
              color: "#ffffff",
              margin: 0,
              maxWidth: 820,
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
              maxWidth: 760,
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
                textAlign: isMobile ? "center" : "left",
                boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: '"Roboto Slab", Georgia, serif',
                  fontWeight: 900,
                  fontSize: isMobile ? "0.8rem" : "0.95rem",
                  letterSpacing: "0.08em",
                  color: "#f5b860",
                  textTransform: "uppercase",
                }}
              >
                {COPY[lang].secBoxHeading}
              </h3>
              <p
                style={{
                  margin: "0.25rem 0 0",
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 500,
                  fontSize: isMobile ? "0.8rem" : "0.9rem",
                  lineHeight: 1.3,
                  color: "#ffffff",
                }}
              >
                {COPY[lang].secBoxBody}
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(232,160,74,0.7)",
                borderRadius: 12,
                padding: isMobile ? "0.75rem 0.9rem" : "0.85rem 1.1rem",
                textAlign: isMobile ? "center" : "left",
                boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: '"Roboto Slab", Georgia, serif',
                  fontWeight: 900,
                  fontSize: isMobile ? "0.8rem" : "0.95rem",
                  letterSpacing: "0.08em",
                  color: "#f5b860",
                  textTransform: "uppercase",
                }}
              >
                {COPY[lang].appBoxHeading}
              </h3>
              <p
                style={{
                  margin: "0.25rem 0 0",
                  fontFamily: '"Work Sans", sans-serif',
                  fontWeight: 500,
                  fontSize: isMobile ? "0.8rem" : "0.9rem",
                  lineHeight: 1.3,
                  color: "#ffffff",
                }}
              >
                {COPY[lang].appBoxBody}
              </p>
            </div>
          </div>

          {/* CTA buttons */}
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
