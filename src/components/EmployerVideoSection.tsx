import { useEffect, useRef, useState } from "react";
import { useLang } from "@/context/LanguageContext";
import { PlayOverlay } from "@/components/AdVideoSection";
import enAd from "@/assets/videos/employers-churches-en-v1.mp4.asset.json";
import esAd from "@/assets/videos/employers-churches-es-v1.mp4.asset.json";
import htAd from "@/assets/videos/employers-churches-ht-v1.mp4.asset.json";

const SRC: Record<string, string> = {
  en: enAd.url,
  es: esAd.url,
  ht: htAd.url,
};

const HEADING: Record<string, string> = {
  en: "For Employers & Churches",
  es: "Para Empleadores e Iglesias",
  ht: "Pou Anplwayè ak Legliz",
};

const SUBHEADING: Record<string, string> = {
  en: "Detencion Defensa keeps your people working.",
  es: "Detención Defensa mantiene a su gente trabajando.",
  ht: "Detansyon Defansa kenbe moun ou yo ap travay.",
};

const CTA: Record<string, string> = {
  en: "Start Now →",
  es: "Comience Ahora →",
  ht: "Kòmanse Kounye a →",
};

const DISCLAIMER: Record<string, string> = {
  en: "This video is an advertisement. Every case can be handled independently, and the outcome is not guaranteed.",
  es: "Este video es un anuncio publicitario. Cada caso se maneja de manera independiente y el resultado no está garantizado.",
  ht: "Videyo sa a se yon piblisite. Chak ka jere endepandamman, e rezilta a pa garanti.",
};

export default function EmployerVideoSection() {
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
      id={"employer-video"}
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
            fontFamily: '"Work Sans", -apple-system, Roboto, Helvetica, Arial, sans-serif',
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            margin: "0 0 0.35rem",
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
          }}
        >
          {HEADING[lang] ?? HEADING.en}
        </h2>
        <p
          style={{
            fontFamily: '"Work Sans", -apple-system, Roboto, Helvetica, Arial, sans-serif',
            fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)",
            fontWeight: 600,
            margin: "0 0 1.25rem",
            color: "#e8a04a",
            letterSpacing: "0.01em",
          }}
        >
          {SUBHEADING[lang] ?? SUBHEADING.en}
        </p>
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
            margin: "1.5rem auto 0",
          }}
        >
          <a
            href="/intake"
            style={{
              display: "inline-block",
              background: "#e8a04a",
              color: "#0f1830",
              padding: "0.9rem 2.4rem",
              borderRadius: 999,
              fontWeight: 800,
              fontSize: "1.05rem",
              textDecoration: "none",
              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            }}
          >
            {CTA[lang] ?? CTA.en}
          </a>
        </div>
        <p
          style={{
            margin: "1rem auto 0",
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
