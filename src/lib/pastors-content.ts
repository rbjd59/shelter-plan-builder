import type { Lang } from "@/context/LanguageContext";

export type StationKey = "radiopaz" | "wrhc" | "woir" | "wmbm" | "lzm" | "default";

// Per-station tracking numbers. Replace with real CallRail/Twilio numbers before launch.
export const STATION_NUMBERS: Record<StationKey, { display: string; tel: string; name: string }> = {
  radiopaz: { display: "(305) 521-0830", tel: "+13055210830", name: "Radio Paz 830 AM / 96.1 FM" },
  wrhc:     { display: "(305) 521-1550", tel: "+13055211550", name: "WRHC 1550 AM" },
  woir:     { display: "(305) 521-1430", tel: "+13055211430", name: "WOIR 1430 AM" },
  wmbm:     { display: "(305) 521-1490", tel: "+13055211490", name: "WMBM 1490 AM" },
  lzm:      { display: "(305) 521-0895", tel: "+13055210895", name: "LZM Radio 89.5" },
  default:  { display: "(305) 521-0199", tel: "+13055210199", name: "DetencionDefensa" },
};

type Copy = {
  nav: { back: string; partners: string };
  eyebrow: string;
  title: string;
  lede: string;
  callCta: string;
  packetCta: string;
  fromStation: (name: string) => string;
  stats: { value: string; label: string }[];
  pastorTitle: string;
  pastorBody: string[];
  howTitle: string;
  how: { h: string; p: string }[];
  costTitle: string;
  cost: { label: string; value: string; was?: string }[];
  closingTitle: string;
  closingBody: string;
  footer: string;
};

