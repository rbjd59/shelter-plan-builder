import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/context/LanguageContext";
import enAd from "@/assets/videos/detencion-defensa-ad-final-en.mp4.asset.json";
import esAd from "@/assets/videos/detencion-defensa-ad-final-es.mp4.asset.json";

const SRC: Record<string, string> = {
  en: enAd.url,
  es: esAd.url,
  ht: enAd.url,
};

const HEADING: Record<string, string> = {
  en: "Watch: How DetencionDefensa Works",
  es: "Vea: Cómo Funciona DetencionDefensa",
  ht: "Gade: Kijan DetencionDefensa Mache",
};

export default function AdVideoSection() {
  const { lang } = useLang();
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const find = () => {
      const el = document.getElementById("dd-ad-video-mount");
      if (el) { setMount(el); return true; }
      return false;
    };
    if (find()) return;
    const obs = new MutationObserver(() => { if (find()) obs.disconnect(); });
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

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

  if (!mount) return null;

  return createPortal(
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
          {!started && <PlayOverlay onClick={handlePlay} />}
        </div>
      </div>
    </section>,
    mount,
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
