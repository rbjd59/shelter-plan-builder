import { Link } from "@tanstack/react-router";
import { AssetProtectionComingSoon } from "@/components/AssetProtectionComingSoon";

type Lang = "en" | "es" | "ht";

const DOC_LIST: Record<Lang, string[]> = {
  en: [
    "Power of Attorney (general + childcare)",
    "Standby/Temporary Guardianship for minor children",
    "School pickup authorization",
    "Medical authorization / HIPAA release",
    "Bank & financial account inventory (no passwords)",
    "Property, vehicle & title locator",
    "Lease / mortgage info sheet",
    "Emergency contact tree (3 tiers)",
    "Children's information sheet (DOB, school, doctor, meds)",
    "A-number & immigration court info",
    "Document locator map (birth certs, passports, deeds)",
    "Optional letter to your children",
  ],
  es: [
    "Poder Notarial (general + cuidado de menores)",
    "Tutela temporal/en espera para hijos menores",
    "Autorización para recoger en la escuela",
    "Autorización médica / liberación HIPAA",
    "Inventario de cuentas bancarias y financieras (sin contraseñas)",
    "Localizador de propiedades, vehículos y títulos",
    "Hoja de arrendamiento / hipoteca",
    "Árbol de contactos de emergencia (3 niveles)",
    "Hoja de información de los niños (fecha nac., escuela, médico, medicinas)",
    "Número A y datos de corte de inmigración",
    "Mapa localizador de documentos (actas, pasaportes, escrituras)",
    "Carta opcional a sus hijos",
  ],
  ht: [
    "Pouvwa Avoka (jeneral + swen timoun)",
    "Gad tanporè/an atant pou timoun minè",
    "Otorizasyon pou pran timoun lekòl",
    "Otorizasyon medikal / liberasyon HIPAA",
    "Envantè kont labank ak finansye (san modpas)",
    "Lokalizatè pwopriyete, machin ak tit",
    "Fèy lwaye / ipotèk",
    "Ab kontak ijans (3 nivo)",
    "Fèy enfòmasyon timoun yo (dat nesans, lekòl, doktè, medikaman)",
    "Nimewo A ak enfòmasyon tribinal imigrasyon",
    "Kat lokalizasyon dokiman (batistè, paspò, ak)",
    "Lèt opsyonèl bay timoun ou yo",
  ],
};

const COPY: Record<Lang, {
  eyebrow: string;
  badge: string;
  headline: string;
  packetTitle: string;
  priceLine: string;
  intro: string;
  docsLabel: string;
  workflow: string;
  storageOffer: string;
  control: string;
  packetCta: string;
  trustTitle: string;
  trustBlurb: string;
  trustCta: string;
}> = {
  en: {
    eyebrow: "Sentinel — Asset & Family Protection",
    badge: "Powered by Sentinel",
    headline: "Do not leave your family unprepared.",
    packetTitle: "Sentinel Readiness Packet",
    priceLine: "Included — no charge",
    intro: "At no charge we gather every document your family will need and translate them for you. You fill them out in your language — we translate your words exactly into English. You print, sign, and notarize.",
    docsLabel: "What's included:",
    workflow: "Give the signed originals to family now, OR for $5/month load them into your encrypted document storage inside the app. They are only sent if you are detained.",
    storageOffer: "Encrypted on-device vault. Released only when you trigger NOTIFY FAMILY.",
    control: "We give you a real solution for handing power over your assets and permission for childcare BEFORE something happens — and you keep 100% control until you need help.",
    packetCta: "Add Readiness Packet — no charge",
    trustTitle: "Sentinel Trust — premium",
    trustBlurb: "Asset protection structure for families facing removal: irrevocable spendthrift trust + LLC, designed to keep your home, business, and savings intact across borders.",
    trustCta: "Learn about Sentinel Trust →",
  },
  es: {
    eyebrow: "Sentinel — Protección de Activos y Familia",
    badge: "Por Sentinel",
    headline: "No deje a su familia sin preparación.",
    packetTitle: "Paquete Sentinel Readiness",
    priceLine: "Incluido — sin cargo",
    intro: "Sin cargo reunimos todos los documentos que su familia necesitará y los traducimos para usted. Usted los llena en su idioma — nosotros traducimos sus palabras exactamente al inglés. Usted los imprime, firma y notariza.",
    docsLabel: "Qué incluye:",
    workflow: "Entregue los originales firmados a su familia ahora, O por $5/mes cárguelos en su almacenamiento de documentos cifrado dentro de la app. Solo se envían si usted es detenido.",
    storageOffer: "Bóveda cifrada en su dispositivo. Liberada solo cuando active AVISAR A FAMILIA.",
    control: "Le damos una solución real para entregar el poder sobre sus activos y permiso para el cuidado de sus hijos ANTES de que algo ocurra — y usted mantiene el 100% del control hasta que necesite ayuda.",
    packetCta: "Agregar Paquete Readiness — sin cargo",
    trustTitle: "Sentinel Trust — premium",
    trustBlurb: "Estructura de protección de activos para familias frente a la deportación: fideicomiso irrevocable + LLC, diseñado para mantener su casa, negocio y ahorros intactos a través de fronteras.",
    trustCta: "Conozca Sentinel Trust →",
  },
  ht: {
    eyebrow: "Sentinel — Pwoteksyon Byen ak Fanmi",
    badge: "Pa Sentinel",
    headline: "Pa kite fanmi w san preparasyon.",
    packetTitle: "Pakè Sentinel Readiness",
    priceLine: "Enkli — san frè",
    intro: "San frè nou rasanble tout dokiman fanmi w ap bezwen e nou tradui yo pou ou. Ou ranpli yo nan lang ou — nou tradui pawòl ou yo egzakteman an Anglè. Ou enprime, siyen, e fè yo notarize.",
    docsLabel: "Sa ki ladan:",
    workflow: "Bay fanmi w orijinal ki siyen yo kounye a, OSWA pou $5/mwa mete yo nan estokaj dokiman chiffre w nan app la. Yo voye sèlman si yo detni w.",
    storageOffer: "Kòfrefò chiffre nan aparèy ou. Lage sèlman lè ou aktive AVIZE FANMI.",
    control: "Nou ba ou yon vrè solisyon pou bay yon moun pouvwa sou byen w ak pèmisyon pou swen timoun AVAN yon bagay rive — e ou kenbe 100% kontwòl jiskaske ou bezwen èd.",
    packetCta: "Ajoute Pakè Readiness — san frè",
    trustTitle: "Sentinel Trust — premium",
    trustBlurb: "Estrikti pwoteksyon byen pou fanmi k ap fè fas ak depòtasyon: trast irevokab + LLC, fèt pou kenbe kay, biznis, ak ekonomi w an plas atravè fwontyè.",
    trustCta: "Aprann sou Sentinel Trust →",
  },
};

