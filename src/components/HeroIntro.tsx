import { useEffect, useRef, useState } from "react";
import { useLang, type Lang } from "@/context/LanguageContext";
// Audio-shifted copies preserve the full voiceover and add one second of
// opening video hold, so the audio effectively starts one second earlier
// without trimming off the ending.
import esAsset from "@/assets/videos/detencion-narrative-es-v4-audio-1s-earlier.mp4.asset.json";
import enAsset from "@/assets/videos/detencion-narrative-en-v3-fixed-199.mp4.asset.json";
import htAsset from "@/assets/videos/detencion-narrative-ht-v4-audio-1s-earlier.mp4.asset.json";
import logoAsset from "@/assets/dd-logo.png.asset.json";
import detentionNightAsset from "@/assets/detention-night.png.asset.json";

import { PlayOverlay } from "@/components/AdVideoSection";


const SRC = { es: esAsset.url, en: enAsset.url, ht: htAsset.url };

const COPY = {
  es: {
    headline: "Protéjase antes de la detención.\nActúe hoy — no mañana.",
    subline: "Documentos legales creados y revisados por abogados — SIN COSTO.\nApp de emergencia para su teléfono: $10/mes.",
    offer: "",
    start: "Comenzar",
    play: "Reproducir",
    getStarted: "Regístrese ahora",
  },
  en: {
    headline: "Protect yourself before detention.\nAct today — not tomorrow.",
    subline: "Legal documents created & reviewed by attorneys — NO CHARGE.\nEmergency app for your phone: $10/month.",
    offer: "",
    start: "Start",
    play: "Play",
    getStarted: "Get Started",
  },
  ht: {
    headline: "Pwoteje tèt ou anvan arestasyon.\nAji jodi a — pa demen.",
    subline: "Dokiman legal avoka kreye ak revize — GRATIS.\nApp ijans pou telefòn ou: $10/mwa.",
    offer: "",
    start: "Kòmanse",
    play: "Jwe",
    getStarted: "Kòmanse",
  },
} satisfies Record<Lang, { headline: string; subline: string; offer: string; start: string; play: string; getStarted: string }>;

// === Video autoplay tuning — adjust these values here ===
const VIDEO_START_DELAY_MS = 2000;      // delay after scroll-up trigger before playback starts
const SCROLL_UP_THRESHOLD_PX = 6;       // minimum upward scroll delta required to trigger

export default function HeroIntro() {
  const { lang, setLang } = useLang();

  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const hasAutoStartedRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 720px)");
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);


  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      try { window.history.scrollRestoration = "manual"; } catch { /* noop */ }
    }
    window.scrollTo(0, 0);
  }, []);

  // Auto-play removed — user must click the play overlay to start the video.


  // Reset on language change
  useEffect(() => {
    setIsPlaying(false);
    setHasStarted(false);
    hasAutoStartedRef.current = false;
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
        background: "linear-gradient(180deg, #0d2c54 0%, #081d3a 100%)",
        color: "#ffffff",
        padding: isMobile ? "1rem 0.75rem 1.25rem" : "0 1rem 1.5rem",
        textAlign: "center",
        fontFamily:
          '"Work Sans", -apple-system, Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: "1.25rem",
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
              style={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40, display: "block", flexShrink: 0 }}
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

            {/* Get Started CTA moved below the hero image */}
          </div>

        </div>


        <div
          style={{
            margin: "0 0 1.5rem",
            textAlign: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                fontFamily: '"Roboto Slab", Georgia, serif',
                fontSize: isMobile ? "1.9rem" : "clamp(2.25rem, 5.4vw, 3.75rem)",
                fontWeight: 700,
                lineHeight: 1.08,
                margin: "0 0 1rem",
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
          </div>
        </div>

        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 1200,
            margin: "0 auto 1.75rem",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 2,
              padding: isMobile ? "0.75rem 1rem" : "1rem 1.5rem",
              background: "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 60%, transparent 100%)",
              textAlign: "center",
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
              }}
            >
              ICE ARRESTS OVER 2000 NON-CITIZENS EVERY DAY
            </span>
          </div>
          <img
            src={detentionNightAsset.url}
            alt="ICE detention facility at night behind razor wire fencing"
            loading="lazy"
            style={{
              width: "100%",
              aspectRatio: isMobile ? "16 / 10" : "21 / 9",
              objectFit: "cover",
              borderRadius: 14,
              display: "block",
            }}
          />
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


        <div ref={wrapRef} style={{ textAlign: "center" }}>
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
            {lang === "es" ? "Ver videos" : lang === "ht" ? "Gade videyo yo" : "Watch videos"}
          </a>
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
        background: "#0a0a0a",
        color: "#ffffff",
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
            borderLeft: "14px solid #ffffff",
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
