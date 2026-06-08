import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/context/LanguageContext";
import esAsset from "@/assets/videos/detenciondefensa_es.mp4.asset.json";
import enAsset from "@/assets/videos/detenciondefensa_en.mp4.asset.json";
import htAsset from "@/assets/videos/detenciondefensa_ht.mp4.asset.json";

const SRC = { es: esAsset.url, en: enAsset.url, ht: htAsset.url };

export default function HeroVideoPortal() {
  const { lang } = useLang();
  const [mount, setMount] = useState<HTMLElement | null>(null);

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

  if (!mount) return null;
  return createPortal(
    <video
      key={lang}
      src={SRC[lang]}
      autoPlay
      muted
      controls
      playsInline
      preload="auto"
      style={{ width: "100%", height: "100%", objectFit: "cover", background: "#000" }}
    />,
    mount,
  );
}
