import { useEffect, useRef, useState } from "react";
import { useLang } from "@/context/LanguageContext";
import enAd from "@/assets/videos/detenciondefensa_en.mp4.asset.json";
import esAd from "@/assets/videos/detenciondefensa_es.mp4.asset.json";
import htAd from "@/assets/videos/detenciondefensa_ht.mp4.asset.json";

const SRC: Record<string, string> = {
  en: enAd.url,
  es: esAd.url,
  ht: htAd.url,
};

const HEADING: Record<string, string> = {
  en: "Watch: How DetencionDefensa Works",
  es: "Vea: Cómo Funciona DetencionDefensa",
  ht: "Gade: Kijan DetencionDefensa Mache",
};

const DISCLAIMER: Record<string, string> = {
  en: "This video is an advertisement. Every case can be handled independently, and the outcome is not guaranteed.",
  es: "Este video es un anuncio publicitario. Cada caso se maneja de manera independiente y el resultado no está garantizado.",
  ht: "Videyo sa a se yon piblisite. Chak ka jere endepandamman, e rezilta a pa garanti.",
};

export default function AdVideoSection() {
  const { lang } = useLang();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setStarted(false);
    const v = videoRef.current;
    if (v) { v.pause(); v.currentTime = 0; }
  }, [lang]);

  const handlePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    const p = v.play();
    if (p && typeof p.then === "function") {
      p.then(() => setStarted(true)).catch(() => {
        v.muted = true;
        v.play().then(() => setStarted(true)).catch(() => {});
      });
    } else {
      setStarted(true);
    }
  };

  return (
    <section
      style={{
        padding: "3rem 1rem 1rem",
        background: "#0d2c54",
        color: "#fff",
        fontFamily: '"Work Sans", -apple-system, Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <h2
          style={{
            fontFamily: '"Roboto Slab", Georgia, serif',
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            fontWeight: 700,
            margin: "0 0 1.25rem",
            color: "#fff",
          }}
        >
          {HEADING[lang] ?? HEADING.en}
        </h2>
        <div
          style={{
            position: "relative",
            background: "#000",
            aspectRatio: "16 / 9",
            width: "100%",
            overflow: "hidden",
            borderRadius: 18,
            padding: 12,
            border: "2px solid #e8a04a",
            boxShadow:
              "0 0 0 6px #fff inset, 0 18px 50px rgba(0,0,0,0.6), 0 0 24px rgba(232,160,74,0.25)",
          }}
        >
          <video
            ref={videoRef}
            key={lang}
            src={`${SRC[lang] ?? SRC.en}#t=0.1`}
            controls={started}
            playsInline
            {...({ "webkit-playsinline": "true" } as Record<string, string>)}
            preload="metadata"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              background: "#000",
              display: "block",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              padding: "4px 10px",
              background: "rgba(0,0,0,0.55)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.04em",
              borderRadius: 6,
              border: "1px solid rgba(232,160,74,0.6)",
              zIndex: 4,
              pointerEvents: "none",
            }}
          >
            detenciondefensa.com
          </div>
          {!started && <PlayOverlay onClick={handlePlay} />}
        </div>
        <p
          style={{
            margin: "0.75rem auto 0",
            fontSize: 12,
            lineHeight: 1.45,
            color: "rgba(255,255,255,0.75)",
            fontStyle: "italic",
            maxWidth: 760,
          }}
        >
          {DISCLAIMER[lang] ?? DISCLAIMER.en}
        </p>
      </div>
    </section>
  );
}

export function PlayOverlay({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Play video"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.35)",
        border: "none",
        cursor: "pointer",
        padding: 0,
        zIndex: 5,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 96,
          height: 96,
          borderRadius: "50%",
          background: "rgba(232,160,74,0.95)",
          border: "4px solid #fff",
          boxShadow: "0 10px 30px rgba(0,0,0,0.55)",
        }}
      >
        <span
          aria-hidden
          style={{
            display: "inline-block",
            width: 0,
            height: 0,
            marginLeft: 8,
            borderTop: "18px solid transparent",
            borderBottom: "18px solid transparent",
            borderLeft: "28px solid #0f1830",
          }}
        />
      </span>
    </button>
  );
}
