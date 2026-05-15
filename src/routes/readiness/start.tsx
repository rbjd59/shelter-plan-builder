import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createReadinessCheckout } from "@/lib/readiness.functions";

const search = z.object({
  session: z.string().min(6).optional(),
  lang: z.enum(["en", "es", "ht"]).catch("es"),
  email: z.string().email().optional(),
});

function generateStandaloneSessionId() {
  return `standalone_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export const Route = createFileRoute("/readiness/start")({
  validateSearch: search,
  component: StartPage,
  head: () => ({ meta: [{ title: "Sentinel Readiness — Add-on" }] }),
});

const COPY = {
  en: { title: "Sentinel Readiness Packet", price: "$99 — one-time  ·  optional $5/month vault storage", body: "Do not leave your family unprepared. We gather the court-recognized documents (POA, standby guardianship, HIPAA release, school pickup, financial inventory, contact tree, child info, document locator), translate them into English and your language side-by-side, you fill them out in your own words, we translate your words exactly. You print, sign, and notarize. Then either give the packet to your family now, OR — for $5/month — load it into your encrypted document vault and we only release it to your designated person when you trigger HELP NOW. You keep 100% control until you need help.", disclaimer: "Document preparation and translation only. Not legal advice. Forms are based on the Uniform Power of Attorney Act and standard state-recognized templates — have an attorney or notary in your state review POA and guardianship documents before signing." },
  es: { title: "Paquete Sentinel Readiness", price: "$99 — pago único  ·  bóveda opcional $5/mes", body: "No deje a su familia desprevenida. Reunimos los documentos reconocidos por las cortes (poder notarial, tutela temporal, autorización HIPAA, recogida escolar, inventario financiero, árbol de contactos, ficha de menores, ubicación de documentos), los traducimos al inglés y a su idioma lado a lado, usted los llena en sus propias palabras, nosotros traducimos sus palabras exactas. Usted imprime, firma y notariza. Luego: entréguelos a su familia ahora, O — por $5/mes — guárdelos en su bóveda cifrada y solo se liberan a la persona que usted designe cuando active AYUDA YA. Usted mantiene el 100% del control hasta que necesite ayuda.", disclaimer: "Solo preparación y traducción de documentos. No es asesoría legal. Los formularios se basan en la Ley Uniforme de Poder Notarial y plantillas estatales estándar — pida a un abogado o notario en su estado revisar el poder y la tutela antes de firmar." },
  ht: { title: "Pakè Sentinel Readiness", price: "$99 — pèman youn fwa  ·  $5/mwa pou kòfrefò opsyonèl", body: "Pa kite fanmi w san preparasyon. Nou rasanble dokiman tribinal yo rekonèt (POA, gad legal tanporè, otorizasyon HIPAA, ranmase timoun lekòl, envantè finansye, lis kontak, enfòmasyon timoun, kote dokiman yo ye), tradui yo an angle ak lang ou kòt-a-kòt, ou ranpli yo nan pwòp mo w, nou tradui mo w yo egzakteman. Ou enprime, siyen, e notaryze. Apre sa: bay fanmi w yo kounye a, OUBYEN — pou $5/mwa — sere yo nan kòfrefò chiffre w epi nou voye yo bay moun ou chwazi a sèlman lè ou aktive AYÈ KOUNYE A. Ou gen 100% kontwòl jiskaske w bezwen èd.", disclaimer: "Preparasyon ak tradiksyon dokiman sèlman. Pa konsèy legal. Fòm yo baze sou Lwa Inifòm sou Pouvwa Avoka ak modèl estanda eta yo — mande yon avoka oswa notè nan eta w revize POA ak gad legal anvan w siyen." },
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
