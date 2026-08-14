/**
 * Canonical, single-source trilingual disclosure copy for the license structure.
 *
 * Structure of record:
 * - DetencionDefensa.com, Inc. (Delaware) = technology developer and website/app
 *   operator. It owns the platform and licenses it to the Firm. It does not
 *   practice law and has no control over legal services.
 * - Sorrentino Law Firm PLLC (Florida) = operates this site under that license
 *   and has sole control and sole responsibility for all legal services, legal
 *   advice, legal content, and attorney-client relationships.
 *
 * Every page must use these strings (or the components that render them) so the
 * site never carries conflicting statements for The Florida Bar or the FTC.
 */

export type DiscLang = "en" | "es" | "ht";

/** One-line operating notice. Use anywhere a short footer/banner line is needed. */
export const OPERATING_NOTICE: Record<DiscLang, string> = {
  en: "This site is operated by Sorrentino Law Firm PLLC under license from DetencionDefensa.com, Inc. DetencionDefensa.com, Inc. is strictly the technology developer and website operator; the Firm has sole control of, and sole responsibility for, all legal services, legal advice, and legal content.",
  es: "Este sitio es operado por Sorrentino Law Firm PLLC bajo licencia de DetencionDefensa.com, Inc. DetencionDefensa.com, Inc. es estrictamente el desarrollador tecnológico y operador del sitio web; la Firma tiene el control exclusivo y la responsabilidad exclusiva de todos los servicios legales, el asesoramiento legal y el contenido legal.",
  ht: "Se Sorrentino Law Firm PLLC k ap opere sit sa a anba yon lisans DetencionDefensa.com, Inc. bay. DetencionDefensa.com, Inc. se sèlman devlopè teknoloji a ak operatè sit entènèt la; Kabinè a gen kontwòl total ak responsablite total pou tout sèvis legal, konsèy legal, ak kontni legal.",
};

/** Longer version with the no-fee-sharing point, for legal pages and footers. */
export const OPERATING_NOTICE_LONG: Record<DiscLang, string> = {
  en: "DetencionDefensa.com, Inc., a Delaware corporation, is a technology company. It builds and maintains this website and the emergency app. It does not practice law, does not give legal advice, and does not direct or control any legal service. Sorrentino Law Firm PLLC, a Florida law firm, operates this site under a written license and services agreement and is solely responsible for all legal services, legal advice, legal content, and attorney-client relationships. The Company receives a fixed license fee that does not vary with any client or any matter, and it does not share in any legal fee.",
  es: "DetencionDefensa.com, Inc., una corporación de Delaware, es una empresa de tecnología. Construye y mantiene este sitio web y la aplicación de emergencia. No practica derecho, no brinda asesoramiento legal y no dirige ni controla ningún servicio legal. Sorrentino Law Firm PLLC, una firma de abogados de Florida, opera este sitio bajo un acuerdo escrito de licencia y servicios y es la única responsable de todos los servicios legales, el asesoramiento legal, el contenido legal y las relaciones abogado-cliente. La empresa recibe una tarifa de licencia fija que no varía según ningún cliente ni ningún asunto, y no participa en ningún honorario legal.",
  ht: "DetencionDefensa.com, Inc., yon konpayi Delaware, se yon konpayi teknoloji. Li konstwi epi kenbe sit entènèt sa a ak aplikasyon dijans lan. Li pa pratike lalwa, li pa bay konsèy legal, epi li pa dirije ni kontwole okenn sèvis legal. Sorrentino Law Firm PLLC, yon kabinè avoka Florid, ap opere sit sa a anba yon akò lisans ak sèvis ekri epi li sèl responsab pou tout sèvis legal, konsèy legal, kontni legal, ak relasyon avoka-kliyan. Konpayi an resevwa yon frè lisans fiks ki pa chanje selon kliyan oswa dosye, epi li pa patisipe nan okenn frè legal.",
};

