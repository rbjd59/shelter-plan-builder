import { useRef, useState, useEffect } from "react";
import { useLang } from "@/context/LanguageContext";
import enAsset from "@/assets/videos/how-it-works-en-v2.mp4.asset.json";
import esAsset from "@/assets/videos/how-it-works-es-v2.mp4.asset.json";
import htAsset from "@/assets/videos/how-it-works-ht-v2.mp4.asset.json";
import { PlayOverlay } from "@/components/AdVideoSection";

const SRC: Record<string, string> = { en: enAsset.url, es: esAsset.url, ht: htAsset.url };

const HEADING: Record<string, string> = {
  en: "How It Works",
  es: "Cómo Funciona",
  ht: "Kijan Li Fonksyone",
};

export default function HowItWorksVideoSection() {
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
        background: "#081d3a",
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
              objectFit: "contain",
              background: "#163b73",
              display: "block",
            }}
          />
          {!started && <PlayOverlay onClick={handlePlay} />}
        </div>
      </div>
    </section>
  );
}
