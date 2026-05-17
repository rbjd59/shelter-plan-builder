import type { Lang } from "@/context/LanguageContext";

type Section = {
  cta: { churches: string };
  nav: { back: string };
  hero: {
    eyebrow: string;
    title: string;
    lede: string;
    primary: string;
    secondary: string;
  };
  context: {
    title: string;
    items: { h: string; p: string }[];
  };
  need: {
    title: string;
    items: { h: string; p: string }[];
  };
  offers: {
    title: string;
    items: { h: string; p: string }[];
  };
  process: {
    title: string;
    items: { h: string; p: string }[];
  };
  cost: {
    title: string;
    rows: { label: string; value: string; note: string }[];
  };
  giveBack: {
    title: string;
    items: { h: string; p: string }[];
  };
  steps: {
    title: string;
    items: { h: string; p: string }[];
  };
  hardship: {
    title: string;
    items: { h: string; p: string }[];
  };
  impact: {
    title: string;
    items: { h: string; p: string }[];
  };
  next: {
    title: string;
    items: { h: string; p: string }[];
    contact: string;
  };
};

export const PARTNERS: Record<Lang, Section> = {
  en: {
    cta: { churches: "Churches & Nonprofits — Enter Here →" },
    nav: { back: "← Back to home" },
    hero: {
      eyebrow: "Partnership Program",
      title: "Empowering Communities Against Detention",
      lede:
        "DetencionDefensa partners with churches, employers, and nonprofits to prepare working families before ICE detention happens — with zero legal exposure for your organization.",
      primary: "Request partnership packet",
      secondary: "See how it works",
    },
    context: {
      title: "Introducing DetencionDefensa",
      items: [
        {
          h: "Empowering communities amid rising detention",
          p: "DetencionDefensa responds to increased ICE detentions and community fear. Families face disruptions in work, worship, and daily life.",
        },
        {
          h: "Accessible pre-detention defense tools",
          p: "A simple, affordable plan prepares families for potential detention. Multilingual support ensures inclusivity for Spanish and Haitian Creole speakers.",
        },
        {
          h: "Partnering with churches, employers & nonprofits",
          p: "Organizations refer families and receive scholarship credits to help those in need. No legal exposure — partners simply share information.",
        },
      ],
    },
    need: {
      title: "Understanding the community need",
      items: [
        { h: "25× surge in ICE detentions", p: "Detentions of people with no criminal record have increased 25-fold since January 2025." },
        { h: "Ripple effects on daily life", p: "Families avoid public spaces, children stay home, workers miss jobs for fear of detention." },
        { h: "Strain on community resources", p: "Churches and nonprofits see fewer donations and more requests for help as wage-earners are detained." },
        { h: "Urgency for proactive support", p: "Early preparation empowers families to respond quickly and reduces long-term hardship." },
      ],
    },
    offers: {
      title: "What DetencionDefensa offers",
      items: [
        { h: "Empowering families before detention", p: "Families prepare essential federal court documents in advance, reducing stress and uncertainty." },
        { h: "Easy translation & form preparation", p: "Answers are translated and typed onto official forms in Spanish, Haitian Creole, or English." },
        { h: "Accessible support via HELP NOW app", p: "Completed packages are delivered directly to the customer's phone for quick access if needed." },
      ],
    },
    process: {
      title: "How the process works",
      items: [
        { h: "1. Easy multilingual intake", p: "Families answer simple questions in Spanish, Haitian Creole, or English. No legal expertise required." },
        { h: "2. Secure document preparation", p: "Answers are translated and typed onto official federal forms, then delivered to the customer's phone." },
        { h: "3. Activation & rapid mailing", p: "If detention occurs, a single tap activates overnight mailing to the facility, including samples and a postage-paid return envelope." },
      ],
    },
    cost: {
      title: "Affordability & accessibility",
      rows: [
        { label: "DetencionDefensa pre-detention plan", value: "$199 setup + $10/mo", note: "Typical cost" },
        { label: "Federal habeas corpus attorney", value: "$8,500 – $15,000", note: "Comparable legal cost" },
        { label: "Scholarship credits (per 20 sign-ups)", value: "Funds 10 families", note: "At no cost to recipients" },
      ],
    },
    giveBack: {
      title: "The partnership give-back program",
      items: [
        { h: "Empowering community referrals", p: "Organizations simply share program info — no legal advice or document handling required." },
        { h: "Scholarship credits for families in need", p: "For every 20 sign-ups, partners receive $2,000 in credits to sponsor low-income families." },
        { h: "Expanding protection through partnerships", p: "Churches, employers, and nonprofits reach those most at risk and ensure more families are prepared." },
        { h: "Simple, safe, and impactful process", p: "All steps are designed to keep organizations free from legal exposure while maximizing community support." },
      ],
    },
    steps: {
      title: "Step-by-step partnership guide",
      items: [
        { h: "Easy onboarding for partners", p: "Sign a simple agreement to become a referring organization — no legal risk or document handling." },
        { h: "Empowering your community", p: "Share ready-made flyers, inserts, and digital materials in multiple languages to reach everyone." },
        { h: "Scholarship designation made simple", p: "Select community members for scholarship sign-ups using your give-back credit pool." },
        { h: "Direct support, no legal burden", p: "All sign-ups and paperwork handled directly by DetencionDefensa — your role is purely informational." },
      ],
    },
    hardship: {
      title: "Supporting subscription hardship",
      items: [
        { h: "Lowered monthly cost for scholarships", p: "Scholarship recipients pay just $3/month for the first year." },
        { h: "Flexible sponsorship options", p: "Partner organizations can cover subscription fees for those in need." },
        { h: "Ongoing hardship support", p: "After 12 months, hardship deferrals are available case-by-case." },
      ],
    },
    impact: {
      title: "Impact & success metrics",
      items: [
        { h: "25×", p: "Surge in ICE detentions of non-criminals since Jan 2025." },
        { h: "97%", p: "Of decided immigration habeas cases granted for petitioners." },
        { h: "10–14 days", p: "Typical time from filing to first hearing." },
        { h: "Fraction of legal cost", p: "Families protect themselves for a small share of attorney fees." },
      ],
    },
    next: {
      title: "Key takeaways & next steps",
      items: [
        { h: "Empowering families", p: "Prepares families for unexpected detention with ready-to-file federal court documents." },
        { h: "Accessible protection", p: "Partnerships enable scholarship credits for those unable to afford the setup fee." },
        { h: "Simple participation", p: "Easy onboarding and informational role — no legal exposure for your organization." },
        { h: "Next steps", p: "Contact DetencionDefensa to receive your partnership packet and referral code. Begin with a soft launch in your community." },
      ],
      contact: "Request partnership packet",
    },
  },

  es: {
    cta: { churches: "Iglesias y organizaciones — Entrar aquí →" },
    nav: { back: "← Volver al inicio" },
    hero: {
      eyebrow: "Programa de Alianzas",
      title: "Fortaleciendo a las comunidades frente a la detención",
      lede:
        "DetencionDefensa se asocia con iglesias, empleadores y organizaciones sin fines de lucro para preparar a las familias trabajadoras antes de una detención de ICE — sin exposición legal para su organización.",
      primary: "Solicitar paquete de alianza",
      secondary: "Ver cómo funciona",
    },
    context: {
      title: "Presentamos DetencionDefensa",
      items: [
        { h: "Fortalecer comunidades ante el aumento de detenciones", p: "DetencionDefensa responde al aumento de detenciones de ICE y al miedo en la comunidad. Las familias enfrentan interrupciones en el trabajo, el culto y la vida diaria." },
        { h: "Herramientas accesibles de defensa pre-detención", p: "Un plan simple y económico prepara a las familias para una posible detención. Apoyo multilingüe para hispanohablantes y hablantes de criollo haitiano." },
        { h: "Alianzas con iglesias, empleadores y ONG", p: "Las organizaciones refieren a familias y reciben créditos de becas para ayudar a quienes más lo necesitan. Sin exposición legal — los aliados solo comparten información." },
      ],
    },
    need: {
      title: "Entendiendo la necesidad de la comunidad",
      items: [
        { h: "Aumento de 25× en detenciones de ICE", p: "Las detenciones de personas sin antecedentes penales aumentaron 25 veces desde enero de 2025." },
        { h: "Efectos en la vida diaria", p: "Las familias evitan lugares públicos, los niños se quedan en casa y los trabajadores faltan al trabajo por miedo a la detención." },
        { h: "Presión sobre los recursos comunitarios", p: "Las iglesias y ONG ven menos donaciones y más solicitudes de ayuda al ser detenidos los proveedores del hogar." },
        { h: "Urgencia de un apoyo proactivo", p: "La preparación temprana permite a las familias responder rápido y reduce el sufrimiento a largo plazo." },
      ],
    },
    offers: {
      title: "Lo que ofrece DetencionDefensa",
      items: [
        { h: "Fortaleciendo a las familias antes de la detención", p: "Las familias preparan con anticipación los documentos esenciales para la corte federal, reduciendo estrés e incertidumbre." },
        { h: "Traducción y llenado fácil de formularios", p: "Las respuestas se traducen y se transcriben en los formularios oficiales en español, criollo haitiano o inglés." },
        { h: "Apoyo accesible vía la app HELP NOW", p: "Los paquetes completos se entregan directamente al teléfono del cliente para acceso rápido cuando sea necesario." },
      ],
    },
    process: {
      title: "Cómo funciona el proceso",
      items: [
        { h: "1. Toma de datos multilingüe", p: "Las familias responden preguntas simples en español, criollo haitiano o inglés. No se requiere conocimiento legal." },
        { h: "2. Preparación segura de documentos", p: "Las respuestas se traducen y se transcriben en formularios federales oficiales, luego se entregan al teléfono del cliente." },
        { h: "3. Activación y envío urgente", p: "Si ocurre una detención, un solo toque activa el envío nocturno al centro, con muestras y sobre de retorno prepagado." },
      ],
    },
    cost: {
      title: "Asequibilidad y acceso",
      rows: [
        { label: "Plan pre-detención DetencionDefensa", value: "$199 inicial + $10/mes", note: "Costo típico" },
        { label: "Abogado federal de habeas corpus", value: "$8,500 – $15,000", note: "Costo legal comparable" },
        { label: "Créditos de becas (por cada 20 inscripciones)", value: "Financia a 10 familias", note: "Sin costo para los beneficiarios" },
      ],
    },
    giveBack: {
      title: "El programa de retribución de alianzas",
      items: [
        { h: "Empoderando las referencias comunitarias", p: "Las organizaciones solo comparten información — no dan consejo legal ni manejan documentos." },
        { h: "Créditos de becas para familias en necesidad", p: "Por cada 20 inscripciones, los aliados reciben $2,000 en créditos para patrocinar familias de bajos ingresos." },
        { h: "Ampliando la protección a través de alianzas", p: "Iglesias, empleadores y ONG llegan a quienes más están en riesgo y aseguran que más familias estén preparadas." },
        { h: "Proceso simple, seguro e impactante", p: "Todos los pasos están diseñados para mantener libres de exposición legal a las organizaciones." },
      ],
    },
    steps: {
      title: "Guía paso a paso para aliados",
      items: [
        { h: "Incorporación fácil", p: "Firme un acuerdo simple para convertirse en organización referente — sin riesgo legal." },
        { h: "Empoderando a su comunidad", p: "Comparta volantes, insertos y materiales digitales listos en varios idiomas." },
        { h: "Designación de becas simplificada", p: "Seleccione miembros de la comunidad para becas usando su fondo de créditos." },
        { h: "Apoyo directo, sin carga legal", p: "DetencionDefensa maneja todas las inscripciones y el papeleo — su rol es puramente informativo." },
      ],
    },
    hardship: {
      title: "Apoyo en dificultad de pago",
      items: [
        { h: "Costo mensual reducido para becas", p: "Los beneficiarios pagan solo $3/mes el primer año." },
        { h: "Opciones flexibles de patrocinio", p: "Las organizaciones aliadas pueden cubrir las cuotas mensuales de quienes lo necesiten." },
        { h: "Apoyo continuo en dificultad", p: "Después de 12 meses, hay aplazamientos por dificultad caso por caso." },
      ],
    },
    impact: {
      title: "Impacto y resultados",
      items: [
        { h: "25×", p: "Aumento de detenciones de ICE sin antecedentes penales desde enero de 2025." },
        { h: "97%", p: "De los casos de habeas corpus migratorio decididos a favor de los peticionarios." },
        { h: "10–14 días", p: "Tiempo típico entre la presentación y la primera audiencia." },
        { h: "Fracción del costo legal", p: "Las familias se protegen por una pequeña parte del costo de un abogado." },
      ],
    },
    next: {
      title: "Conclusiones y próximos pasos",
      items: [
        { h: "Fortaleciendo a las familias", p: "Prepara a las familias para una detención inesperada con documentos federales listos para presentar." },
        { h: "Protección accesible", p: "Las alianzas habilitan becas para quienes no pueden pagar la cuota inicial." },
        { h: "Participación simple", p: "Incorporación fácil y rol informativo — sin exposición legal para su organización." },
        { h: "Próximos pasos", p: "Contacte a DetencionDefensa para recibir su paquete de alianza y código de referencia. Comience con un lanzamiento suave en su comunidad." },
      ],
      contact: "Solicitar paquete de alianza",
    },
  },

  ht: {
    cta: { churches: "Legliz ak ONG — Antre la a →" },
    nav: { back: "← Tounen nan paj akèy" },
    hero: {
      eyebrow: "Pwogram Patenarya",
      title: "Bay kominote yo fòs devan detansyon",
      lede:
        "DetencionDefensa fè patenarya ak legliz, anplwayè ak ONG pou prepare fanmi travayè yo anvan yon detansyon ICE rive — san okenn ekspozisyon legal pou òganizasyon w.",
      primary: "Mande pakèt patenarya",
      secondary: "Wè kijan li mache",
    },
    context: {
      title: "Prezantasyon DetencionDefensa",
      items: [
        { h: "Bay kominote yo fòs nan moman detansyon ap monte", p: "DetencionDefensa reponn a ogmantasyon detansyon ICE yo ak laperèz nan kominote a. Fanmi yo gen pwoblèm nan travay, legliz ak lavi chak jou." },
        { h: "Zouti aksesib pou defans anvan detansyon", p: "Yon plan senp epi pa chè prepare fanmi yo pou yon detansyon posib. Sipò miltileng pou moun ki pale Panyòl ak Kreyòl Ayisyen." },
        { h: "Patenarya ak legliz, anplwayè ak ONG", p: "Òganizasyon yo refere fanmi yo epi resevwa kredi bous pou ede sa ki nan bezwen. Pa gen ekspozisyon legal — patnè yo senpleman pataje enfòmasyon." },
      ],
    },
    need: {
      title: "Konprann bezwen kominote a",
      items: [
        { h: "25× plis detansyon ICE", p: "Detansyon moun ki pa gen kazye kriminèl ogmante 25 fwa depi janvye 2025." },
        { h: "Efè sou lavi chak jou", p: "Fanmi yo evite kote piblik, timoun yo rete lakay, travayè yo pa ale nan travay paske yo pè detansyon." },
        { h: "Presyon sou resous kominotè", p: "Legliz ak ONG yo wè mwens donasyon ak plis demand pou èd lè moun k ap rapòte lajan yo arete." },
        { h: "Ijans pou sipò pwoaktif", p: "Preparasyon bonè ede fanmi yo reponn vit epi diminye soufrans alontèm." },
      ],
    },
    offers: {
      title: "Sa DetencionDefensa ofri",
      items: [
        { h: "Bay fanmi yo fòs anvan detansyon", p: "Fanmi yo prepare dokiman esansyèl pou tribinal federal davans, sa redui estrès ak ensètitid." },
        { h: "Tradiksyon fasil ak preparasyon fòm", p: "Repons yo tradui epi tape sou fòm ofisyèl an Panyòl, Kreyòl Ayisyen oswa Anglè." },
        { h: "Sipò aksesib atravè app HELP NOW", p: "Pakèt fini yo livre dirèkteman sou telefòn kliyan an pou aksè rapid si sa nesesè." },
      ],
    },
    process: {
      title: "Kijan pwosesis la mache",
      items: [
        { h: "1. Pran enfòmasyon miltileng fasil", p: "Fanmi yo reponn kesyon senp an Panyòl, Kreyòl Ayisyen oswa Anglè. Pa bezwen okenn konesans legal." },
        { h: "2. Preparasyon dokiman an sekirite", p: "Repons yo tradui epi tape sou fòm federal ofisyèl, epi livre sou telefòn kliyan an." },
        { h: "3. Aktivasyon ak voye rapid", p: "Si yon detansyon rive, yon sèl tap aktive voye lapòs lannwit nan etablisman an, ak echantiyon ak yon anvlòp retounen peye." },
      ],
    },
    cost: {
      title: "Pri ak aksè",
      rows: [
        { label: "Plan pre-detansyon DetencionDefensa", value: "$199 enstalasyon + $10/mwa", note: "Pri tipik" },
        { label: "Avoka federal habeas corpus", value: "$8,500 – $15,000", note: "Konparezon pri legal" },
        { label: "Kredi bous (chak 20 enskripsyon)", value: "Finanse 10 fanmi", note: "San pri pou benefisyè yo" },
      ],
    },
    giveBack: {
      title: "Pwogram retounen patenarya a",
      items: [
        { h: "Bay referans kominotè fòs", p: "Òganizasyon yo senpleman pataje enfòmasyon — pa gen konsèy legal ni manyen dokiman." },
        { h: "Kredi bous pou fanmi nan bezwen", p: "Pou chak 20 enskripsyon, patnè yo resevwa $2,000 nan kredi pou patwone fanmi ki gen ti revni." },
        { h: "Elaji pwoteksyon atravè patenarya", p: "Legliz, anplwayè ak ONG rive jwenn moun ki pi an risk epi asire plis fanmi prepare." },
        { h: "Pwosesis senp, an sekirite ak ki gen enpak", p: "Tout etap yo fèt pou kenbe òganizasyon yo lib de ekspozisyon legal." },
      ],
    },
    steps: {
      title: "Gid patenarya etap pa etap",
      items: [
        { h: "Antre fasil pou patnè yo", p: "Siyen yon akò senp pou vin yon òganizasyon referans — san risk legal." },
        { h: "Bay kominote w fòs", p: "Pataje afich, ensèsyon ak materyèl dijital ki pare nan plizyè lang." },
        { h: "Deziyasyon bous fasilite", p: "Chwazi manm kominote a pou enskripsyon ak bous lè w sèvi ak kredi w yo." },
        { h: "Sipò dirèk, san chay legal", p: "DetencionDefensa okipe tout enskripsyon ak papye yo — wòl ou se sèlman enfòmatif." },
      ],
    },
    hardship: {
      title: "Sipò pou difikilte abònman",
      items: [
        { h: "Pri mansyèl redui pou bous", p: "Moun ki resevwa bous yo peye sèlman $3/mwa premye ane a." },
        { h: "Opsyon patwonaj fleksib", p: "Òganizasyon patnè yo ka kouvri frè mansyèl yo pou sa ki nan bezwen." },
        { h: "Sipò difikilte kontinyèl", p: "Apre 12 mwa, gen rapò difikilte ki disponib ka pa ka." },
      ],
    },
    impact: {
      title: "Enpak ak rezilta",
      items: [
        { h: "25×", p: "Ogmantasyon detansyon ICE moun ki pa gen kazye depi janvye 2025." },
        { h: "97%", p: "Nan ka habeas corpus imigrasyon ki deside yo akòde pou demandè a." },
        { h: "10–14 jou", p: "Tan tipik ant depo a ak premye odyans la." },
        { h: "Fraksyon pri legal", p: "Fanmi yo pwoteje tèt yo pou yon ti pati nan frè avoka." },
      ],
    },
    next: {
      title: "Pwen kle ak pwochen etap",
      items: [
        { h: "Bay fanmi yo fòs", p: "Prepare fanmi yo pou yon detansyon san atann ak dokiman federal pare pou depoze." },
        { h: "Pwoteksyon aksesib", p: "Patenarya yo pèmèt kredi bous pou moun ki pa ka peye frè enstalasyon an." },
        { h: "Patisipasyon senp", p: "Antre fasil ak yon wòl enfòmatif — san ekspozisyon legal pou òganizasyon w." },
        { h: "Pwochen etap", p: "Kontakte DetencionDefensa pou resevwa pakèt patenarya w ak kòd referans ou. Kòmanse ak yon lansman dousman nan kominote w." },
      ],
      contact: "Mande pakèt patenarya",
    },
  },
};
