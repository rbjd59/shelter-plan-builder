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
    tag: "Two Jobs · Two Fees · One Packet",
    heading: "We type your forms. A lawyer checks them. Two jobs, two fees, sent to you together.",
    sub: "DetencionDefensa and the lawyer do two different jobs. Each one has its own fee. You pay both, but they come together as one packet. Each job is its own contract.",
    checkpoints: [
      {
        stage: "Job 1 · DetencionDefensa",
        title: "We translate and type your answers",
        body: "You answer simple questions. We translate them into English and type them onto your habeas corpus form. We charge one fee for this work. That is all we do. We are not your lawyer.",
      },
      {
        stage: "Job 2 · The lawyer",
        title: "A lawyer checks your forms — twice",
        body: "A Florida lawyer reads every page before it is saved on your phone. If you are picked up later, the lawyer reads it again, signs it, and mails it to the court. The lawyer charges a second fee for this work.",
      },
    ],
    attorneyLine: "Forms are read and signed by",
    cta: "Meet the lawyer",
  },
  es: {
    tag: "Dos Trabajos · Dos Pagos · Un Paquete",
    heading: "Nosotros escribimos sus formas. Un abogado las revisa. Dos trabajos, dos pagos, juntos.",
    sub: "DetencionDefensa y el abogado hacen dos trabajos diferentes. Cada uno cobra su propio pago. Usted paga los dos, pero le llegan juntos en un solo paquete. Cada trabajo es su propio contrato.",
    checkpoints: [
      {
        stage: "Trabajo 1 · DetencionDefensa",
        title: "Traducimos y escribimos sus respuestas",
        body: "Usted contesta preguntas fáciles. Nosotros las traducimos al inglés y las escribimos en su forma de habeas corpus. Cobramos un pago por este trabajo. Eso es todo lo que hacemos. No somos su abogado.",
      },
      {
        stage: "Trabajo 2 · El abogado",
        title: "Un abogado revisa sus formas — dos veces",
        body: "Un abogado de Florida lee cada página antes de guardarla en su teléfono. Si lo detienen, el abogado la lee otra vez, la firma y la manda a la corte. El abogado cobra un segundo pago por este trabajo.",
      },
    ],
    attorneyLine: "Las formas las lee y firma",
    cta: "Conozca al abogado",
  },
  ht: {
    tag: "De Travay · De Peman · Yon Pake",
    heading: "Nou ekri fòm yo. Yon avoka tcheke yo. De travay, de peman, ansanm.",
    sub: "DetencionDefensa ak avoka a fè de travay diferan. Chak gen pwòp peman pa l. Ou peye toulède, men yo vin ansanm nan yon sèl pake. Chak travay se pwòp kontra pa l.",
    checkpoints: [
      {
        stage: "Travay 1 · DetencionDefensa",
        title: "Nou tradui epi ekri repons ou yo",
        body: "Ou reponn kèk kesyon fasil. Nou tradui yo an Angle epi ekri yo sou fòm habeas corpus ou. Nou pran yon peman pou travay sa a. Se sa sèlman nou fè. Nou pa avoka w.",
      },
      {
        stage: "Travay 2 · Avoka a",
        title: "Yon avoka tcheke fòm ou yo — de fwa",
        body: "Yon avoka Florida li chak paj anvan li sere sou telefòn ou. Si yo pran w, avoka a li l ankò, siyen l, epi voye l bay tribinal la. Avoka a pran yon dezyèm peman pou travay sa a.",
      },
    ],
    attorneyLine: "Fòm yo li epi siyen pa",
    cta: "Konnen avoka a",
  },
} as const;
