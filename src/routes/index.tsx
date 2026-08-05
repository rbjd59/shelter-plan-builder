import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import rosarioPhoto from "@/assets/rosario-sorrentino.png.asset.json";

const DEFENDER_HOSTS = new Set([
  "defendermicasa.com",
  "www.defendermicasa.com",
]);

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { lang?: string } => {
    const lang = typeof search.lang === "string" ? search.lang : undefined;
    return lang ? { lang } : {};
  },
  beforeLoad: ({ location }) => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      if (DEFENDER_HOSTS.has(host)) {
        throw redirect({ to: "/coming-soon" });
      }
    }
    try {
      const url = new URL(location.href, "http://localhost");
      const host = url.hostname.toLowerCase();
      if (DEFENDER_HOSTS.has(host)) {
        throw redirect({ to: "/coming-soon" });
      }
    } catch {
      /* ignore */
    }
  },
  head: () => ({
    meta: [
      { title: "DetencionDefensa.com — Plan de Defensa Pre-Detención · $10/mes" },
      {
        name: "description",
        content:
          "A pre-detention defense plan for immigrant working families. Emergency app $10/month; attorney-reviewed documents at no charge. NOT a law firm.",
      },
      { property: "og:title", content: "DetencionDefensa.com — Plan de Defensa Pre-Detención · $10/mes" },
      {
        property: "og:description",
        content:
          "Pre-detention defense plan for immigrant working families. Emergency app $10/month; attorney-reviewed documents at no charge.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://detenciondefensa.com/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "DetencionDefensa.com — Plan de Defensa Pre-Detención · $10/mes" },
      { name: "twitter:description", content: "Pre-detention defense plan for immigrant working families. Emergency app $10/month; attorney-reviewed documents at no charge." },
    ],
    links: [{ rel: "canonical", href: "https://detenciondefensa.com/" }],
  }),
  component: Index,
});

/* -------------------- i18n -------------------- */
type Lang = "es" | "en" | "ht";

/**
 * External backend URL. All "Get Started / El Plan / See if you qualify" CTAs
 * redirect here so this site (DetencionDefensa) is pure marketing / cover, while
 * the DetencionDefensa backend (detenciondefensa.com) handles disclaimers, email, payment, upsells,
 * and app delivery. `?src=detenciondefensa` tags the traffic so the backend can
 * attribute the lead to this site.
 */
const BACKEND_BASE = ""; // same-origin: backend lives in this project
const BACKEND_ENTRY = "/checkout"; // page right after the splash on the other site
function ctaHref(lang: Lang) {
  const params = new URLSearchParams({
    src: "detenciondefensa",
    utm_source: "detenciondefensa",
    utm_medium: "web",
    lang,
  });
  return `${BACKEND_BASE}${BACKEND_ENTRY}?${params.toString()}`;
}

// Eligibility screener lives on the DetencionDefensa backend site.
const QUALIFY_ENTRY = "/qualify";
function qualifyHref(lang: Lang) {
  const params = new URLSearchParams({
    src: "detenciondefensa",
    utm_source: "detenciondefensa",
    utm_medium: "web",
    utm_campaign: "qualify",
    lang,
  });
  return `${BACKEND_BASE}${QUALIFY_ENTRY}?${params.toString()}`;
}

