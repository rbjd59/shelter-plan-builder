import { useEffect, useRef, useState } from "react";
import { useLang, type Lang } from "@/context/LanguageContext";
import esAsset from "@/assets/videos/detenciondefensa_es.mp4.asset.json";
import enAsset from "@/assets/videos/detenciondefensa_en.mp4.asset.json";
import htAsset from "@/assets/videos/detenciondefensa_ht.mp4.asset.json";

const SRC = { es: esAsset.url, en: enAsset.url, ht: htAsset.url };

export default function HeroIntro() {
  const { lang, setLang } = useLang();

  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current || inView) return;
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
    io.observe(ref.current);
    return () => io.disconnect();
  }, [inView]);

  return (
    <section
      style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
        color: "#fff",
        padding: "5rem 1rem 3rem",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            margin: "0 auto 1.75rem",
            flexWrap: "wrap",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            opacity: 0.92,
          }}
        >
          <span>PICK A LANGUAGE —</span>
          <div
            style={{
              display: "inline-flex",
              background: "rgba(255,255,255,0.95)",
              border: "1px solid rgba(255,255,255,0.6)",
              borderRadius: 999,
              padding: 3,
            }}
          >
            {(["es", "en", "ht"] as Lang[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                style={{
                  background: lang === code ? "#0f1830" : "transparent",
                  color: lang === code ? "#fff" : "#0f1830",
                  border: "none",
                  borderRadius: 999,
                  padding: "6px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          <span>—</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            margin: "0 0 1rem",
            letterSpacing: -0.5,
          }}
        >
          Stop overpaying for legal help
        </h1>
        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            lineHeight: 1.55,
            maxWidth: 760,
            margin: "0 auto 2rem",
            opacity: 0.95,
          }}
        >
          Draft attorney-grade documents with AI and get expert legal guidance
          — all in one simple platform.
        </p>
        <div
          ref={ref}
          style={{
            maxWidth: 960,
            margin: "0 auto",
            background: "#000",
            aspectRatio: "16 / 9",
            width: "100%",
          }}
        >
          {inView ? (
            <video
              key={lang}
              src={SRC[lang]}
              controls
              playsInline
              preload="metadata"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                background: "#000",
                display: "block",
              }}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
