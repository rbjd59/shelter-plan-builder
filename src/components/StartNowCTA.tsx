import { useEffect } from "react";
import { useLang } from "@/context/LanguageContext";

const COPY = {
  es: { btn: "Empezar ahora", soon: "Formulario próximamente", heading: "Comience su plan", body: "El formulario estará disponible aquí en breve." },
  en: { btn: "Start Now", soon: "Form coming soon", heading: "Start your plan", body: "The intake form will appear here shortly." },
  ht: { btn: "Kòmanse Kounye a", soon: "Fòm nan ap vini", heading: "Kòmanse plan ou", body: "Fòm nan pral parèt isit la byento." },
};

/**
 * Adds:
 *  - A sticky bottom "Start Now" CTA bar
 *  - A placeholder #form-section anchor near the page bottom (above footer)
 * Both link to #form-section so future form work can drop in there.
 */
export default function StartNowCTA() {
  const { lang } = useLang();
  const t = COPY[lang];

  // Inject placeholder form section into the SITE_HTML output (once)
  useEffect(() => {
    const ensureSection = () => {
      if (document.getElementById("form-section")) return true;
      const footer = document.querySelector("footer");
      if (!footer) return false;
      const sec = document.createElement("section");
      sec.id = "form-section";
      sec.style.cssText =
        "padding:4rem 1rem;background:#f8fafc;text-align:center;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;color:#1e293b;scroll-margin-top:80px;";
      sec.innerHTML = `
        <div style="max-width:720px;margin:0 auto;padding:2.5rem 1.5rem;background:#fff;border:1px dashed #cbd5e1;border-radius:12px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:.18em;color:#1e40af;text-transform:uppercase;margin-bottom:.5rem;">${t.soon}</div>
          <h2 style="font-size:clamp(1.5rem,4vw,2rem);font-weight:800;margin:0 0 .75rem;">${t.heading}</h2>
          <p style="color:#64748b;margin:0;">${t.body}</p>
        </div>`;
      footer.parentNode?.insertBefore(sec, footer);
      return true;
    };
    if (ensureSection()) return;
    const obs = new MutationObserver(() => { if (ensureSection()) obs.disconnect(); });
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [t]);

  // Update text on lang change
  useEffect(() => {
    const sec = document.getElementById("form-section");
    if (!sec) return;
    const eyebrow = sec.querySelector("div > div");
    const h = sec.querySelector("h2");
    const p = sec.querySelector("p");
    if (eyebrow) eyebrow.textContent = t.soon;
    if (h) h.textContent = t.heading;
    if (p) p.textContent = t.body;
  }, [t]);

  const scrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("form-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Sticky bottom bar */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          padding: "10px 12px",
          background: "rgba(15,24,48,0.96)",
          borderTop: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
        }}
      >
        <a
          href="#form-section"
          onClick={scrollToForm}
          style={{
            display: "inline-block",
            background: "#e8a04a",
            color: "#0f1830",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "12px 28px",
            borderRadius: 999,
            textDecoration: "none",
            fontSize: 14,
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          }}
        >
          {t.btn} →
        </a>
      </div>
      {/* Spacer so sticky bar doesn't cover footer */}
      <div style={{ height: 64 }} aria-hidden />
    </>
  );
}
