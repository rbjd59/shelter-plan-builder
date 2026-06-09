import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

const searchSchema = z.object({ lang: z.enum(["en", "es", "ht"]).catch("es") });

export const Route = createFileRoute("/checkout")({
  validateSearch: searchSchema,
  component: CheckoutPage,
  head: () => ({
    meta: [
      { title: "Pay for Service — DetencionDefensa.com" },
      { name: "description", content: "Pay $199 to begin your DetencionDefensa.com defense plan." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type Lang = "en" | "es" | "ht";

const T = {
  en: {
    title: "Pay for the Service",
    sub: "One-time $199 — covers translation, typing, and Florida-licensed attorney review of your federal forms.",
    bullets: [
      "AO 242 Petition for Writ of Habeas Corpus (28 U.S.C. § 2241)",
      "AO 240 In Forma Pauperis fee-waiver request",
      "DefensaSiempre emergency app for your phone",
      "Attorney review before any document is delivered",
    ],
    price: "$199",
    once: "one-time",
    pay: "Pay $199 — Continue",
    processing: "Processing…",
    note: "After payment you'll be asked to read and accept the Terms of Service and the Limited Attorney-Client Retainer Agreement before starting the intake.",
    back: "← Back to home",
    langLabel: "Language",
  },
  es: {
    title: "Pagar el Servicio",
    sub: "$199 una sola vez — incluye traducción, mecanografía y revisión por un abogado licenciado en Florida de sus formularios federales.",
    bullets: [
      "Petición AO 242 de Habeas Corpus (28 U.S.C. § 2241)",
      "AO 240 Solicitud de exención de tarifa (In Forma Pauperis)",
      "App de emergencia DefensaSiempre para su teléfono",
      "Revisión por abogado antes de entregar cualquier documento",
    ],
    price: "$199",
    once: "pago único",
    pay: "Pagar $199 — Continuar",
    processing: "Procesando…",
    note: "Después del pago se le pedirá leer y aceptar los Términos del Servicio y el Acuerdo Limitado de Retención Abogado-Cliente antes de comenzar el formulario.",
    back: "← Volver al inicio",
    langLabel: "Idioma",
  },
  ht: {
    title: "Peye pou Sèvis la",
    sub: "$199 yon sèl fwa — kouvri tradiksyon, tap, ak revizyon yon avoka ki gen lisans Florida sou fòm federal ou yo.",
    bullets: [
      "Petisyon AO 242 Habeas Corpus (28 U.S.C. § 2241)",
      "AO 240 Demann pou anile frè (In Forma Pauperis)",
      "App ijans DefensaSiempre pou telefòn ou",
      "Revizyon avoka anvan nenpòt dokiman livre",
    ],
    price: "$199",
    once: "yon sèl peman",
    pay: "Peye $199 — Kontinye",
    processing: "K ap trete…",
    note: "Apre peman an w ap dwe li epi dakò ak Tèm Sèvis la ak Akò Retansyon Limite Avoka-Kliyan an anvan w kòmanse fòm nan.",
    back: "← Tounen lakay",
    langLabel: "Lang",
  },
} as const;

function CheckoutPage() {
  const { lang } = Route.useSearch();
  const L = lang as Lang;
  const t = T[L];
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    // Demo: simulate payment, then forward to agreement gate.
    await new Promise((r) => setTimeout(r, 600));
    navigate({ to: "/agreement", search: { lang: L } });
  };

  const langs: Lang[] = ["es", "en", "ht"];
  const langBtn = (active: boolean): React.CSSProperties => ({
    padding: "6px 12px", fontSize: 13, fontWeight: 600, borderRadius: 4,
    border: "1px solid #3a4458", background: active ? "#e8a04a" : "transparent",
    color: active ? "#0b1220" : "#f6efe1", textDecoration: "none",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#f6efe1", fontFamily: "Inter Tight, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 16 }}>
          {langs.map((l) => (
            <Link key={l} to="/checkout" search={{ lang: l }} style={langBtn(l === L)}>{l.toUpperCase()}</Link>
          ))}
        </div>
        <div style={{ background: "#1a2436", borderRadius: 8, padding: 32, borderTop: "4px solid #e8a04a" }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 10, fontFamily: "Fraunces, serif" }}>{t.title}</h1>
          <p style={{ fontSize: 15, color: "#cfc8b8", lineHeight: 1.6, marginBottom: 24 }}>{t.sub}</p>

          <div style={{ background: "#0b1220", border: "1px solid #3a4458", borderRadius: 6, padding: 20, marginBottom: 24, textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: "#e8a04a", fontFamily: "Fraunces, serif" }}>{t.price}</div>
            <div style={{ fontSize: 13, color: "#a8a59a", textTransform: "uppercase", letterSpacing: 1 }}>{t.once}</div>
          </div>

          <ul style={{ paddingLeft: 20, marginBottom: 24 }}>
            {t.bullets.map((b, i) => (
              <li key={i} style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>{b}</li>
            ))}
          </ul>

          <button
            onClick={handlePay}
            disabled={processing}
            style={{ background: "#e8a04a", color: "#0b1220", padding: "16px 28px", fontSize: 16, fontWeight: 700, border: "none", borderRadius: 4, cursor: processing ? "wait" : "pointer", width: "100%" }}
          >
            {processing ? t.processing : t.pay}
          </button>

          <p style={{ fontSize: 12, color: "#a8a59a", marginTop: 16, lineHeight: 1.5 }}>{t.note}</p>
        </div>
        <Link to="/" search={{ lang: L } as never} style={{ display: "inline-block", marginTop: 20, color: "#e8a04a" }}>{t.back}</Link>
      </div>
    </div>
  );
}
