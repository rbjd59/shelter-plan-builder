import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang, type Lang } from "@/context/LanguageContext";
import logoAsset from "@/assets/dd-logo.png.asset.json";

type Copy = {
  heading: string;
  intro: string;
  faqLabel: string;
  faqs: { q: string; a: string[] }[];
  tipsLabel: string;
  tips: string[];
  back: string;
};

const COPY = {
  es: {
    heading: "Más sobre la seguridad de la app",
    intro:
      "Tomamos muy en serio la seguridad de sus datos. Aquí respondemos las preguntas más comunes sobre cómo DetencionDefensa protege su información.",
    faqLabel: "Preguntas frecuentes",
    faqs: [
      {
        q: "¿Quién desarrolló DetencionDefensa?",
        a: [
          "DetencionDefensa fue creada por un equipo de tecnología y defensa legal que trabaja junto a abogados de inmigración y familias trabajadoras inmigrantes para poner herramientas de emergencia en manos de la comunidad.",
        ],
      },
      {
        q: "¿Por qué crearon la app?",
        a: [
          "El botón de emergencia fue creado para que las familias puedan actuar de inmediato si un ser querido es detenido por ICE: notificar contactos, activar al abogado y comenzar el proceso legal sin perder horas críticas.",
        ],
      },
      {
        q: "¿Cómo protege DetencionDefensa mis datos?",
        a: [
          "La app fue diseñada con la privacidad primero. Su información de admisión se cifra de extremo a extremo (TLS 1.3 en tránsito y AES-256 en reposo).",
          "Una vez que su abogado revisa sus formularios, su plan se transfiere a su teléfono y se elimina de nuestros servidores. Usted controla si alguna vez se comparte.",
        ],
      },
      {
        q: "¿Puede ICE o DHS acceder a mis datos si me detienen?",
        a: [
          "No. En su teléfono, el plan está protegido por el bloqueo del dispositivo y por la verificación de la app. Nosotros no entregamos información sin una orden legal válida y no vendemos ni compartimos sus datos con terceros no autorizados.",
        ],
      },
      {
        q: "¿Qué pasa si no puedo presionar el botón?",
        a: [
          "Sus datos están protegidos por la pantalla de bloqueo del teléfono. Recomendamos usar un código numérico o de patrón, no huella digital ni reconocimiento facial.",
          "También puede compartir por adelantado una copia de su plan de emergencia con sus contactos clave, por si no puede presionar el botón al momento del arresto.",
        ],
      },
      {
        q: "Si alguien desbloquea mi teléfono, ¿puede ver mi plan?",
        a: [
          "La app tiene su propia capa de protección: verificación del número de teléfono y un segundo paso de autenticación (código de un solo uso). Sin esos pasos no se puede abrir el plan guardado.",
        ],
      },
      {
        q: "¿Qué pasa si no tengo señal cuando presiono el botón?",
        a: [
          "Sin datos ni Wi-Fi, los mensajes pueden no salir de inmediato. La app reintenta enviarlos cuando se restablece el servicio.",
          "Por eso recomendamos avisar a sus contactos clave antes de visitar lugares de alto riesgo con poca señal, como cortes o aeropuertos.",
        ],
      },
      {
        q: "¿Qué pasa si presiono el botón por error?",
        a: [
          "Hay una ventana de 3 segundos para cancelar antes de que se envíe la alerta.",
          "Si la alerta ya salió, puede cancelarla con su código y el sistema envía automáticamente un aviso de falsa alarma a todos sus contactos y a su abogado.",
        ],
      },
      {
        q: "¿Quién recibe mis alertas?",
        a: [
          "Solo usted, su abogado y los contactos que usted designó. Nadie más recibe notificaciones de SOS.",
        ],
      },
    ],
    tipsLabel: "Cómo usar la app de la forma más segura",
    tips: [
      "Use un código numérico o de patrón fuerte; evite huella digital o reconocimiento facial.",
      "Mantenga la app en la pantalla principal de su teléfono.",
      "Guarde una copia de su plan de emergencia donde sus contactos clave puedan verla.",
      "Avise a sus contactos cuando vaya a lugares de alto riesgo o sin señal.",
      "Abra la app cada vez que se sienta en riesgo para tener el botón a la mano.",
    ],
    back: "Volver al inicio",
  },
  en: {
    heading: "More about app security",
    intro:
      "We take the safety and security of your data extremely seriously. Below are answers to the most common questions about how DetencionDefensa protects your information.",
    faqLabel: "FAQs",
    faqs: [
      {
        q: "Who developed DetencionDefensa?",
        a: [
          "DetencionDefensa was built by a technology and legal-defense team working alongside immigration attorneys and immigrant working families to put emergency tools directly in the community's hands.",
        ],
      },
      {
        q: "Why did you make it?",
        a: [
          "The emergency button was built so families can act immediately if a loved one is detained by ICE — notify contacts, activate the attorney, and start the legal process without losing critical hours.",
        ],
      },
      {
        q: "How does DetencionDefensa protect user data?",
        a: [
          "The app was designed privacy-first. Your intake information is encrypted end-to-end (TLS 1.3 in transit, AES-256 at rest).",
          "Once your attorney has reviewed your forms, your plan is transferred to your phone and deleted from our servers. You control whether it is ever shared.",
        ],
      },
      {
        q: "Can ICE or DHS access the data if someone is detained?",
        a: [
          "No. On your phone the plan is protected by the device lock and by the app's own verification. We do not hand over information without valid legal process, and we never sell or share your data with unauthorized third parties.",
        ],
      },
      {
        q: "What if the user isn't able to press the button?",
        a: [
          "Your data is protected by the phone's lock screen. We recommend a numeric or pattern passcode — not biometric passkeys such as fingerprint or face unlock.",
          "You can also share a copy of your emergency plan with key contacts in advance, in case you can't press the button at the time of arrest.",
        ],
      },
      {
        q: "If someone gets past the lock screen, can they see the plan?",
        a: [
          "The app has its own layer of protection: phone-number verification plus a second authentication step (one-time code). Without both, the stored plan cannot be opened.",
        ],
      },
      {
        q: "What if there's no service when the button is pressed?",
        a: [
          "Without cell service or Wi-Fi, messages may not go out immediately. The app retries sending once service is restored.",
          "Notify key emergency contacts before visiting high-risk locations with poor service, such as courthouses or airports.",
        ],
      },
      {
        q: "What happens if the button is pressed by mistake?",
        a: [
          "There is a 3-second window to cancel before the alert is sent.",
          "If the alert already went out, you can cancel with your code and the system automatically sends a false-alarm notice to every contact and to your attorney.",
        ],
      },
      {
        q: "Who receives my alerts?",
        a: [
          "Only you, your attorney, and the contacts you designated. No one else receives SOS notifications.",
        ],
      },
    ],
    tipsLabel: "How to use the app most safely",
    tips: [
      "Choose a strong numeric or pattern passcode; avoid fingerprint or face unlock.",
      "Keep the app on your phone's main screen.",
      "Keep a backup of your emergency plan somewhere your key contacts can reach.",
      "Notify key contacts when visiting high-risk locations that may not have service.",
      "Open the app any time you feel at risk so the alert button is ready.",
    ],
    back: "Back to home",
  },
  ht: {
    heading: "Plis sou sekirite app la",
    intro:
      "Nou pran sekirite done ou yo trè oserye. Men repons pou kesyon ki pi komen sou fason DetencionDefensa pwoteje enfòmasyon ou.",
    faqLabel: "Kesyon yo poze souvan",
    faqs: [
      {
        q: "Kiyès ki devlope DetencionDefensa?",
        a: [
          "DetencionDefensa te devlope pa yon ekip teknoloji ak defans legal k ap travay ansanm ak avoka imigrasyon ak fanmi imigran k ap travay pou mete zouti dijans nan men kominote a.",
        ],
      },
      {
        q: "Poukisa nou fè app la?",
        a: [
          "Bouton dijans lan te fèt pou fanmi yo ka aji imedyatman si ICE detni yon moun yo renmen — avize kontak yo, aktive avoka a, epi kòmanse pwosesis legal la san pèdi tan.",
        ],
      },
      {
        q: "Kijan DetencionDefensa pwoteje done yo?",
        a: [
          "App la fèt ak vi prive an premye. Enfòmasyon antre ou yo kripte de bout an bout (TLS 1.3 nan transpò, AES-256 nan repo).",
          "Yon fwa avoka ou fin revize fòm yo, plan ou transfere nan telefòn ou epi efase nan sèvè nou yo. Se ou ki kontwole si yo janm pataje l.",
        ],
      },
      {
        q: "Èske ICE oswa DHS ka jwenn done yo si yo detni w?",
        a: [
          "Non. Sou telefòn ou, plan an pwoteje pa fèmti aparèy la ak verifikasyon app la. Nou pa bay enfòmasyon san yon pwosesis legal valab, e nou pa vann ni pataje done ou ak twazyèm pati ki pa otorize.",
        ],
      },
      {
        q: "E si mwen pa ka peze bouton an?",
        a: [
          "Done ou yo pwoteje pa ekran fèmti telefòn nan. Nou rekòmande yon kòd nimerik oswa modèl — pa anprint dijital ni rekonesans figi.",
          "Ou ka tou pataje yon kopi plan dijans ou ak kontak kle yo davans.",
        ],
      },
      {
        q: "Si yon moun louvri telefòn nan, èske li ka wè plan an?",
        a: [
          "App la gen pwòp pwoteksyon pa l: verifikasyon nimewo telefòn plis yon dezyèm etap otantifikasyon (kòd yon sèl fwa). San sa, plan an pa ka louvri.",
        ],
      },
      {
        q: "E si pa gen sèvis lè w peze bouton an?",
        a: [
          "San sèvis selilè oswa Wi-Fi, mesaj yo ka pa sòti imedyatman. App la ap eseye voye yo ankò lè sèvis la retounen.",
          "Avize kontak kle yo anvan w ale kote ki gen gwo risk ak move sèvis, tankou tribinal oswa ayewopò.",
        ],
      },
      {
        q: "E si yo peze bouton an pa erè?",
        a: [
          "Gen yon fenèt 3 segond pou anile anvan alèt la voye.",
          "Si alèt la deja soti, ou ka anile l ak kòd ou epi sistèm nan voye otomatikman yon avi fo alam bay tout kontak yo ak avoka a.",
        ],
      },
      {
        q: "Kiyès ki resevwa alèt mwen yo?",
        a: [
          "Se sèl ou, avoka ou, ak kontak ou te designe yo. Pèsonn lòt pa resevwa notifikasyon SOS.",
        ],
      },
    ],
    tipsLabel: "Kijan pou itilize app la pi an sekirite",
    tips: [
      "Chwazi yon kòd nimerik oswa modèl solid; evite anprint dijital oswa rekonesans figi.",
      "Kenbe app la sou ekran prensipal telefòn ou.",
      "Kenbe yon kopi plan dijans ou kote kontak kle ou yo ka jwenn li.",
      "Avize kontak kle yo lè w ap vizite kote ki gen gwo risk san sèvis.",
      "Louvri app la chak fwa w santi w nan risk pou bouton an pare.",
    ],
    back: "Retounen nan paj dakèy",
  },
} satisfies Record<Lang, Copy>;