export const PASTORS: Record<Lang, Copy> = {
  es: {
    nav: { back: "← Inicio", partners: "Programa de alianzas →" },
    eyebrow: "Para pastores y sacerdotes",
    title: "Antes de la tormenta, prepare a su rebaño.",
    lede:
      "Familias trabajadoras de su congregación pueden ser detenidas por ICE sin previo aviso. Nosotros preparamos los documentos federales por adelantado — por una fracción del costo de un abogado.",
    callCta: "Llamar ahora",
    packetCta: "Solicitar paquete para iglesias",
    fromStation: (n) => `¿Nos escuchó en ${n}? Llame a esta línea directa para pastores:`,
    stats: [
      { value: "25×", label: "aumento en detenciones de ICE desde enero 2025" },
      { value: "97%", label: "de casos de habeas corpus migratorio decididos a favor del peticionario" },
      { value: "Sin costo", label: "vs. $8,500+ que cobra un abogado federal" },
    ],
    pastorTitle: "Una palabra para el pastor",
    pastorBody: [
      "Usted ya conoce el miedo en los ojos de sus feligreses. Niños que no van a la escuela. Padres que no van al trabajo. Familias que dejan de venir a misa los domingos.",
      "DetencionDefensa no es un abogado. Es una preparación. Antes de que ICE toque la puerta, la familia ya tiene su petición de habeas corpus federal lista — traducida, firmada, y guardada en el teléfono. Si ocurre la detención, un solo toque la envía esa misma noche al centro de detención.",
      "Por cada 20 familias que su iglesia refiera, recibimos $2,000 en créditos de becas para patrocinar a familias que no pueden pagar. Su iglesia nunca da consejo legal. Solo comparte la información.",
    ],
    howTitle: "Cómo funciona para su iglesia",
    how: [
      { h: "1. Sin riesgo legal", p: "Su iglesia firma un acuerdo simple de referencia. No maneja documentos ni da consejo legal — solo comparte volantes en español, criollo e inglés." },
      { h: "2. Lanzamiento suave", p: "Empezamos con una mesa después de misa o un anuncio breve. Le damos materiales listos para imprimir y un código de referencia para su parroquia." },
      { h: "3. Becas para los suyos", p: "Por cada 20 inscripciones desde su iglesia, recibe $2,000 en créditos de becas. Usted decide qué familias de su comunidad reciben la protección gratis." },
    ],
    costTitle: "Comparación de costos",
    cost: [
      { label: "DetencionDefensa (app de emergencia)", value: "Gratis — pro bono por la crisis comunitaria", was: "$199" },
      { label: "Beca patrocinada (primer año)", value: "$3/mes" },
      { label: "Abogado federal de habeas corpus", value: "$8,500 – $15,000" },
    ],
    closingTitle: "Hablemos esta semana",
    closingBody:
      "Nuestro equipo le envía hoy mismo el paquete pastoral: muestras de los formularios, los volantes en tres idiomas, el acuerdo de referencia, y los pasos del lanzamiento suave. Sin compromiso.",
    footer:
      "DetencionDefensa.com, Inc. es solo el operador tecnológico y no es una firma de abogados. Sorrentino Law Firm PLLC opera este sitio bajo licencia y presta todos los servicios legales.",
  },

  en: {
    nav: { back: "← Home", partners: "Partnership program →" },
    eyebrow: "For pastors and priests",
    title: "Before the storm, prepare your flock.",
    lede:
      "Working families in your congregation can be detained by ICE without warning. We prepare the federal court documents in advance — for a fraction of an attorney's fee.",
    callCta: "Call now",
    packetCta: "Request church packet",
    fromStation: (n) => `Heard us on ${n}? Call this direct line for pastors:`,
    stats: [
      { value: "25×", label: "surge in ICE detentions since January 2025" },
      { value: "97%", label: "of decided immigration habeas cases granted for petitioners" },
      { value: "No cost", label: "vs. $8,500+ from a federal attorney" },
    ],
    pastorTitle: "A word to the pastor",
    pastorBody: [
      "You already see the fear in your people. Children kept home from school. Fathers afraid to drive to work. Families who stop coming to Mass on Sundays.",
      "DetencionDefensa is not a lawyer. It is preparation. Before ICE knocks, the family already has their federal habeas corpus petition ready — translated, signed, stored on their phone. If detention happens, one tap mails it overnight to the facility.",
      "For every 20 families your church refers, you receive $2,000 in scholarship credits to sponsor families who cannot pay. Your church never gives legal advice. You only share the information.",
    ],
    howTitle: "How it works for your church",
    how: [
      { h: "1. No legal risk", p: "Your church signs a simple referral agreement. No document handling, no legal advice — just sharing flyers in Spanish, Creole, and English." },
      { h: "2. Soft launch", p: "Start with a table after Mass or a brief announcement. We provide print-ready materials and a referral code for your parish." },
      { h: "3. Scholarships for your own", p: "Every 20 sign-ups from your church earns $2,000 in scholarship credits. You decide which families in your community get the protection at no cost." },
    ],
    costTitle: "Cost comparison",
    cost: [
      { label: "DetencionDefensa (emergency app)", value: "Free — pro bono due to the community crisis", was: "$199" },
      { label: "Sponsored scholarship (year one)", value: "$3/mo" },
      { label: "Federal habeas corpus attorney", value: "$8,500 – $15,000" },
    ],
    closingTitle: "Let's talk this week",
    closingBody:
      "Our team will send you the pastor packet today: sample forms, three-language flyers, the referral agreement, and the soft-launch playbook. No obligation.",
    footer:
      "DetencionDefensa.com, Inc. is the technology operator only and is not a law firm. Sorrentino Law Firm PLLC operates this site under license and provides all legal services.",
  },

  ht: {
    nav: { back: "← Akèy", partners: "Pwogram patenarya →" },
    eyebrow: "Pou pastè ak prèt",
    title: "Anvan tanpèt la, prepare moun ou yo.",
    lede:
      "Fanmi travayè nan kongregasyon w lan ka arete pa ICE san avètisman. Nou prepare dokiman tribinal federal yo davans — pou yon ti pati nan pri yon avoka.",
    callCta: "Rele kounye a",
    packetCta: "Mande pakèt legliz la",
    fromStation: (n) => `Ou tande nou sou ${n}? Rele liy dirèk pastè a:`,
    stats: [
      { value: "25×", label: "ogmantasyon detansyon ICE depi janvye 2025" },
      { value: "97%", label: "nan ka habeas corpus imigrasyon yo akòde pou demandè a" },
      { value: "San frè", label: "kont $8,500+ yon avoka federal" },
    ],
    pastorTitle: "Yon mo pou pastè a",
    pastorBody: [
      "Ou deja wè laperèz nan je moun ou yo. Timoun yo pa ale lekòl. Papa yo pè kondi pou al travay. Fanmi yo sispann vin nan legliz dimanch.",
      "DetencionDefensa pa yon avoka. Se yon preparasyon. Anvan ICE frape pòt la, fanmi an gen petisyon habeas corpus federal yo deja pare — tradui, siyen, e estoke sou telefòn yo. Si detansyon rive, yon sèl tap voye li lannwit nan etablisman an.",
      "Pou chak 20 fanmi legliz ou refere, ou resevwa $2,000 nan kredi bous pou patwone fanmi ki pa ka peye. Legliz ou pa janm bay konsèy legal. Ou senpleman pataje enfòmasyon an.",
    ],
    howTitle: "Kijan li mache pou legliz ou",
    how: [
      { h: "1. Pa gen risk legal", p: "Legliz ou siyen yon akò referans senp. Pa gen manyen dokiman, pa gen konsèy legal — sèlman pataje afich an Panyòl, Kreyòl, e Anglè." },
      { h: "2. Lansman dousman", p: "Kòmanse ak yon tab apre lamès oswa yon ti anons. Nou bay materyèl ki pare pou enprime ak yon kòd referans pou pawas ou." },
      { h: "3. Bous pou pwòp moun ou yo", p: "Chak 20 enskripsyon nan legliz ou pote $2,000 nan kredi bous. Ou deside ki fanmi nan kominote w ki resevwa pwoteksyon an gratis." },
    ],
    costTitle: "Konparezon pri",
    cost: [
      { label: "DetencionDefensa (app dijans)", value: "Gratis — pro bono akòz kriz kominotè a", was: "$199" },
      { label: "Bous patwone (premye ane)", value: "$3/mwa" },
      { label: "Avoka federal habeas corpus", value: "$8,500 – $15,000" },
    ],
    closingTitle: "Ann pale semèn sa a",
    closingBody:
      "Ekip nou an ap voye pakèt pastè a jodi a: echantiyon fòm yo, afich nan twa lang, akò referans la, ak gid lansman dousman an. San okenn angajman.",
    footer:
      "DetencionDefensa.com, Inc. se sèlman operatè teknoloji a epi li pa yon kabinè avoka. Sorrentino Law Firm PLLC ap opere sit sa a anba lisans epi se li ki bay tout sèvis legal.",
  },
};