const T = {
  es: {
    nav: { how: "Cómo funciona", plan: "El Plan", attorney: "El Abogado", faq: "Preguntas", cta: "Empezar · $199" },
    hero: {
      badge: "Plan de defensa pre-detención · Miami, FL",
      h1a: "La migra", h1b: "ya viene.", h1c: "No espere.",
      sub: "Un plan de defensa legal creado y revisado por abogados, para quienes no pueden pagar un retenedor tradicional de $10,000.",
      cta: "Empezar por $199 →",
      seeHow: "Ver cómo funciona",
      nowFree: "Ahora gratis por la crisis comunitaria a través de Refuge Outreach, una organización sin fines de lucro 501(c)(3) desde 1991.",
    },
    trust: { attorneyName: "Rosario Kyle Sorrentino, Esq.", firm: "Fundador, Sorrentino Law Firm PLLC · Fla. Bar No. 1049132", bio: "Abogado de inmigración con sede en Miami. Practica defensa contra deportación ante los tribunales de inmigración (EOIR), audiencias de fianza en ICE, peticiones de Habeas Corpus en cortes federales, mociones de reapertura, asilo, retención de deportación (Withholding), CAT, y peticiones para víctimas (VAWA, U y T). Atiende familias hispanohablantes en toda Florida." },
    features: [
      {
        eyebrow: "El botón que salva vidas",
        title: "Un botón. Toda su familia y su abogado, alertados en segundos.",
        body: "Cuando la migra toca a la puerta, no hay tiempo para llamar a nadie. NOTIFY FAMILY envía su ubicación, su plan y su Habeas Corpus a las personas correctas — automáticamente.",
        bullets: ["Alerta a múltiples contactos de emergencia", "Envía Habeas al abogado de guardia", "Registra la hora y lugar de la detención"],
      },
      {
        eyebrow: "Habeas Corpus, listo antes de que lo necesite",
        title: "Sus formularios están firmados, guardados y cifrados. Hoy.",
        body: "Generamos su Habeas Corpus, su AO 242 y su IFP con sus datos. El abogado los revisa. Se guardan cifrados. El día que los necesite, ya están listos para ser presentados.",
        bullets: ["Documentos generados por IA", "Revisados por Rosario Sorrentino, Esq.", "Cifrados de extremo a extremo"],
      },
      {
        eyebrow: "Su familia, preparada",
        title: "Poder notarial, custodia de menores, cuentas bancarias. Un solo lugar.",
        body: "El Family Readiness Package le da a su familia todo lo que necesita para seguir funcionando si usted es detenido. Sin caos. Sin adivinar.",
        bullets: ["Poder notarial (Power of Attorney)", "Custodia temporal de menores", "Acceso a cuentas y beneficios"],
      },
    ],
    pricing: {
      eyebrow: "El plan",
      h2a: "Un pago.", h2b: "Toda su defensa.",
      priceNote: "pago único",
      split: "$164 a DetencionDefensa.com, Inc. · $35 directo al fideicomiso IOLTA del bufete.",
      readinessBadge: "Servicios legales con descuento a través de Sorrentino Law Firm disponibles para clientes. Paquete de formularios de preparación familiar del abogado, noventa y nueve dólares.",
      features: [
        "Habeas Corpus, AO 242 e IFP generados y revisados",
        "Botón de pánico NOTIFY FAMILY",
        "Carta de compromiso de alcance limitado (Rule 4-1.2(c))",
        "Almacenamiento cifrado de extremo a extremo",
        "Disponible en Español, English, Kreyòl",
      ],
      cta: "Empezar mi plan por $199",
      addons: [
        { title: "Family Readiness Forms", price: "$99", body: "Poder notarial, custodia de menores, acceso a cuentas." },
        { title: "Attorney Form Completion", price: "$50", body: "El bufete completa cada formulario por usted." },
      ],
      scholarshipTitle: "¿No puede pagar?",
      scholarshipBody: "Refuge Outreach (501(c)(3)) ofrece becas para el plan completo.",
    },
    eligibility: {
      eyebrow: "Escala móvil · Sin costo o bajo costo",
      title: "¿Califica para el programa reducido?",
      body: "Para padres con hijos ciudadanos o residentes de EE.UU. que sean el sostén principal del hogar y ganen menos del 150% del nivel federal de pobreza.",
      cta: "Ver si califico",
      close: "Cerrar",
      qHousehold: "Tamaño del hogar (personas)",
      qIncome: "Ingreso mensual bruto del hogar (USD)",
      qChildren: "¿Tiene hijos ciudadanos o residentes de EE.UU.?",
      qPrimary: "¿Es usted el sostén principal del hogar?",
      yes: "Sí", no: "No",
      submit: "Verificar elegibilidad",
      resultFree: "Califica: SIN COSTO",
      resultFreeBody: "Su plan completo es cubierto por becas de Refuge Outreach. Un coordinador le contactará en 24 horas.",
      resultLow: "Califica: BAJO COSTO — $49",
      resultLowBody: "Precio reducido por escala móvil. Incluye Habeas Corpus, botón NOTIFY FAMILY y revisión de abogado.",
      resultStandard: "No califica para tarifa reducida",
      resultStandardBody: "El precio estándar es $199. Refuge Outreach todavía puede ayudarle con becas parciales.",
      disclaimer: "Vista previa. Elegibilidad final verificada por Refuge Outreach (501(c)(3)) con documentación (W-2, prueba de residencia de hijos).",
      heroPitch: "Para quienes tienen hijos estadounidenses o hijos en EE.UU. y son el sostén principal del hogar, usted puede calificar para un programa sin costo o de bajo costo. Para ver si califica, pulse el botón abajo.",
    },
    attorney: {
      eyebrow: "El bufete",
      quote: "\"Nadie debería enfrentar una detención sin un plan.\"",
      body: "Rosario Sorrentino, Esq. — fundador de Sorrentino Law Firm PLLC, un bufete de Florida especializado en defensa de inmigración. Cada plan de DetencionDefensa es revisado y aprobado por su equipo.",
      notice: "La contratación de un abogado es una decisión importante que no debe basarse únicamente en anuncios. Antes de decidir, pida información gratuita por escrito sobre nuestras cualificaciones y experiencia. Sorrentino Law Firm PLLC, Miami, FL.",
    },
    faq: {
      eyebrow: "Preguntas frecuentes",
      title: "Lo que la gente pregunta.",
      items: [
        { q: "¿DetencionDefensa es un bufete de abogados?", a: "No. DetencionDefensa es operado por DetencionDefensa.com, Inc., una corporación de Delaware — no un bufete. Los servicios legales son prestados por Sorrentino Law Firm PLLC, un bufete de Florida separado." },
        { q: "¿Qué pasa con mi dinero?", a: "$164 van a DetencionDefensa.com, Inc. por la plataforma. $35 van directamente al fideicomiso IOLTA de Sorrentino Law Firm PLLC — nosotros nunca tocamos los honorarios del abogado." },
        { q: "¿Necesito estar en Florida?", a: "Fase 1 sirve al mercado de Miami. Fase 2 (2026) expande a Los Ángeles, Houston y Nueva York a través de PLLCs estatales separadas supervisadas por Sorrentino Law Firm PLLC." },
        { q: "¿Qué idiomas soporta?", a: "Español, English y Kreyòl Ayisyen. Toda la documentación legal ha sido traducida profesionalmente." },
      ],
    },
    finalCta: { h2a: "No espere", h2b: "a la puerta.", sub: "Tome 10 minutos hoy. Tenga su plan listo mañana.", cta: "Empezar mi plan · $199" },
    footer: {
      tag: "Tecnología legal para comunidades vulnerables. Miami, FL.",
      companyHead: "La empresa", companyLinks: ["Cómo funciona", "Precios", "Refuge Outreach"],
      legalHead: "Legal", legalLinks: ["Términos", "Privacidad", "Aviso de publicidad"],
      dba: "DetencionDefensa es operado por DetencionDefensa.com, Inc., una corporación de Delaware.",
      notLawFirm: "DetencionDefensa.com, Inc. NO es un bufete de abogados.",
      disclaimer1: "DetencionDefensa.com, Inc. es una corporación de Delaware. NO es un bufete de abogados y NO presta servicios legales. Los servicios legales son prestados por Sorrentino Law Firm PLLC, un bufete de Florida separado, cuyo propietario es Rosario Sorrentino, Esq.",
      dualRoleLabel: "Divulgación de doble rol:",
      dualRole: " Rosario Sorrentino, Esq. tiene una participación tanto en DetencionDefensa.com, Inc. como en Sorrentino Law Firm PLLC. Esta relación ha sido divulgada conforme a la Regla 4-1.7 del Florida Bar.",
      adLabel: "Aviso de publicidad legal:",
      ad: " La contratación de un abogado es una decisión importante que no debe basarse únicamente en anuncios. Sorrentino Law Firm PLLC · Miami, FL.",
      copyright: "© 2026 DetencionDefensa.com, Inc. Todos los derechos reservados.",
    },
    mock: { panicEyebrow: "Emergencia", panicTitle: "Notificar familia", panicBtn: "PULSE\nAQUÍ", panicFoot: "Envía ubicación + Habeas a múltiples contactos de emergencia", onDuty: "✓ Abogado de guardia · Sorrentino Law Firm", docsEyebrow: "Su expediente", docsTitle: "Documentos", encrypted: "🔒 cifrado", reviewed: "Revisado", ready: "Listo", lastReview: "Última revisión por", today: "hoy 14:22", familyEyebrow: "Su familia", familyTitle: "Todo listo si usted no está.", familyDone: "3 de 4 documentos firmados y notarizados", familyKit: "Family Kit" },
  },
  en: {
    nav: { how: "How it works", plan: "The Plan", attorney: "The Attorney", faq: "FAQ", cta: "Get started · $199" },
    hero: {
      badge: "Pre-detention defense plan · Miami, FL",
      h1a: "ICE is", h1b: "coming.", h1c: "Don't wait.",
      sub: "A legal defense plan built and reviewed by attorneys, for those who can't afford a traditional $10,000 retainer.",
      cta: "Get started for $199 →",
      seeHow: "See how it works",
      nowFree: "Now free due to community crisis through Refuge Outreach, a 501(c)(3) nonprofit since 1991.",
    },
    trust: { attorneyName: "Rosario Kyle Sorrentino, Esq.", firm: "Founder, Sorrentino Law Firm PLLC · Fla. Bar No. 1049132", bio: "Miami-based immigration attorney. Practices removal defense before the immigration courts (EOIR), ICE bond hearings, federal Habeas Corpus petitions, motions to reopen, asylum, Withholding of Removal, CAT, and victim-based petitions (VAWA, U, and T). Serves Spanish-speaking families throughout Florida." },
    features: [
      {
        eyebrow: "The button that saves lives",
        title: "One button. Your whole family and your attorney, alerted in seconds.",
        body: "When ICE knocks on the door, there's no time to call anyone. NOTIFY FAMILY sends your location, your plan, and your Habeas Corpus to the right people — automatically.",
        bullets: ["Alerts multiple emergency contacts", "Sends Habeas to the on-duty attorney", "Logs time and location of the detention"],
      },
      {
        eyebrow: "Habeas Corpus, ready before you need it",
        title: "Your forms are signed, stored, and encrypted. Today.",
        body: "We generate your Habeas Corpus, your AO 242, and your IFP with your information. The attorney reviews them. They're stored encrypted. The day you need them, they're ready to file.",
        bullets: ["AI-generated documents", "Reviewed by Rosario Sorrentino, Esq.", "End-to-end encrypted"],
      },
      {
        eyebrow: "Your family, prepared",
        title: "Power of attorney, child custody, bank accounts. One place.",
        body: "The Family Readiness Package gives your family everything they need to keep functioning if you are detained. No chaos. No guessing.",
        bullets: ["Power of Attorney", "Temporary child custody", "Access to accounts and benefits"],
      },
    ],
    pricing: {
      eyebrow: "The plan",
      h2a: "One payment.", h2b: "Your whole defense.",
      priceNote: "one-time",
      split: "$164 to DetencionDefensa.com, Inc. · $35 direct to the firm's IOLTA trust.",
      readinessBadge: "Discounted legal services through Sorrentino Law Firm available for clients. Attorney family readiness form packet, ninety-nine dollars.",
      features: [
        "Habeas Corpus, AO 242, and IFP generated and reviewed",
        "NOTIFY FAMILY panic button",
        "Limited-scope engagement letter (Rule 4-1.2(c))",
        "End-to-end encrypted storage",
        "Available in Spanish, English, Kreyòl",
      ],
      cta: "Start my plan for $199",
      addons: [
        { title: "Family Readiness Forms", price: "$99", body: "Power of attorney, child custody, account access." },
        { title: "Attorney Form Completion", price: "$50", body: "The firm completes each form for you." },
      ],
      scholarshipTitle: "Can't afford it?",
      scholarshipBody: "Refuge Outreach (501(c)(3)) offers scholarships for the full plan.",
    },
    eligibility: {
      eyebrow: "Sliding scale · No-cost or low-cost",
      title: "Do you qualify for the reduced program?",
      body: "For parents with U.S. citizen or resident children who are the household's primary income earner and make less than 150% of the federal poverty level.",
      cta: "See if I qualify",
      close: "Close",
      qHousehold: "Household size (people)",
      qIncome: "Gross monthly household income (USD)",
      qChildren: "Do you have U.S. citizen or resident children?",
      qPrimary: "Are you the household's primary income earner?",
      yes: "Yes", no: "No",
      submit: "Check eligibility",
      resultFree: "You qualify: NO COST",
      resultFreeBody: "Your full plan is covered by Refuge Outreach scholarships. A coordinator will contact you within 24 hours.",
      resultLow: "You qualify: LOW COST — $49",
      resultLowBody: "Reduced sliding-scale price. Includes Habeas Corpus, NOTIFY FAMILY button, and attorney review.",
      resultStandard: "You don't qualify for the reduced rate",
      resultStandardBody: "Standard price is $199. Refuge Outreach may still help with partial scholarships.",
      disclaimer: "Preview. Final eligibility verified by Refuge Outreach (501(c)(3)) with documentation (W-2, proof of children's residency).",
      heroPitch: "For those with American children or children in the U.S. who are the household's primary income earner, you may qualify for a no-cost or low-cost program. To see if you qualify, press the button below.",
    },
    attorney: {
      eyebrow: "The firm",
      quote: "\"No one should face a detention without a plan.\"",
      body: "Rosario Sorrentino, Esq. — founder of Sorrentino Law Firm PLLC, a Florida firm specializing in immigration defense. Every DetencionDefensa plan is reviewed and approved by his team.",
      notice: "The hiring of a lawyer is an important decision that should not be based solely upon advertisements. Before you decide, ask us to send you free written information about our qualifications and experience. Sorrentino Law Firm PLLC, Miami, FL.",
    },
    faq: {
      eyebrow: "Frequently asked",
      title: "What people ask.",
      items: [
        { q: "Is DetencionDefensa a law firm?", a: "No. DetencionDefensa is operated by DetencionDefensa.com, Inc., a Delaware corporation — not a law firm. Legal services are provided by Sorrentino Law Firm PLLC, a separate Florida law firm." },
        { q: "Where does my money go?", a: "$164 goes to DetencionDefensa.com, Inc. for the platform. $35 goes directly to the IOLTA trust of Sorrentino Law Firm PLLC — we never touch the attorney's fees." },
        { q: "Do I need to be in Florida?", a: "Phase 1 serves the Miami market. Phase 2 (2026) expands to Los Angeles, Houston, and New York through separate state PLLCs supervised by Sorrentino Law Firm PLLC." },
        { q: "What languages are supported?", a: "Spanish, English, and Haitian Creole. All legal documentation has been professionally translated." },
      ],
    },
    finalCta: { h2a: "Don't wait", h2b: "at the door.", sub: "Take 10 minutes today. Have your plan ready tomorrow.", cta: "Start my plan · $199" },
    footer: {
      tag: "Legal technology for vulnerable communities. Miami, FL.",
      companyHead: "Company", companyLinks: ["How it works", "Pricing", "Refuge Outreach"],
      legalHead: "Legal", legalLinks: ["Terms", "Privacy", "Advertising notice"],
      dba: "DetencionDefensa is operated by DetencionDefensa.com, Inc., a Delaware corporation.",
      notLawFirm: "DetencionDefensa.com, Inc. is NOT a law firm.",
      disclaimer1: "DetencionDefensa.com, Inc. is a Delaware corporation. It is NOT a law firm and does NOT provide legal services. Legal services are provided by Sorrentino Law Firm PLLC, a separate Florida law firm, wholly owned by Rosario Sorrentino, Esq.",
      dualRoleLabel: "Dual-role disclosure:",
      dualRole: " Rosario Sorrentino, Esq. holds an interest in both DetencionDefensa.com, Inc. and Sorrentino Law Firm PLLC. This relationship has been disclosed pursuant to Florida Bar Rule 4-1.7.",
      adLabel: "Attorney advertising notice:",
      ad: " The hiring of a lawyer is an important decision that should not be based solely upon advertisements. Sorrentino Law Firm PLLC · Miami, FL.",
      copyright: "© 2026 DetencionDefensa.com, Inc. All rights reserved.",
    },
    mock: { panicEyebrow: "Emergency", panicTitle: "Notify family", panicBtn: "PRESS\nHERE", panicFoot: "Sends location + Habeas to multiple emergency contacts", onDuty: "✓ On-duty attorney · Sorrentino Law Firm", docsEyebrow: "Your file", docsTitle: "Documents", encrypted: "🔒 encrypted", reviewed: "Reviewed", ready: "Ready", lastReview: "Last reviewed by", today: "today 2:22 PM", familyEyebrow: "Your family", familyTitle: "All set if you're not here.", familyDone: "3 of 4 documents signed and notarized", familyKit: "Family Kit" },
  },
  ht: {
    nav: { how: "Kijan sa fonksyone", plan: "Plan an", attorney: "Avoka a", faq: "Kesyon", cta: "Kòmanse · $199" },
    hero: {
      badge: "Plan defans anvan detansyon · Miami, FL",
      h1a: "ICE ap", h1b: "vini.", h1c: "Pa tann.",
      sub: "Yon plan defans legal ki fèt epi revize pa avoka, pou moun ki pa ka peye yon retenè tradisyonèl $10,000.",
      cta: "Kòmanse pou $199 →",
      seeHow: "Wè kijan li fonksyone",
      nowFree: "Kounye a gratis akòz kriz kominotè a atravè Refuge Outreach, yon òganizasyon san bi likratif 501(c)(3) depi 1991.",
    },
    trust: { attorneyName: "Rosario Kyle Sorrentino, Esq.", firm: "Fondatè, Sorrentino Law Firm PLLC · Fla. Bar No. 1049132", bio: "Avoka imigrasyon ki baze Miami. Li pratike defans kont depòtasyon devan tribinal imigrasyon (EOIR), odyans kosyon ICE, petisyon Habeas Corpus nan tribinal federal, mosyon pou re-ouvri, azil, Withholding of Removal, CAT, ak petisyon pou viktim (VAWA, U, ak T). Li sèvi fanmi ki pale Panyòl atravè tout Florida." },
    features: [
      {
        eyebrow: "Bouton ki sove lavi",
        title: "Yon bouton. Tout fanmi w ak avoka w, alète nan segonn.",
        body: "Lè ICE frape pòt la, pa gen tan pou rele pèsonn. NOTIFY FAMILY voye pozisyon w, plan w, ak Habeas Corpus w bay bon moun yo — otomatikman.",
        bullets: ["Alète plizyè kontak dijans", "Voye Habeas bay avoka an sèvis", "Anrejistre lè ak kote detansyon an"],
      },
      {
        eyebrow: "Habeas Corpus, pare anvan w bezwen l",
        title: "Fòm ou yo siyen, sere, epi chiffré. Jodi a.",
        body: "Nou jenere Habeas Corpus w, AO 242 w, ak IFP w ak enfòmasyon w. Avoka a revize yo. Yo sere chiffré. Jou w bezwen yo, yo pare pou depoze.",
        bullets: ["Dokiman jenere pa IA", "Revize pa Rosario Sorrentino, Esq.", "Chiffré bout an bout"],
      },
      {
        eyebrow: "Fanmi w, prepare",
        title: "Pouvwa notarye, gad timoun, kont labank. Yon sèl kote.",
        body: "Family Readiness Package bay fanmi w tout sa yo bezwen pou kontinye fonksyone si yo detni w. Pa gen dezòd. Pa gen devinasyon.",
        bullets: ["Pouvwa Notarye (Power of Attorney)", "Gad timoun tanporè", "Aksè a kont ak benefis"],
      },
    ],
    pricing: {
      eyebrow: "Plan an",
      h2a: "Yon peman.", h2b: "Tout defans ou.",
      priceNote: "yon sèl fwa",
      split: "$164 bay DetencionDefensa.com, Inc. · $35 dirèk nan kont IOLTA biwo a.",
      readinessBadge: "Sèvis legal ak reduiksyon atravè Sorrentino Law Firm disponib pou kliyan. Pake fòm preparasyon fanmi avoka a, swasan-nèf dola.",
      features: [
        "Habeas Corpus, AO 242, ak IFP jenere epi revize",
        "Bouton panik NOTIFY FAMILY",
        "Lèt angajman limite (Rule 4-1.2(c))",
        "Stokaj chiffré bout an bout",
        "Disponib nan Panyòl, Anglè, Kreyòl",
      ],
      cta: "Kòmanse plan mwen pou $199",
      addons: [
        { title: "Family Readiness Forms", price: "$99", body: "Pouvwa notarye, gad timoun, aksè kont." },
        { title: "Attorney Form Completion", price: "$50", body: "Biwo a ranpli chak fòm pou ou." },
      ],
      scholarshipTitle: "Ou pa ka peye?",
      scholarshipBody: "Refuge Outreach (501(c)(3)) ofri bous pou plan konplè a.",
    },
    eligibility: {
      eyebrow: "Echèl mobil · San kou oswa ba kou",
      title: "Èske w kalifye pou pwogram redwi a?",
      body: "Pou paran ki gen pitit sitwayen oswa rezidan Ozetazini ki se sipò prensipal fanmi an epi ki fè mwens pase 150% nivo povrete federal la.",
      cta: "Wè si m kalifye",
      close: "Fèmen",
      qHousehold: "Gwosè fanmi (moun)",
      qIncome: "Revni mansyèl brit fanmi (USD)",
      qChildren: "Èske w gen pitit sitwayen oswa rezidan Ozetazini?",
      qPrimary: "Èske w se sipò prensipal fanmi an?",
      yes: "Wi", no: "Non",
      submit: "Verifye kalifikasyon",
      resultFree: "W kalifye: SAN KOU",
      resultFreeBody: "Plan konplè w kouvri pa bous Refuge Outreach. Yon kowòdonatè ap kontakte w nan 24 èdtan.",
      resultLow: "W kalifye: BA KOU — $49",
      resultLowBody: "Pri redwi echèl mobil. Gen ladan Habeas Corpus, bouton NOTIFY FAMILY, ak revizyon avoka.",
      resultStandard: "W pa kalifye pou to redwi",
      resultStandardBody: "Pri estanda a se $199. Refuge Outreach ka toujou ede ak bous pasyèl.",
      disclaimer: "Apèsi. Kalifikasyon final verifye pa Refuge Outreach (501(c)(3)) ak dokiman (W-2, prèv rezidans timoun yo).",
      heroPitch: "Pou moun ki gen pitit Ameriken oswa pitit Ozetazini epi ki se sipò prensipal fanmi an, ou ka kalifye pou yon pwogram san kou oswa ba kou. Pou wè si w kalifye, peze bouton anba a.",
    },
    attorney: {
      eyebrow: "Biwo a",
      quote: "\"Pèsonn pa ta dwe fè fas ak yon detansyon san yon plan.\"",
      body: "Rosario Sorrentino, Esq. — fondatè Sorrentino Law Firm PLLC, yon biwo Florida ki espesyalize nan defans imigrasyon. Chak plan DetencionDefensa revize epi apwouve pa ekip li a.",
      notice: "Anboche yon avoka se yon desizyon enpòtan ki pa ta dwe baze sèlman sou reklam. Anvan w deside, mande enfòmasyon gratis alekri sou kalifikasyon ak eksperyans nou. Sorrentino Law Firm PLLC, Miami, FL.",
    },
    faq: {
      eyebrow: "Kesyon souvan",
      title: "Sa moun mande.",
      items: [
        { q: "Èske DetencionDefensa se yon biwo avoka?", a: "Non. DetencionDefensa opere pa DetencionDefensa.com, Inc., yon kòporasyon Delaware, opere — se pa yon biwo avoka. Sèvis legal yo bay pa Sorrentino Law Firm PLLC, yon biwo Florida separe." },
        { q: "Kote lajan m ale?", a: "$164 ale nan DetencionDefensa.com, Inc. pou platfòm nan. $35 ale dirèk nan kont IOLTA Sorrentino Law Firm PLLC — nou pa janm manyen frè avoka a." },
        { q: "Èske m bezwen nan Florida?", a: "Faz 1 sèvi mache Miami. Faz 2 (2026) elaji nan Los Angeles, Houston, ak New York atravè PLLC eta separe sipèvize pa Sorrentino Law Firm PLLC." },
        { q: "Ki lang ki sipòte?", a: "Panyòl, Anglè, ak Kreyòl Ayisyen. Tout dokiman legal yo tradwi pwofesyonèlman." },
      ],
    },
    finalCta: { h2a: "Pa tann", h2b: "nan pòt la.", sub: "Pran 10 minit jodi a. Gen plan w pare demen.", cta: "Kòmanse plan mwen · $199" },
    footer: {
      tag: "Teknoloji legal pou kominote vilnerab. Miami, FL.",
      companyHead: "Konpayi", companyLinks: ["Kijan li fonksyone", "Pri", "Refuge Outreach"],
      legalHead: "Legal", legalLinks: ["Kondisyon", "Konfidansyalite", "Avi piblisite"],
      dba: "DetencionDefensa opere pa DetencionDefensa.com, Inc., yon kòporasyon Delaware.",
      notLawFirm: "DetencionDefensa.com, Inc. PA yon biwo avoka.",
      disclaimer1: "DetencionDefensa.com, Inc. se yon kòporasyon Delaware. Li PA yon biwo avoka epi li PA bay sèvis legal. Sèvis legal yo bay pa Sorrentino Law Firm PLLC, yon biwo Florida separe, ki apatni a Rosario Sorrentino, Esq.",
      dualRoleLabel: "Divilgasyon doub-wòl:",
      dualRole: " Rosario Sorrentino, Esq. gen enterè nan tou de DetencionDefensa.com, Inc. ak Sorrentino Law Firm PLLC. Relasyon sa a divilge dapre Rule 4-1.7 Florida Bar la.",
      adLabel: "Avi piblisite avoka:",
      ad: " Anboche yon avoka se yon desizyon enpòtan ki pa ta dwe baze sèlman sou reklam. Sorrentino Law Firm PLLC · Miami, FL.",
      copyright: "© 2026 DetencionDefensa.com, Inc. Tout dwa rezève.",
    },
    mock: { panicEyebrow: "Ijans", panicTitle: "Avèti fanmi", panicBtn: "PRESE\nLA A", panicFoot: "Voye pozisyon + Habeas bay plizyè kontak dijans", onDuty: "✓ Avoka an sèvis · Sorrentino Law Firm", docsEyebrow: "Dosye w", docsTitle: "Dokiman", encrypted: "🔒 chiffré", reviewed: "Revize", ready: "Pare", lastReview: "Dènye revizyon pa", today: "jodi 14:22", familyEyebrow: "Fanmi w", familyTitle: "Tout pare si ou pa la.", familyDone: "3 sou 4 dokiman siyen epi notarye", familyKit: "Family Kit" },
  },
};

