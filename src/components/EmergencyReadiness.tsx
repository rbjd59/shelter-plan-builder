import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileCheck2,
  Gavel,
  Home,
  MapPin,
  RotateCcw,
  Scale,
  Smartphone,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/context/LanguageContext";
import { withLang } from "@/lib/outbound-lang";
import {
  buildReadinessPlan,
  EMPTY_READINESS_ANSWERS,
  isReadinessScreenComplete,
  type ReadinessAnswers,
} from "@/lib/readiness-screener";

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
      "The roughly 12–15% range sometimes cited in historical general reporting for certain emergency change-of-status or relief postures is illustrative, not a current official rate. Approval rates vary by posture, jurisdiction, facts and time period. Historical statistics and fee examples do not predict or guarantee any individual outcome.",
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
    screenerEyebrow: "Private interactive pre-screening",
    screenerHeading: "Identify your readiness priorities.",
    screenerIntro:
      "Answer five basic questions. This tool does not decide eligibility, relief or legal standing; it only organizes planning priorities. Answers stay on this page and are not sent or saved.",
    questions: {
      time: {
        legend: "1. How long have you lived in the United States?",
        options: { under2: "Less than 2 years", "2to10": "2–10 years", over10: "More than 10 years", unsure: "Not sure / prefer not to say" },
      },
      status: {
        legend: "2. What best describes your current immigration posture?",
        options: { none: "No current lawful status", tps: "TPS", daca: "DACA", lawful: "Permanent resident or visa holder", pending: "Pending asylum or other application", other: "Other / not sure" },
      },
      prior: {
        legend: "3. Do you have a prior deportation or removal order?",
        options: { yes: "Yes", no: "No", unsure: "Not sure" },
      },
      home: {
        legend: "4. Do you own a home or residential equity?",
        options: { yes: "Yes", no: "No" },
      },
      business: {
        legend: "5. Do you own a route, service business or other business?",
        options: { yes: "Yes", no: "No" },
      },
    },
    completeNote: "Answer all five questions to view your planning priorities.",
    submit: "View my readiness priorities",
    reset: "Clear answers",
    resultTitle: "Your planning priorities",
    resultCaseTitle: "Prepare the case file first",
    resultCaseBody:
      "Continue to the full intake to organize your A-number, immigration history and emergency contacts. Qualified licensed counsel must independently evaluate your actual legal standing and any viable relief.",
    resultPriorTitle: "Prior-order review needs prompt licensed-counsel attention",
    resultPriorBody:
      "A prior removal order—or uncertainty about one—requires individual legal review. A § 2241 habeas petition does not cancel a removal order and is not a substitute for a petition for review or immigration counsel.",
    resultHomeTitle: "Add residential equity planning",
    resultHomeBody: "Explore whether a Save My Home trust structure fits your facts. No trust prevents every sale, creditor action or loss.",
    resultBusinessTitle: "Add business continuity planning",
    resultBusinessBody: "Explore a trust-and-corporation structure for continuity, transfer or sale. Licensing, control and outcomes require professional review.",
    resultCta: "Continue to full intake",
    resultDisclaimer:
      "These are organizational next steps, not a legal opinion or an eligibility determination. Completing the intake does not guarantee counsel acceptance or representation.",
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
      "El rango aproximado de 12–15% citado a veces en reportes históricos generales para ciertas situaciones de cambio de estatus o alivio de emergencia es ilustrativo, no una tasa oficial actual. Las tasas de aprobación varían según la situación, jurisdicción, hechos y período. Las estadísticas históricas y los ejemplos de honorarios no predicen ni garantizan ningún resultado individual.",
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
    screenerEyebrow: "Evaluación preliminar interactiva y privada",
    screenerHeading: "Identifique sus prioridades de preparación.",
    screenerIntro:
      "Responda cinco preguntas básicas. Esta herramienta no decide elegibilidad, alivio ni situación legal; solo organiza prioridades de planificación. Las respuestas permanecen en esta página y no se envían ni se guardan.",
    questions: {
      time: {
        legend: "1. ¿Cuánto tiempo ha vivido en Estados Unidos?",
        options: { under2: "Menos de 2 años", "2to10": "2–10 años", over10: "Más de 10 años", unsure: "No estoy seguro / prefiero no decir" },
      },
      status: {
        legend: "2. ¿Qué describe mejor su situación migratoria actual?",
        options: { none: "Sin estatus legal actual", tps: "TPS", daca: "DACA", lawful: "Residente permanente o titular de visa", pending: "Asilo u otra solicitud pendiente", other: "Otra / no estoy seguro" },
      },
      prior: {
        legend: "3. ¿Tiene una orden previa de deportación o remoción?",
        options: { yes: "Sí", no: "No", unsure: "No estoy seguro" },
      },
      home: {
        legend: "4. ¿Es dueño de una casa o tiene valor acumulado en una vivienda?",
        options: { yes: "Sí", no: "No" },
      },
      business: {
        legend: "5. ¿Es dueño de una ruta, negocio de servicios u otro negocio?",
        options: { yes: "Sí", no: "No" },
      },
    },
    completeNote: "Responda las cinco preguntas para ver sus prioridades de planificación.",
    submit: "Ver mis prioridades de preparación",
    reset: "Borrar respuestas",
    resultTitle: "Sus prioridades de planificación",
    resultCaseTitle: "Prepare primero el expediente",
    resultCaseBody:
      "Continúe al formulario completo para organizar su número A, historial migratorio y contactos de emergencia. Un abogado autorizado y calificado debe evaluar independientemente su verdadera situación legal y cualquier alivio viable.",
    resultPriorTitle: "Una orden previa requiere atención pronta de un abogado autorizado",
    resultPriorBody:
      "Una orden de remoción previa—o la duda sobre su existencia—requiere revisión legal individual. Una petición de habeas corpus bajo § 2241 no cancela una orden de remoción ni sustituye una petición de revisión o un abogado de inmigración.",
    resultHomeTitle: "Añada planificación para el valor de su vivienda",
    resultHomeBody: "Explore si un fideicomiso Save My Home se ajusta a sus hechos. Ningún fideicomiso evita toda venta, acción de acreedores o pérdida.",
    resultBusinessTitle: "Añada planificación de continuidad del negocio",
    resultBusinessBody: "Explore una estructura de fideicomiso y corporación para continuidad, transferencia o venta. Las licencias, el control y los resultados requieren revisión profesional.",
    resultCta: "Continuar al formulario completo",
    resultDisclaimer:
      "Estos son pasos de organización, no una opinión legal ni una determinación de elegibilidad. Completar el formulario no garantiza que un abogado acepte el caso o lo represente.",
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
      "Chif apeprè 12–15% rapò istorik jeneral pafwa site pou kèk sitiyasyon ijans chanjman estati oswa sekou se yon egzanp, se pa yon pousantaj ofisyèl aktyèl. Pousantaj apwobasyon yo varye selon sitiyasyon, jiridiksyon, enfòmasyon ak peryòd. Estatistik istorik ak egzanp frè yo pa prevwa ni garanti okenn rezilta endividyèl.",
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
    screenerEyebrow: "Evalyasyon preliminè entèraktif prive",
    screenerHeading: "Idantifye priyorite preparasyon ou.",
    screenerIntro:
      "Reponn senk kesyon debaz. Zouti sa a pa deside eligibilite, sekou oswa sitiyasyon legal; li sèlman òganize priyorite planifikasyon. Repons yo rete sou paj sa a epi yo pa voye ni sove yo.",
    questions: {
      time: {
        legend: "1. Konbyen tan ou ap viv Etazini?",
        options: { under2: "Mwens pase 2 an", "2to10": "2–10 an", over10: "Plis pase 10 an", unsure: "Mwen pa sèten / mwen prefere pa di" },
      },
      status: {
        legend: "2. Ki sa ki dekri sitiyasyon imigrasyon ou pi byen kounye a?",
        options: { none: "Mwen pa gen estati legal kounye a", tps: "TPS", daca: "DACA", lawful: "Rezidan pèmanan oswa moun ki gen viza", pending: "Azil oswa yon lòt demann annatant", other: "Lòt / mwen pa sèten" },
      },
      prior: {
        legend: "3. Èske ou gen yon ansyen lòd depòtasyon oswa revokasyon?",
        options: { yes: "Wi", no: "Non", unsure: "Mwen pa sèten" },
      },
      home: {
        legend: "4. Èske ou gen yon kay oswa kapital nan yon kay?",
        options: { yes: "Wi", no: "Non" },
      },
      business: {
        legend: "5. Èske ou gen yon wout, biznis sèvis oswa yon lòt biznis?",
        options: { yes: "Wi", no: "Non" },
      },
    },
    completeNote: "Reponn tout senk kesyon yo pou wè priyorite planifikasyon ou.",
    submit: "Wè priyorite preparasyon mwen",
    reset: "Efase repons yo",
    resultTitle: "Priyorite planifikasyon ou",
    resultCaseTitle: "Prepare dosye a an premye",
    resultCaseBody:
      "Kontinye nan fòm konplè a pou òganize nimewo A ou, istorik imigrasyon ou ak kontak ijans yo. Yon avoka kalifye ki gen lisans dwe evalye vrè sitiyasyon legal ou ak nenpòt sekou ki posib poukont li.",
    resultPriorTitle: "Yon ansyen lòd mande atansyon rapid yon avoka ki gen lisans",
    resultPriorBody:
      "Yon ansyen lòd revokasyon—oswa ensètitid sou li—mande revizyon legal endividyèl. Yon petisyon habeas corpus dapre § 2241 pa anile yon lòd revokasyon epi li pa ranplase yon petisyon pou revizyon oswa yon avoka imigrasyon.",
    resultHomeTitle: "Ajoute planifikasyon pou kapital kay ou",
    resultHomeBody: "Eksplore si yon estrikti fidisi Save My Home adapte ak sitiyasyon ou. Okenn fidisi pa anpeche tout vant, aksyon kretyanse oswa pèt.",
    resultBusinessTitle: "Ajoute planifikasyon kontiniite biznis",
    resultBusinessBody: "Eksplore yon estrikti fidisi ak kòporasyon pou kontiniite, transfè oswa vant. Lisans, kontwòl ak rezilta yo mande revizyon pwofesyonèl.",
    resultCta: "Kontinye nan fòm konplè a",
    resultDisclaimer:
      "Sa yo se etap òganizasyon, se pa yon opinyon legal ni yon desizyon sou eligibilite. Ranpli fòm nan pa garanti yon avoka ap aksepte dosye a oswa reprezante w.",
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
  const [answers, setAnswers] = useState<ReadinessAnswers>({ ...EMPTY_READINESS_ANSWERS });
  const [showResults, setShowResults] = useState(false);
  const complete = isReadinessScreenComplete(answers);
  const plan = useMemo(() => buildReadinessPlan(answers), [answers]);
  const intakeHref = `/intake?lang=${lang}`;
  const homeHref = withLang("https://savemyhometrust.com/trust", lang);
  const businessHref = withLang("https://savemybusiness.com", lang);
  const pillarLinks = ["#readiness-screener", homeHref, businessHref, intakeHref];

  const update = (key: keyof ReadinessAnswers, value: string) => {
    setAnswers((current) => ({ ...current, [key]: value }) as ReadinessAnswers);
    setShowResults(false);
  };

  const questions = [
    { key: "timeInUs" as const, legend: t.questions.time.legend, options: Object.entries(t.questions.time.options) },
    { key: "currentStatus" as const, legend: t.questions.status.legend, options: Object.entries(t.questions.status.options) },
    { key: "priorRemoval" as const, legend: t.questions.prior.legend, options: Object.entries(t.questions.prior.options) },
    { key: "ownsHome" as const, legend: t.questions.home.legend, options: Object.entries(t.questions.home.options) },
    { key: "ownsBusiness" as const, legend: t.questions.business.legend, options: Object.entries(t.questions.business.options) },
  ];

  return <>
    <section className="home-band home-readiness" id="emergency-readiness" aria-labelledby="readiness-heading">
      <div className="home-container">
        <p className="home-readiness-eyebrow">{t.eyebrow}</p>
        <h2 id="readiness-heading">{t.heading}</h2>
        <p className="home-readiness-intro">{t.intro}</p>
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

    <section className="home-readiness-app" aria-labelledby="readiness-app-heading">
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

    <section className="home-band home-readiness-screen" id="readiness-screener" aria-labelledby="screener-heading">
      <div className="home-container home-readiness-screen-layout">
        <div className="home-readiness-screen-intro">
          <p className="home-readiness-eyebrow">{t.screenerEyebrow}</p>
          <h2 id="screener-heading">{t.screenerHeading}</h2>
          <p>{t.screenerIntro}</p>
          <Scale aria-hidden="true" />
        </div>
        <form className="home-readiness-form" onSubmit={(event) => { event.preventDefault(); if (complete) setShowResults(true); }}>
          {questions.map((question) => <fieldset key={question.key}>
            <legend>{question.legend}</legend>
            <div className="home-readiness-options">
              {question.options.map(([value, label]) => <label key={value}>
                <input
                  type="radio"
                  name={`readiness-${question.key}`}
                  value={value}
                  checked={answers[question.key] === value}
                  onChange={() => update(question.key, value)}
                />
                <span>{label}</span>
              </label>)}
            </div>
          </fieldset>)}
          <div className="home-readiness-form-actions">
            <Button type="submit" className="home-primary" disabled={!complete}>{t.submit}<ArrowRight size={18} /></Button>
            <Button type="button" variant="outline" onClick={() => { setAnswers({ ...EMPTY_READINESS_ANSWERS }); setShowResults(false); }}><RotateCcw size={17} />{t.reset}</Button>
          </div>
          {!complete && <p className="home-readiness-complete-note">{t.completeNote}</p>}
        </form>
      </div>
      {showResults && complete && <div className="home-container home-readiness-results" role="status" aria-live="polite">
        <h3>{t.resultTitle}</h3>
        <article><FileCheck2 aria-hidden="true" /><div><h4>{t.resultCaseTitle}</h4><p>{t.resultCaseBody}</p></div></article>
        {plan.counselReviewUrgent && <article className="home-readiness-priority"><AlertTriangle aria-hidden="true" /><div><h4>{t.resultPriorTitle}</h4><p>{t.resultPriorBody}</p></div></article>}
        {plan.showHome && <article><Home aria-hidden="true" /><div><h4>{t.resultHomeTitle}</h4><p>{t.resultHomeBody}</p><a href={homeHref} target="_blank" rel="noopener noreferrer">SaveMyHomeTrust.com<ArrowRight size={16} /></a></div></article>}
        {plan.showBusiness && <article><BriefcaseBusiness aria-hidden="true" /><div><h4>{t.resultBusinessTitle}</h4><p>{t.resultBusinessBody}</p><a href={businessHref} target="_blank" rel="noopener noreferrer">SaveMyBusiness.com<ArrowRight size={16} /></a></div></article>}
        <Button asChild className="home-primary"><a href={intakeHref}>{t.resultCta}<ArrowRight size={18} /></a></Button>
        <p className="home-readiness-result-disclaimer">{t.resultDisclaimer}</p>
      </div>}
    </section>

    <section className="home-band home-readiness-legal" aria-labelledby="habeas-limits-heading">
      <div className="home-container">
        <h2 id="habeas-limits-heading">{t.legalHeading}</h2>
        <div className="home-readiness-legal-grid">
          <article><Gavel aria-hidden="true" /><h3>{t.legalCanTitle}</h3><p>{t.legalCan}</p></article>
          <article><AlertTriangle aria-hidden="true" /><h3>{t.legalCannotTitle}</h3><p>{t.legalCannot}</p></article>
        </div>
        <div className="home-readiness-firm"><Scale aria-hidden="true" /><div><h3>{t.firmHeading}</h3><p>{t.firmBody}</p></div></div>
      </div>
    </section>
  </>;
}
