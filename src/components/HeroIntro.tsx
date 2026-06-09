import { useEffect, useRef, useState } from "react";
import { useLang, type Lang } from "@/context/LanguageContext";
import esAsset from "@/assets/videos/detenciondefensa_es.mp4.asset.json";
import enAsset from "@/assets/videos/detenciondefensa_en.mp4.asset.json";
import htAsset from "@/assets/videos/detenciondefensa_ht.mp4.asset.json";

const SRC = { es: esAsset.url, en: enAsset.url, ht: htAsset.url };

export default function HeroIntro() {
  const { lang, setLang } = useLang();

  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!wrapRef.current || inView) return;
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
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, [inView]);

  useEffect(() => {
    setStarted(false);
  }, [lang]);

  const handleStart = () => {
    setStarted(true);
    requestAnimationFrame(() => {
      videoRef.current?.play().catch(() => {
        /* user can use native controls */
      });
    });
  };

  return (
    <section
      style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
        color: "#fff",
        padding: "2rem 1rem 1.5rem",
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
            margin: "0 auto 1rem",
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
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            margin: "0 0 0.5rem",
            letterSpacing: -0.5,
          }}
        >
          Stop overpaying for legal help
        </h1>
        <p
          style={{
            fontSize: "clamp(0.95rem, 1.8vw, 1.1rem)",
            lineHeight: 1.5,
            maxWidth: 720,
            margin: "0 auto 1.25rem",
            opacity: 0.95,
          }}
        >
          Draft attorney-grade documents with AI and get expert legal guidance
          — all in one simple platform.
        </p>
        <div
          ref={wrapRef}
          style={{
            position: "relative",
            maxWidth: 880,
            margin: "0 auto",
            background: "#000",
            aspectRatio: "16 / 9",
            width: "100%",
            overflow: "hidden",
            borderRadius: 8,
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          {inView && (
            <video
              ref={videoRef}
              key={lang}
              src={SRC[lang]}
              controls={started}
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
          )}
          {!started && (
            <button
              type="button"
              onClick={handleStart}
              aria-label="Start video"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.35)",
                border: "none",
                cursor: "pointer",
                color: "#fff",
                fontFamily: "inherit",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 26px 14px 22px",
                  background: "rgba(255,255,255,0.96)",
                  color: "#0f1830",
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    display: "inline-block",
                    width: 0,
                    height: 0,
                    borderTop: "9px solid transparent",
                    borderBottom: "9px solid transparent",
                    borderLeft: "14px solid #0f1830",
                  }}
                />
                Start
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
