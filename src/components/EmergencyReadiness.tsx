import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileCheck2,
  Gavel,
  Home,
  MapPin,
  Scale,
  Smartphone,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/context/LanguageContext";
import { withLang } from "@/lib/outbound-lang";
import LegalScreening from "@/components/LegalScreening";
import { HOME_REFINEMENT } from "@/lib/home-refinement-content";

const COPY = {
  en: {
    eyebrow: "Emergency readiness · prepare before a crisis",
    heading: "A prepared file is stronger than panic hiring.",
    intro:
      "After detention, families can feel pressured to buy whatever legal package is offered. Pre-screening today organizes the facts so qualified licensed counsel can assess actual legal standing before a crisis drives the decision.",
    crisisTitle: "After detention: emergency hiring",
    crisisItems: [
      "Crisis representation can cost $5,000–$15,000 or more.",
      "The family may have to reconstruct an A-number, immigration history and contacts under pressure.",
      "Desperation can make an unfeasible change-of-status or relief package look like the only option.",
    ],
    preparedTitle: "Before an emergency: advance pre-screening",
    preparedItems: [
      "Organize the case file and emergency contacts now.",
      "Have independent licensed counsel review legal posture and viable options.",
      "Give a vetted detention attorney a usable file instead of starting from scratch.",
    ],
    statsNote:
      "Fee examples are illustrative, not verified market rates. No overall approval rate can predict your case. Individual facts, legal posture and current law require licensed review.",
    pillarsEyebrow: "Four integrated pillars",
    pillarsHeading: "One readiness plan for your case, home, business and counsel.",
    pillars: [
      {
        title: "Pre-Screening & Case File Preparation",
        body: "Gather your A-number, immigration history and emergency contacts so a vetted detention attorney can act promptly without rebuilding your file from zero. Legal standing and options require independent licensed-counsel review.",
        cta: "Check basic posture",
      },
      {
        title: "Save My Home Trust",
        body: "Explore trust structures and equity-protection planning intended to reduce the risk of a fire sale or forced liquidation of residential equity. Suitability and outcomes depend on individual facts and applicable law.",
        cta: "Explore Save My Home",
      },
      {
        title: "Save My Business",
        body: "Structure a route or service business through a trust and corporate entity with the goal of keeping it sellable, transferable, licensable or operable remotely—without abandoning goodwill and equipment.",
        cta: "Explore Save My Business",
      },
      {
        title: "Habeas Corpus & Counsel Activation",
        body: "Connect with qualified immigration counsel. For clients who qualify after independent review, the program provides attorney-reviewed pro se 28 U.S.C. § 2241 habeas petition drafting for prolonged or unlawful physical detention.",
        cta: "Prepare my file",
      },
    ],
    appEyebrow: "Proprietary mobile app · our key differentiator",
    appHeading: "SOS, detention tracking and family alerts—in one proprietary app.",
    appItems: [
      { title: "Immediate one-tap SOS activation", body: "Activate the emergency plan directly from your phone the moment detention is imminent—no separate calls or paper forms needed to start." },
      { title: "Automated detention tracking & ICE locator monitoring", body: "Monitor available ICE locator information to help identify where the person is held; timing depends on when ICE publishes or updates the record." },
      { title: "Instant automated family & case-status alerts", body: "Notify designated family members and emergency contacts automatically, with the exact facility location once available and case-status updates as the plan progresses." },
    ],
    appCta: "See how the app works",
    appStart: "Start my readiness file",
    legalHeading: "Strict limits: what habeas corpus can and cannot do",
    legalCanTitle: "It may challenge physical detention",
    legalCan:
      "A 28 U.S.C. § 2241 petition challenges the legality or prolonged duration of physical custody. Depending on the facts, issues can include post-final-order detention beyond six months under Zadvydas v. Davis or prolonged mandatory detention without constitutionally sufficient process. Six months does not create an automatic right to release.",
    legalCannotTitle: "It does not review a final removal order",
    legalCannot:
      "Habeas corpus does not cancel a final order of removal. Challenges to final removal orders are generally restricted by the REAL ID Act, 8 U.S.C. § 1252, to a petition for review in the appropriate federal circuit court. Habeas is not a substitute for removal defense or an immigration attorney.",
    firmHeading: "Technology and document preparation—not a law firm",
    firmBody:
      "DetencionDefensa.com, Inc. is not a law firm and does not provide legal representation or legal advice. All legal evaluations, eligibility determinations and representation require independent review, conflict clearance and acceptance by qualified licensed counsel. Save My Home and Save My Business are separate advertised planning services, not legal recommendations, and no outcome is guaranteed.",
  },
  es: {
    eyebrow: "Preparación para emergencias · prepárese antes de una crisis",
    heading: "Un expediente preparado es mejor que contratar en pánico.",
    intro:
      "Después de una detención, la familia puede sentirse presionada a comprar cualquier paquete legal que le ofrezcan. La evaluación preliminar de hoy organiza los hechos para que un abogado autorizado y calificado pueda evaluar su verdadera situación legal antes de que la crisis dicte la decisión.",
    crisisTitle: "Después de la detención: contratación de emergencia",
    crisisItems: [
      "La representación en una crisis puede costar $5,000–$15,000 o más.",
      "La familia puede tener que reconstruir bajo presión el número A, el historial migratorio y los contactos.",
      "La desesperación puede hacer que un paquete inviable de cambio de estatus o alivio parezca la única opción.",
    ],
    preparedTitle: "Antes de una emergencia: evaluación preliminar",
    preparedItems: [
      "Organice ahora el expediente y los contactos de emergencia.",
      "Permita que un abogado independiente y autorizado revise su situación legal y las opciones viables.",
      "Entregue a un abogado de detención evaluado un expediente útil, en vez de comenzar desde cero.",
    ],
    statsNote:
      "Los honorarios son ejemplos, no tarifas de mercado verificadas. Ninguna tasa general predice su caso. Los hechos, la situación legal y la ley vigente requieren revisión por un abogado autorizado.",
    pillarsEyebrow: "Cuatro pilares integrados",
    pillarsHeading: "Un solo plan de preparación para su caso, casa, negocio y abogado.",
    pillars: [
      {
        title: "Evaluación preliminar y preparación del expediente",
        body: "Reúna su número A, historial migratorio y contactos de emergencia para que un abogado de detención evaluado pueda actuar sin reconstruir su expediente desde cero. Su situación legal y opciones requieren revisión independiente de un abogado autorizado.",
        cta: "Revisar situación básica",
      },
      {
        title: "Save My Home Trust",
        body: "Explore fideicomisos y planificación de protección del patrimonio destinados a reducir el riesgo de una venta apresurada o liquidación forzada del valor de su vivienda. La idoneidad y los resultados dependen de sus hechos y de la ley aplicable.",
        cta: "Conocer Save My Home",
      },
      {
        title: "Save My Business",
        body: "Estructure un negocio de rutas o servicios mediante un fideicomiso y una corporación con la meta de mantenerlo vendible, transferible, apto para licencias u operable a distancia, sin abandonar su clientela y equipos.",
        cta: "Conocer Save My Business",
      },
      {
        title: "Habeas corpus y activación de abogado",
        body: "Conéctese con un abogado de inmigración calificado. Para clientes que califiquen tras una revisión independiente, el programa ofrece preparación pro se revisada por abogado de una petición de habeas corpus bajo 28 U.S.C. § 2241 por detención física prolongada o ilegal.",
        cta: "Preparar mi expediente",
      },
    ],
    appEyebrow: "App móvil propietaria · nuestra principal diferencia",
    appHeading: "SOS, seguimiento de detención y alertas familiares en una sola app propietaria.",
    appItems: [
      { title: "Activación SOS inmediata con un toque", body: "Active el plan de emergencia directamente desde su teléfono cuando la detención sea inminente, sin llamadas separadas ni formularios en papel para comenzar." },
      { title: "Seguimiento automatizado y monitoreo del localizador de ICE", body: "Monitoree la información disponible del localizador de ICE para ayudar a identificar dónde está detenida la persona; el tiempo depende de cuándo ICE publique o actualice el registro." },
      { title: "Alertas automáticas instantáneas a familia y sobre el caso", body: "Notifique automáticamente a familiares y contactos de emergencia designados, con la ubicación exacta del centro cuando esté disponible y actualizaciones del estatus del caso." },
    ],
    appCta: "Vea cómo funciona la app",
    appStart: "Comenzar mi expediente",
    legalHeading: "Límites estrictos: qué puede y qué no puede hacer el habeas corpus",
    legalCanTitle: "Puede cuestionar la detención física",
    legalCan:
      "Una petición bajo 28 U.S.C. § 2241 cuestiona la legalidad o duración prolongada de la custodia física. Según los hechos, puede incluir detención posterior a una orden final por más de seis meses bajo Zadvydas v. Davis o detención obligatoria prolongada sin proceso constitucional suficiente. Seis meses no crean un derecho automático a la libertad.",
    legalCannotTitle: "No revisa una orden final de remoción",
    legalCannot:
      "El habeas corpus no cancela una orden final de remoción. Las impugnaciones de órdenes finales generalmente están restringidas por la REAL ID Act, 8 U.S.C. § 1252, a una petición de revisión ante el tribunal federal de circuito correspondiente. El habeas no sustituye la defensa contra remoción ni un abogado de inmigración.",
    firmHeading: "Tecnología y preparación de documentos—no un bufete de abogados",
    firmBody:
      "DetencionDefensa.com, Inc. no es un bufete de abogados y no ofrece representación ni asesoría legal. Toda evaluación legal, determinación de elegibilidad y representación requiere revisión independiente, verificación de conflictos y aceptación por un abogado autorizado y calificado. Save My Home y Save My Business son servicios de planificación anunciados por separado, no recomendaciones legales, y ningún resultado está garantizado.",
  },
  ht: {
    eyebrow: "Preparasyon pou ijans · prepare anvan kriz la",
    heading: "Yon dosye prepare pi bon pase anboche yon avoka nan panik.",
    intro:
      "Apre yon detansyon, fanmi an ka santi li oblije achte nenpòt pake legal yo ofri li. Evalyasyon preliminè jodi a òganize enfòmasyon yo pou yon avoka kalifye ki gen lisans ka evalye vrè sitiyasyon legal ou anvan kriz la dirije desizyon an.",
    crisisTitle: "Apre detansyon: anboche avoka nan ijans",
    crisisItems: [
      "Reprezantasyon nan yon kriz ka koute $5,000–$15,000 oswa plis.",
      "Fanmi an ka oblije rekòmanse chèche nimewo A, istorik imigrasyon ak kontak yo nan presyon.",
      "Dekourajman ka fè yon pake chanjman estati oswa sekou ki pa posib sanble sèl solisyon an.",
    ],
    preparedTitle: "Anvan ijans: evalyasyon preliminè davans",
    preparedItems: [
      "Òganize dosye a ak kontak ijans yo kounye a.",
      "Pèmèt yon avoka endepandan ki gen lisans revize sitiyasyon legal ou ak opsyon ki posib yo.",
      "Bay yon avoka detansyon yo verifye yon dosye li ka itilize, pito li rekòmanse a zewo.",
    ],
    statsNote:
      "Frè yo se egzanp, pa pri mache verifye. Okenn pousantaj jeneral pa prevwa dosye ou. Enfòmasyon endividyèl, sitiyasyon legal ak lwa aktyèl mande revizyon yon avoka ki gen lisans.",
    pillarsEyebrow: "Kat pilye ki travay ansanm",
    pillarsHeading: "Yon sèl plan preparasyon pou dosye w, kay ou, biznis ou ak avoka w.",
    pillars: [
      {
        title: "Evalyasyon preliminè ak preparasyon dosye",
        body: "Rasanble nimewo A ou, istorik imigrasyon ou ak kontak ijans yo pou yon avoka detansyon yo verifye ka aji san li pa rekòmanse dosye a a zewo. Sitiyasyon legal ou ak opsyon yo mande revizyon endepandan pa yon avoka ki gen lisans.",
        cta: "Verifye sitiyasyon debaz",
      },
      {
        title: "Save My Home Trust",
        body: "Eksplore estrikti fidisi ak planifikasyon pwoteksyon kapital ki gen objektif diminye risk vant prese oswa likidasyon fòse sou valè kay ou. Si li apwopriye ak rezilta yo depann de enfòmasyon ou ak lwa ki aplikab yo.",
        cta: "Dekouvri Save My Home",
      },
      {
        title: "Save My Business",
        body: "Òganize yon biznis wout oswa sèvis atravè yon fidisi ak yon kòporasyon ak objektif kenbe l vandab, transferab, kapab jwenn lisans oswa fonksyone adistans, san ou pa abandone kliyantèl ak ekipman yo.",
        cta: "Dekouvri Save My Business",
      },
      {
        title: "Habeas corpus ak aktivasyon avoka",
        body: "Konekte ak yon avoka imigrasyon kalifye. Pou kliyan ki kalifye apre revizyon endepandan, pwogram nan bay preparasyon pro se yon avoka revize pou petisyon habeas corpus dapre 28 U.S.C. § 2241 pou detansyon fizik pwolonje oswa ilegal.",
        cta: "Prepare dosye mwen",
      },
    ],
    appEyebrow: "App mobil propriyetè nou · prensipal diferans nou",
    appHeading: "SOS, swivi detansyon ak alèt fanmi nan yon sèl app propriyetè.",
    appItems: [
      { title: "Aktivasyon SOS imedya ak yon sèl klike", body: "Aktive plan ijans lan dirèkteman sou telefòn ou lè detansyon an pre pou rive, san apèl separe ni fòm papye pou kòmanse." },
      { title: "Swivi detansyon otomatik ak siveyans lokalizatè ICE", body: "Siveye enfòmasyon lokalizatè ICE ki disponib yo pou ede idantifye kote yo kenbe moun nan; tan an depann de kilè ICE pibliye oswa mete dosye a ajou." },
      { title: "Alèt otomatik imedya bay fanmi ak sou estati ka a", body: "Avize manm fanmi ak kontak ijans yo chwazi otomatikman, ak adrès egzak sant detansyon an lè li disponib ak mizajou sou estati ka a." },
    ],
    appCta: "Gade kijan app la mache",
    appStart: "Kòmanse dosye mwen",
    legalHeading: "Limit egzat: sa habeas corpus ka fè ak sa li pa ka fè",
    legalCanTitle: "Li ka konteste detansyon fizik",
    legalCan:
      "Yon petisyon dapre 28 U.S.C. § 2241 konteste legalite oswa dire pwolonje detansyon fizik. Selon enfòmasyon yo, li ka konsène detansyon apre yon lòd final ki depase sis mwa dapre Zadvydas v. Davis oswa detansyon obligatwa pwolonje san pwosesis konstitisyonèl ase. Sis mwa pa kreye yon dwa otomatik pou liberasyon.",
    legalCannotTitle: "Li pa revize yon lòd revokasyon final",
    legalCannot:
      "Habeas corpus pa anile yon lòd revokasyon final. REAL ID Act, 8 U.S.C. § 1252, jeneralman limite kontestasyon lòd revokasyon final yo a yon petisyon pou revizyon nan tribinal federal sikwi ki apwopriye a. Habeas pa ranplase defans kont revokasyon ni yon avoka imigrasyon.",
    firmHeading: "Teknoloji ak preparasyon dokiman—se pa yon kabinè avoka",
    firmBody:
      "DetencionDefensa.com, Inc. se pa yon kabinè avoka epi li pa bay reprezantasyon ni konsèy legal. Tout evalyasyon legal, desizyon sou eligibilite ak reprezantasyon mande revizyon endepandan, verifikasyon konfli ak akseptasyon pa yon avoka kalifye ki gen lisans. Save My Home ak Save My Business se sèvis planifikasyon separe ki anonse, se pa rekòmandasyon legal, epi okenn rezilta pa garanti.",
  },
} as const;

