import { useEffect, useRef, useState } from "react";
import { useLang, type Lang } from "@/context/LanguageContext";
import esAsset from "@/assets/videos/detenciondefensa_es.mp4.asset.json";
import enAsset from "@/assets/videos/detenciondefensa_en.mp4.asset.json";
import htAsset from "@/assets/videos/detenciondefensa_ht.mp4.asset.json";
import logoAsset from "@/assets/dd-logo.png.asset.json";
import iceLeftAsset from "@/assets/ice-arrest-dallas.jpg.asset.json";
import iceRightAsset from "@/assets/ice-arrest-nyc.jpg.asset.json";


const SRC = { es: esAsset.url, en: enAsset.url, ht: htAsset.url };

const COPY = {
  es: {
    headline: "La Migra ya viene, prepárese",
    subline: "Plan de Defensa Legal Pro Se de Bajo Costo $199 Creado y Revisado por Abogados\nPara Quienes No Pueden Pagar $10,000 si son Arrestados",
    offer: "",
    start: "Comenzar",
    play: "Reproducir",
  },
  en: {
    headline: "La Migra is Coming, Be Prepared",
    subline: "Attorney Created & Reviewed Low Cost $199 Pro Se Legal Defense Plan\nFor Those Who Can Not Afford $10,000 if Arrested",
    offer: "",
    start: "Start",
    play: "Play",
  },
  ht: {
    headline: "La Migra ap vini, prepare w",
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
        background: "#000000",
        color: "#ffffff",
        padding: "1.25rem 1rem 1.5rem",
        textAlign: "center",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
            color: "#ffffff",
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
              color: "#ffffff",
            }}
          >
            DetencionDefensa
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
            color: "#ffffff",
            opacity: 0.85,
            paddingTop: 56,
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
                  background: lang === code ? "#0a1633" : "transparent",
                  color: lang === code ? "#fff" : "#0a1633",
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
            gridTemplateColumns: "minmax(140px, 1fr) minmax(0, 2.4fr) minmax(140px, 1fr)",
            alignItems: "center",
            gap: "clamp(12px, 2vw, 32px)",
            margin: "0 0 1.75rem",
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
          <div>
            <h1
              style={{
                fontFamily: '"Fraunces", "Quincy CF", Georgia, "Times New Roman", serif',
                fontSize: "clamp(2.25rem, 5.5vw, 3.75rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                margin: "0 0 1.25rem",
                letterSpacing: -1,
                color: "#c0282d",
              }}
            >
              {COPY[lang].headline}
            </h1>
            <p
              style={{
                fontFamily: '"Work Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                fontSize: "clamp(1.2rem, 2.2vw, 1.7rem)",
                lineHeight: 1.3,
                maxWidth: 720,
                margin: "0 auto",
                fontWeight: 400,
                color: "#ffffff",
                whiteSpace: "pre-line",
              }}
            >
              {COPY[lang].subline}
            </p>
          </div>
          <img
            src={iceRightAsset.url}
            alt="ICE Fugitive Operations Team arresting a subject"
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
        </div>


        <div
          ref={wrapRef}
          style={{
            position: "relative",
            maxWidth: 880,
            margin: "0 auto",
            background: "#000",
            aspectRatio: "16 / 9",
            width: "100%",
            overflow: "hidden",
            borderRadius: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
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
