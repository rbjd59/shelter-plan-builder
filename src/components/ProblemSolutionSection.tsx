import type { ReactNode } from "react";
import { useLang, type Lang } from "@/context/LanguageContext";

const withLang = (url: string, lang: Lang) => {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}lang=${lang}&hl=${lang}#lang=${lang}`;
};

const pillStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: 10,
  padding: "8px 14px",
  background: "#e8a04a",
  color: "#0f1830",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: 800,
  textDecoration: "none",
  letterSpacing: "0.02em",
};

function SaveMyHomeButton({ tld = "com", lang }: { tld?: "com" | "io"; lang: Lang }) {
  return (
    <a href={withLang(`https://savemyhometrust.${tld}/trust`, lang)} target="_blank" rel="noopener noreferrer" style={pillStyle}>
      SaveMyHomeTrust.{tld} →
    </a>
  );
}

function DefensaSiempreButton({ lang }: { lang: Lang }) {
  return (
    <a href={withLang("https://defensasiempre.com", lang)} target="_blank" rel="noopener noreferrer" style={pillStyle}>
      DefensaSiempre.com →
    </a>
  );
}

const COPY: Record<
  Lang,
  {
    problemLabel: string;
    problems: ReactNode[];
    solutionLabel: string;
    solutions: (lang: Lang) => ReactNode[];
    faqNote: string;
    watchMore: string;
  }
