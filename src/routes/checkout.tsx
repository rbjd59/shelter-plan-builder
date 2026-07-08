import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { StripeEmbeddedCheckoutBox } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

const searchSchema = z.object({
  lang: z.enum(["en", "es", "ht"]).catch("es"),
  discountPct: z.coerce.number().int().min(0).max(100).optional(),
  submissionId: z.string().optional(),
});

export const Route = createFileRoute("/checkout")({
  validateSearch: searchSchema,
  component: CheckoutPage,
  head: () => ({
    meta: [
      { title: "Pay for Service — DetencionDefensa.com" },
      { name: "description", content: "Pay for your DetencionDefensa.com defense plan and optional family-readiness add-ons." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type Lang = "en" | "es" | "ht";

const T = {
  en: {
    title: "Your Order",
    sub: "Select the services you need. Attorney review is included on every document. Payment is processed securely by Stripe.",
    baseTitle: "Pre-Detention Protection Plan",
    baseSub: "Translation, typing, and Florida-licensed attorney review of your federal forms.",
    baseBullets: [
      "AO 242 Petition for Writ of Habeas Corpus (28 U.S.C. § 2241)",
      "AO 240 In Forma Pauperis fee-waiver request",
      "DefensaSiempre emergency app for your phone",
      "Attorney review before any document is delivered",
    ],
    readinessTitle: "Family Readiness Documents Package",
    readinessSub: "Eight legally-drafted documents so your family can act the moment you are detained. Reviewed by a Florida-licensed attorney.",
    readinessBullets: [
      "Power of Attorney",
      "Standby Guardianship Designation",
      "School Pickup Authorization",
      "HIPAA Medical Records Authorization",
      "Financial Inventory & Bill-Pay Sheet",
      "Emergency Contact Tree",
      "Children's Information Sheet",
      "Important Document Locator",
    ],
    petTitle: "Pet Rescue",
    petSub: "If you are detained, we contact your designated caregiver and coordinate emergency shelter or boarding for your pets.",
    required: "Required",
    optional: "Optional add-on",
    total: "Total",
    pay: "Continue to secure payment",
    note: "After payment you'll be asked to read and accept the Terms of Service and the Limited Attorney-Client Retainer Agreement before starting the intake.",
    back: "← Back to home",
  },
  es: {
    title: "Su Pedido",
    sub: "Seleccione los servicios que necesita. Cada documento incluye revisión de un abogado. Pago procesado de forma segura por Stripe.",
    baseTitle: "Plan de Protección Antes de la Detención",
    baseSub: "Traducción, mecanografía y revisión por un abogado licenciado en Florida de sus formularios federales.",
    baseBullets: [
      "Petición AO 242 de Habeas Corpus (28 U.S.C. § 2241)",
      "AO 240 Solicitud de exención de tarifa (In Forma Pauperis)",
      "App de emergencia DefensaSiempre para su teléfono",
      "Revisión por abogado antes de entregar cualquier documento",
    ],
    readinessTitle: "Paquete de Documentos de Preparación Familiar",
    readinessSub: "Ocho documentos redactados legalmente para que su familia pueda actuar el momento en que la migra lo detenga. Revisados por un abogado licenciado en Florida.",
    readinessBullets: [
      "Poder Notarial",
      "Designación de Tutela en Espera (Standby Guardianship)",
      "Autorización de Recogida Escolar",
      "Autorización HIPAA de Registros Médicos",
      "Inventario Financiero y Hoja de Pago de Facturas",
      "Árbol de Contactos de Emergencia",
      "Hoja de Información de los Niños",
      "Localizador de Documentos Importantes",
    ],
    petTitle: "Rescate de Mascotas",
    petSub: "Si la migra lo detiene, contactamos a su cuidador designado y coordinamos refugio o alojamiento de emergencia para sus mascotas.",
    required: "Obligatorio",
    optional: "Complemento opcional",
    total: "Total",
    pay: "Continuar al pago seguro",
    note: "Después del pago se le pedirá leer y aceptar los Términos del Servicio y el Acuerdo Limitado de Retención Abogado-Cliente antes de comenzar el formulario.",
    back: "← Volver al inicio",
  },
  ht: {
    title: "Kòmand ou",
    sub: "Chwazi sèvis ou bezwen yo. Yon avoka revize chak dokiman. Peman trete an sekirite pa Stripe.",
    baseTitle: "Plan Pwoteksyon Anvan Detansyon",
    baseSub: "Tradiksyon, tap, ak revizyon yon avoka ki gen lisans Florida sou fòm federal ou yo.",
    baseBullets: [
      "Petisyon AO 242 Habeas Corpus (28 U.S.C. § 2241)",
      "AO 240 Demann pou anile frè (In Forma Pauperis)",
      "App ijans DefensaSiempre pou telefòn ou",
      "Revizyon avoka anvan nenpòt dokiman livre",
    ],
    readinessTitle: "Pakè Dokiman Preparasyon Fanmi",
    readinessSub: "Uit dokiman legal pou fanmi ou ka aji lè yo detni w. Revize pa yon avoka ki gen lisans Florida.",
    readinessBullets: [
      "Pouvwa Avoka (Power of Attorney)",
      "Deziyasyon Gadyen Rezèv (Standby Guardianship)",
      "Otorizasyon pou Ranmase Timoun nan Lekòl",
      "Otorizasyon HIPAA pou Dosye Medikal",
      "Envantè Finansye ak Fèy Peman Bòdwo",
      "Pyebwa Kontak Ijans",
      "Fèy Enfòmasyon Timoun yo",
      "Lokalizatè Dokiman Enpòtan",
    ],
    petTitle: "Sekou pou Bèt Kay",
    petSub: "Si yo detni w, nou kontakte moun ou deziyen an epi nou òganize lojman ijans pou bèt kay ou yo.",
    required: "Obligatwa",
    optional: "Opsyonèl",
    total: "Total",
    pay: "Kontinye nan peman sekirize a",
    note: "Apre peman an w ap dwe li epi dakò ak Tèm Sèvis la ak Akò Retansyon Limite Avoka-Kliyan an anvan w kòmanse fòm nan.",
    back: "← Tounen lakay",
  },
} as const;

function CheckoutPage() {
  const { lang, discountPct, submissionId } = Route.useSearch();
  const L = lang as Lang;
  const t = T[L];
  const [includeReadiness, setIncludeReadiness] = useState(false);
  const [includePetRescue, setIncludePetRescue] = useState(false);
  const [showPay, setShowPay] = useState(false);

  const discount = discountPct && discountPct > 0 ? discountPct : 0;
  const subtotal = 199 + (includeReadiness ? 99 : 0) + (includePetRescue ? 10 : 0);
  const total = Math.round(subtotal * (1 - discount / 100));

  const langs: Lang[] = ["es", "en", "ht"];
  const langBtn = (active: boolean): React.CSSProperties => ({
    padding: "6px 12px", fontSize: 13, fontWeight: 600, borderRadius: 4,
    border: "1px solid #3a4458", background: active ? "#e8a04a" : "transparent",
    color: active ? "#0b1220" : "#f6efe1", textDecoration: "none",
  });

  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/agreement?lang=${L}&session_id={CHECKOUT_SESSION_ID}`
      : `/agreement?lang=${L}&session_id={CHECKOUT_SESSION_ID}`;

  const card: React.CSSProperties = {
    background: "#0b1220", border: "1px solid #3a4458", borderRadius: 6,
    padding: 20, marginBottom: 16,
  };
  const cardHeader: React.CSSProperties = {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    gap: 12, marginBottom: 6,
  };
  const priceTag: React.CSSProperties = {
    fontSize: 22, fontWeight: 700, color: "#e8a04a", fontFamily: "Fraunces, serif",
    whiteSpace: "nowrap",
  };
  const tag = (bg: string, color: string): React.CSSProperties => ({
    display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: 1,
    textTransform: "uppercase", padding: "3px 8px", borderRadius: 3,
    background: bg, color, marginBottom: 8,
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#f6efe1", fontFamily: "Inter Tight, system-ui, sans-serif" }}>
      <PaymentTestModeBanner />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginBottom: 16 }}>
          {langs.map((l) => (
            <Link key={l} to="/checkout" search={{ lang: l }} style={langBtn(l === L)}>{l.toUpperCase()}</Link>
          ))}
        </div>
        <div style={{ background: "#1a2436", borderRadius: 8, padding: 32, borderTop: "4px solid #e8a04a" }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 10, fontFamily: "Fraunces, serif" }}>{t.title}</h1>
          <p style={{ fontSize: 15, color: "#cfc8b8", lineHeight: 1.6, marginBottom: 24 }}>{t.sub}</p>

          {/* Base — required */}
          <div style={card}>
            <div style={cardHeader}>
              <div style={{ flex: 1 }}>
                <span style={tag("#e8a04a", "#0b1220")}>{t.required}</span>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, fontFamily: "Fraunces, serif" }}>{t.baseTitle}</h2>
                <p style={{ fontSize: 13, color: "#cfc8b8", lineHeight: 1.5 }}>{t.baseSub}</p>
              </div>
              <div style={priceTag}>$199</div>
            </div>
            <ul style={{ paddingLeft: 20, marginTop: 10 }}>
              {t.baseBullets.map((b, i) => (
                <li key={i} style={{ fontSize: 13, lineHeight: 1.6, color: "#cfc8b8" }}>{b}</li>
              ))}
            </ul>
          </div>

          {/* Family Readiness Documents Package — optional */}
          <label style={{ ...card, cursor: "pointer", display: "block", borderColor: includeReadiness ? "#e8a04a" : "#3a4458" }}>
            <div style={cardHeader}>
              <div style={{ flex: 1 }}>
                <span style={tag("#3a4458", "#f6efe1")}>{t.optional}</span>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={includeReadiness}
                    onChange={(e) => setIncludeReadiness(e.target.checked)}
                    style={{ marginTop: 5, width: 18, height: 18, cursor: "pointer" }}
                  />
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, fontFamily: "Fraunces, serif" }}>{t.readinessTitle}</h2>
                    <p style={{ fontSize: 13, color: "#cfc8b8", lineHeight: 1.5 }}>{t.readinessSub}</p>
                  </div>
                </div>
              </div>
              <div style={priceTag}>$99</div>
            </div>
            <ul style={{ paddingLeft: 20, marginTop: 10, columns: 2, columnGap: 24 }}>
              {t.readinessBullets.map((b, i) => (
                <li key={i} style={{ fontSize: 12, lineHeight: 1.5, color: "#cfc8b8", breakInside: "avoid" }}>{b}</li>
              ))}
            </ul>
          </label>

          {/* Pet Rescue — optional */}
          <label style={{ ...card, cursor: "pointer", display: "block", borderColor: includePetRescue ? "#e8a04a" : "#3a4458" }}>
            <div style={cardHeader}>
              <div style={{ flex: 1 }}>
                <span style={tag("#3a4458", "#f6efe1")}>{t.optional}</span>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={includePetRescue}
                    onChange={(e) => setIncludePetRescue(e.target.checked)}
                    style={{ marginTop: 5, width: 18, height: 18, cursor: "pointer" }}
                  />
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, fontFamily: "Fraunces, serif" }}>{t.petTitle}</h2>
                    <p style={{ fontSize: 13, color: "#cfc8b8", lineHeight: 1.5 }}>{t.petSub}</p>
                  </div>
                </div>
              </div>
              <div style={priceTag}>$10</div>
            </div>
          </label>

          {/* Total */}
          {discount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#a8c5a8", padding: "4px 4px" }}>
              <div>Reduced-cost discount ({discount}% off)</div>
              <div>−${subtotal - total}</div>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 4px", borderTop: "1px solid #3a4458", marginTop: 8, marginBottom: 20 }}>
            <div style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: 1, color: "#a8a59a" }}>{t.total}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#e8a04a", fontFamily: "Fraunces, serif" }}>${total}</div>
          </div>

          {!showPay ? (
            <button
              onClick={() => setShowPay(true)}
              style={{ background: "#e8a04a", color: "#0b1220", padding: "16px 28px", fontSize: 16, fontWeight: 700, border: "none", borderRadius: 4, cursor: "pointer", width: "100%" }}
            >
              {t.pay}
            </button>
          ) : (
            <div style={{ background: "#fff", borderRadius: 6, padding: 12 }}>
              <StripeEmbeddedCheckoutBox
                language={L}
                returnUrl={returnUrl}
                includeReadiness={includeReadiness}
                includePetRescue={includePetRescue}
                discountPct={discount}
                submissionId={submissionId}
              />
            </div>
          )}

          <p style={{ fontSize: 12, color: "#a8a59a", marginTop: 16, lineHeight: 1.5 }}>{t.note}</p>
        </div>
        <Link to="/" search={{ lang: L } as never} style={{ display: "inline-block", marginTop: 20, color: "#e8a04a" }}>{t.back}</Link>
      </div>
    </div>
  );
}