export function SentinelUpsellCards({ intakeSessionId, lang, customerEmail }: {
  intakeSessionId: string;
  lang: Lang;
  customerEmail?: string | null;
}) {
  const c = COPY[lang];
  const docs = DOC_LIST[lang];
  return (
    <section style={{
      marginTop: 28,
      padding: "36px 28px",
      background: "linear-gradient(180deg, #f4efe6 0%, #ebe3d4 100%)",
      borderRadius: 10,
      borderLeft: "4px solid #b8551f",
      color: "#0e1a2b",
      fontFamily: "Inter Tight, system-ui, sans-serif",
    }}>
      <div style={{
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "#8a3c11",
        marginBottom: 10,
      }}>{c.eyebrow}</div>

      <h2 style={{
        fontFamily: "Fraunces, Georgia, serif",
        fontSize: 30,
        fontWeight: 600,
        lineHeight: 1.15,
        margin: "0 0 22px",
        color: "#0e1a2b",
        letterSpacing: "-0.01em",
      }}>{c.headline}</h2>

      <div style={{ display: "grid", gap: 18, gridTemplateColumns: "1fr" }}>
        {/* Card 1 — Readiness Packet */}
        <article style={{
          background: "#fff",
          border: "1px solid rgba(14,26,43,0.15)",
          borderTop: "3px solid #b8551f",
          padding: "26px 26px",
          borderRadius: 6,
        }}>
          <h3 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 24, fontWeight: 600, margin: "0 0 6px", color: "#0e1a2b" }}>
            {c.packetTitle}
          </h3>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#b8551f", marginBottom: 16 }}>{c.priceLine}</div>

          <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.6, color: "#1a2940" }}>
            {c.intro}
          </p>

          <div style={{
            background: "#faf6ee",
            border: "1px solid rgba(184,85,31,0.2)",
            borderRadius: 4,
            padding: "14px 18px",
            marginBottom: 18,
          }}>
            <div style={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#8a3c11",
              marginBottom: 10,
            }}>{c.docsLabel}</div>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13.5, lineHeight: 1.65, color: "#1a2940" }}>
              {docs.map((d) => <li key={d} style={{ marginBottom: 2 }}>{d}</li>)}
            </ul>
          </div>

          <p style={{ margin: "0 0 12px", fontSize: 14.5, lineHeight: 1.6, color: "#1a2940" }}>
            {c.workflow}
          </p>
          <p style={{
            margin: "0 0 16px",
            fontSize: 13,
            lineHeight: 1.55,
            color: "#6b4a2a",
            fontStyle: "italic",
            borderLeft: "2px solid #c9a961",
            paddingLeft: 12,
          }}>
            {c.storageOffer}
          </p>
          <p style={{ margin: "0 0 22px", fontSize: 14.5, lineHeight: 1.6, color: "#1a2940", fontWeight: 500 }}>
            {c.control}
          </p>

          <Link
            to="/readiness/start"
            search={{ session: intakeSessionId, lang, email: customerEmail || undefined } as never}
            style={{
              display: "inline-block",
              background: "#b8551f",
              color: "#fff",
              padding: "13px 26px",
              fontWeight: 600,
              fontSize: 14.5,
              textDecoration: "none",
              borderRadius: 4,
              letterSpacing: "0.02em",
            }}
          >{c.packetCta}</Link>
        </article>

        {/* Card 2 — Asset Protection Trust (Coming Soon, $899, AZ ABS) */}
        <AssetProtectionComingSoon lang={lang} />

        {/* Card 3 — Sentinel Trust */}
        <article style={{
          background: "#0e1a2b",
          color: "#f4efe6",
          padding: "22px 24px",
          borderRadius: 6,
          borderTop: "3px solid #c9a961",
        }}>
          <div style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#c9a961",
            marginBottom: 8,
          }}>{c.badge}</div>
          <h3 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 22, fontWeight: 600, margin: "0 0 8px" }}>
            {c.trustTitle}
          </h3>
          <p style={{ margin: "0 0 18px", fontSize: 14.5, lineHeight: 1.55, color: "#e6e0d2" }}>
            {c.trustBlurb}
          </p>
          <a
            href="https://www.defendermicasa.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              border: "1px solid #c9a961",
              color: "#c9a961",
              padding: "11px 22px",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
              borderRadius: 4,
              letterSpacing: "0.02em",
            }}
          >{c.trustCta}</a>
        </article>
      </div>
    </section>
  );
}