> = {
  es: {
    problemLabel: "El Problema",
    watchMore: "Mira Más Videos",
    problems: [
      "ICE lo arresta. Usted no está listo. Todo se descontrola.",
      "Lo llevan a un centro de detención lejos. Nadie sabe dónde está.",
      "Puede quedar detenido por meses.",
      "Su auto queda tirado y la grúa se lo lleva.",
      "Sin trabajo, no puede pagar casa ni auto. Puede perder todo.",
      "Un abogado cobra entre $5,000 y $10,000.",
    ],
    solutionLabel: "La Solución: DetencionDefensa",
    solutions: (l) => [
      "Preparamos su carta al juez para pedir su liberación. La guardamos en una app en su teléfono.",
      "Si lo detienen, presione el botón de la app. Avisamos a su familia y activamos su plan.",
      "Lo ubicamos en el sistema de ICE y enviamos los papeles al abogado y a su familia para proteger su casa.",
      <>
        ICE puede multarlo $998 por día si no sale del país. Con <strong>SaveMyHomeTrust.com</strong> usted protege su casa, puede sacar un préstamo HELOC, rentarla o venderla. <SaveMyHomeButton lang={l} />
      </>,
      <>
        ¿Tiene abogado de inmigración? Pídale que lo inscriba en <strong>SaveMyHomeTrust.io</strong> para proteger su casa. LLÁMELO HOY. <SaveMyHomeButton tld="io" lang={l} />
      </>,
      <>
        ¿Tiene miedo de perder su trabajo? Muéstrele <strong>DefensaSiempre.com</strong> a su jefe. Si lo detienen, vuelve al trabajo más rápido y su jefe no pierde tiempo entrenando a otro empleado. <DefensaSiempreButton lang={l} />
      </>,
    ],
    faqNote: "Vea las preguntas frecuentes para más detalles.",
  },
  en: {
    problemLabel: "The Problem",
    watchMore: "Watch More Videos",
    problems: [
      "ICE arrests you. You're not ready. Everything falls apart.",
      "They send you to a detention center far away. No one knows where you are.",
      "You can be locked up for months.",
      "Your car gets left behind and towed.",
      "No income. You can't pay your house or car. You can lose it all.",
      "Immigration lawyers charge $5,000–$10,000.",
    ],
    solutionLabel: "The Solution: DetencionDefensa",
    solutions: (l) => [
      "We prepare your release request to the judge and keep it on an app on your phone.",
      "If you're detained, press the button in the app. We alert your family and start your plan.",
      "We find you in the ICE system and send the paperwork to your lawyer and family to protect your home.",
      <>
        ICE can fine you $998 a day if you don't leave. With <strong>SaveMyHomeTrust.com</strong> you protect your home, get a HELOC loan, rent it or sell it. <SaveMyHomeButton lang={l} />
      </>,
      <>
        Have an immigration lawyer? Ask them to sign you up at <strong>SaveMyHomeTrust.io</strong> to protect your home. CALL TODAY. <SaveMyHomeButton tld="io" lang={l} />
      </>,
      <>
        Afraid to lose your job? Show <strong>DefensaSiempre.com</strong> to your boss. If detained, you get back to work faster and your boss doesn't lose time training someone new. <DefensaSiempreButton lang={l} />
      </>,
    ],
    faqNote: "See the FAQ for more details.",
  },
  ht: {
    problemLabel: "Pwoblèm nan",
    watchMore: "Gade Plis Videyo",
    problems: [
      "ICE arete w. Ou pa pare. Tout bagay tonbe.",
      "Yo voye w nan yon sant detansyon lwen. Pèsòn pa konnen kote w ye.",
      "Ou ka rete fèmen pandan plizyè mwa.",
      "Machin ou rete atè epi yo rale l ale.",
      "Pa gen lajan. Ou pa ka peye kay ou oswa machin ou. Ou ka pèdi tout.",
      "Avoka imigrasyon mande $5,000–$10,000.",
    ],
    solutionLabel: "Solisyon an: DetencionDefensa",
    solutions: (l) => [
      "Nou prepare demann liberasyon w pou jij la epi kenbe l nan yon app sou telefòn ou.",
      "Si yo detni w, peze bouton an nan app la. Nou avize fanmi w epi kòmanse plan w.",
      "Nou jwenn kote w ye nan sistèm ICE la epi voye papye yo bay avoka w ak fanmi w pou pwoteje kay ou.",
      <>
        ICE ka bay ou amann $998 pa jou si w pa ale. Avèk <strong>SaveMyHomeTrust.com</strong> ou pwoteje kay ou, jwenn yon prè HELOC, lwe l oswa vann li. <SaveMyHomeButton lang={l} />
      </>,
      <>
        Ou gen yon avoka imigrasyon? Mande l enskri w nan <strong>SaveMyHomeTrust.io</strong> pou pwoteje kay ou. RELE JODI A. <SaveMyHomeButton tld="io" lang={l} />
      </>,
      <>
        Pè pou pèdi travay ou? Montre <strong>DefensaSiempre.com</strong> bay patwon w. Si yo detni w, ou retounen travay pi vit epi patwon w pa pèdi tan fòme lòt moun. <DefensaSiempreButton lang={l} />
      </>,
    ],
    faqNote: "Gade kesyon yo poze souvan pou plis detay.",
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
        padding: "72px 24px 80px",
        fontFamily: '"Work Sans", -apple-system, Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: "48px" }}>
        <Block
          label={t.problemLabel}
          items={t.problems}
          accent="#7fc4ff"
          action={<WatchMoreButton label={t.watchMore} />}
        />
        <Block label={t.solutionLabel} items={t.solutions(lang)} accent="#8ed3ff" />
        <p
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "rgba(255,255,255,0.7)",
            maxWidth: 720,
            margin: "0 auto",
            lineHeight: 1.6,
            fontStyle: "italic",
          }}
        >
          {t.faqNote}
        </p>
      </div>
    </section>
  );
}

function Block({
  label,
  items,
  accent,
  action,
}: {
  label: string;
  items: ReactNode[];
  accent: string;
  action?: ReactNode;
}) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
        <span
          aria-hidden
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 0 4px ${accent}22`,
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: accent,
          }}
        >
          {label}
        </span>
        {action && <div style={{ marginLeft: "auto" }}>{action}</div>}
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: 12,
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        }}
      >
        {items.map((it, i) => (
          <li
            key={i}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              padding: "20px 22px",
              fontSize: 15,
              lineHeight: 1.5,
              color: "rgba(255,255,255,0.92)",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <span
              aria-hidden
              style={{
                fontFamily: '"Roboto Slab", Georgia, serif',
                fontSize: 18,
                color: accent,
                lineHeight: 1.3,
                flexShrink: 0,
                minWidth: 22,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WatchMoreButton({ label }: { label: string }) {
  return (
    <a
      href="/videos"
      style={{
        display: "inline-block",
        background: "#e8a04a",
        color: "#0f1830",
        padding: "0.7rem 1.4rem",
        borderRadius: 999,
        fontWeight: 800,
        fontSize: "0.95rem",
        textDecoration: "none",
        whiteSpace: "nowrap",
        boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
      }}
    >
      {label}
    </a>
  );
}
