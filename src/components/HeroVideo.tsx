import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/context/LanguageContext";
import esAsset from "@/assets/videos/detencion-narrative-es-v4-audio-1s-earlier.mp4.asset.json";
import enAsset from "@/assets/videos/detencion-narrative-en-v3-fixed-199.mp4.asset.json";
import htAsset from "@/assets/videos/detencion-narrative-ht-v4-audio-1s-earlier.mp4.asset.json";

// Use narrative videos with audio shifted one second earlier without trimming the voiceover.
const SRC = { es: esAsset.url, en: enAsset.url, ht: htAsset.url };

export default function HeroVideoPortal() {
  const { lang } = useLang();
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const find = () => {
      const el = document.getElementById("dd-hero-video-mount");
      if (el) setMount(el);
      return !!el;
    };
    if (find()) return;
    const obs = new MutationObserver(() => {
      if (find()) obs.disconnect();
    });
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!mount || inView) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );
    io.observe(mount);
    return () => io.disconnect();
  }, [mount, inView]);

  if (!mount) return null;
  return createPortal(
    inView ? (
      <video
        key={lang}
        src={SRC[lang]}
        controls
        playsInline
        preload="metadata"
        style={{ width: "100%", height: "100%", objectFit: "contain", background: "#000", display: "block" }}
      />
    ) : (
      <div
        aria-label="Video loading when scrolled into view"
        style={{ width: "100%", height: "100%", background: "#000" }}
      />
    ),
    mount,
  );
}
