import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import {
  getPacketByToken,
  sendPacketNow,
  createVaultSubscriptionCheckout,
} from "@/lib/readiness.functions";

const search = z.object({
  token: z.string().min(8),
  lang: z.enum(["en", "es", "ht"]).catch("es"),
});

export const Route = createFileRoute("/readiness/review")({
  validateSearch: search,
  component: ReviewPage,
  head: () => ({ meta: [{ title: "Sentinel Readiness — Your Packet" }] }),
});

type Lang = "en" | "es" | "ht";

const COPY = {
  en: {
    eyebrow: "SENTINEL READINESS · YOUR PACKET",
    title: "Your packet is ready",
    intro: "Download each document below, print it, sign it, and have a notary witness the signatures (POA and guardianship require notarization in most states). Then choose how to deliver them to your family.",
    download: "Download",
    deliveryTitle: "Choose how to deliver to your family",
    optA: "Send to my family now",
    optAdesc: "Email the entire packet to your designated person right now. They keep it on file.",
    optActa: "Email to {name}",
    optAsent: "Sent.",
    optB: "Lock in the vault — release only on HELP NOW",
    optBdesc: "$5/month encrypted storage. We hold the packet and only release it to your designated person the moment you activate HELP NOW. You keep 100% control until then.",
    optBcta: "Start $5/month vault",
    disclaimer: "Forms based on the Uniform Power of Attorney Act and standard state-recognized templates. Have your attorney or notary in your state review POA and guardianship before signing. Not legal advice.",
    loading: "Loading your packet…",
    notfound: "Packet not found or link expired.",
    sending: "Sending…",
    home: "← Home",
  },
  es: {
    eyebrow: "SENTINEL READINESS · SU PAQUETE",
    title: "Su paquete está listo",
    intro: "Descargue cada documento, imprímalo, fírmelo y notarice las firmas (el poder y la tutela requieren notarización en casi todos los estados). Luego elija cómo entregarlo a su familia.",
    download: "Descargar",
    deliveryTitle: "Elija cómo entregarlo a su familia",
    optA: "Enviar a mi familia ahora",
    optAdesc: "Le enviamos el paquete completo a la persona designada ahora mismo. Lo guardan en archivo.",
    optActa: "Enviar a {name}",
    optAsent: "Enviado.",
    optB: "Guardar en la bóveda — liberar solo con AYUDA YA",
    optBdesc: "$5/mes de almacenamiento cifrado. Conservamos el paquete y solo lo liberamos a su persona designada cuando active AYUDA YA. Usted mantiene 100% del control hasta entonces.",
    optBcta: "Iniciar bóveda $5/mes",
    disclaimer: "Formularios basados en la Ley Uniforme de Poder Notarial y plantillas estatales reconocidas. Pida a un abogado o notario en su estado revisar el poder y la tutela antes de firmar. No es asesoría legal.",
    loading: "Cargando su paquete…",
    notfound: "Paquete no encontrado o enlace vencido.",
    sending: "Enviando…",
    home: "← Inicio",
  },
  ht: {
    eyebrow: "SENTINEL READINESS · PAKÈ W LA",
    title: "Pakè w pare",
    intro: "Telechaje chak dokiman, enprime li, siyen li, epi mande yon notè temwen siyati yo (POA ak gad legal mande notarizasyon nan pifò eta). Lè sa a chwazi ki jan pou voye l bay fanmi w.",
    download: "Telechaje",
    deliveryTitle: "Chwazi ki jan pou voye l bay fanmi w",
    optA: "Voye bay fanmi m kounye a",
    optAdesc: "Nou voye pakè a bay moun ou chwazi a kounye a. Yo kenbe l.",
    optActa: "Voye bay {name}",
    optAsent: "Voye.",
    optB: "Sere nan kòfrefò — lage sèlman ak AYÈ KOUNYE A",
    optBdesc: "$5/mwa estokaj chiffre. Nou kenbe pakè a epi nou lage l bay moun ou chwazi a sèlman lè ou aktive AYÈ KOUNYE A. Ou gen 100% kontwòl jiskaske lè sa a.",
    optBcta: "Kòmanse kòfrefò $5/mwa",
    disclaimer: "Fòm baze sou Lwa Inifòm sou Pouvwa Avoka ak modèl estanda eta yo. Mande yon avoka oswa notè nan eta w revize POA ak gad legal anvan w siyen. Pa konsèy legal.",
    loading: "K ap chaje pakè w...",
    notfound: "Pakè pa jwenn oswa lyen ekspire.",
    sending: "K ap voye...",
    home: "← Akèy",
  },
} as const;

