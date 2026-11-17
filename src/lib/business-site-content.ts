import type { Lang } from "@/context/LanguageContext";

export const TRADES: Record<Lang, string[]> = {
  en: ["Air conditioning / HVAC", "Landscaping", "Painting", "Cleaning", "Pressure washing", "Plumbing", "Lawn care", "Tree care", "Commercial cleaning", "Window cleaning", "Electrical work", "Pool service", "Junk removal", "Remodeling", "Construction", "Roofing", "Pest control", "Handyman"],
  es: ["Aire acondicionado / HVAC", "Jardinería", "Pintura", "Limpieza", "Lavado a presión", "Plomería", "Corte de césped", "Cuidado de árboles", "Limpieza comercial", "Limpieza de ventanas", "Trabajo eléctrico", "Servicio de piscinas", "Recogida de basura", "Remodelación", "Construcción", "Techos", "Control de plagas", "Reparaciones del hogar"],
  ht: ["Èkondisyone / HVAC", "Antreten jaden", "Penti", "Netwayaj", "Netwayaj anba presyon", "Plonbri", "Koupe gazon", "Antreten pye bwa", "Netwayaj biwo ak magazen", "Lave fenèt", "Travay elektrik", "Antreten pisin", "Rale fatra", "Renovasyon", "Konstriksyon", "Twati", "Kontwòl ensèk ak rat", "Tout kalite ti reparasyon"],
};

export type BusinessSiteCopy = {
  skip: string;
  navValue: string;
  navTools: string;
  navHelp: string;
  navCosts: string;
  call: string;
  eyebrow: string;
  heroTitle: string;
  heroBody: string;
  valueButton: string;
  toolsButton: string;
  freeNote: string;
  imageAlt: string;
  keep: string;
  sell: string;
  family: string;
  tradesTitle: string;
  tradesBody: string;
  cashNote: string;
  valueTitle: string;
  valueBody: string;
  exampleTitle: string;
  exampleBody: string;
  marketLinks: string;
  videoTitle: string;
  videoBody: string;
  defenseLink: string;
  toolsTitle: string;
  toolsBody: string;
  localNote: string;
  planTitle: string;
  planBody: string;
  steps: { title: string; body: string }[];
  structureTitle: string;
  structureSteps: { title: string; body: string }[];
  structureNote: string;
  paymentsTitle: string;
  paymentsBody: string;
  squareLink: string;
  paypalLink: string;
  costsTitle: string;
  costsBody: string;
  monthlyPrice: string;
  monthlyLabel: string;
  included: string[];
  trustTitle: string;
  trustBody: string;
  directorTitle: string;
  directorBody: string;
  brokerTitle: string;
  brokerBody: string;
  costsNote: string;
  helpTitle: string;
  helpBody: string;
  text: string;
  ai: string;
  disclosureTitle: string;
  disclosures: string[];
};

