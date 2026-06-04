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
    tag: "Attorney Review",
    heading: "Every form is reviewed by an attorney — twice.",
    sub: "Your packet is checked once when it is first drafted, and again after it comes back through the SEND DOCS app — before anything is mailed to the court.",
    checkpoints: [
      {
        stage: "Checkpoint 1 · Before storage",
        title: "Draft review",
        body: "After your intake, we generate the draft packet. A licensed Florida attorney reviews every page before it is stored on your phone — checking facts, citations, and the AO 242 caption.",
      },
      {
        stage: "Checkpoint 2 · After the app sends it back",
        title: "Post-trigger re-review",
        body: "If you are detained and the SEND DOCS app fires the packet back to the firm, the attorney re-reviews it with your current facility, signs it, and mails it via U.S. legal mail.",
      },
    ],
    attorneyLine: "Reviewed and signed by",
    cta: "Meet the attorney",
  },
  es: {
    tag: "Revisión del Abogado",
    heading: "Cada formulario lo revisa un abogado — dos veces.",
    sub: "Su paquete se revisa una vez cuando se redacta y otra vez cuando regresa por la app MANDA DEMANDA — antes de enviarlo a la corte.",
    checkpoints: [
      {
        stage: "Revisión 1 · Antes de guardarlo",
        title: "Revisión del borrador",
        body: "Después de su entrevista, generamos el borrador. Un abogado con licencia en Florida revisa cada página antes de guardarla en su teléfono — verifica hechos, citas y el encabezado del AO 242.",
      },
      {
        stage: "Revisión 2 · Después de que la app lo devuelve",
        title: "Re-revisión post-detención",
        body: "Si lo detienen y la app MANDA DEMANDA envía el paquete de regreso al bufete, el abogado lo revisa otra vez con su centro actual, lo firma y lo envía por correo legal de EE.UU.",
      },
    ],
    attorneyLine: "Revisado y firmado por",
    cta: "Conozca al abogado",
  },
  ht: {
    tag: "Revizyon Avoka",
    heading: "Chak fòm yon avoka revize l — de fwa.",
    sub: "Pake w la revize yon fwa lè nou prepare l, epi ankò lè li retounen nan aplikasyon VOYE DOSYE — anvan nou voye anyen nan tribinal la.",
    checkpoints: [
      {
        stage: "Revizyon 1 · Anvan estokaj",
        title: "Revizyon bouyon",
        body: "Aprè entèvyou w la, nou jenere pake bouyon an. Yon avoka ki gen lisans nan Florida revize chak paj anvan li estoke sou telefòn ou — li tcheke reyalite, sitasyon ak tèt AO 242 la.",
      },
      {
        stage: "Revizyon 2 · Aprè aplikasyon an voye l tounen",
        title: "Re-revizyon aprè detansyon",
        body: "Si yo detni w e aplikasyon VOYE DOSYE a voye pake a tounen bay kabinè a, avoka a re-revize l ak sant kote w ye a, siyen l, epi voye l pa lapòs legal Etazini.",
      },
    ],
    attorneyLine: "Revize epi siyen pa",
    cta: "Konnen avoka a",
  },
} as const;
