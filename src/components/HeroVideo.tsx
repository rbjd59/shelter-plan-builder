import { useLang } from "@/context/LanguageContext";
import esAsset from "@/assets/videos/detenciondefensa_es.mp4.asset.json";
import enAsset from "@/assets/videos/detenciondefensa_en.mp4.asset.json";
import htAsset from "@/assets/videos/detenciondefensa_ht.mp4.asset.json";

const SRC = { es: esAsset.url, en: enAsset.url, ht: htAsset.url };
const LABEL = { es: "ES", en: "EN", ht: "HT" };

export default function HeroVideo() {
  const { lang, setLang } = useLang();
  return (
    <section
      style={{
        background: "#0b0b0e",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 960 }}>
        <video
          key={lang}
          src={SRC[lang]}
          controls
          playsInline
          preload="metadata"
          poster=""
          style={{
            width: "100%",
            aspectRatio: "16 / 9",
            background: "#000",
            borderRadius: 12,
            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          }}
        />
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginTop: 12,
          }}
        >
          {(["es", "en", "ht"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid rgba(232,160,74,0.5)",
                background: lang === l ? "#e8a04a" : "transparent",
                color: lang === l ? "#0b0b0e" : "#e8a04a",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: 1.5,
                cursor: "pointer",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {LABEL[l]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