function ReviewPage() {
  const { token, lang } = Route.useSearch();
  const L = lang as Lang;
  const c = COPY[L];

  const getPacket = useServerFn(getPacketByToken);
  const sendNow = useServerFn(sendPacketNow);
  const startVault = useServerFn(createVaultSubscriptionCheckout);

  const [packet, setPacket] = useState<{
    id: string;
    recipientName: string | null;
    documents: Array<{ name: string; url: string }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [vaultMode, setVaultMode] = useState<"closed" | "open">("closed");
  const [stripePromise] = useState(() => getStripe());

  useEffect(() => {
    getPacket({ data: { token } })
      .then((res) => {
        if (res.ok) setPacket(res.packet);
        else setError(res.error);
      })
      .catch(() => setError("Failed to load"));
  }, [token, getPacket]);

  const handleSendNow = async () => {
    if (!packet) return;
    setSendStatus("sending");
    try {
      await sendNow({ data: { packetId: packet.id } });
      setSendStatus("sent");
    } catch {
      setSendStatus("error");
    }
  };

  const fetchVaultSecret = async () => {
    if (!packet) throw new Error("No packet");
    const secret = await startVault({
      data: {
        packetId: packet.id,
        returnUrl: `${window.location.origin}/readiness/review?token=${token}&lang=${lang}&vault=ok`,
        environment: getStripeEnvironment(),
      },
    });
    if (!secret) throw new Error("No secret");
    return secret;
  };

  const wrap: React.CSSProperties = { minHeight: "100vh", background: "#f4efe6", color: "#0e1a2b", fontFamily: "Inter Tight, system-ui, sans-serif", padding: "32px 20px" };
  const container: React.CSSProperties = { maxWidth: 760, margin: "0 auto" };

  if (error) return <div style={wrap}><div style={container}><h1>{c.notfound}</h1><Link to="/" style={{ color: "#b8551f" }}>{c.home}</Link></div></div>;
  if (!packet) return <div style={wrap}><div style={container}><p>{c.loading}</p></div></div>;

  const recipientLabel = packet.recipientName ?? "your contact";

  return (
    <div style={wrap}>
      <div style={container}>
        <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: "0.12em", color: "#8a3c11", marginBottom: 8 }}>{c.eyebrow}</div>
        <h1 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 32, fontWeight: 600, margin: "0 0 10px" }}>{c.title}</h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "#1a2940", marginBottom: 22 }}>{c.intro}</p>

        <div style={{ background: "#fff", border: "1px solid rgba(14,26,43,0.15)", borderRadius: 6, padding: 18, marginBottom: 26 }}>
          {packet.documents.map((d) => (
            <div key={d.url} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(14,26,43,0.08)" }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{d.name.replace(/\.pdf\.enc$|\.enc$/, ".pdf")}</div>
              <a href={d.url} download style={{ background: "#0e1a2b", color: "#fff", padding: "6px 14px", borderRadius: 4, fontSize: 13, textDecoration: "none", fontWeight: 600 }}>{c.download}</a>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 22, fontWeight: 600, margin: "0 0 14px" }}>{c.deliveryTitle}</h2>

        <div style={{ display: "grid", gap: 14, marginBottom: 22 }}>
          <div style={{ background: "#fff", border: "1px solid rgba(14,26,43,0.15)", borderRadius: 6, padding: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>A · {c.optA}</div>
            <div style={{ fontSize: 14, color: "#1a2940", marginBottom: 12, lineHeight: 1.5 }}>{c.optAdesc}</div>
            {sendStatus === "sent" ? (
              <div style={{ color: "#2d5a3d", fontWeight: 600 }}>✓ {c.optAsent}</div>
            ) : (
              <button onClick={handleSendNow} disabled={sendStatus === "sending"} style={{ background: "#b8551f", color: "#fff", border: 0, padding: "10px 18px", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>
                {sendStatus === "sending" ? c.sending : c.optActa.replace("{name}", recipientLabel)}
              </button>
            )}
          </div>

          <div style={{ background: "#fff", border: "1px solid rgba(14,26,43,0.15)", borderRadius: 6, padding: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>B · {c.optB}</div>
            <div style={{ fontSize: 14, color: "#1a2940", marginBottom: 12, lineHeight: 1.5 }}>{c.optBdesc}</div>
            {vaultMode === "closed" ? (
              <button onClick={() => setVaultMode("open")} style={{ background: "#0e1a2b", color: "#fff", border: 0, padding: "10px 18px", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>
                {c.optBcta}
              </button>
            ) : (
              <div style={{ marginTop: 12 }}>
                <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret: fetchVaultSecret }}>
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            )}
          </div>
        </div>

        <p style={{ fontSize: 12, color: "#6b6b6b", lineHeight: 1.5 }}>{c.disclaimer}</p>
        <Link to="/" style={{ display: "inline-block", marginTop: 18, color: "#b8551f" }}>{c.home}</Link>
      </div>
    </div>
  );
}