export const Route = createFileRoute("/security-faq")({
  head: () => ({
    meta: [
      { title: "App Security FAQ — DetencionDefensa.com" },
      {
        name: "description",
        content:
          "Answers about encryption, phone-only storage, two-factor access, false alarms, and who receives your DetencionDefensa emergency alerts.",
      },
      { property: "og:title", content: "App Security FAQ — DetencionDefensa.com" },
      {
        property: "og:description",
        content: "How DetencionDefensa protects your emergency plan and personal data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SecurityFaqPage,
});

function SecurityFaqPage() {
  const { lang } = useLang();
  const t = COPY[lang];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #081d3a 0%, #0d2c54 100%)",
        color: "#ffffff",
        fontFamily: '"Work Sans", -apple-system, Roboto, Helvetica, Arial, sans-serif',
        padding: "1.5rem 1rem 3rem",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <header style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <img src={logoAsset.url} alt="DetencionDefensa logo" width={40} height={40} style={{ width: 40, height: 40, display: "block" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#e8a04a" }}>DetencionDefensa.com</span>
        </header>

        <h1
          style={{
            fontFamily: '"Roboto Slab", Georgia, serif',
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            fontWeight: 700,
            color: "#e8a04a",
            margin: "0 0 1rem",
            textAlign: "center",
          }}
        >
          {t.heading}
        </h1>

        <p
          style={{
            fontSize: 16,
            lineHeight: 1.6,
            textAlign: "center",
            maxWidth: 680,
            margin: "0 auto 2.25rem",
            color: "rgba(255,255,255,0.92)",
          }}
        >
          {t.intro}
        </p>

        <h2
          style={{
            fontFamily: '"Roboto Slab", Georgia, serif',
            fontSize: "1.35rem",
            color: "#e8a04a",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            margin: "0 0 1rem",
          }}
        >
          {t.faqLabel}
        </h2>

        <div style={{ display: "grid", gap: 14, marginBottom: 36 }}>
          {t.faqs.map((f, i) => (
            <details
              key={i}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(232,160,74,0.35)",
                borderRadius: 14,
                padding: "1rem 1.15rem",
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: 16,
                  color: "#f5b860",
                  listStyle: "none",
                }}
              >
                {f.q}
              </summary>
              {f.a.map((p, j) => (
                <p key={j} style={{ margin: "0.75rem 0 0", fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.92)" }}>
                  {p}
                </p>
              ))}
            </details>
          ))}
        </div>

        <div
          style={{
            background: "rgba(232,160,74,0.12)",
            border: "2px solid #e8a04a",
            borderRadius: 16,
            padding: "1.25rem 1.4rem",
            marginBottom: 32,
          }}
        >
          <h2
            style={{
              margin: "0 0 0.75rem",
              fontSize: "1.15rem",
              fontWeight: 800,
              color: "#e8a04a",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {t.tipsLabel}
          </h2>
          <ul style={{ margin: 0, paddingLeft: "1.1rem", display: "grid", gap: 8 }}>
            {t.tips.map((tip, i) => (
              <li key={i} style={{ fontSize: 15, lineHeight: 1.55, color: "rgba(255,255,255,0.95)" }}>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ textAlign: "center" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#e8a04a",
              color: "#0f1830",
              textDecoration: "none",
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "14px 28px",
              borderRadius: 999,
            }}
          >
            {t.back}
          </Link>
        </div>
      </div>
    </main>
  );
}
