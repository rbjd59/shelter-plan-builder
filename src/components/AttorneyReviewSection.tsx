import { Link } from "@tanstack/react-router";
import { useLang } from "@/context/LanguageContext";
import { FIRM } from "@/lib/firm-info";

/**
 * Homepage attorney-review section. Communicates the TWO review checkpoints:
 *   1. Before the packet is stored/sent — attorney reviews the draft.
 *   2. After the packet returns from the SEND DOCS app (post-detention) —
 *      attorney re-reviews and finalizes before legal mailing.
 *
 * Trilingual (EN / ES / HT). Rendered above the marketing markup so users
 * see the attorney workflow immediately.
 */
export function AttorneyReviewSection() {
  const { lang } = useLang();
  const t = COPY[lang] ?? COPY.en;

  return (
    <section
      aria-labelledby="attorney-review-heading"
      style={{
        background: "#0f1830",
        color: "#fff",
        padding: "56px 20px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span
            style={{
              display: "inline-block",
              background: "rgba(224,122,77,0.18)",
              color: "#e07a4d",
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {t.tag}
          </span>
          <h2
            id="attorney-review-heading"
            style={{
              fontFamily: "'Libre Baskerville', Georgia, serif",
              fontSize: "clamp(28px, 4vw, 40px)",
              margin: "14px 0 10px",
              lineHeight: 1.15,
            }}
          >
            {t.heading}
          </h2>
          <p style={{ color: "#c7cbd6", maxWidth: 720, margin: "0 auto", fontSize: 16, lineHeight: 1.6 }}>
            {t.sub}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 18,
          }}
        >
          {t.checkpoints.map((c, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderLeft: "3px solid #e07a4d",
                borderRadius: 12,
                padding: 22,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "#e07a4d",
                    color: "#0f1830",
                    fontWeight: 800,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                  }}
                >
                  {i + 1}
                </span>
                <strong style={{ fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: "#e07a4d" }}>
                  {c.stage}
                </strong>
              </div>
              <h3 style={{ fontSize: 18, margin: "0 0 8px", lineHeight: 1.25 }}>{c.title}</h3>
              <p style={{ color: "#c7cbd6", margin: 0, fontSize: 14.5, lineHeight: 1.6 }}>{c.body}</p>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 28,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
            color: "#c7cbd6",
            fontSize: 13,
          }}
        >
          <span>
            {t.attorneyLine}{" "}
            <strong style={{ color: "#fff" }}>{FIRM.attorney}</strong> · FL Bar {FIRM.flBarNumber}
          </span>
          <Link
            to="/attorney"
            style={{
              background: "#e07a4d",
              color: "#0f1830",
              padding: "9px 18px",
              borderRadius: 999,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {t.cta} →
          </Link>
        </div>
      </div>
    </section>
  );
}

const COPY = {
  en: {
    tag: "Two Roles · One Packet · No Fee",
    heading: "The Company types your forms. The Firm controls the legal work. One packet, no charge.",
    sub: "Sorrentino Law Firm PLLC operates this site under license from DetencionDefensa.com, Inc. The Company is the technology operator only. The Firm has sole control of all legal services, and the service is free during the community crisis.",
    checkpoints: [
      {
        stage: "Role 1 · DetencionDefensa.com, Inc.",
        title: "We translate and type your answers",
        body: "You answer simple questions. As the Firm's disclosed agent, we translate them into English and type them onto your habeas corpus form, then deliver them securely. That is all we do. We are not a law firm, we give no legal advice, and we are not your lawyer.",
      },
      {
        stage: "Role 2 · Sorrentino Law Firm PLLC",
        title: "The Firm reviews your forms — twice",
        body: "A Florida lawyer reads every page before it is saved on your phone. If you are picked up later, the lawyer reads it again, signs it, and mails it to the court. The Firm is solely responsible for this legal work and provides it pro bono during the crisis.",
      },
    ],
    attorneyLine: "Forms are read and signed by",
    cta: "Meet the lawyer",
  },
  es: {
    tag: "Dos Funciones · Un Paquete · Sin Costo",
    heading:
      "La empresa escribe sus formas. La Firma controla el trabajo legal. Un paquete, sin cargo.",
    sub: "Sorrentino Law Firm PLLC opera este sitio bajo licencia de DetencionDefensa.com, Inc. La empresa es únicamente el operador tecnológico. La Firma tiene el control exclusivo de todos los servicios legales, y el servicio es gratuito durante la crisis comunitaria.",
    checkpoints: [
      {
        stage: "Función 1 · DetencionDefensa.com, Inc.",
        title: "Traducimos y escribimos sus respuestas",
        body: "Usted contesta preguntas fáciles. Como agente divulgado de la Firma, las traducimos al inglés y las escribimos en su forma de habeas corpus, y luego las entregamos de forma segura. Eso es todo lo que hacemos. No somos una firma de abogados, no damos asesoría legal y no somos su abogado.",
      },
      {
        stage: "Función 2 · Sorrentino Law Firm PLLC",
        title: "La Firma revisa sus formas — dos veces",
        body: "Un abogado de Florida lee cada página antes de guardarla en su teléfono. Si lo detienen, el abogado la lee otra vez, la firma y la manda a la corte. La Firma es la única responsable de este trabajo legal y lo brinda pro bono durante la crisis.",
      },
    ],
    attorneyLine: "Las formas las lee y firma",
    cta: "Conozca al abogado",
  },
  ht: {
    tag: "De Wòl · Yon Pake · San Frè",
    heading: "Konpayi an ekri fòm yo. Kabinè a kontwole travay legal la. Yon pake, san frè.",
    sub: "Se Sorrentino Law Firm PLLC k ap opere sit sa a anba yon lisans DetencionDefensa.com, Inc. bay. Konpayi an se sèlman operatè teknoloji a. Kabinè a gen kontwòl total sou tout sèvis legal, epi sèvis la gratis pandan kriz kominotè a.",
    checkpoints: [
      {
        stage: "Wòl 1 · DetencionDefensa.com, Inc.",
        title: "Nou tradui epi ekri repons ou yo",
        body: "Ou reponn kèk kesyon fasil. Kòm ajan deklare Kabinè a, nou tradui yo an Angle epi ekri yo sou fòm habeas corpus ou, epi nou livre yo an sekirite. Se sa sèlman nou fè. Nou pa yon kabinè avoka, nou pa bay konsèy legal, epi nou pa avoka w.",
      },
      {
        stage: "Wòl 2 · Sorrentino Law Firm PLLC",
        title: "Kabinè a tcheke fòm ou yo — de fwa",
        body: "Yon avoka Florida li chak paj anvan li sere sou telefòn ou. Si yo pran w, avoka a li l ankò, siyen l, epi voye l bay tribinal la. Kabinè a sèl responsab pou travay legal sa a epi li bay li pro bono pandan kriz la.",
      },
    ],
    attorneyLine: "Fòm yo li epi siyen pa",
    cta: "Konnen avoka a",
  },
} as const;

