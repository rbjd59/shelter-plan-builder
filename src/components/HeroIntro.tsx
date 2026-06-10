import { useEffect, useRef, useState } from "react";
import { useLang, type Lang } from "@/context/LanguageContext";
import esAsset from "@/assets/videos/detenciondefensa_es.mp4.asset.json";
import enAsset from "@/assets/videos/detenciondefensa_en.mp4.asset.json";
import htAsset from "@/assets/videos/detenciondefensa_ht.mp4.asset.json";
import logoAsset from "@/assets/dd-logo.png.asset.json";
import iceLeftAsset from "@/assets/ice-arrest-new.jpg.asset.json";


const SRC = { es: esAsset.url, en: enAsset.url, ht: htAsset.url };

const COPY = {
  es: {
    headline: "La Migra ya viene\npor favor prepárese",
    subline: "Plan de Defensa Legal Pro Se de Bajo Costo $199\nCreado y Revisado por Abogados\nPara Quienes No Pueden Pagar $10,000 si son Arrestados",
    offer: "",
    start: "Comenzar",
    play: "Reproducir",
  },
  en: {
    headline: "La Migra is Coming\nPlease Be Prepared",
    subline: "Attorney Created & Reviewed Low Cost $199\nPro Se Legal Defense Plan\nFor Those Who Can Not Afford $10,000 if Arrested",
    offer: "",
    start: "Start",
    play: "Play",
  },
  ht: {
    headline: "La Migra ap vini\ntanpri prepare w",
    subline: "Plan Defans Legal Pro Se Pri Ba $199 Avoka Kreye ak Revize\nPou Moun Ki Pa Kapab Peye $10,000 si yo Arestasyon",
    offer: "",
    start: "Kòmanse",
    play: "Jwe",
  },
} satisfies Record<Lang, { headline: string; subline: string; offer: string; start: string; play: string }>;

export default function HeroIntro() {
  const { lang, setLang } = useLang();

  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!wrapRef.current || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, [inView]);

  // Reset on language change
  useEffect(() => {
    setIsPlaying(false);
    setHasStarted(false);
  }, [lang]);

  // Sync button state with the underlying <video>
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => {
      setIsPlaying(true);
      setHasStarted(true);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
    };
  }, [inView, lang]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {
        /* noop */
      });
    } else {
      v.pause();
    }
  };

  return (
    <section
      style={{
        background: "#ffffff",
        color: "#112e51",
        padding: "0 1rem 1.5rem",
        textAlign: "center",
        fontFamily:
          '"Source Sans Pro", "Source Sans 3", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        <a
          href="/"
          aria-label="DetencionDefensa home"
          style={{
            position: "absolute",
            top: 0,
            left: 8,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "#112e51",
          }}
        >
          <img
            src={logoAsset.url}
            alt="DetencionDefensa logo"
            width={40}
            height={40}
            style={{ width: 40, height: 40, display: "block" }}
          />
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: -0.3,
            }}
          >
            {"DetencionDefensa".split("").map((ch, i) => (
              <span key={i} style={{ color: i % 2 === 0 ? "#c0282d" : "#1d4ed8" }}>{ch}</span>
            ))}
          </span>
        </a>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 12,
            margin: "0 0 1.25rem auto",
            flexWrap: "wrap",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#112e51",
            opacity: 0.85,
            paddingTop: 4,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              background: "#fff",
              border: "1px solid rgba(10,22,51,0.15)",
              borderRadius: 999,
              padding: 3,
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
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(120px, 220px) minmax(0, 1fr)",
            alignItems: "center",
            gap: "clamp(16px, 3vw, 36px)",
            margin: "0 0 1.75rem",
            textAlign: "left",
          }}
        >
          <img
            src={iceLeftAsset.url}
            alt="ICE ERO officers conducting a targeted enforcement operation"
            loading="lazy"
            style={{
              width: "100%",
              aspectRatio: "3 / 4",
              objectFit: "cover",
              borderRadius: 10,
              boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
              display: "block",
            }}
          />
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontFamily: 'Merriweather, Georgia, "Times New Roman", serif',
                fontSize: "clamp(2.5rem, 6vw, 4.25rem)",
                fontWeight: 700,
                lineHeight: 1.08,
                margin: "0 0 1.25rem",
                letterSpacing: "-0.005em",
                color: "#112e51",
                whiteSpace: "pre-line",
              }}
            >
              <span style={{ color: "#c0282d" }}>La Migra</span>
              {COPY[lang].headline.replace(/^La Migra/, "")}
            </h1>
            <p
              style={{
                fontFamily: '"Source Sans Pro", "Source Sans 3", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                fontSize: "clamp(1.2rem, 2.2vw, 1.7rem)",
                lineHeight: 1.3,
                maxWidth: 900,
                margin: "0 auto",
                fontWeight: 400,
                color: "#112e51",
                whiteSpace: "pre-line",
              }}
            >
              {COPY[lang].subline}
            </p>
          </div>
        </div>

        <div
          aria-hidden
          style={{
            height: 2,
            background: "linear-gradient(90deg, transparent, #e8a04a 20%, #e8a04a 80%, transparent)",
            margin: "0 auto 1.75rem",
            maxWidth: 1100,
            borderRadius: 2,
          }}
        />

        <div
          ref={wrapRef}
          style={{
            position: "relative",
            maxWidth: 900,
            margin: "0 auto",
            background: "#0a0a0a",
            aspectRatio: "16 / 9",
            width: "100%",
            overflow: "hidden",
            borderRadius: 18,
            padding: 14,
            border: "2px solid #e8a04a",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.08) inset, 0 18px 50px rgba(0,0,0,0.6), 0 0 24px rgba(232,160,74,0.25)",
          }}
        >

          {inView && (
            <video
              ref={videoRef}
              key={lang}
              src={SRC[lang]}
              controls={hasStarted}
              playsInline
              preload="metadata"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                background: "#000",
                display: "block",
              }}
            />
          )}
          {!isPlaying && (
            <button
              type="button"
              onClick={toggle}
              aria-label={hasStarted ? "Play video" : "Start video"}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: hasStarted ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.35)",
                border: "none",
                cursor: "pointer",
                color: "#fff",
                fontFamily: "inherit",
              }}
            >
              <PillButton label={hasStarted ? COPY[lang].play : COPY[lang].start} icon="play" />
            </button>
          )}
          {isPlaying && (
            <button
              type="button"
              onClick={toggle}
              aria-label="Pause video"
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: 999,
                background: "rgba(15,24,48,0.78)",
                border: "1px solid rgba(255,255,255,0.4)",
                color: "#fff",
                cursor: "pointer",
                fontFamily: "inherit",
                padding: 0,
              }}
            >
              <PauseIcon />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function PillButton({ label, icon }: { label: string; icon: "play" | "pause" }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 26px 14px 22px",
        background: "rgba(255,255,255,0.96)",
        color: "#0f1830",
        borderRadius: 999,
        fontWeight: 800,
        fontSize: 16,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      }}
    >
      {icon === "play" ? (
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
      ) : (
        <PauseIcon dark />
      )}
      {label}
    </span>
  );
}

function PauseIcon({ dark = false }: { dark?: boolean }) {
  const color = dark ? "#0f1830" : "#fff";
  return (
    <span aria-hidden style={{ display: "inline-flex", gap: 4 }}>
      <span style={{ display: "inline-block", width: 4, height: 16, background: color }} />
      <span style={{ display: "inline-block", width: 4, height: 16, background: color }} />
    </span>
  );
}
