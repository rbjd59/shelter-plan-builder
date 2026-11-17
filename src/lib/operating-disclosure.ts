/** Canonical trilingual company, Firm and privilege disclosures. */
export type DiscLang = "en" | "es" | "ht";

export const OPERATING_NOTICE: Record<DiscLang, string> = {
  en: "DetencionDefensa is a software-as-a-service (SaaS) platform owned by DETENCIONDEFENSACOM, INC., a Delaware technology company, and licensed to Sorrentino Law Firm, PLLC. The Firm pays the Company a flat monthly license fee, plus a fixed per-package fee for each property-information package the Company assembles (third-party valuations, broker price opinions, rent, mortgage and sale data that the Company purchases from outside providers). These fees are for technology and data services. They are not a share of any legal fee and do not depend on the outcome of any matter. DETENCIONDEFENSACOM, INC. is not a law firm and gives no legal advice. Sorrentino Law Firm, PLLC has sole control of, and sole responsibility for, all legal services, legal advice, legal content, and attorney-client relationships.",
  es: "DetencionDefensa es una plataforma de software como servicio (SaaS), propiedad de DETENCIONDEFENSACOM, INC., una empresa de tecnología de Delaware, y licenciada a Sorrentino Law Firm, PLLC. La Firma paga a la Empresa una tarifa mensual fija de licencia, más una tarifa fija por cada paquete de información sobre propiedades que la Empresa reúne (valoraciones de terceros, opiniones de precio de corredores y datos de alquiler, hipoteca y venta que la Empresa compra a proveedores externos). Estas tarifas son por servicios de tecnología y datos. No son una participación en ningún honorario legal y no dependen del resultado de ningún asunto. DETENCIONDEFENSACOM, INC. no es una firma de abogados y no brinda asesoramiento legal. Sorrentino Law Firm, PLLC tiene el control exclusivo y la responsabilidad exclusiva de todos los servicios legales, el asesoramiento legal, el contenido legal y las relaciones abogado-cliente.",
  ht: "DetencionDefensa se yon platfòm lojisyèl kòm sèvis (SaaS) ki pou DETENCIONDEFENSACOM, INC., yon konpayi teknoloji Delaware, epi ki bay Sorrentino Law Firm, PLLC yon lisans pou sèvi avè l. Kabinè a peye Konpayi an yon frè lisans fiks chak mwa, plis yon frè fiks pou chak pakè enfòmasyon sou pwopriyete Konpayi an rasanble (evalyasyon twazyèm pati, opinyon koutye sou pri, ak done sou lwaye, ipotèk ak vant Konpayi an achte nan men founisè deyò). Frè sa yo se pou sèvis teknoloji ak done. Yo pa yon pati nan okenn frè legal epi yo pa depann de rezilta okenn dosye. DETENCIONDEFENSACOM, INC. pa yon kabinè avoka epi li pa bay konsèy legal. Sorrentino Law Firm, PLLC gen kontwòl total ak responsablite total pou tout sèvis legal, konsèy legal, kontni legal ak relasyon avoka-kliyan.",
};

export const PRIVILEGE_NOTICE: Record<DiscLang, string> = {
  en: "Your intake is collected by DETENCIONDEFENSACOM, INC. acting only as the disclosed agent of Sorrentino Law Firm, PLLC, under the Firm's supervision and confidentiality obligations. Submitting information does not by itself create an attorney-client relationship or guarantee attorney-client privilege. An attorney-client relationship with the Firm begins when the Firm accepts your matter and you sign its limited-scope engagement letter.",
  es: "DETENCIONDEFENSACOM, INC. recopila su información de admisión únicamente como agente divulgado de Sorrentino Law Firm, PLLC, bajo la supervisión y las obligaciones de confidencialidad de la Firma. Enviar información no crea por sí solo una relación abogado-cliente ni garantiza el privilegio abogado-cliente. La relación abogado-cliente con la Firma comienza cuando la Firma acepta su asunto y usted firma su carta de contratación de alcance limitado.",
  ht: "DETENCIONDEFENSACOM, INC. kolekte enfòmasyon admisyon w sèlman kòm ajan deklare Sorrentino Law Firm, PLLC, anba sipèvizyon ak obligasyon konfidansyalite Kabinè a. Voye enfòmasyon pa kreye pou kont li yon relasyon avoka-kliyan ni garanti privilèj avoka-kliyan. Relasyon avoka-kliyan ak Kabinè a kòmanse lè Kabinè a aksepte dosye w epi ou siyen lèt angajman limite li a.",
};

