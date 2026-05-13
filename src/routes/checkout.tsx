import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { StripeEmbeddedCheckoutBox } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

const searchSchema = z.object({ lang: z.enum(["en", "es", "ht"]).catch("es") });

export const Route = createFileRoute("/checkout")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Checkout · $199 + $10/mo — DetencionDefensa.com" }] }),
  component: CheckoutPage,
});

const T = {
  en: {
    title: "Pre-Detention Defense Plan",
    sub: "Form preparation only. We are NOT a law firm. After payment, you will fill out an intake form so we can prepare your AO 242 (28 U.S.C. § 2241) petition and AO 240 (In Forma Pauperis) application.",
    back: "← Back",
    flat: "$199 today + $10/month",
  },
  es: {
    title: "Plan de Defensa Pre-Detención",
    sub: "Solo preparamos formularios. NO somos un bufete de abogados. Después del pago, completará un formulario para preparar su petición AO 242 (28 U.S.C. § 2241) y solicitud AO 240 (In Forma Pauperis).",
    back: "← Volver",
    flat: "$199 hoy + $10/mes",
  },
  ht: {
    title: "Plan Defans Anvan-Detansyon",
    sub: "Nou prepare fòm sèlman. Nou PA yon kabinè avoka. Apre peman, ou pral ranpli yon fòm pou nou prepare petisyon AO 242 (28 U.S.C. § 2241) ou ak aplikasyon AO 240 (In Forma Pauperis).",
    back: "← Tounen",
    flat: "$199 jodi a + $10/mwa",
  },
} as const;

function CheckoutPage() {
  const { lang } = Route.useSearch();
  const t = T[lang as "en" | "es" | "ht"];
  const returnUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/intake?session_id={CHECKOUT_SESSION_ID}&lang=${lang}`
      : `https://detenciondefensa.com/intake?session_id={CHECKOUT_SESSION_ID}&lang=${lang}`;

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#f6efe1", fontFamily: "Inter Tight, system-ui, sans-serif" }}>
      <PaymentTestModeBanner />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 64px" }}>
        <Link to="/" search={{ lang } as never} style={{ color: "#e8a04a", textDecoration: "none", fontSize: 14 }}>
          {t.back}
        </Link>
        <h1 style={{ fontSize: 36, marginTop: 24, marginBottom: 8, fontWeight: 700, letterSpacing: "-0.02em", fontFamily: "Fraunces, serif" }}>
          {t.title}
        </h1>
        <p style={{ fontSize: 18, color: "#e8a04a", marginBottom: 8, fontWeight: 600 }}>{t.flat}</p>
        <p style={{ fontSize: 14, color: "#cfc8b8", lineHeight: 1.6, marginBottom: 32, borderLeft: "3px solid #e8a04a", paddingLeft: 14 }}>
          {t.sub}
        </p>
        <div style={{ background: "#fff", borderRadius: 8, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
          <StripeEmbeddedCheckoutBox language={lang} returnUrl={returnUrl} />
        </div>
      </div>
    </div>
  );
}
