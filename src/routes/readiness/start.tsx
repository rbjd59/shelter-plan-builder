import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createReadinessCheckout } from "@/lib/readiness.functions";

const search = z.object({
  session: z.string().min(6),
  lang: z.enum(["en", "es", "ht"]).catch("es"),
  email: z.string().email().optional(),
});

export const Route = createFileRoute("/readiness/start")({
  validateSearch: search,
  component: StartPage,
  head: () => ({ meta: [{ title: "Sentinel Readiness — Add-on" }] }),
});

const COPY = {
  en: { title: "Sentinel Readiness Packet", price: "$100 — one-time", body: "Add the documents your family will need the moment ICE acts. We translate, type, and seal them in your encrypted vault. Released only when you trigger HELP NOW.", disclaimer: "Document preparation and translation only. Not legal advice. Have an attorney review POA and guardianship documents in your state before signing." },
  es: { title: "Paquete Sentinel Readiness", price: "$100 — pago único", body: "Agregue los documentos que su familia necesitará en el momento que actúe ICE. Los traducimos, los escribimos y los sellamos en su bóveda cifrada. Liberados solo cuando active AYUDA YA.", disclaimer: "Solo preparación y traducción de documentos. No es asesoría legal. Pida a un abogado en su estado revisar el poder notarial y la tutela antes de firmar." },
  ht: { title: "Pakè Sentinel Readiness", price: "$100 — pèman youn fwa", body: "Ajoute dokiman fanmi w ap bezwen lè ICE aji. Nou tradui yo, ekri yo, e sele yo nan kòfrefò chiffre w. Yo lage sèlman lè ou aktive AYÈ KOUNYE A.", disclaimer: "Preparasyon ak tradiksyon dokiman sèlman. Pa konsèy legal. Mande yon avoka nan eta w revize POA ak gad legal anvan w siyen." },
} as const;

function StartPage() {
  const { session, lang, email } = Route.useSearch();
  const c = COPY[lang as keyof typeof COPY];
  const [stripePromise] = useState(() => getStripe());

  const fetchClientSecret = async () => {
    const secret = await createReadinessCheckout({
      data: {
        intakeSessionId: session,
        language: lang,
        customerEmail: email,
        returnUrl: `${window.location.origin}/readiness/intake?packet_session={CHECKOUT_SESSION_ID}&lang=${lang}`,
        environment: getStripeEnvironment(),
      },
    });
    if (!secret) throw new Error("No client secret");
    return secret;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4efe6", color: "#0e1a2b", fontFamily: "Inter Tight, system-ui, sans-serif", padding: "32px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8a3c11", marginBottom: 8 }}>Sentinel — Asset & Family Protection</div>
        <h1 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 36, fontWeight: 600, margin: "0 0 6px" }}>{c.title}</h1>
        <div style={{ fontSize: 18, fontWeight: 600, color: "#b8551f", marginBottom: 18 }}>{c.price}</div>
        <p style={{ fontSize: 16, lineHeight: 1.6, marginBottom: 26, color: "#1a2940" }}>{c.body}</p>

        <div style={{ background: "#fff", border: "1px solid rgba(14,26,43,0.15)", borderRadius: 6, padding: 16, marginBottom: 18 }}>
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>

        <p style={{ fontSize: 12, color: "#6b6b6b", lineHeight: 1.5 }}>{c.disclaimer}</p>
      </div>
    </div>
  );
}
