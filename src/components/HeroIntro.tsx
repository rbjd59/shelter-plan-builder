import { useEffect, useState } from "react";
import { useLang, type Lang } from "@/context/LanguageContext";

import logoAsset from "@/assets/dd-logo.png.asset.json";
import detentionNightAsset from "@/assets/hero-family.jpg.asset.json";

const COPY = {
  es: {
    plan: "Plan de protección ante detención ICE ",
    wasPrice: "$199",
    freeText: "Gratis — pro bono por la crisis comunitaria.",
    tagline: "Alerta de emergencia de un clic y plan de defensa legal revisado por un abogado",
    btn1: "Cómo funciona el plan de protección",
    btn2: "Si eres propietario de una vivienda",
    watchVideo: "Mira un video de un minuto",
    secBoxHeading: "Seguridad y privacidad integradas",
    secBoxBody: "Diseñada con la privacidad y la seguridad en su núcleo.",
    secBoxBtn: "Más sobre seguridad",
    employerHeading: "Empleadores e iglesias",
    appBoxHeading: "App gratuita para el teléfono",
    appBoxBody: "Notifica al instante a tus contactos y abogado si enfrentas un arresto.",
    appBoxBtn: "Mira el video",
    homeBox: "Video de Protección para Propietarios",
    homeBoxHeading: "Proteja su casa",
    homeBoxBody: "Protección de fideicomiso de bajo costo diseñada por un abogado para proteger su casa.",
    privilegeNotice:
      "Toda la información ingresada aquí está protegida por el privilegio abogado-cliente, exactamente como si hubiera contratado a un abogado de inmigración. Como este servicio es gratuito, usted sigue recibiendo la misma protección segura y confidencial de privacidad bajo la ley entre usted y su abogado.",
    disclaimer:
      "Sorrentino Law Firm PLLC opera este sitio bajo licencia de DetencionDefensa.com, Inc. DetencionDefensa.com, Inc. es estrictamente el desarrollador tecnológico y operador del sitio web; la Firma tiene el control exclusivo de todos los servicios legales, el asesoramiento legal y el contenido legal.",
  },
  en: {
    plan: "ICE detention protection plan ",
    wasPrice: "$199",
    freeText: "Free — pro bono due to the community crisis.",
    tagline: "One-click emergency alert and attorney-reviewed legal defense plan",
    btn1: "How Protection Plan Works",
    btn2: "If You're a Homeowner",
    watchVideo: "Watch a one-minute video",
    secBoxHeading: "Security and privacy built in",
    secBoxBody: "Designed with privacy and security at its very core.",
    secBoxBtn: "More on security",
    employerHeading: "Employers & churches",
    appBoxHeading: "Free app for phone",
    appBoxBody: "Instantly notify contacts and attorney if faced with arrest.",
    appBoxBtn: "Watch the video",
    homeBox: "Homeowner Protection Video",
    homeBoxHeading: "Protect your home",
    homeBoxBody: "Low-cost trust protection designed by an attorney to protect your home.",
    privilegeNotice:
      "All information entered here is protected under attorney-client privilege, exactly as if you had hired an immigration attorney. Because this service is free, you still receive the same secure and confidential privacy protection under the law between you and your attorney.",
    disclaimer:
      "Sorrentino Law Firm PLLC operates this site under license from DetencionDefensa.com, Inc. DetencionDefensa.com, Inc. is strictly the technology developer and website operator; the Firm has sole control of all legal services, legal advice, and legal content.",
  },
  ht: {
    plan: "Plan pwoteksyon pou arestasyon ICE ",
    wasPrice: "$199",
    freeText: "Gratis — pro bono akòz kriz kominotè a.",
    tagline: "Sijè a alèt dijans yon sèl kli epi plan defans legal revize pa yon avoka",
    btn1: "Ki jan plan pwoteksyon an fonksyone",
    btn2: "Si w se yon pwopriyetè kay",
    watchVideo: "Gade yon videyo yon minit",
    secBoxHeading: "Sekirite ak konfidansyalite entegre",
    secBoxBody: "Fèt ak vi prive ak sekirite kòm nwayo li.",
    secBoxBtn: "Plis sou sekirite",
    employerHeading: "Anplwayè ak legliz",
    appBoxHeading: "App gratis pou telefòn",
    appBoxBody: "Fè kontak ak avoka w konnen imedyatman si yo arete w.",
    appBoxBtn: "Gade videyo a",
    homeBox: "Videyo Pwoteksyon Pwopriyetè Kay",
    homeBoxHeading: "Pwoteje kay ou",
    homeBoxBody: "Pwoteksyon fidisyè ki ba pri ki fèt pa yon avoka pou pwoteje kay ou.",
    privilegeNotice:
      "Tout enfòmasyon ou antre isit la pwoteje pa privilèj avoka-kliyan, menm jan si ou te anboche yon avoka imigrasyon. Paske sèvis sa a gratis, ou toujou resevwa menm pwoteksyon sekirite ak konfidansyalite anba lwa a ant ou menm ak avoka w.",
    disclaimer:
      "Se Sorrentino Law Firm PLLC k ap opere sit sa a anba yon lisans DetencionDefensa.com, Inc. bay. DetencionDefensa.com, Inc. se sèlman devlopè teknoloji a ak operatè sit la; Kabinè a gen kontwòl total sou tout sèvis legal, konsèy legal, ak kontni legal.",
  },
} satisfies Record<
  Lang,
  { plan: string; wasPrice: string; freeText: string; tagline: string; btn1: string; btn2: string; watchVideo: string; secBoxHeading: string; secBoxBody: string; secBoxBtn: string; employerHeading: string; appBoxHeading: string; appBoxBody: string; appBoxBtn: string; homeBox: string; homeBoxHeading: string; homeBoxBody: string; privilegeNotice: string; disclaimer: string }
