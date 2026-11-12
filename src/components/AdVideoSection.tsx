import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import posterAsset from "@/assets/home-property-poster.jpg.asset.json";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/context/LanguageContext";
import { withLang } from "@/lib/outbound-lang";
import enAd from "@/assets/videos/protect-what-you-built-en.mp4.asset.json";
import esAd from "@/assets/videos/protect-what-you-built-es.mp4.asset.json";
import htAd from "@/assets/videos/protect-what-you-built-ht.mp4.asset.json";

const SRC: Record<string, string> = {
  en: enAd.url,
  es: esAd.url,
  ht: htAd.url,
};

const HEADING: Record<string, string> = {
  en: "Are you a homeowner?",
  es: "¿Es propietario de una vivienda?",
  ht: "Èske ou se pwopriyetè yon kay?",
};

const SUBHEADING: Record<string, string> = {
  en: "Protect your home now. Watch the video.",
  es: "Proteja su casa ahora. Mire el video.",
  ht: "Pwoteje kay ou kounye a. Gade videyo a.",
};

const TRUST_SUBLINE: Record<string, string> = {
  en: "Protect your home and assets in an attorney-created trust",
  es: "Proteja su casa y bienes en un fideicomiso creado por un abogado",
  ht: "Pwoteje kay ou ak byen ou nan yon konfyans kreye pa yon avoka",
};

const CTA: Record<string, string> = {
  en: "Start Now →",
  es: "Comience Ahora →",
  ht: "Kòmanse Kounye a →",
};

const DISCLAIMER: Record<string, string> = {
  en: "This video is a paid advertisement. Every case can be handled independently, and the outcome is not guaranteed.",
  es: "Este video es un anuncio pagado. Cada caso se maneja de manera independiente y el resultado no está garantizado.",
  ht: "Videyo sa a se yon piblisite peye. Chak ka jere endepandamman, e rezilta a pa garanti.",
};

export default function AdVideoSection({ children }: { children?: React.ReactNode }) {
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
      id={'homeowner-video'}
      style={{
        padding: "0.5rem 1rem 1rem",
        background: "#0d2c54",
        color: "#fff",
        fontFamily: '"Work Sans", -apple-system, Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <p className="home-paid-label">{lang === "es" ? "Publicidad pagada" : lang === "en" ? "Paid advertising" : "Piblisite peye"}</p>
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
            controls
            playsInline
            {...({ "webkit-playsinline": "true" } as Record<string, string>)}
            preload="none"
            poster={posterAsset.url}
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
            margin: "1.25rem auto 0.5rem",
            fontSize: 15,
            lineHeight: 1.5,
            color: "#fff",
            maxWidth: 760,
          }}
        >
          {TRUST_SUBLINE[lang] ?? TRUST_SUBLINE.en}
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
            margin: "1.1rem auto 0",
          }}
        >
          <a
            href={withLang("https://savemyhometrust.com/trust", lang)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              background: "#fff",
              color: "#0f1830",
              padding: "0.7rem 2rem",
              borderRadius: 999,
              fontWeight: 800,
              fontSize: "0.95rem",
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
        {children}
      </div>
    </section>
  );
}

export function PlayOverlay({ onClick }: { onClick: () => void }) {
  return <Button type="button" variant="ghost" onClick={onClick} aria-label="Play video" className="home-play-overlay"><span><Play size={32} aria-hidden="true" /></span></Button>;
}
