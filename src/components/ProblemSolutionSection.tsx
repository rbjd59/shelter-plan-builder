import type { ReactNode } from "react";
import { useLang, type Lang } from "@/context/LanguageContext";
import { withLang } from "@/lib/outbound-lang";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { HOME_PLAIN } from "@/lib/home-plain-content";
import { HomePoints } from "@/components/HomePoints";
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
 const {lang}=useLang(); const t=HOME_PLAIN[lang];
 return <section className="home-band home-problem-solution" id="problems-solutions"><div className="home-container">
 <p className="home-readiness-intro">{t.problemsIntro}</p>
 <div className="home-comparison"><div><h2>{t.problemsHeading}</h2><ol>{t.problems.map((item,i)=><li key={i}><span>{String(i+1).padStart(2,"0")}</span><div>{item}</div></li>)}</ol><a className="home-text-link" href="/videos">{COPY[lang].watchMore} →</a></div>
 <div className="home-solution"><h2>{t.solutionsHeading}</h2><ol>{t.solutions.map((item,i)=><li key={i}><span>{String(i+1).padStart(2,"0")}</span><div><h3>{item.title}</h3><HomePoints items={item.points} /></div></li>)}</ol></div></div>
 <p className="home-faq-note"><a href="#preguntas">{COPY[lang].faqNote}</a></p></div></section>;
}
const BUSINESS_COPY = {
  en: {
    heading: "Save My Business",
    body: "We can create a trust for your business and form a corporation owned by that trust. The corporation can hold and structure the business to make it sellable, transferable and marketable, so you do not have to walk away from what you built.",
    cta: "Explore Save My Business",
    disclosure: "Advertising, not a legal recommendation. The appropriate structure depends on your circumstances and applicable law; outcomes are not guaranteed. Consult a licensed attorney before transferring a business or forming a trust or corporation.",
  },
  es: {
    heading: "Save My Business — Proteja su negocio",
    body: "Podemos crear un fideicomiso para su negocio y constituir una corporación propiedad de ese fideicomiso. La corporación puede ser titular del negocio y estructurarlo para facilitar su venta, transferencia y comercialización, sin que usted tenga que abandonar lo que construyó.",
    cta: "Conozca Save My Business",
    disclosure: "Publicidad, no una recomendación legal. La estructura adecuada depende de sus circunstancias y de la legislación aplicable; los resultados no están garantizados. Consulte a un abogado autorizado antes de transferir un negocio o constituir un fideicomiso o una corporación.",
  },
  ht: {
    heading: "Save My Business — Pwoteje biznis ou",
    body: "Nou ka kreye yon fidisi pou biznis ou epi fòme yon kòporasyon ki pou fidisi sa a. Kòporasyon an ka posede biznis la epi òganize l pou fasilite vant li, transfè li ak maketing li, pou ou pa oblije abandone sa ou bati a.",
    cta: "Dekouvri Save My Business",
    disclosure: "Piblisite, se pa yon rekòmandasyon legal. Estrikti ki apwopriye a depann de sitiyasyon ou ak lwa ki aplikab yo; rezilta yo pa garanti. Konsilte yon avoka ki gen lisans anvan ou transfere yon biznis oswa kreye yon fidisi oswa yon kòporasyon.",
  },
} satisfies Record<Lang, { heading: string; body: string; cta: string; disclosure: string }>;

export function PaidSolutions() {
  const { lang } = useLang();
  const business = BUSINESS_COPY[lang];
  const plain = HOME_PLAIN[lang];
  return <>
    <section className="home-business-offering" aria-labelledby="save-my-business-heading">
      <h3 id="save-my-business-heading">{business.heading}</h3>
      <HomePoints items={plain.businessPoints} />
      <Button asChild className="home-primary"><a href={withLang("https://savemybusiness.com", lang)} target="_blank" rel="noopener noreferrer">{business.cta}<ArrowRight size={18} aria-hidden="true" /></a></Button>
      <p className="home-business-disclosure">{plain.businessNote}</p><details><summary>{plain.details}</summary><p>{business.body}</p><p>{business.disclosure}</p></details>
    </section>
    <div className="home-paid-grid">{COPY[lang].solutions(lang).slice(3).map((item,i)=><article key={i}><span className="home-item-number">{String(i+4).padStart(2,"0")}</span><div>{item}</div></article>)}</div>
  </>;
}
