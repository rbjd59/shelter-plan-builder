import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/context/LanguageContext";
import enAd from "@/assets/videos/detencion-defensa-ad-final-en.mp4.asset.json";
import esAd from "@/assets/videos/detencion-defensa-ad-final-es.mp4.asset.json";

// English ad for EN, Spanish ad for ES, English ad for HT as fallback.
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
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const triggeredRef = useRef(false);

  // Find mount node (re-scan if SiteShell re-renders innerHTML)
  useEffect(() => {
    const find = () => {
      const el = document.getElementById("dd-ad-video-mount");
      if (el) {
        setMount(el);
        return true;
      }
      return false;
    };
    if (find()) return;
    const obs = new MutationObserver(() => {
      if (find()) obs.disconnect();
    });
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  // Reset autoplay flag when language changes
  useEffect(() => {
    triggeredRef.current = false;
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  }, [lang]);

  // Auto-play when the video scrolls into view
  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !triggeredRef.current) {
            triggeredRef.current = true;
            const v = videoRef.current;
            if (!v) return;
            v.muted = true;
            v.setAttribute("muted", "");
            const p = v.play();
            if (p && typeof p.then === "function") {
              p.then(() => {
                try { v.muted = false; } catch { /* keep muted */ }
              }).catch(() => { v.muted = true; });
            }
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [mount, lang]);

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
          ref={wrapRef}
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
            controls
            playsInline
            {...({ "webkit-playsinline": "true" } as Record<string, string>)}
            muted
            preload="metadata"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              background: "#000",
              display: "block",
            }}
          />
        </div>
      </div>
    </section>,
    mount,
  );
}
