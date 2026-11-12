import type { ReactNode } from "react";
import { useLang, type Lang } from "@/context/LanguageContext";
import { withLang } from "@/lib/outbound-lang";
function SaveMyHomeButton({ tld = "com", lang }: { tld?: "com" | "io"; lang: Lang }) { return <a className="home-text-link" href={withLang(`https://savemyhometrust.${tld}/trust`, lang)} target="_blank" rel="noopener noreferrer">SaveMyHomeTrust.{tld} →</a>; }
function DefensaSiempreButton({ lang }: { lang: Lang }) { return <a className="home-text-link" href={withLang("https://defensasiempre.com", lang)} target="_blank" rel="noopener noreferrer">DefensaSiempre.com →</a>; }
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
 const {lang}=useLang(); const t=COPY[lang];
 return <section className="home-band home-problem-solution"><div className="home-container">
 <div className="home-comparison"><div><h2>{t.problemLabel}</h2><ol>{t.problems.map((item,i)=><li key={i}><span>{String(i+1).padStart(2,"0")}</span><div>{item}</div></li>)}</ol><a className="home-text-link" href="/videos">{t.watchMore} →</a></div>
 <div className="home-solution"><h2>{t.solutionLabel}</h2><ol>{t.solutions(lang).slice(0,3).map((item,i)=><li key={i}><span>{String(i+1).padStart(2,"0")}</span><div>{item}</div></li>)}</ol></div></div>
 <p className="home-faq-note"><a href="#preguntas">{t.faqNote}</a></p></div></section>;
}
export function PaidSolutions() { const {lang}=useLang(); return <div className="home-paid-grid">{COPY[lang].solutions(lang).slice(3).map((item,i)=><article key={i}><span className="home-item-number">{String(i+4).padStart(2,"0")}</span><div>{item}</div></article>)}</div>; }
