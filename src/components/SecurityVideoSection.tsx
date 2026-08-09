import { useEffect, useRef, useState } from "react";
import { useLang } from "@/context/LanguageContext";
import { useAutoplayOnHash } from "@/hooks/useAutoplayOnHash";
import { PlayOverlay } from "@/components/AdVideoSection";
import enVid from "@/assets/videos/security-faq-en-v1.mp4.asset.json";
import esVid from "@/assets/videos/security-faq-es-v1.mp4.asset.json";
import htVid from "@/assets/videos/security-faq-ht-v1.mp4.asset.json";

const SRC: Record<string, string> = {
  en: enVid.url,
  es: esVid.url,
  ht: htVid.url,
};

const HEADING: Record<string, string> = {
  en: "App Security",
  es: "Seguridad de la App",
  ht: "Sekirite App la",
};

const SUBHEADING: Record<string, string> = {
  en: "How we protect your information — in under two minutes.",
  es: "Cómo protegemos su información — en menos de dos minutos.",
  ht: "Kijan nou pwoteje enfòmasyon ou — nan mwens pase de minit.",
};

const FAQ_LINK: Record<string, string> = {
  en: "More security information",
  es: "Más información de seguridad",
  ht: "Plis enfòmasyon sou sekirite",
};

export default function SecurityVideoSection() {
  const { lang } = useLang();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setStarted(false);
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
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

  useAutoplayOnHash("security-video", handlePlay);

  return (
    <section
      id="security-video"
      style={{
        padding: "3rem 1rem 2rem",
        background: "#0d2c54",
        color: "#fff",
        fontFamily: '"Work Sans", -apple-system, Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <h2
          style={{
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
            fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)",
            fontWeight: 600,
            margin: "0 0 1.25rem",
            color: "#e8a04a",
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
        <a
          href="/security-faq"
          style={{
            display: "inline-block",
            marginTop: "1.4rem",
            background: "#e8a04a",
            color: "#0f1830",
            fontWeight: 800,
            fontSize: "0.82rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            textDecoration: "none",
            padding: "12px 26px",
            borderRadius: 999,
            boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
          }}
        >
          {FAQ_LINK[lang] ?? FAQ_LINK.en}
        </a>
      </div>
    </section>
  );
}