type TDict = typeof T.es;
const LangCtx = createContext<{ lang: Lang; t: TDict }>({ lang: "es", t: T.es });
const useT = () => useContext(LangCtx);

function Index() {
  const [lang, setLang] = useState<Lang>("es");
  const t: TDict = T[lang];
  return (
    <LangCtx.Provider value={{ lang, t }}>
      <div className="min-h-screen bg-background text-foreground">
        <Nav lang={lang} setLang={setLang} />
        <main>
          <Hero />
          <TrustBar />
          <FeatureSection idx={0} mockup={<PanicScreen />} reverse={false} />
          <FeatureSection idx={1} mockup={<DocsMock />} reverse={true} />
          <HomeownerVideo />
          <FeatureSection idx={2} mockup={<FamilyMock />} reverse={false} />
          <AttorneySection />
          <FAQ />
          <FinalCTA />
        </main>
        <Footer />

      </div>
    </LangCtx.Provider>
  );
}

/* -------------------- NAV -------------------- */
function Nav({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const { t } = useT();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2">
          <ShieldLogo />
          <span className="font-display text-xl leading-none">DetencionDefensa</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#como-funciona" className="hover:text-foreground">{t.nav.how}</a>
          <a href={ctaHref(lang)} className="hover:text-foreground">{t.nav.plan}</a>
          <a href="#abogado" className="hover:text-foreground">{t.nav.attorney}</a>
          <a href="#preguntas" className="hover:text-foreground">{t.nav.faq}</a>
          <div className="flex items-center gap-1 rounded-full border border-border p-0.5 text-xs font-semibold">
            {(["es", "en", "ht"] as Lang[]).map((code) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                className={`rounded-full px-2.5 py-1 uppercase transition ${lang === code ? "bg-cvink text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {code}
              </button>
            ))}
          </div>
        </nav>
        <div className="relative inline-block">
          <a href={ctaHref(lang)} className="inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
            {t.nav.cta}
          </a>
          <RedX />
        </div>
      </div>
    </header>
  );
}

/* -------------------- HERO -------------------- */
function Hero() {
  const { t, lang } = useT();
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 pb-24 pt-20 md:grid-cols-[1.15fr_1fr] md:pt-28 md:pb-32">
        <div className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-urgent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-urgent" />
            </span>
            {t.hero.badge}
          </div>

          <h1 className="hero-headline text-[3.5rem] text-cvink sm:text-[5rem] md:text-[6.5rem]">
            {t.hero.h1a} <br />
            <span className="italic text-firm">{t.hero.h1b}</span>
            <br />
            {t.hero.h1c}
          </h1>

          <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground">{t.hero.sub}</p>

          <div className="mt-6 flex flex-wrap items-center gap-5">
            <div className="relative inline-block">
              <a href={ctaHref(lang)} className="inline-block rounded-full bg-primary px-7 py-4 text-base font-semibold text-primary-foreground transition hover:bg-primary/90">
                {t.hero.cta}
              </a>
              <RedX />
            </div>
            <p className="max-w-xs text-sm font-semibold leading-snug text-urgent">
              {t.hero.nowFree}
            </p>
          </div>

        </div>

        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-firm/10 via-transparent to-primary/5 blur-2xl" />
          <PhoneFrame>
            <PanicScreen />
          </PhoneFrame>
        </div>
      </div>
    </section>
  );
}

/* -------------------- TRUST BAR -------------------- */
function TrustBar() {
  const { t, lang } = useT();
  return (
    <section className="border-y border-border bg-cream">
      <div className="mx-auto flex max-w-6xl items-start gap-4 px-6 py-5 text-sm">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-firm/40">
          <img src={rosarioPhoto.url} alt={t.trust.attorneyName} width={44} height={44} fetchPriority="high" decoding="async" className="h-full w-full object-cover object-[center_45%] scale-[1.6] origin-center" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-foreground leading-tight">{t.trust.attorneyName}</div>
          <div className="text-xs text-muted-foreground leading-tight">{t.trust.firm}</div>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">{t.trust.bio}</p>
        </div>
      </div>
    </section>

  );
}

/* -------------------- FEATURE SECTION -------------------- */
function FeatureSection({ idx, mockup, reverse }: { idx: number; mockup: ReactNode; reverse: boolean }) {
  const { t, lang } = useT();
  const f = t.features[idx];
  return (
    <section id={idx === 0 ? "como-funciona" : undefined} className="py-24 md:py-32">
      <div className={`mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-2 md:items-center ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
        <div>
          <div className="eyebrow text-firm">{f.eyebrow}</div>
          <h2 className="mt-4 font-display text-4xl leading-[1.02] text-cvink md:text-5xl">{f.title}</h2>
          <p className="mt-6 text-lg text-muted-foreground">{f.body}</p>
          <ul className="mt-8 space-y-3">
            {f.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 text-foreground">
                <CheckDot />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center">
          <PhoneFrame>{mockup}</PhoneFrame>
        </div>
      </div>
    </section>
  );
}

/* -------------------- RED X OVERLAY -------------------- */
function RedX() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center text-urgent">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-[112%] w-[112%] overflow-visible">
        <line x1="2" y1="8" x2="98" y2="92" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
        <line x1="98" y1="8" x2="2" y2="92" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/* -------------------- HOMEOWNER VIDEO -------------------- */
const HOMEOWNER = {
  en: {
    src: "https://detenciondefensa.com/__l5e/assets-v1/79637105-8f9f-4e06-95a6-88def4387a95/protect-what-you-built-en.mp4",
    h: "Are you a homeowner?",
    sub: "Protect your home now. Watch the video.",
    trust: "Protect your home and assets in an attorney-created trust at",
    disc: "This video is an advertisement. Every case is handled independently, and the outcomes are not guaranteed, subject to property equity and qualifications, trust acceptance. Savemyhometrust.com is a subsidiary of detenciondefensa.com.",
  },
  es: {
    src: "https://detenciondefensa.com/__l5e/assets-v1/16758c57-3542-457c-947e-79324aaa7923/protect-what-you-built-es.mp4",
    h: "¿Es propietario de una vivienda?",
    sub: "Proteja su casa ahora. Mire el video.",
    trust: "Proteja su casa y bienes en un fideicomiso creado por un abogado en",
    disc: "Este video es un anuncio publicitario. Cada caso se maneja de manera independiente y los resultados no están garantizados, sujetos a la plusvalía de la propiedad, calificaciones y aceptación del fideicomiso. Savemyhometrust.com es una subsidiaria de detenciondefensa.com.",
  },
  ht: {
    src: "https://detenciondefensa.com/__l5e/assets-v1/d670656c-a0b4-449b-ba24-3e9e9301e281/protect-what-you-built-ht.mp4",
    h: "Èske ou se pwopriyetè yon kay?",
    sub: "Pwoteje kay ou kounye a. Gade videyo a.",
    trust: "Pwoteje kay ou ak byen ou nan yon konfyans kreye pa yon avoka nan",
    disc: "Videyo sa a se yon piblisite. Chak ka jere endepandamman, e rezilta yo pa garanti, sijè a ekite pwopriyete a, kalifikasyon, ak akseptasyon trust la. Savemyhometrust.com se yon sibsidyè detenciondefensa.com.",
  },
} as const;

function HomeownerVideo() {
  const { lang } = useT();
  const v = HOMEOWNER[lang as keyof typeof HOMEOWNER] ?? HOMEOWNER.es;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    const ok = () => {
      setPlaying(true);
      el.controls = true;
    };
    const p = el.play();
    if (p && p.then) {
      p.then(ok).catch(() => {
        el.muted = true;
        el.play().then(ok).catch(() => {});
      });
    } else ok();
  };

  return (
    <section id="plan" className="bg-sand py-10 text-sand-foreground md:py-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-[3px] border-cvink/40 shadow-2xl">
          <video
            key={v.src}
            ref={videoRef}
            src={v.src}
            playsInline
            preload="metadata"
            className="h-full w-full object-cover object-top"
          />
          {!playing && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/45 px-4 text-center">
              <h2 className="font-display text-3xl uppercase tracking-wide drop-shadow-lg md:text-5xl">{v.h}</h2>
              <p className="mt-2 text-base font-semibold text-firm-foreground drop-shadow-md md:text-xl">{v.sub}</p>
              <button
                type="button"
                onClick={play}
                aria-label="Play video"
                className="mt-6 flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-firm-foreground bg-cvink/85 transition hover:scale-105 hover:bg-cvink"
              >
                <span className="ml-2 h-0 w-0 border-y-[18px] border-l-[28px] border-y-transparent border-l-firm-foreground" />
              </button>
            </div>
          )}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-[15px] leading-relaxed">
          {v.trust}{" "}
          <a
            href="https://savemyhometrust.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block rounded-md bg-cvink px-4 py-2 font-bold text-primary-foreground"
          >
            savemyhometrust.com
          </a>
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-center text-xs italic text-sand-foreground/80">{v.disc}</p>
      </div>
    </section>
  );
}





/* -------------------- ATTORNEY -------------------- */
function AttorneySection() {
  const { t, lang } = useT();
  return (
    <section id="abogado" className="bg-cream py-24 md:py-32">
      <div className="mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-[auto_1fr] md:items-center">
        <div className="h-40 w-40 overflow-hidden rounded-full shadow-lg ring-4 ring-firm/30">
          <img
            src={rosarioPhoto.url}
            alt={t.attorney.eyebrow}
            className="h-full w-full object-cover object-[center_45%] scale-[1.6] origin-center"
          />
        </div>
        <div>
          <div className="eyebrow text-firm">{t.attorney.eyebrow}</div>
          <h2 className="mt-3 font-display text-4xl leading-tight text-cvink md:text-5xl">{t.attorney.quote}</h2>
          <p className="mt-6 text-lg text-muted-foreground">{t.attorney.body}</p>
          <p className="mt-4 text-xs text-muted-foreground">{t.attorney.notice}</p>
        </div>
      </div>
    </section>
  );
}

/* -------------------- FAQ -------------------- */
function FAQ() {
  const { t, lang } = useT();
  return (
    <section id="preguntas" className="py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <div className="eyebrow text-firm">{t.faq.eyebrow}</div>
        <h2 className="mt-4 font-display text-4xl text-cvink md:text-5xl">{t.faq.title}</h2>
        <div className="mt-12 divide-y divide-border border-y border-border">
          {t.faq.items.map((it) => (
            <details key={it.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-foreground">
                {it.q}
                <span className="text-2xl text-muted-foreground transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-muted-foreground">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------- FINAL CTA -------------------- */
function FinalCTA() {
  const { t, lang } = useT();
  return (
    <section className="bg-cvink py-24 text-primary-foreground md:py-32">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="hero-headline text-5xl md:text-7xl">
          {t.finalCta.h2a} <span className="italic text-firm-foreground/70">{t.finalCta.h2b}</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/70">{t.finalCta.sub}</p>
        <div className="relative mt-10 inline-block">
          <a href={ctaHref(lang)} className="inline-flex rounded-full bg-primary-foreground px-8 py-4 font-semibold text-cvink hover:bg-primary-foreground/90">
            {t.finalCta.cta}
          </a>
          <RedX />
        </div>
      </div>
    </section>
  );
}

/* -------------------- FOOTER -------------------- */
function Footer() {
  const { t, lang } = useT();
  return (
    <footer className="border-t border-border bg-cream">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldLogo />
              <span className="font-display text-xl">DetencionDefensa</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">{t.footer.tag}</p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <div className="eyebrow mb-3 text-firm">{t.footer.companyHead}</div>
              <ul className="space-y-2 text-muted-foreground">
                {t.footer.companyLinks.map((l) => <li key={l}>{l}</li>)}
              </ul>
            </div>
            <div>
              <div className="eyebrow mb-3 text-firm">{t.footer.legalHead}</div>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/terms" className="hover:text-firm">{t.footer.legalLinks[0]}</Link></li>
                <li><Link to="/privacy" className="hover:text-firm">{t.footer.legalLinks[1]}</Link></li>
                {t.footer.legalLinks.slice(2).map((l) => <li key={l}>{l}</li>)}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 space-y-4 border-t border-border pt-8 text-xs leading-relaxed text-muted-foreground">
          <p className="font-semibold uppercase tracking-widest text-foreground">{t.footer.notLawFirm}</p>
          <p className="italic">{t.footer.dba}</p>
          <p>{t.footer.disclaimer1}</p>
          <p><strong>{t.footer.dualRoleLabel}</strong>{t.footer.dualRole}</p>
          <p><strong>{t.footer.adLabel}</strong>{t.footer.ad}</p>
          <p className="pt-4">{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}

/* -------------------- ATOMS -------------------- */
function ShieldLogo() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-cvink text-primary-foreground">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3Z" />
      </svg>
    </div>
  );
}

function CheckDot({ dark }: { dark?: boolean }) {
  return (
    <span className={`mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${dark ? "bg-primary-foreground text-cvink" : "bg-firm text-firm-foreground"}`}>
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 5 5L20 7" />
      </svg>
    </span>
  );
}

/* -------------------- PHONE MOCKUPS -------------------- */
function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-[280px] rounded-[2.75rem] border-[10px] border-cvink bg-cvink shadow-2xl md:w-[320px]">
      <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-cvink" />
      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2rem] bg-background">
        {children}
      </div>
    </div>
  );
}

function PanicScreen() {
  const { t, lang } = useT();
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-cream to-background p-5">
      <div className="flex items-center justify-between text-[10px] font-semibold text-foreground">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
          <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
        </div>
      </div>
      <div className="mt-6 flex-1 flex flex-col items-center justify-center text-center">
        <div className="eyebrow text-firm">{t.mock.panicEyebrow}</div>
        <div className="mt-2 font-display text-2xl text-cvink">{t.mock.panicTitle}</div>
        <div className="relative mt-8">
          <span className="absolute inset-0 animate-ping rounded-full bg-urgent/40" />
          <button className="relative flex h-36 w-36 items-center justify-center rounded-full bg-urgent text-urgent-foreground shadow-lg">
            <span className="font-display text-xl leading-tight whitespace-pre-line">{t.mock.panicBtn}</span>
          </button>
        </div>
        <div className="mt-8 text-[10px] text-muted-foreground">{t.mock.panicFoot}</div>
      </div>
      <div className="mt-4 rounded-2xl bg-cvink p-3 text-[10px] text-primary-foreground">{t.mock.onDuty}</div>
    </div>
  );
}

function DocsMock() {
  const { t, lang } = useT();
  const docs = [
    { name: "Habeas Corpus", status: t.mock.reviewed },
    { name: "AO 242", status: t.mock.reviewed },
    { name: "In Forma Pauperis", status: t.mock.reviewed },
    { name: "JS 44 Civil Cover", status: t.mock.ready },
  ];
  return (
    <div className="flex h-full flex-col bg-background p-5">
      <div className="flex items-center justify-between text-[10px] font-semibold">
        <span>9:41</span>
        <span className="text-firm">{t.mock.encrypted}</span>
      </div>
      <div className="mt-6">
        <div className="eyebrow text-firm">{t.mock.docsEyebrow}</div>
        <div className="mt-1 font-display text-2xl text-cvink">{t.mock.docsTitle}</div>
      </div>
      <div className="mt-6 space-y-2">
        {docs.map((d) => (
          <div key={d.name} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-firm/10 text-firm">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
              </div>
              <span className="text-[11px] font-semibold text-foreground">{d.name}</span>
            </div>
            <span className="rounded-full bg-firm/10 px-2 py-0.5 text-[9px] font-semibold text-firm">{d.status}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto rounded-2xl bg-cream p-3 text-[10px] text-muted-foreground">
        {t.mock.lastReview} <span className="font-semibold text-firm">R. Sorrentino, Esq.</span> — {t.mock.today}
      </div>
    </div>
  );
}

const FAMILY_ITEMS: Record<Lang, { icon: string; label: string; done: boolean }[]> = {
  es: [
    { icon: "👨‍👩‍👧", label: "Custodia de Alex (7) y María (4)", done: true },
    { icon: "🏦", label: "Poder para cuenta Wells Fargo", done: true },
    { icon: "🏠", label: "Autorización de arrendamiento", done: false },
    { icon: "📞", label: "Lista de contactos de emergencia", done: true },
  ],
  en: [
    { icon: "👨‍👩‍👧", label: "Custody of Alex (7) and María (4)", done: true },
    { icon: "🏦", label: "Power over Wells Fargo account", done: true },
    { icon: "🏠", label: "Lease authorization", done: false },
    { icon: "📞", label: "Emergency contacts list", done: true },
  ],
  ht: [
    { icon: "👨‍👩‍👧", label: "Gad Alex (7) ak María (4)", done: true },
    { icon: "🏦", label: "Pouvwa sou kont Wells Fargo", done: true },
    { icon: "🏠", label: "Otorizasyon lwaye", done: false },
    { icon: "📞", label: "Lis kontak ijans", done: true },
  ],
};

function FamilyMock() {
  const { t, lang } = useT();
  const items = FAMILY_ITEMS[lang];
  return (
    <div className="flex h-full flex-col bg-cream p-5">
      <div className="flex items-center justify-between text-[10px] font-semibold">
        <span>9:41</span>
        <span className="text-muted-foreground">{t.mock.familyKit}</span>
      </div>
      <div className="mt-6">
        <div className="eyebrow text-firm">{t.mock.familyEyebrow}</div>
        <div className="mt-1 font-display text-2xl leading-tight text-cvink">{t.mock.familyTitle}</div>
      </div>
      <div className="mt-5 space-y-2">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-3 rounded-xl bg-background p-3">
            <span className="text-lg">{it.icon}</span>
            <span className="flex-1 text-[11px] text-foreground">{it.label}</span>
            <span className={`h-4 w-4 rounded-full ${it.done ? "bg-firm" : "border-2 border-border"}`}>
              {it.done && (
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-firm-foreground" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
              )}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-auto rounded-2xl border border-firm/30 bg-firm/10 p-3 text-[10px] text-firm">{t.mock.familyDone}</div>
    </div>
  );
}
