import { useRef, useState, useEffect } from "react";
import { useLang } from "@/context/LanguageContext";
import { useAutoplayOnHash } from "@/hooks/useAutoplayOnHash";
import esAsset from "@/assets/videos/detencion-narrative-es-v4-audio-1s-earlier.mp4.asset.json";
import enAsset from "@/assets/videos/detencion-narrative-en-v3-fixed-199.mp4.asset.json";
import htAsset from "@/assets/videos/detencion-narrative-ht-v4-audio-1s-earlier.mp4.asset.json";
import { PlayOverlay } from "@/components/AdVideoSection";

const SRC: Record<string, string> = { es: esAsset.url, en: enAsset.url, ht: htAsset.url };

const HEADING: Record<string, string> = {
  en: "The Story: Why Preparation Matters",
  es: "La Historia: Por Qué Prepararse Importa",
  ht: "Istwa a: Poukisa Preparasyon Enpòtan",
};

const DISCLAIMER: Record<string, string> = {
  es: "Este video es un anuncio publicitario. No garantiza resultados. Cada caso se maneja de manera diferente.",
  ht: "Videyo sa a se yon piblisite. Li pa garanti rezilta. Chak ka jere yon fason diferan.",
  en: "This video is an advertisement. It does not guarantee outcomes. Each case is handled differently.",
};

export default function NarrativeVideoSection() {
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

  useAutoplayOnHash("story-video", handlePlay);

  return (
    <section
      id="story-video"
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
            background: "#163b73",
            aspectRatio: "16 / 9",
            width: "100%",
            overflow: "hidden",
            borderRadius: 14,
            border: "3px solid #e8a04a",
            boxShadow: "0 18px 50px rgba(0,0,0,0.45), 0 0 24px rgba(232,160,74,0.35)",
          }}
        >
          <video
            ref={videoRef}
            key={lang}
            src={SRC[lang] ?? SRC.en}
            controls={started}
            playsInline
            {...({ "webkit-playsinline": "true" } as Record<string, string>)}
            preload="metadata"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "50% 0%",
              background: "#163b73",
              display: "block",
            }}
          />
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