export const PRIVILEGE_SCOPE: Record<DiscLang, string> = {
  en: "After the Firm accepts your matter and you sign the limited-scope engagement letter, attorney-client privilege may protect confidential communications about your matter under applicable law. It does not cover public browsing of marketing pages, and privilege can be lost if you share the same information with someone outside the Firm's team.",
  es: "Después de que la Firma acepta su asunto y usted firma la carta de contratación de alcance limitado, el privilegio abogado-cliente puede proteger las comunicaciones confidenciales sobre su asunto según la ley aplicable. No cubre la navegación pública de páginas informativas, y el privilegio puede perderse si comparte la misma información con alguien fuera del equipo de la Firma.",
  ht: "Apre Kabinè a aksepte dosye w epi ou siyen lèt angajman limite a, privilèj avoka-kliyan ka pwoteje kominikasyon konfidansyèl sou dosye w dapre lalwa ki aplike. Li pa kouvri navigasyon piblik sou paj enfòmasyon yo, epi privilèj la ka pèdi si w pataje menm enfòmasyon an ak yon moun deyò ekip Kabinè a.",
};

export const LANGUAGE_EDITION_NOTICE: Record<DiscLang, string> = {
  en: "ListoAhora.org (Spanish) and PareKounya.org (Haitian Kreyòl) are language editions of the DetencionDefensa platform.",
  es: "ListoAhora.org (español) y PareKounya.org (kreyòl haitiano) son ediciones por idioma de la plataforma DetencionDefensa.",
  ht: "ListoAhora.org (panyòl) ak PareKounya.org (kreyòl ayisyen) se vèsyon nan diferan lang platfòm DetencionDefensa a.",
};

export const HOME_TRUST_AD_NOTICE: Record<DiscLang, string> = {
  en: "Save My Home Trust trust documents are prepared and reviewed by Sorrentino Law Firm, PLLC. Client payments are made to the Firm and held in its Florida IOLTA trust account. The Firm pays DETENCIONDEFENSACOM, INC. a fixed fee for the property-information package used for each trust. You are never required to use any advertised service or any particular attorney, and you may choose other providers.",
  es: "Los documentos de fideicomiso de Save My Home Trust son preparados y revisados por Sorrentino Law Firm, PLLC. Los pagos de los clientes se hacen a la Firma y se mantienen en su cuenta fiduciaria IOLTA de Florida. La Firma paga a DETENCIONDEFENSACOM, INC. una tarifa fija por el paquete de información sobre propiedades utilizado para cada fideicomiso. Usted nunca está obligado a usar ningún servicio anunciado ni ningún abogado en particular, y puede elegir otros proveedores.",
  ht: "Se Sorrentino Law Firm, PLLC ki prepare epi revize dokiman fidisyè Save My Home Trust yo. Kliyan yo peye Kabinè a, epi lajan yo rete nan kont fidisyè IOLTA li nan Florid. Kabinè a peye DETENCIONDEFENSACOM, INC. yon frè fiks pou pakè enfòmasyon sou pwopriyete ki sèvi pou chak fidisyè. Ou pa janm oblije sèvi ak okenn sèvis ki anonse ni okenn avoka an patikilye, epi ou ka chwazi lòt founisè.",
};

export const OPERATING_NOTICE_LONG = OPERATING_NOTICE;
export const ROLE_NOTICE = OPERATING_NOTICE;
export const PRIVILEGE_HEADING: Record<DiscLang, string> = {
  en: "Confidentiality and attorney-client privilege",
  es: "Confidencialidad y privilegio abogado-cliente",
  ht: "Konfidansyalite ak privilèj avoka-kliyan",
};
