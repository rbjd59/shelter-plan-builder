import { useEffect, useRef, useState } from "react";
import { useLang, type Lang } from "@/context/LanguageContext";
import esAsset from "@/assets/videos/detenciondefensa_es.mp4.asset.json";
import enAsset from "@/assets/videos/detenciondefensa_en.mp4.asset.json";
import htAsset from "@/assets/videos/detenciondefensa_ht.mp4.asset.json";
import logoAsset from "@/assets/dd-logo.png.asset.json";
import iceLeftAsset from "@/assets/ice-arrest-new.jpg.asset.json";
import iceRightAsset from "@/assets/hispanic-family.jpg";


const SRC = { es: esAsset.url, en: enAsset.url, ht: htAsset.url };

const COPY = {
  es: {
    headline: "La migra ya viene\npor favor prepárese",
    subline: "Plan de Defensa Legal de Bajo Costo $199\nCreado y Revisado por Abogados\nPara Quienes No Pueden Pagar $10,000",
    offer: "",
    start: "Comenzar",
    play: "Reproducir",
  },
  en: {
    headline: "La migra is coming\nplease be prepared",
    subline: "Attorney Created & Reviewed Low Cost $199\nLegal Defense Plan\nFor Those Who Can Not Afford $10,000",
    offer: "",
    start: "Start",
    play: "Play",
  },
  ht: {
    headline: "La migra ap vini\ntanpri prepare w",
    subline: "Plan Defans Legal Pro Se Pri Ba $199 Avoka Kreye ak Revize\nPou Moun Ki Pa Kapab Peye $10,000 Si Yo Arestasyon",
    offer: "",
    start: "Kòmanse",
    play: "Jwe",
  },
} satisfies Record<Lang, { headline: string; subline: string; offer: string; start: string; play: string }>;

// === Video autoplay tuning — adjust these values here ===
const VIDEO_VISIBILITY_THRESHOLD = 0.1; // fallback: % of video in view (0–1) before it triggers
const VIDEO_START_DELAY_MS = 0;         // delay after trigger before playback starts
const SCROLL_ACTIVATION_PX = 8;         // starts once the page has moved down this many pixels

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

  useEffect(() => {
    if (!wrapRef.current) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let io: IntersectionObserver | null = null;
    let lastTouchY: number | null = null;

    const tryPlay = () => {
      const v = videoRef.current;
      if (!v) return;
      // iOS Safari requires muted + playsInline for programmatic play().
      // Start muted synchronously inside the gesture, then try to unmute.
      v.muted = true;
      v.setAttribute("muted", "");
      const playPromise = v.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            try {
              v.muted = false;
            } catch {
              /* keep muted */
            }
          })
          .catch(() => {
            v.muted = true;
          });
      }
    };

    const activateVideo = () => {
      if (hasAutoStartedRef.current) return;
      hasAutoStartedRef.current = true;
      setInView(true);
      if (timer) clearTimeout(timer);
      if (VIDEO_START_DELAY_MS > 0) {
        timer = setTimeout(tryPlay, VIDEO_START_DELAY_MS);
      } else {
        tryPlay();
      }
    };

    const startOnScroll = () => {
      if (window.scrollY >= SCROLL_ACTIVATION_PX) activateVideo();
    };

    const startOnWheel = (event: WheelEvent) => {
      if (event.deltaY > 0) activateVideo();
    };

    const rememberTouchStart = (event: TouchEvent) => {
      lastTouchY = event.touches[0]?.clientY ?? null;
    };

    const startOnTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY;
      if (lastTouchY !== null && currentY !== undefined && currentY < lastTouchY) activateVideo();
      lastTouchY = currentY ?? lastTouchY;
    };

    window.addEventListener("scroll", startOnScroll, { passive: true });
    window.addEventListener("wheel", startOnWheel, { passive: true });
    window.addEventListener("touchstart", rememberTouchStart, { passive: true });
    window.addEventListener("touchmove", startOnTouchMove, { passive: true });

    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!hasAutoStartedRef.current && e.isIntersecting && window.scrollY >= SCROLL_ACTIVATION_PX) {
              activateVideo();
            } else if (!e.isIntersecting && timer) {
              clearTimeout(timer);
              timer = null;
            }
          }
        },
        { rootMargin: "0px", threshold: VIDEO_VISIBILITY_THRESHOLD },
      );
      io.observe(wrapRef.current);
    }

    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", startOnScroll);
      window.removeEventListener("wheel", startOnWheel);
      window.removeEventListener("touchstart", rememberTouchStart);
      window.removeEventListener("touchmove", startOnTouchMove);
      if (timer) clearTimeout(timer);
    };
  }, [lang]);


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
        background: "#000000",
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
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>


        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr"
              : "minmax(140px, 230px) minmax(0, 1fr) minmax(140px, 230px)",
            alignItems: "center",
            gap: isMobile ? "1rem" : "clamp(16px, 3vw, 36px)",
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
              aspectRatio: isMobile ? "4 / 3" : "3 / 4",
              objectFit: "cover",
              borderRadius: 10,
              boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
              display: "block",
              order: isMobile ? 2 : 0,
            }}
          />
          <div style={{ textAlign: "center", order: isMobile ? 1 : 0 }}>
            <h1
              style={{
                fontFamily: '"Fraunces", "Quincy CF", Georgia, serif',
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
                fontFamily: '"Fraunces", "Quincy CF", Georgia, serif',
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
          <img
            src={iceRightAsset}
            alt="Hispanic family standing together"
            loading="lazy"
            style={{
              width: "100%",
              aspectRatio: isMobile ? "4 / 3" : "3 / 4",
              objectFit: "cover",
              borderRadius: 10,
              boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
              display: isMobile ? "none" : "block",
              order: isMobile ? 3 : 0,
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

        <div
          ref={wrapRef}
          style={{
            position: "relative",
            maxWidth: 900,
            margin: "0 auto",
            background: "#000000",
            aspectRatio: "16 / 9",
            width: "100%",
            overflow: "hidden",
            borderRadius: 18,
            padding: 14,
            border: "2px solid #e8a04a",
            boxShadow: "0 0 0 6px #ffffff inset, 0 0 0 1px rgba(0,0,0,0.08) inset, 0 18px 50px rgba(0,0,0,0.6), 0 0 24px rgba(232,160,74,0.25)",
          }}
        >
          <video
            ref={videoRef}
            key={lang}
            src={`${SRC[lang]}#t=0.1`}
            controls
            playsInline
            {...({ "webkit-playsinline": "true" } as Record<string, string>)}
            muted
            preload="metadata"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              background: "#000000",
              display: "block",
            }}
          />

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
        <p
          style={{
            maxWidth: 900,
            margin: "0.75rem auto 0",
            fontSize: 12,
            lineHeight: 1.45,
            color: "rgba(255,255,255,0.75)",
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          {lang === "es"
            ? "Este video es un anuncio publicitario. No garantiza resultados. Cada caso se maneja de manera diferente."
            : lang === "ht"
            ? "Videyo sa a se yon piblisite. Li pa garanti rezilta. Chak ka jere yon fason diferan."
            : "This video is an advertisement. It does not guarantee outcomes. Each case is handled differently."}
        </p>
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