export const BUSINESS_SITE_COPY: Record<Lang, BusinessSiteCopy> = {
  en: {
    skip: "Skip to free tools", navValue: "What is it worth?", navTools: "Free tools", navHelp: "How we help", navCosts: "Costs", call: "Call now",
    eyebrow: "For people who may have to leave the United States", heroTitle: "Don’t leave your business behind.",
    heroBody: "Your customers, tools, and hard work may be worth money. We help you keep clear records, run your business from another country, let family run it, or sell it.",
    valueButton: "See what it may be worth", toolsButton: "Use the free tools", freeNote: "Free tools. No card needed.", imageAlt: "A lawn-care business owner beside his work truck and tools",
    keep: "Run it from abroad", sell: "Sell it", family: "Let family run it", tradesTitle: "Your work can be a real business.",
    tradesBody: "You may not call it a business. You may just say you cut lawns, clean homes, or fix air conditioners. If people pay you for the work, this site is for you.",
    cashNote: "Cash jobs are okay. You do not need perfect records today. Start writing down each job now. A clear history can help a buyer understand what you built.",
    valueTitle: "What could your business be worth?", valueBody: "Use your own numbers. This gives you a simple starting range, not a promise or a formal appraisal.",
    exampleTitle: "A buyer looks for proof.", exampleBody: "Repeat customers, money left after costs, tools, job photos, and clear records can make a business easier to sell. A buyer also checks licenses, contracts, debts, and whether the business can run without you.",
    marketLinks: "See real businesses for sale and learn how brokers think about value:", videoTitle: "Watch: your work may have value", videoBody: "This video explains why you should not walk away from the customers and tools you worked hard to get.",
    defenseLink: "Go to the Detención Defensa questionnaire", toolsTitle: "Free tools to build your history", toolsBody: "Price a job. Save each customer and work date. Add job photos. Make an invoice or receipt. Download your records.",
    localNote: "Your free-tool records stay in this browser. Download your records often. Do not put bank passwords or Social Security numbers here.",
    planTitle: "We help you turn daily work into a business.", planBody: "You do not have to figure it out alone. A paralegal helps you one step at a time. An attorney reviews the legal setup.",
    steps: [
      { title: "Write down the work", body: "List customers, dates, prices, workers, tools, and costs. Take a photo of every job." },
      { title: "Set up the company", body: "We help with a Florida C corporation and an EIN. You pay the state filing cost. Then the company can keep its own records and payment account." },
      { title: "Protect the ownership", body: "The business can be owned by a trust. If you already have a home trust, the attorney reviews whether the same trust can be used." },
      { title: "Sell it or keep it running", body: "We train you and your team. You can prepare for a sale, run the company from abroad, or have a trusted person run it here." },
    ],
    structureTitle: "How the business setup works",
    structureSteps: [
      { title: "Your work becomes a company", body: "Your work becomes a Florida C corporation. The company keeps its own records and gets its own EIN." },
      { title: "Your trust owns the company", body: "Your trust owns the corporation. If you already have a home trust, the attorney checks whether that trust can own it." },
      { title: "An agent gets official mail", body: "A registered agent receives official mail for the company, so your home address is not listed publicly as the company's registered-agent address." },
      { title: "A director can help with paperwork", body: "A director can handle the company's paperwork if you have to leave." },
    ],
    structureNote: "Sorrentino Law Firm, PLLC may serve as registered agent or director under a separate written agreement. It includes a conflict disclosure that you sign. You may choose any other provider.",
    paymentsTitle: "Get paid in the company’s name", paymentsBody: "After the company is set up, we help you apply for a business payment account. Square can take cards and send invoices. PayPal is another option. You choose. The payment company must approve the account.",
    squareLink: "See Square for business", paypalLink: "See PayPal for business", costsTitle: "Clear costs. No big trust payment all at once.", costsBody: "The tools above are free. Paid setup help is optional. You get the full agreement before you pay.",
    monthlyPrice: "$199", monthlyLabel: "per month to start", included: ["Simple training and document help", "Help setting up the company and its records", "Customer, job, invoice, and receipt tools", "Help preparing the business to run or sell"],
    trustTitle: "$899 trust — pay monthly", trustBody: "The trust can be paid over time. If you have a home trust, the attorney checks whether the business can go in that same trust. Florida company filing costs and the registered agent’s fee are separate.",
    directorTitle: "$50 per month for a local director", directorBody: "If your setup needs a local director, this service is $50 per month. The registered agent is a separate third-party cost.",
    brokerTitle: "10% if a broker sells the business", brokerBody: "You must sign a separate broker agreement before the business is listed. If it sells, the commission is 10% of the sale price. The agreement explains who provides broker services and when payment is due.",
    costsNote: "No sale or business value is guaranteed. You do not have to buy a trust, company setup, director, or broker service to use the free tools.",
    helpTitle: "Talk to a real person now.", helpBody: "Tell us what work you do and what you want to happen to your business. We speak English, Spanish, and Haitian Creole.",
    text: "Text 305-773-7737", ai: "Ask the AI helper", disclosureTitle: "Important information",
    disclosures: [
      "Business value results are rough estimates from the numbers you enter. They are not appraisals, offers, or promises of a sale. A licensed broker or qualified valuation professional should review the business and its records.",
      "DETENCIONDEFENSACOM, INC. provides website technology, administration, development, distribution, and maintenance. It is not a law firm. Legal services and legal review are provided by Sorrentino Law Firm PLLC. Using this site does not make the firm your lawyer. Paid legal and structuring services are separate from the free tools.",
      "Trust and company documents may be drafted with AI and are reviewed by an attorney before use. Company, EIN, payment-account, registered-agent, director, and broker services may involve separate agreements and third-party approval or fees.",
    ],
  },
  es: {
    skip: "Ir a las herramientas gratis", navValue: "¿Cuánto vale?", navTools: "Herramientas gratis", navHelp: "Cómo ayudamos", navCosts: "Costos", call: "Llame ahora",
    eyebrow: "Para personas que tal vez tengan que salir de Estados Unidos", heroTitle: "No deje su negocio atrás.",
    heroBody: "Sus clientes, sus herramientas y su trabajo pueden valer dinero. Le ayudamos a llevar buenos registros, manejar su negocio desde otro país, dejar que su familia lo maneje o venderlo.",
    valueButton: "Vea cuánto podría valer", toolsButton: "Use las herramientas gratis", freeNote: "Herramientas gratis. No necesita tarjeta.", imageAlt: "Un dueño de negocio de jardinería junto a su camioneta y herramientas",
    keep: "Manéjelo desde otro país", sell: "Véndalo", family: "Deje que su familia lo maneje", tradesTitle: "Su trabajo puede ser un negocio de verdad.",
    tradesBody: "Tal vez usted no lo llama negocio. Solo dice que corta césped, limpia casas o arregla aires acondicionados. Si la gente le paga por su trabajo, este sitio es para usted.",
    cashNote: "Está bien si le pagan en efectivo. No necesita registros perfectos hoy. Empiece a anotar cada trabajo ahora. Un buen historial puede ayudar a un comprador a entender lo que usted construyó.",
    valueTitle: "¿Cuánto podría valer su negocio?", valueBody: "Use sus propios números. Esto le da una idea inicial, no una promesa ni una valuación formal.",
    exampleTitle: "Un comprador busca pruebas.", exampleBody: "Clientes que vuelven, dinero que queda después de los gastos, herramientas, fotos y buenos registros pueden hacer que el negocio sea más fácil de vender. El comprador también revisa licencias, contratos, deudas y si el negocio puede funcionar sin usted.",
    marketLinks: "Vea negocios reales a la venta y aprenda cómo los corredores calculan el valor:", videoTitle: "Vea: su trabajo puede tener valor", videoBody: "Este video explica por qué no debe abandonar los clientes y las herramientas que tanto le costó conseguir.",
    defenseLink: "Vaya al cuestionario de Detención Defensa", toolsTitle: "Herramientas gratis para crear su historial", toolsBody: "Calcule un precio. Guarde cada cliente y fecha de trabajo. Agregue fotos. Haga una factura o un recibo. Descargue sus registros.",
    localNote: "Los registros de las herramientas gratis quedan en este navegador. Descárguelos con frecuencia. No escriba claves de banco ni números de Seguro Social aquí.",
    planTitle: "Le ayudamos a convertir su trabajo diario en un negocio.", planBody: "No tiene que hacerlo solo. Un asistente legal le ayuda paso a paso. Un abogado revisa la parte legal.",
    steps: [
      { title: "Anote el trabajo", body: "Haga una lista de clientes, fechas, precios, trabajadores, herramientas y gastos. Tome una foto de cada trabajo." },
      { title: "Forme la compañía", body: "Le ayudamos con una corporación C de Florida y un número EIN. Usted paga el costo del estado. La compañía puede tener sus propios registros y cuenta de pagos." },
      { title: "Proteja quién es dueño", body: "Un fideicomiso puede ser dueño del negocio. Si ya tiene un fideicomiso para su casa, el abogado revisa si se puede usar el mismo." },
      { title: "Véndalo o siga trabajando", body: "Capacitamos a usted y a su equipo. Puede preparar el negocio para venderlo, manejarlo desde otro país o dejar que una persona de confianza lo maneje aquí." },
    ],
    structureTitle: "Cómo funciona la estructura del negocio",
    structureSteps: [
      { title: "Su trabajo se convierte en una compañía", body: "Su trabajo se convierte en una corporación C de Florida. La compañía lleva sus propios registros y obtiene su propio número EIN." },
      { title: "Su fideicomiso es dueño de la compañía", body: "Su fideicomiso es dueño de la corporación. Si ya tiene un fideicomiso para su casa, el abogado revisa si ese mismo fideicomiso puede ser dueño." },
      { title: "Un agente recibe el correo oficial", body: "Un agente registrado recibe el correo oficial de la compañía. Así, su dirección de casa no aparece públicamente como la dirección del agente registrado." },
      { title: "Un director puede ayudar con los documentos", body: "Un director puede encargarse de los documentos de la compañía si usted tiene que salir." },
    ],
    structureNote: "Sorrentino Law Firm, PLLC puede servir como agente registrado o director mediante un acuerdo escrito separado. El acuerdo incluye una divulgación de conflicto que usted firma. Puede elegir cualquier otro proveedor.",
    paymentsTitle: "Reciba el dinero a nombre de la compañía", paymentsBody: "Después de formar la compañía, le ayudamos a pedir una cuenta de pagos del negocio. Square puede aceptar tarjetas y enviar facturas. PayPal es otra opción. Usted elige. La compañía de pagos debe aprobar la cuenta.",
    squareLink: "Vea Square para negocios", paypalLink: "Vea PayPal para negocios", costsTitle: "Costos claros. No pague todo el fideicomiso de una vez.", costsBody: "Las herramientas son gratis. La ayuda para formar el negocio es opcional. Usted recibe el acuerdo completo antes de pagar.",
    monthlyPrice: "$199", monthlyLabel: "al mes para empezar", included: ["Capacitación fácil y ayuda con documentos", "Ayuda para formar la compañía y llevar registros", "Herramientas de clientes, trabajos, facturas y recibos", "Ayuda para preparar el negocio para operar o vender"],
    trustTitle: "Fideicomiso de $899 — pague por mes", trustBody: "El fideicomiso se puede pagar poco a poco. Si tiene uno para su casa, el abogado revisa si el negocio puede entrar en el mismo. Los costos del estado y del agente registrado se pagan por separado.",
    directorTitle: "$50 al mes por un director local", directorBody: "Si su negocio necesita un director local, este servicio cuesta $50 al mes. El agente registrado es un costo aparte de otra compañía.",
    brokerTitle: "10% si un corredor vende el negocio", brokerBody: "Debe firmar un acuerdo de corredor antes de poner el negocio a la venta. Si se vende, la comisión es 10% del precio de venta. El acuerdo explica quién da el servicio y cuándo se paga.",
    costsNote: "No garantizamos una venta ni un valor. No tiene que comprar un fideicomiso, una compañía, un director o un corredor para usar las herramientas gratis.",
    helpTitle: "Hable con una persona ahora.", helpBody: "Díganos qué trabajo hace y qué quiere que pase con su negocio. Hablamos inglés, español y criollo haitiano.",
    text: "Texto al 305-773-7737", ai: "Pregunte al ayudante AI", disclosureTitle: "Información importante",
    disclosures: [
      "Los valores son estimados basados en los números que usted escribe. No son valuaciones formales, ofertas ni promesas de venta. Un corredor con licencia o un profesional de valuaciones debe revisar el negocio y sus registros.",
      "DETENCIONDEFENSACOM, INC. da servicios de tecnología, administración, desarrollo, distribución y mantenimiento del sitio. No es un bufete de abogados. Sorrentino Law Firm PLLC da los servicios legales y hace la revisión legal. Usar este sitio no hace que el bufete sea su abogado. Los servicios legales y de estructura se cobran aparte de las herramientas gratis.",
      "Los documentos del fideicomiso y de la compañía pueden prepararse con AI y un abogado los revisa antes de usarlos. La compañía, el EIN, la cuenta de pagos, el agente registrado, el director y el corredor pueden necesitar acuerdos, aprobaciones o pagos aparte.",
    ],
  },
  ht: {
    skip: "Ale nan zouti gratis yo", navValue: "Konben li vo?", navTools: "Zouti gratis", navHelp: "Kijan nou ede", navCosts: "Pri", call: "Rele kounye a",
    eyebrow: "Pou moun ki ka oblije kite Etazini", heroTitle: "Pa abandone biznis ou.",
    heroBody: "Kliyan ou, zouti ou, ak travay di ou ka vo lajan. Nou ede w kenbe bon rejis, dirije biznis la depi yon lòt peyi, kite fanmi w dirije l, oswa vann li.",
    valueButton: "Gade konben li ka vo", toolsButton: "Sèvi ak zouti gratis yo", freeNote: "Zouti gratis. Ou pa bezwen kat.", imageAlt: "Yon met biznis koupe gazon bò kamyon ak zouti travay li",
    keep: "Dirije l depi lòt peyi", sell: "Vann li", family: "Kite fanmi dirije l", tradesTitle: "Travay ou ka yon vrè biznis.",
    tradesBody: "Petèt ou pa rele l biznis. Ou ka di ou koupe gazon, netwaye kay, oswa repare èkondisyone. Si moun peye w pou travay la, sit sa a se pou ou.",
    cashNote: "Se pa pwoblèm si yo peye w kach. Ou pa bezwen papye pafè jodi a. Kòmanse ekri chak travay kounye a. Yon bon listwa ka ede yon achtè konprann sa ou bati a.",
    valueTitle: "Konben biznis ou ka vo?", valueBody: "Sèvi ak chif pa ou. Sa ba w yon lide kòmansman, se pa yon pwomès oswa yon evalyasyon ofisyèl.",
    exampleTitle: "Yon achtè chèche prèv.", exampleBody: "Kliyan ki tounen souvan, lajan ki rete apre depans, zouti, foto ak bon rejis ka fè biznis la pi fasil pou vann. Achtè a tcheke lisans, kontra, dèt, ak si biznis la ka mache san ou.",
    marketLinks: "Gade vrè biznis ki pou vann epi aprann kijan koutye kalkile valè:", videoTitle: "Gade: travay ou ka gen valè", videoBody: "Videyo sa a eksplike poukisa ou pa dwe abandone kliyan ak zouti ou te travay di pou jwenn yo.",
    defenseLink: "Ale nan kesyonè Detención Defensa a", toolsTitle: "Zouti gratis pou bati listwa biznis ou", toolsBody: "Kalkile pri yon travay. Sove chak kliyan ak dat travay. Mete foto. Fè yon fakti oswa resi. Telechaje rejis ou yo.",
    localNote: "Rejis zouti gratis yo rete nan navigatè sa a. Telechaje yo souvan. Pa mete modpas labank oswa nimewo Sekirite Sosyal isit la.",
    planTitle: "Nou ede w fè travay chak jou a tounen yon biznis.", planBody: "Ou pa oblije fè sa pou kont ou. Yon asistan legal ede w pa etap. Yon avoka revize pati legal la.",
    steps: [
      { title: "Ekri travay la", body: "Fè lis kliyan, dat, pri, travayè, zouti ak depans. Pran yon foto pou chak travay." },
      { title: "Fòme konpani an", body: "Nou ede w ak yon kòporasyon C nan Florid ak yon nimewo EIN. Ou peye frè eta a. Konpani an ka gen pwòp rejis ak kont peman li." },
      { title: "Pwoteje moun ki met biznis la", body: "Yon fidisi ka met biznis la. Si ou gen yon fidisi pou kay ou deja, avoka a tcheke si ou ka sèvi ak menm fidisi a." },
      { title: "Vann li oswa kite l mache", body: "Nou fòme ou ansanm ak ekip ou. Ou ka prepare biznis la pou vann, dirije l depi lòt peyi, oswa kite yon moun ou fè konfyans dirije l isit la." },
    ],
    structureTitle: "Kijan estrikti biznis la mache",
    structureSteps: [
      { title: "Travay ou a tounen yon konpayi", body: "Travay ou a tounen yon kòporasyon C nan Florid. Konpayi an kenbe pwòp rejis li epi li jwenn pwòp nimewo EIN li." },
      { title: "Fidisi ou a se met konpayi an", body: "Fidisi ou a se met kòporasyon an. Si ou gen yon fidisi pou kay ou deja, avoka a tcheke si menm fidisi sa a ka met konpayi an." },
      { title: "Yon ajan resevwa lèt ofisyèl", body: "Yon ajan anrejistre resevwa lèt ofisyèl pou konpayi an. Konsa, adrès kay ou pa parèt piblikman kòm adrès ajan anrejistre konpayi an." },
      { title: "Yon direktè ka ede ak papye yo", body: "Yon direktè ka okipe papye konpayi an si ou oblije ale." },
    ],
    structureNote: "Sorrentino Law Firm, PLLC ka sèvi kòm ajan anrejistre oswa direktè ak yon kontra ekri apa. Kontra a gen yon divilgasyon konfli ou dwe siyen. Ou ka chwazi nenpòt lòt founisè.",
    paymentsTitle: "Resevwa lajan nan non konpani an", paymentsBody: "Apre konpani an fòme, nou ede w mande yon kont peman pou biznis la. Square ka pran kat epi voye fakti. PayPal se yon lòt chwa. Se ou ki chwazi. Konpani peman an dwe apwouve kont lan.",
    squareLink: "Gade Square pou biznis", paypalLink: "Gade PayPal pou biznis", costsTitle: "Pri klè. Ou pa oblije peye tout fidisi a yon sèl kou.", costsBody: "Zouti yo gratis. Èd pou fòme biznis la se yon chwa. Ou jwenn tout kontra a anvan ou peye.",
    monthlyPrice: "$199", monthlyLabel: "pa mwa pou kòmanse", included: ["Fòmasyon senp ak èd ak papye", "Èd pou fòme konpani an epi kenbe rejis", "Zouti pou kliyan, travay, fakti ak resi", "Èd pou prepare biznis la pou mache oswa pou vann"],
    trustTitle: "Fidisi $899 — peye pa mwa", trustBody: "Ou ka peye fidisi a ti kras pa ti kras. Si ou gen yon fidisi pou kay ou, avoka a tcheke si biznis la ka antre nan menm fidisi a. Frè eta a ak frè ajan anrejistre a se apa.",
    directorTitle: "$50 pa mwa pou yon direktè lokal", directorBody: "Si biznis ou bezwen yon direktè lokal, sèvis sa a koute $50 pa mwa. Ajan anrejistre a se yon lòt frè yon twazyèm konpani.",
    brokerTitle: "10% si yon koutye vann biznis la", brokerBody: "Ou dwe siyen yon kontra koutye apa anvan yo mete biznis la pou vann. Si li vann, komisyon an se 10% pri vant la. Kontra a di ki moun ki bay sèvis koutye a ak ki lè pou peye.",
    costsNote: "Nou pa garanti vant oswa valè biznis la. Ou pa oblije achte fidisi, konpani, direktè oswa sèvis koutye pou sèvi ak zouti gratis yo.",
    helpTitle: "Pale ak yon moun kounye a.", helpBody: "Di nou ki travay ou fè ak sa ou vle ki rive biznis ou. Nou pale angle, panyòl ak kreyòl ayisyen.",
    text: "Voye mesaj nan 305-773-7737", ai: "Poze èd AI a yon kesyon", disclosureTitle: "Enfòmasyon enpòtan",
    disclosures: [
      "Valè yo se estimasyon ki soti nan chif ou mete yo. Se pa evalyasyon ofisyèl, òf, oswa pwomès vant. Yon koutye ki gen lisans oswa yon pwofesyonèl nan evalyasyon dwe revize biznis la ak rejis li yo.",
      "DETENCIONDEFENSACOM, INC. bay teknoloji sit wèb la, administrasyon, devlopman, distribisyon ak antreten. Se pa yon biwo avoka. Sorrentino Law Firm PLLC bay sèvis legal ak revizyon legal. Sèvi ak sit sa a pa fè biwo a tounen avoka ou. Sèvis legal ak estrikti yo peye apa zouti gratis yo.",
      "Yo ka prepare papye fidisi ak konpani yo ak AI epi yon avoka revize yo anvan yo sèvi ak yo. Konpani, EIN, kont peman, ajan anrejistre, direktè ak koutye ka mande kontra, apwobasyon oswa frè apa.",
    ],
  },
};
