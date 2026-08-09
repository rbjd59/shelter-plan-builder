import { useLang, type Lang } from "@/context/LanguageContext";

const COPY: Record<Lang, {
  problemLabel: string;
  problems: string[];
  solutionLabel: string;
  solutions: string[];
  faqNote: string;
  watchMore: string;
}> = {
  es: {
    problemLabel: "El Problema",
    watchMore: "Mira Más Videos",
    problems: [
      "ICE detiene a dos mil personas al día.",
      "Si no eres ciudadano, estás en riesgo.",
      "Una vez detenido, el acceso a la familia y a los abogados es difícil.",
      "No puedes pagar miles de dólares por un abogado.",
    ],
    solutionLabel: "La Solución: DetencionDefensa",
    solutions: [
      "DetencionDefensa te proporciona un botón de emergencia en tu teléfono.",
      "Si ICE o la policía llega, presiona el botón por 3 segundos.",
      "Inmediatamente tu familia, amigos, abogado y DetencionDefensa serán notificados de que fuiste detenido.",
      "Te localizamos en el sistema de ICE. El abogado te manda todo lo que necesitas para presentar un recurso de Habeas Corpus ante la Corte.",
    ],
    faqNote: "Consulta la sección de preguntas frecuentes para obtener todos los detalles sobre cómo funciona DetencionDefensa.",
  },
  en: {
    problemLabel: "The Problem",
    problems: [
      "ICE is detaining two thousand persons a day.",
      "If you're not a citizen, you are at risk.",
      "Once detained, access to family and lawyers is difficult.",
      "You cannot afford thousands for an attorney.",
    ],
    solutionLabel: "The Solution: DetencionDefensa",
    watchMore: "Watch More Videos",
    solutions: [
      "DetencionDefensa gives you an emergency button on your phone.",
      "If ICE or the police arrive, press the button for 3 seconds.",
      "Your family, friends, attorney, and DetencionDefensa are immediately notified that you have been detained.",
      "We locate you in the ICE system, and the attorney sends you everything you need to file a Habeas Corpus petition in court.",
    ],
    faqNote: "See the FAQ section for full details on how DetencionDefensa works.",
  },
  ht: {
    problemLabel: "Pwoblèm nan",
    problems: [
      "ICE detni de milye moun pa jou.",
      "Si ou pa sitwayen, ou nan risk.",
      "Yon fwa yo detni ou, aksè a fanmi ak avoka difisil.",
      "Ou pa ka peye milye dola pou yon avoka.",
    ],
    solutionLabel: "Solisyon an: DetencionDefensa",
    watchMore: "Gade Plis Videyo",
    solutions: [
      "DetencionDefensa ba w yon bouton dijans sou telefòn ou.",
      "Si ICE oswa lapolis rive, peze bouton an pandan 3 segond.",
      "Fanmi w, zanmi w, avoka w, ak DetencionDefensa ap resevwa notifikasyon imedyatman ke yo detni w.",
      "Nou jwenn kote w ye nan sistèm ICE la, epi avoka a voye ba w tout sa w bezwen pou depoze yon petisyon Habeas Corpus nan tribinal.",
    ],
    faqNote: "Gade seksyon kesyon yo poze souvan pou tout detay sou kijan DetencionDefensa fonksyone.",
  },
};

export default function ProblemSolutionSection() {
  const { lang } = useLang();
  const t = COPY[lang];

  return (
    <section
      style={{
        background: "linear-gradient(180deg, #081d3a 0%, #0d2c54 100%)",
        color: "#ffffff",
        padding: "3rem 1rem 3.5rem",
        fontFamily: '"Work Sans", -apple-system, Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gap: "2.5rem" }}>
        <Block
          badgeColor="#c81f1f"
          badgeShape="octagon"
          label={t.problemLabel}
          items={t.problems}
          bulletColor="#ff6b6b"
          action={<WatchMoreButton label={t.watchMore} />}
        />
        <Block
          badgeColor="#4aa8e8"
          badgeShape="circle"
          label={t.solutionLabel}
          items={t.solutions}
          bulletColor="#8ed3ff"
        />
        <p
          style={{
            textAlign: "center",
            fontStyle: "italic",
            fontSize: "1rem",
            color: "rgba(255,255,255,0.85)",
            maxWidth: 780,
            margin: "0 auto",
            lineHeight: 1.5,
          }}
        >
          {t.faqNote}
        </p>
      </div>
    </section>
  );
}

function Block({
  badgeColor,
  badgeShape,
  label,
  items,
  bulletColor,
  action,
}: {
  badgeColor: string;
  badgeShape: "circle" | "octagon";
  label: string;
  items: string[];
  bulletColor: string;
  action?: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
        }}
      >
        <Badge color={badgeColor} shape={badgeShape} />
        <h2
          style={{
            fontFamily: '"Roboto Slab", Georgia, serif',
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {label}
        </h2>
        {action && <div style={{ marginLeft: "auto" }}>{action}</div>}
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: "0.75rem",
        }}
      >
        {items.map((it, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "flex-start",
              fontSize: "clamp(1rem, 1.6vw, 1.15rem)",
              lineHeight: 1.5,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "0.85rem 1rem",
            }}
          >
            <span
              aria-hidden
              style={{
                color: bulletColor,
                fontWeight: 900,
                fontSize: "1.1rem",
                lineHeight: 1.4,
                flexShrink: 0,
              }}
            >
              ●
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Badge({ color, shape }: { color: string; shape: "circle" | "octagon" }) {
  const size = 72;
  const style: React.CSSProperties = {
    width: size,
    height: size,
    background: color,
    boxShadow: `0 8px 24px ${color}55`,
    flexShrink: 0,
    border: "3px solid rgba(255,255,255,0.9)",
  };
  if (shape === "circle") {
    return <div style={{ ...style, borderRadius: "50%" }} aria-hidden />;
  }
  // Octagon via clip-path
  return (
    <div
      aria-hidden
      style={{
        ...style,
        clipPath:
          "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
        border: "none",
        boxShadow: `0 8px 24px ${color}55, inset 0 0 0 3px rgba(255,255,255,0.9)`,
      }}
    />
  );
}