/** Attorney-client privilege statement (disclosed-agent intake model). */
export const PRIVILEGE_NOTICE: Record<DiscLang, string> = {
  en: "Your intake is collected by DetencionDefensa.com, Inc. acting only as the disclosed agent of Sorrentino Law Firm PLLC, so your information is the Firm's client information and attorney-client privilege attaches through the Firm. The Company staff who type and translate work under the Firm's supervision and confidentiality obligations. An attorney-client relationship with the Firm begins when the Firm accepts your matter and you sign its limited-scope engagement letter.",
  es: "Su información de admisión es recopilada por DetencionDefensa.com, Inc. actuando únicamente como agente divulgado de Sorrentino Law Firm PLLC, por lo que su información es información de cliente de la Firma y el privilegio abogado-cliente se aplica a través de la Firma. El personal de la empresa que mecanografía y traduce trabaja bajo la supervisión y las obligaciones de confidencialidad de la Firma. La relación abogado-cliente con la Firma comienza cuando la Firma acepta su asunto y usted firma su carta de contratación de alcance limitado.",
  ht: "Se DetencionDefensa.com, Inc. ki kolekte enfòmasyon admisyon w, men sèlman kòm ajan deklare Sorrentino Law Firm PLLC, konsa enfòmasyon w se enfòmasyon kliyan Kabinè a epi privilèj avoka-kliyan aplike atravè Kabinè a. Anplwaye konpayi an ki ekri epi tradui yo travay anba sipèvizyon ak obligasyon konfidansyalite Kabinè a. Relasyon avoka-kliyan ak Kabinè a kòmanse lè Kabinè a aksepte dosye w epi ou siyen lèt angajman limite li a.",
};

/** What the Company does / does not do — replaces old blunt "we are not a law firm" copy. */
export const ROLE_NOTICE: Record<DiscLang, string> = {
  en: "DetencionDefensa.com, Inc. provides the intake software, translation, typing, document assembly, secure delivery, and the emergency app. It is not a law firm and gives no legal advice. Every document is reviewed by Sorrentino Law Firm PLLC, which operates this site under license and is solely responsible for the legal work.",
  es: "DetencionDefensa.com, Inc. provee el software de admisión, la traducción, la mecanografía, el armado de documentos, la entrega segura y la aplicación de emergencia. No es una firma de abogados y no brinda asesoramiento legal. Cada documento es revisado por Sorrentino Law Firm PLLC, que opera este sitio bajo licencia y es la única responsable del trabajo legal.",
  ht: "DetencionDefensa.com, Inc. bay lojisyèl admisyon an, tradiksyon, daktilografi, asanblaj dokiman, livrezon an sekirite, ak aplikasyon dijans lan. Li pa yon kabinè avoka epi li pa bay konsèy legal. Sorrentino Law Firm PLLC revize chak dokiman; se li k ap opere sit sa a anba lisans epi se li sèl ki responsab travay legal la.",
};

/** Short heading for the privilege panel. */
export const PRIVILEGE_HEADING: Record<DiscLang, string> = {
  en: "Attorney-Client Privilege Protected",
  es: "Protegido por el privilegio abogado-cliente",
  ht: "Pwoteje pa privilèj avoka-kliyan",
};

/** Accurate scope limit so the privilege claim is never overstated. */
export const PRIVILEGE_SCOPE: Record<DiscLang, string> = {
  en: "This protection covers the confidential case information you send through intake, the emergency app, and messages about your matter. It does not cover public browsing of marketing pages, and privilege can be lost if you share the same information with someone outside the Firm's team.",
  es: "Esta protección cubre la información confidencial de su caso que envía por el formulario de admisión, la aplicación de emergencia y los mensajes sobre su asunto. No cubre la navegación pública de las páginas informativas, y el privilegio puede perderse si comparte la misma información con alguien fuera del equipo de la Firma.",
  ht: "Pwoteksyon sa a kouvri enfòmasyon konfidansyèl dosye w voye nan fòm admisyon an, aplikasyon dijans lan, ak mesaj sou dosye w. Li pa kouvri navigasyon piblik sou paj piblisite yo, epi privilèj la ka pèdi si w pataje menm enfòmasyon an ak yon moun deyò ekip Kabinè a.",
};
