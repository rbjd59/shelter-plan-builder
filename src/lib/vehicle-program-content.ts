import type { Lang } from "@/context/LanguageContext";

export type VehicleCopy = {
  metaTitle: string;
  metaDescription: string;
  navHome: string;
  navHow: string;
  navProtections: string;
  navFaq: string;
  heroTitle: string;
  heroSub: string;
  status: string;
  primaryCta: string;
  watchCta: string;
  disclosure: string;
  videoTitle: string;
  videoNote: string;
  clockTitle: string;
  clockBody: string;
  clockCards: { title: string; body: string }[];
  howTitle: string;
  howSteps: { title: string; body: string }[];
  situationsTitle: string;
  situations: { title: string; body: string }[];
  protectionsTitle: string;
  protections: { title: string; body: string }[];
  signingTitle: string;
  signingIntro: string;
  signing: { title: string; body: string }[];
  faqTitle: string;
  faqs: { q: string; a: string }[];
  finalTitle: string;
  finalBody: string;
  dealerLink: string;
};

export const VEHICLE_PROGRAM_COPY: Record<Lang, VehicleCopy> = {
  en: {
    metaTitle: "Don't Lose Your Car — Vehicle Rescue Add-On | DetencionDefensa",
    metaDescription: "Plan ahead for a towed or impounded car. Learn about retrieval, a written minimum-price offer, your right to refuse, and direct payment to your chosen person.",
    navHome: "Home",
    navHow: "How it works",
    navProtections: "Your protections",
    navFaq: "Questions",
    heroTitle: "Don't Lose Your Car",
    heroSub: "Add a vehicle plan to your free DetencionDefensa plan before a tow, detention or departure leaves your family with growing fees.",
    status: "Program documents are in final attorney review. You can sign up now; we will contact you before anything is signed.",
    primaryCta: "Add my vehicle to my free plan",
    watchCta: "Watch the video",
    disclosure: "The partner dealer pays DetencionDefensa a referral fee for each vehicle it accepts. You pay us nothing, and the fee is not taken from your money. No sale or price is guaranteed beyond the Guaranteed Minimum Price. DetencionDefensa is not a motor vehicle dealer.",
    videoTitle: "See how Don't Lose Your Car works",
    videoNote: "People and scenes in this video are illustrative, not actual clients.",
    clockTitle: "The clock is running",
    clockBody: "After a traffic stop and detention, a towed car can sit unclaimed. Storage fees may grow each day. Under Florida's towing-lien law, a yard can sell an unclaimed car more than 3 years old after 35 days; newer cars have a longer timeline. The exact deadline and process depend on the vehicle and the notices required by law.",
    clockCards: [
      { title: "The tow", body: "The car goes to a tow yard. Your family may not know where it is or what papers the yard needs." },
      { title: "Daily storage", body: "Yard charges can grow every day the car stays there. Waiting can leave less money for your family." },
      { title: "A possible sale", body: "An unclaimed car can eventually be sold under the towing-lien process. Planning ahead gives your family clear instructions." },
    ],
    howTitle: "How it works",
    howSteps: [
      { title: "Enroll and pre-sign", body: "Check 'I have a vehicle' in your free plan. When the reviewed documents are ready, sign the authorizations and choose your Designated Contact." },
      { title: "Report what happened", body: "Tell us about a detention, impound or departure, or make a written request. Do not send immigration-status details through the dealer form." },
      { title: "We locate the car", body: "We work with you, your contact and a licensed independent Florida partner dealer to find the vehicle and check any release hold." },
      { title: "Viability check within 24 hours", body: "We compare the likely sale money with towing, storage, any loan payoff and fixed transport. If you would not receive the set minimum net, we do not pick up the car and we show you the math." },
      { title: "Retrieval within 48–72 hours", body: "If the numbers work and release is allowed, the partner dealer retrieves the car quickly so storage fees stop growing." },
      { title: "Written offer — you decide", body: "Your Designated Contact gets photos, a condition report, the benchmark and a written offer within 24 hours of retrieval. You may refuse within 48 hours. If you accept, the dealer pays your chosen person directly." },
    ],
    situationsTitle: "Three situations we plan for",
    situations: [
      { title: "Towed after detention", body: "A traffic stop leads to detention and the car is impounded. Your pre-signed instructions help the dealer act without waiting for you to sign from detention." },
      { title: "Selling from detention", body: "You need money for family needs or an approved commissary deposit. A written benchmark and offer help you avoid a rushed, unexplained price." },
      { title: "Leaving the U.S.", body: "Before departure, you can ask for a review instead of selling in a hurry without knowing the wholesale benchmark or where the money will go." },
    ],
    protectionsTitle: "Your protections",
    protections: [
      { title: "A viability test first", body: "The default minimum net to you is $500 after towing and storage, any loan payoff and fixed transport. If the sale would leave less than the set minimum, we do not pick up the car and we show your family the math." },
      { title: "Photos and a written offer", body: "Within 24 hours of retrieval, your Designated Contact receives photos, a condition report, the wholesale auction benchmark printout and a written offer. You have 48 hours to refuse." },
      { title: "Your money goes to your chosen person", body: "The dealer pays your family member, an approved commissary or trust-account deposit service, or the law firm trust account, as you direct. The money never passes through DetencionDefensa." },
      { title: "Cancel before a sale", body: "You can cancel at any time before a sale. The written documents explain how to revoke your instructions." },
    ],
    signingTitle: "What you'll sign",
    signingIntro: "These documents are being reviewed. We will contact you before you sign anything. The final packet may depend on your title, lender and vehicle.",
    signing: [
      { title: "Vehicle Rescue Agreement — Schedules A–D", body: "Schedule A covers the price guarantee; B directs the proceeds; C gives instructions to the agent; and D is the revocation form." },
      { title: "Florida HSMV 82053 power of attorney", body: "Or HSMV 82995 secure power of attorney when the lender holds the title or the title is lost." },
      { title: "HSMV 82993 odometer disclosure", body: "Used when the vehicle and transaction require an odometer statement." },
      { title: "HSMV 82050 notice of sale and bill of sale", body: "Records the sale and provides the required notice." },
      { title: "Notarized impound-release authorization", body: "Gives the named person authority to request release of the impounded vehicle, subject to the yard and any legal hold." },
    ],
    faqTitle: "Questions about your car",
    faqs: [
      { q: "What does this cost me?", a: "You pay DetencionDefensa $0. The partner dealer pays us a referral fee for each vehicle it accepts. That fee is not taken from your money. The sale math still accounts for towing, storage, any loan payoff and fixed transport." },
      { q: "What if I still owe money on the car?", a: "Tell us about the loan. Any payoff is part of the viability math. If the remaining money would be below the set minimum net, we do not pick up the car and we show you the numbers." },
      { q: "What if the car is worth less than the fees?", a: "We do not pick it up under this program. Your family sees the math and can decide what to do next without a sale pressure." },
      { q: "Can I change my mind?", a: "Yes. You may cancel before a sale. After retrieval, you may refuse the written offer within 48 hours. The documents explain any yard or transport charges that may still belong to you." },
      { q: "Who gets the money?", a: "The dealer pays the person or account you choose: a family member, an approved facility deposit service for commissary or trust, or the law firm trust account. DetencionDefensa does not hold or forward your sale money." },
      { q: "What if police or another agency has a hold on the car?", a: "The dealer cannot retrieve a vehicle until the hold is released and the yard allows release. We will tell your Designated Contact rather than promise a pickup date." },
      { q: "Do I need my title?", a: "Usually, the title is needed for a sale. If a lender holds it or it is lost, the reviewed packet may use the secure power-of-attorney process and other title steps. We will explain what applies before you sign." },
      { q: "Which dealer would buy the car?", a: "A licensed independent Florida dealer that signed our Dealer Participation Agreement. The dealer must follow the price, reporting, payment and audit rules. You may choose not to accept the dealer's offer." },
      { q: "Is the price guaranteed?", a: "No sale or price is guaranteed beyond the written Guaranteed Minimum Price. That minimum is the wholesale auction benchmark on retrieval day, adjusted only for documented condition items with photos." },
      { q: "How quickly can the car be picked up?", a: "After a report, the viability check is targeted within 24 hours and retrieval within 48–72 hours when release is allowed. A legal hold, missing papers or yard rules can delay retrieval." },
    ],
    finalTitle: "Your car. Your money. Your family.",
    finalBody: "Add the vehicle plan to your free DetencionDefensa plan now. We will contact you before any reviewed document is signed.",
    dealerLink: "For dealers",
  },
  es: {
    metaTitle: "No Pierdas Tu Carro — Plan de rescate de vehículos | DetencionDefensa",
    metaDescription: "Planifique para un carro remolcado o incautado. Conozca la recuperación, la oferta escrita con precio mínimo, su derecho a rechazar y el pago directo a quien usted elija.",
    navHome: "Inicio",
    navHow: "Cómo funciona",
    navProtections: "Sus protecciones",
    navFaq: "Preguntas",
    heroTitle: "No Pierdas Tu Carro",
    heroSub: "Añada un plan para su vehículo a su plan gratis de DetencionDefensa antes de que una grúa, una detención o una salida deje a su familia con cargos crecientes.",
    status: "Los documentos del programa están en revisión legal final. Puede inscribirse ahora; nos comunicaremos con usted antes de que se firme nada.",
    primaryCta: "Añadir mi vehículo a mi plan gratis",
    watchCta: "Ver el video",
    disclosure: "El concesionario asociado paga a DetencionDefensa una tarifa de referencia por cada vehículo que acepta. Usted no nos paga nada, y la tarifa no se descuenta de su dinero. No se garantiza ninguna venta ni precio más allá del Precio Mínimo Garantizado. DetencionDefensa no es un concesionario de vehículos de motor.",
    videoTitle: "Vea cómo funciona No Pierdas Tu Carro",
    videoNote: "Las personas y escenas de este video son ilustrativas; no son clientes reales.",
    clockTitle: "El tiempo corre",
    clockBody: "Después de una parada de tráfico y una detención, un carro remolcado puede quedar sin reclamar. Los cargos de almacenaje pueden aumentar cada día. Según la ley de Florida sobre gravámenes de remolque, el lote puede vender un carro sin reclamar de más de 3 años después de 35 días; los carros más nuevos tienen un plazo más largo. El plazo y el proceso exactos dependen del vehículo y de los avisos que exige la ley.",
    clockCards: [
      { title: "La grúa", body: "El carro va a un lote. Su familia puede no saber dónde está ni qué documentos pide el lote." },
      { title: "Almacenaje diario", body: "Los cargos del lote pueden aumentar cada día que el carro permanece allí. Esperar puede dejar menos dinero para su familia." },
      { title: "Una posible venta", body: "Un carro sin reclamar puede llegar a venderse bajo el proceso de gravamen de remolque. Planificar da instrucciones claras a su familia." },
    ],
    howTitle: "Cómo funciona",
    howSteps: [
      { title: "Inscríbase y firme por adelantado", body: "Marque 'Tengo un vehículo' en su plan gratis. Cuando los documentos revisados estén listos, firme las autorizaciones y elija su Contacto Designado." },
      { title: "Informe lo que pasó", body: "Avísenos sobre una detención, un depósito o una salida, o haga una solicitud escrita. No envíe datos de estatus migratorio por el formulario para concesionarios." },
      { title: "Localizamos el carro", body: "Trabajamos con usted, su contacto y un concesionario independiente autorizado de Florida para encontrar el vehículo y revisar cualquier retención." },
      { title: "Revisión de viabilidad dentro de 24 horas", body: "Comparamos el posible dinero de la venta con el remolque, almacenaje, pago del préstamo y transporte fijo. Si usted no recibiría el mínimo neto establecido, no recogemos el carro y le mostramos los cálculos." },
      { title: "Recuperación dentro de 48–72 horas", body: "Si los números funcionan y el lote permite la entrega, el concesionario asociado recoge el carro rápido para que los cargos dejen de aumentar." },
      { title: "Oferta escrita — usted decide", body: "Su Contacto Designado recibe fotos, un informe, el valor de referencia y una oferta escrita dentro de 24 horas de la recuperación. Puede rechazarla dentro de 48 horas. Si acepta, el concesionario paga directamente a quien usted elija." },
    ],
    situationsTitle: "Tres situaciones para las que planificamos",
    situations: [
      { title: "Remolcado después de una detención", body: "Una parada de tráfico lleva a una detención y el carro va al depósito. Sus instrucciones firmadas ayudan al concesionario a actuar sin esperar una firma desde la detención." },
      { title: "Vender desde la detención", body: "Necesita dinero para su familia o un depósito autorizado de comisaría. Un valor de referencia y una oferta escrita ayudan a evitar un precio apurado y sin explicación." },
      { title: "Salir de Estados Unidos", body: "Antes de salir, puede pedir una revisión en lugar de vender apurado sin conocer el valor de subasta ni a dónde irá el dinero." },
    ],
    protectionsTitle: "Sus protecciones",
    protections: [
      { title: "Primero, una prueba de viabilidad", body: "El mínimo neto para usted es $500 por defecto después del remolque, almacenaje, pago del préstamo y transporte fijo. Si la venta dejaría menos del mínimo establecido, no recogemos el carro y mostramos los cálculos a su familia." },
      { title: "Fotos y una oferta escrita", body: "Dentro de 24 horas de la recuperación, su Contacto Designado recibe fotos, un informe de condición, el comprobante del valor de subasta mayorista y una oferta escrita. Tiene 48 horas para rechazarla." },
      { title: "Su dinero va a quien usted elija", body: "El concesionario paga a su familiar, al servicio autorizado del centro para depósitos de comisaría o fideicomiso, o a la cuenta fiduciaria de la firma, según usted indique. El dinero nunca pasa por DetencionDefensa." },
      { title: "Cancele antes de una venta", body: "Puede cancelar en cualquier momento antes de una venta. Los documentos escritos explican cómo revocar sus instrucciones." },
    ],
    signingTitle: "Lo que firmará",
    signingIntro: "Estos documentos están siendo revisados. Nos comunicaremos con usted antes de que firme. El paquete final puede depender de su título, prestamista y vehículo.",
    signing: [
      { title: "Acuerdo de Rescate del Vehículo — Anexos A–D", body: "El Anexo A cubre la garantía de precio; B dirige el dinero; C da instrucciones al agente; y D es el formulario de revocación." },
      { title: "Poder HSMV 82053 de Florida", body: "O el poder seguro HSMV 82995 cuando el prestamista tiene el título o el título se perdió." },
      { title: "Declaración de odómetro HSMV 82993", body: "Se usa cuando el vehículo y la transacción exigen una declaración del odómetro." },
      { title: "Aviso de venta y factura de venta HSMV 82050", body: "Registra la venta y proporciona el aviso requerido." },
      { title: "Autorización notariada para liberar un vehículo", body: "Autoriza a la persona nombrada a pedir la entrega del vehículo, sujeta a las reglas del lote y a cualquier retención legal." },
    ],
    faqTitle: "Preguntas sobre su carro",
    faqs: [
      { q: "¿Cuánto me cuesta?", a: "Usted paga $0 a DetencionDefensa. El concesionario asociado nos paga una tarifa de referencia por cada vehículo que acepta. Esa tarifa no se descuenta de su dinero. El cálculo de la venta incluye remolque, almacenaje, pago del préstamo y transporte fijo." },
      { q: "¿Qué pasa si todavía debo dinero del carro?", a: "Infórmenos sobre el préstamo. El pago pendiente forma parte del cálculo. Si el dinero restante sería menor que el mínimo neto establecido, no recogemos el carro y le mostramos los números." },
      { q: "¿Qué pasa si el carro vale menos que los cargos?", a: "No lo recogemos bajo este programa. Su familia ve los cálculos y puede decidir qué hacer sin presión de venta." },
      { q: "¿Puedo cambiar de opinión?", a: "Sí. Puede cancelar antes de una venta. Después de la recuperación, puede rechazar la oferta escrita dentro de 48 horas. Los documentos explican cualquier cargo del lote o transporte que todavía pueda corresponderle." },
      { q: "¿Quién recibe el dinero?", a: "El concesionario paga a la persona o cuenta que usted elija: un familiar, un servicio autorizado del centro para comisaría o fideicomiso, o la cuenta fiduciaria de la firma. DetencionDefensa no guarda ni transfiere el dinero de su venta." },
      { q: "¿Qué pasa si la policía u otra agencia retiene el carro?", a: "El concesionario no puede recuperar el vehículo hasta que se levante la retención y el lote permita la entrega. Avisaremos a su Contacto Designado en lugar de prometer una fecha." },
      { q: "¿Necesito mi título?", a: "Por lo general, el título se necesita para vender. Si lo tiene el prestamista o se perdió, el paquete revisado puede usar el proceso de poder seguro y otros pasos de título. Explicaremos qué aplica antes de que firme." },
      { q: "¿Qué concesionario compraría el carro?", a: "Un concesionario independiente autorizado de Florida que haya firmado nuestro Acuerdo de Participación. Debe cumplir las reglas de precio, informes, pago y auditoría. Usted puede rechazar su oferta." },
      { q: "¿El precio está garantizado?", a: "No se garantiza ninguna venta ni precio más allá del Precio Mínimo Garantizado escrito. Ese mínimo es el valor de referencia de subasta mayorista el día de la recuperación, ajustado solo por daños documentados con fotos." },
      { q: "¿Qué tan rápido pueden recoger el carro?", a: "Después de un informe, la revisión de viabilidad tiene como meta 24 horas y la recuperación 48–72 horas cuando se permite la entrega. Una retención legal, documentos faltantes o reglas del lote pueden causar demoras." },
    ],
    finalTitle: "Su carro. Su dinero. Su familia.",
    finalBody: "Añada ahora el plan del vehículo a su plan gratis de DetencionDefensa. Nos comunicaremos con usted antes de firmar cualquier documento revisado.",
    dealerLink: "Para concesionarios",
  },
  ht: {
    metaTitle: "Pa Pèdi Machin Ou — Plan sekou pou machin | DetencionDefensa",
    metaDescription: "Planifye pou yon machin yo remòke oswa mete nan depo. Aprann sou rekipere machin, òf alekri ak pri minimòm, dwa pou w refize, ak peman dirèk bay moun ou chwazi a.",
    navHome: "Akèy",
    navHow: "Kijan li mache",
    navProtections: "Pwoteksyon ou yo",
    navFaq: "Kesyon",
    heroTitle: "Pa Pèdi Machin Ou",
    heroSub: "Ajoute yon plan pou machin ou nan plan gratis DetencionDefensa ou anvan yon remòkaj, yon detansyon oswa yon depa kite fanmi ou ak frè k ap monte.",
    status: "Dokiman pwogram nan nan dènye revizyon avoka a. Ou ka enskri kounye a; n ap kontakte w anvan yo siyen anyen.",
    primaryCta: "Ajoute machin mwen nan plan gratis mwen",
    watchCta: "Gade videyo a",
    disclosure: "Konsesyonè patnè a peye DetencionDefensa yon frè referans pou chak machin li aksepte. Ou pa peye nou anyen, epi frè a pa retire nan lajan ou. Okenn vant oswa pri pa garanti pi lwen pase Pri Minimòm Garanti a. DetencionDefensa pa yon konsesyonè machin.",
    videoTitle: "Gade kijan Pa Pèdi Machin Ou mache",
    videoNote: "Moun ak sèn nan videyo a se ilistrasyon; se pa vrè kliyan.",
    clockTitle: "Revèy la ap mache",
    clockBody: "Apre yon kontwòl trafik ak yon detansyon, yon machin yo remòke ka rete san moun pa al chèche li. Frè depo yo ka monte chak jou. Dapre lwa Florid sou privilej remòkaj, lakou a ka vann yon machin san moun pa reklame ki gen plis pase 3 an apre 35 jou; machin ki pi nèf yo gen plis tan. Dat limit ak pwosesis la depann de machin nan ak avi lalwa mande yo.",
    clockCards: [
      { title: "Remòkaj la", body: "Machin nan ale nan yon lakou remòkaj. Fanmi ou ka pa konn kote li ye oswa ki papye lakou a mande." },
      { title: "Frè depo chak jou", body: "Frè lakou a ka monte chak jou machin nan rete la. Rete tann ka kite mwens lajan pou fanmi ou." },
      { title: "Yon vant posib", body: "Yo ka vann yon machin san moun pa reklame dapre pwosesis privilej remòkaj la. Planifye davans bay fanmi ou enstriksyon klè." },
    ],
    howTitle: "Kijan li mache",
    howSteps: [
      { title: "Enskri epi siyen davans", body: "Make 'Mwen gen yon machin' nan plan gratis ou. Lè dokiman yo fin revize, siyen otorizasyon yo epi chwazi Kontak Ou Dezinye a." },
      { title: "Rapòte sa k pase", body: "Di nou si gen detansyon, depo oswa depa, oswa fè yon demann alekri. Pa voye detay estati imigrasyon nan fòm konsesyonè a." },
      { title: "Nou lokalize machin nan", body: "Nou travay avèk ou, kontak ou ak yon konsesyonè endepandan Florid ki gen lisans pou jwenn machin nan epi verifye si gen retansyon." },
      { title: "Tès viabilite nan 24 è", body: "Nou konpare lajan vant la ka bay ak frè remòkaj, depo, peman pre ak transpò fiks. Si ou pa ta resevwa minimòm nèt la, nou pa pran machin nan epi nou montre w kalkil la." },
      { title: "Rekuperasyon nan 48–72 è", body: "Si kalkil la mache epi yo pèmèt liberasyon, konsesyonè patnè a pran machin nan vit pou frè depo yo sispann monte." },
      { title: "Òf alekri — se ou ki deside", body: "Kontak Ou Dezinye a resevwa foto, rapò kondisyon, referans valè a ak yon òf alekri nan 24 è apre rekiperasyon. Ou ka refize nan 48 è. Si ou dakò, konsesyonè a peye moun ou chwazi a dirèkteman." },
    ],
    situationsTitle: "Twa sitiyasyon nou prepare pou yo",
    situations: [
      { title: "Yo remòke apre detansyon", body: "Yon kontwòl trafik mennen nan detansyon epi machin nan nan depo. Enstriksyon ou siyen davans yo ede konsesyonè a aji san li pa tann ou siyen nan detansyon." },
      { title: "Vann pandan detansyon", body: "Ou bezwen lajan pou fanmi ou oswa yon depo komisè ki apwouve. Yon referans valè ak yon òf alekri ede ou evite yon pri prese san esplikasyon." },
      { title: "Kite Etazini", body: "Anvan depa, ou ka mande yon revizyon olye ou vann prese san ou pa konn valè lavant ozanchè oswa kote lajan an prale." },
    ],
    protectionsTitle: "Pwoteksyon ou yo",
    protections: [
      { title: "Yon tès viabilite anvan", body: "Minimòm nèt la pou ou se $500 pa defo apre remòkaj, depo, peman pre ak transpò fiks. Si vant la ta kite mwens pase minimòm la, nou pa pran machin nan epi nou montre fanmi ou kalkil la." },
      { title: "Foto ak yon òf alekri", body: "Nan 24 è apre rekiperasyon, Kontak Ou Dezinye a resevwa foto, rapò kondisyon, fèy valè lavant ozanchè a ak yon òf alekri. Ou gen 48 è pou refize." },
      { title: "Lajan ou ale bay moun ou chwazi a", body: "Konsesyonè a peye manm fanmi ou, sèvis depo komisè oswa fidisi fasilite a apwouve, oswa kont fidisyè kabinè avoka a, jan ou endike. Lajan an pa janm pase nan men DetencionDefensa." },
      { title: "Anile anvan yon vant", body: "Ou ka anile nenpòt kilè anvan yon vant. Dokiman alekri yo esplike kijan pou ou revoke enstriksyon ou yo." },
    ],
    signingTitle: "Sa w pral siyen",
    signingIntro: "Yo ap revize dokiman sa yo. N ap kontakte w anvan ou siyen. Pakè final la ka depann de tit machin ou, prete a ak machin nan.",
    signing: [
      { title: "Akò Sekou pou Machin — Tablo A–D", body: "Tablo A kouvri garanti pri a; B endike ki moun ki resevwa lajan; C bay ajan an enstriksyon; epi D se fòm revokasyon an." },
      { title: "Pwokirasyon Florid HSMV 82053", body: "Oswa pwokirasyon sekirize HSMV 82995 lè prete a kenbe tit la oswa tit la pèdi." },
      { title: "Deklarasyon odomet HSMV 82993", body: "Yo sèvi ak li lè machin nan ak tranzaksyon an mande yon deklarasyon odomet." },
      { title: "Avi vant ak fèy vant HSMV 82050", body: "Li anrejistre vant la epi li bay avi obligatwa a." },
      { title: "Otorizasyon notarye pou liberasyon machin nan depo", body: "Li bay moun ou nonmen a otorite pou mande liberasyon machin nan, dapre règleman lakou a ak nenpòt retansyon legal." },
    ],
    faqTitle: "Kesyon sou machin ou",
    faqs: [
      { q: "Konbyen sa koute m?", a: "Ou peye DetencionDefensa $0. Konsesyonè patnè a peye nou yon frè referans pou chak machin li aksepte. Frè sa a pa soti nan lajan ou. Kalkil vant la gen ladan remòkaj, depo, peman pre ak transpò fiks." },
      { q: "E si m toujou dwe lajan sou machin nan?", a: "Di nou sou pre a. Peman pre a fè pati kalkil la. Si lajan ki rete a ta pi ba pase minimòm nèt la, nou pa pran machin nan epi nou montre w chif yo." },
      { q: "E si machin nan vo mwens pase frè yo?", a: "Nou pa pran li nan pwogram sa a. Fanmi ou wè kalkil la epi li ka deside kisa pou fè san presyon vant." },
      { q: "Èske m ka chanje lide?", a: "Wi. Ou ka anile anvan yon vant. Apre rekiperasyon, ou ka refize òf alekri a nan 48 è. Dokiman yo esplike nenpòt frè lakou oswa transpò ki ka rete pou ou." },
      { q: "Ki moun ki resevwa lajan an?", a: "Konsesyonè a peye moun oswa kont ou chwazi a: yon manm fanmi, yon sèvis depo fasilite a apwouve pou komisè oswa fidisi, oswa kont fidisyè kabinè avoka a. DetencionDefensa pa kenbe ni voye lajan vant ou a." },
      { q: "E si lapolis oswa yon lòt ajans mete retansyon sou machin nan?", a: "Konsesyonè a pa ka pran machin nan jiskaske yo leve retansyon an epi lakou a pèmèt liberasyon. N ap di Kontak Ou Dezinye a pito nou pwomèt yon dat." },
      { q: "Èske m bezwen tit machin mwen?", a: "Anjeneral, ou bezwen tit la pou vann. Si prete a gen li oswa li pèdi, pakè yo revize a ka sèvi ak pwosesis pwokirasyon sekirize a ak lòt etap pou tit. N ap esplike sa ki aplike anvan ou siyen." },
      { q: "Ki konsesyonè k ta achte machin nan?", a: "Yon konsesyonè endepandan Florid ki gen lisans epi ki siyen Akò Patisipasyon Konsesyonè nou an. Li dwe suiv règ pri, rapò, peman ak odit yo. Ou ka refize òf li a." },
      { q: "Èske pri a garanti?", a: "Okenn vant oswa pri pa garanti pi lwen pase Pri Minimòm Garanti a alekri. Minimòm sa a se valè referans lavant ozanchè jou rekiperasyon an, ajiste sèlman pou kondisyon ki gen dokiman ak foto." },
      { q: "Konbyen tan pou yo pran machin nan?", a: "Apre yon rapò, objektif tès viabilite a se 24 è ak rekiperasyon 48–72 è lè liberasyon posib. Yon retansyon legal, papye ki manke oswa règleman lakou a ka retade li." },
    ],
    finalTitle: "Machin ou. Lajan ou. Fanmi ou.",
    finalBody: "Ajoute plan machin nan nan plan gratis DetencionDefensa ou kounye a. N ap kontakte w anvan ou siyen nenpòt dokiman yo revize a.",
    dealerLink: "Pou konsesyonè yo",
  },
};

export const VEHICLE_HOME_COPY: Record<Lang, { title: string; body: string; link: string }> = {
  en: { title: "Have a car? Don't lose it.", body: "Add a vehicle rescue plan to your free DetencionDefensa plan.", link: "See Don't Lose Your Car" },
  es: { title: "¿Tiene un carro? No lo pierda.", body: "Añada un plan de rescate del vehículo a su plan gratis de DetencionDefensa.", link: "Vea No Pierdas Tu Carro" },
  ht: { title: "Ou gen yon machin? Pa pèdi li.", body: "Ajoute yon plan sekou pou machin nan plan gratis DetencionDefensa ou.", link: "Gade Pa Pèdi Machin Ou" },
};