>;


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
              justifyContent: "flex-start",
              padding: isMobile ? "0.5rem 0" : "0.75rem 0",
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
                color: "#00d4ff",
                margin: 0,
                whiteSpace: "normal",
                textShadow: "0 1px 2px rgba(255,255,255,0.6)",
                textTransform: "uppercase",
              }}
            >
              {COPY[lang].plan}
            </p>

            <p
              style={{
                fontFamily: '"Roboto Slab", Georgia, serif',
                fontSize: isMobile ? "1.25rem" : "clamp(1.4rem, 3vw, 2.2rem)",
                lineHeight: 1.2,
                fontWeight: 800,
                color: "#ffffff",
                margin: 0,
                textShadow: "0 2px 10px rgba(0,0,0,0.6)",
              }}
            >
              <span
                style={{
                  color: "#ff4d4d",
                  textDecoration: "line-through",
                  textDecorationColor: "#ff4d4d",
                  textDecorationThickness: "3px",
                  marginRight: "0.5rem",
                }}
              >
                {COPY[lang].wasPrice}
              </span>
              {COPY[lang].freeText}
            </p>
          </div>

          {/* Feature boxes */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: isMobile ? "0.35rem" : "0.5rem",
              maxWidth: 700,
              width: "100%",
              margin: "calc(2.5rem + 40px) auto 0",
            }}
          >
            {/* Free app */}
            <div
              style={{
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(232,160,74,0.7)",
                borderRadius: 12,
                padding: isMobile ? "0.6rem 0.8rem" : "0.7rem 1rem",
                textAlign: "center",
                boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: '"Roboto Slab", Georgia, serif',
                  fontWeight: 900,
                  fontSize: isMobile ? "1.15rem" : "clamp(1.1rem, 2vw, 1.4rem)",
                  letterSpacing: "0.06em",
                  color: "#00d4ff",
                  textTransform: "uppercase",
                  width: "100%",
                  lineHeight: 1.2,
                }}
              >
                {COPY[lang].appBoxHeading}
              </h3>
              <a
                href="#how-it-works-video"
                style={{
                  display: "inline-block",
                  marginTop: "0.45rem",
                  background: "#e8a04a",
                  color: "#0f1830",
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: isMobile ? "0.8rem" : "0.74rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  padding: "6px 14px",
                  borderRadius: 999,
                }}
              >
                {COPY[lang].appBoxBtn}
              </a>
            </div>

            {/* Protect your home */}
            <div
              style={{
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(232,160,74,0.7)",
                borderRadius: 12,
                padding: isMobile ? "0.6rem 0.8rem" : "0.7rem 1rem",
                textAlign: "center",
                boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: '"Roboto Slab", Georgia, serif',
                  fontWeight: 900,
                  fontSize: isMobile ? "1.15rem" : "clamp(1.1rem, 2vw, 1.4rem)",
                  letterSpacing: "0.06em",
                  color: "#00d4ff",
                  textTransform: "uppercase",
                  width: "100%",
                  lineHeight: 1.2,
                }}
              >
                {COPY[lang].homeBoxHeading}
              </h3>
              <a
                href="#homeowner-video"
                style={{
                  display: "inline-block",
                  marginTop: "0.45rem",
                  background: "#e8a04a",
                  color: "#0f1830",
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: isMobile ? "0.8rem" : "0.74rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  padding: "6px 14px",
                  borderRadius: 999,
                }}
              >
                {COPY[lang].appBoxBtn}
              </a>
            </div>

            {/* Best in class */}
            <a
              href="#security-video"
              style={{
                display: "block",
                textDecoration: "none",
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(232,160,74,0.7)",
                borderRadius: 12,
                padding: isMobile ? "0.6rem 0.8rem" : "0.7rem 1rem",
                textAlign: "center",
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
                  fontSize: isMobile ? "1.15rem" : "clamp(1.1rem, 2vw, 1.4rem)",
                  letterSpacing: "0.06em",
                  color: "#00d4ff",
                  textTransform: "uppercase",
                  width: "100%",
                  lineHeight: 1.2,
                }}
              >
                {COPY[lang].secBoxHeading}
              </h3>
              <span
                style={{
                  display: "inline-block",
                  marginTop: "0.45rem",
                  background: "#e8a04a",
                  color: "#0f1830",
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: isMobile ? "0.8rem" : "0.74rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  padding: "6px 14px",
                  borderRadius: 999,
                }}
              >
                {COPY[lang].secBoxBtn}
              </span>
            </a>

            {/* Employers & churches */}
            <div
              style={{
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(4px)",
                border: "1px solid rgba(232,160,74,0.7)",
                borderRadius: 12,
                padding: isMobile ? "0.6rem 0.8rem" : "0.7rem 1rem",
                textAlign: "center",
                boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: '"Roboto Slab", Georgia, serif',
                  fontWeight: 900,
                  fontSize: isMobile ? "1.15rem" : "clamp(1.1rem, 2vw, 1.4rem)",
                  letterSpacing: "0.06em",
                  color: "#00d4ff",
                  textTransform: "uppercase",
                  width: "100%",
                  lineHeight: 1.2,
                }}
              >
                {COPY[lang].employerHeading}
              </h3>
              <a
                href="/videos#employer-video"
                style={{
                  display: "inline-block",
                  marginTop: "0.45rem",
                  background: "#e8a04a",
                  color: "#0f1830",
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: isMobile ? "0.8rem" : "0.74rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  padding: "6px 14px",
                  borderRadius: 999,
                }}
              >
                {COPY[lang].appBoxBtn}
              </a>
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