const PILLAR_ICONS = [FileCheck2, Home, BriefcaseBusiness, Gavel];
const APP_ICONS = [Smartphone, MapPin, UsersRound];

export default function EmergencyReadiness() {
  const { lang } = useLang();
  const t = COPY[lang];
  const refined = HOME_REFINEMENT[lang];
  const intakeHref = `/intake?lang=${lang}`;
  const homeHref = withLang("https://savemyhometrust.com/trust", lang);
  const businessHref = withLang("https://savemybusiness.com", lang);
  const pillarLinks = ["#readiness-screener", homeHref, businessHref, intakeHref];


  return <>
    <section className="home-readiness-app" id="readiness-app" aria-labelledby="readiness-app-heading">
      <div className="home-container">
        <p className="home-readiness-eyebrow">{t.appEyebrow}</p>
        <h2 id="readiness-app-heading">{t.appHeading}</h2>
        <div className="home-readiness-app-grid">
          {t.appItems.map((item, index) => {
            const Icon = APP_ICONS[index];
            return <article key={item.title}><Icon aria-hidden="true" /><h3>{item.title}</h3><p>{item.body}</p></article>;
          })}
        </div>
        <div className="home-readiness-app-actions">
          <Button asChild className="home-primary"><a href="#how-app-works">{t.appCta}<ArrowRight size={18} /></a></Button>
          <a href={intakeHref}>{t.appStart}<ArrowRight size={18} /></a>
        </div>
      </div>
    </section>

    <section className="home-band home-readiness-pillars" aria-labelledby="pillars-heading">
      <div className="home-container">
        <p className="home-readiness-eyebrow">{t.pillarsEyebrow}</p>
        <h2 id="pillars-heading">{t.pillarsHeading}</h2>
        <div className="home-readiness-pillar-grid">
          {t.pillars.map((pillar, index) => {
            const Icon = PILLAR_ICONS[index];
            const external = index === 1 || index === 2;
            return <article key={pillar.title}>
              <span className="home-readiness-pillar-number">0{index + 1}</span>
              <Icon aria-hidden="true" />
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
              <a href={pillarLinks[index]} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {pillar.cta}<ArrowRight size={17} aria-hidden="true" />
              </a>
            </article>;
          })}
        </div>
      </div>
    </section>


    <section className="home-band home-readiness" id="emergency-readiness" aria-labelledby="readiness-heading">
      <div className="home-container">
        <p className="home-readiness-eyebrow">{t.eyebrow}</p>
        <h2 id="readiness-heading">{refined.comparison}</h2>
        <p className="home-readiness-intro">{refined.comparisonIntro}</p>
        <div className="home-readiness-comparison">
          <article className="home-readiness-crisis">
            <AlertTriangle aria-hidden="true" />
            <h3>{t.crisisTitle}</h3>
            <ul>{t.crisisItems.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
          <article className="home-readiness-prepared">
            <CheckCircle2 aria-hidden="true" />
            <h3>{t.preparedTitle}</h3>
            <ul>{t.preparedItems.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        </div>
        <p className="home-readiness-stats">{t.statsNote}</p>
      </div>
    </section>


    <LegalScreening lang={lang} />

    <section className="home-band home-readiness-legal" aria-labelledby="habeas-limits-heading">
      <div className="home-container">
        <h2 id="habeas-limits-heading">{refined.release}</h2>
        <p className="home-readiness-intro">{refined.releaseIntro}</p>
        <Button asChild className="home-primary"><a href="#readiness-screener">{t.pillars[0].cta}<ArrowRight size={18} /></a></Button>
        <div className="home-readiness-legal-grid">
          <article><Gavel aria-hidden="true" /><h3>{t.legalCanTitle}</h3><p>{t.legalCan}</p></article>
          <article><AlertTriangle aria-hidden="true" /><h3>{t.legalCannotTitle}</h3><p>{t.legalCannot}</p></article>
        </div>
        <div className="home-readiness-firm"><Scale aria-hidden="true" /><div><h3>{t.firmHeading}</h3><p>{t.firmBody}</p></div></div>
      </div>
    </section>
  </>;
}
