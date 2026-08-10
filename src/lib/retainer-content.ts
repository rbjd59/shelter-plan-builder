/**
 * Limited-scope engagement letter (Florida Bar Rule 4-1.2(c)).
 *
 * The English text is the master. Spanish and Haitian Creole MUST be replaced
 * with certified legal translations BEFORE production launch — the current
 * Spanish text is a working draft only, and Haitian Creole is a placeholder.
 *
 * Version this constant: whenever the substantive scope, fees, or termination
 * clauses change, increment RETAINER_VERSION. Every signature is captured with
 * the exact body shown at signing time.
 */

import { FIRM } from "./firm-info";

export const RETAINER_VERSION = "2026-06-04.v1-draft";

export type RetainerLang = "en" | "es" | "ht";

export interface RetainerCopy {
  title: string;
  intro: string;
  scopeHeading: string;
  scope: string[];
  outOfScopeHeading: string;
  outOfScope: string[];
  feeHeading: string;
  fee: string;
  terminationHeading: string;
  termination: string;
  noGuaranteeHeading: string;
  noGuarantee: string;
  consentHeading: string;
  consent: string;
  signaturePrompt: string;
  signatureNote: string;
  acknowledgeLabel: string;
  signButton: string;
  translationNotice?: string;
}

const buildEn = (): RetainerCopy => ({
  title: "Limited-Scope Legal Services Agreement",
  intro: `This Limited-Scope Legal Services Agreement ("Agreement") is between you ("Client") and ${FIRM.legalName} ("Firm"), through ${FIRM.attorney}, a Florida-licensed attorney (${FIRM.flBarNumber}). This Agreement governs only the limited services described below and does NOT create a general attorney-client relationship for any other matter.`,
  scopeHeading: "1. Scope of Legal Services (what the Firm WILL do)",
  scope: [
    "Review the draft federal-court forms generated from your intake answers — AO 242 (Petition for Writ of Habeas Corpus), AO 240 (Application to Proceed In Forma Pauperis), JS 44 (Civil Cover Sheet), and a draft Motion for Assignment of Counsel — for legal sufficiency before they are stored in your account.",
    "After you (or your designated contact) activate the NOTIFY FAMILY trigger and DetencionDefensa.com locates the detained person, the Firm will complete the AO 242 by adding the respondent, facility, federal detention number, and date of arrest, and will mail the completed packet via U.S. legal mail to the detained person at the facility of detention.",
    "Communicate with you (or your designated contact) about the status of the review and mailing.",
  ],
  outOfScopeHeading: "2. What the Firm will NOT do under this Agreement",
  outOfScope: [
    "File documents in court on your behalf. The mailed packet is a self-help filing for the detained person to submit pro se.",
    "Represent you or the detained person in any court appearance, hearing, motion, or proceeding.",
    "Provide immigration advice, removal-defense strategy, or representation before the immigration court or DHS.",
    "Conduct any other legal work not expressly listed in Section 1.",
  ],
  feeHeading: `3. Attorney Fee — None (Pro Bono)`,
  fee: `The Firm is providing the limited services described in Section 1 PRO BONO — free of charge. You pay the Firm nothing. There is no flat fee, no hourly billing, no retainer, and no cost of any kind for the Firm's review, location, or completion-and-mailing services. You also pay DetencionDefensa.com, Inc. nothing: the software, translation, typing, and storage services are provided free during the community crisis, and no credit card is required. This pro bono commitment is for a limited period and may be ended by the Firm and DetencionDefensa.com, Inc. at any time. If a fee is ever introduced in the future, you will be given advance written notice and you will not be charged anything without first signing a new written fee agreement.`,
  terminationHeading: "4. Termination",
  termination:
    "Either party may terminate this Agreement at any time by written notice. If you terminate before the Firm completes its review, the Firm will refund any portion of the flat fee not yet earned. The Firm may withdraw if continued representation would violate the Florida Rules of Professional Conduct.",
  noGuaranteeHeading: "5. No Guarantee of Outcome",
  noGuarantee:
    "The Firm makes no promise or guarantee about the outcome of any court proceeding. A habeas petition is a request to a federal judge; the judge alone decides whether to grant relief.",
  consentHeading: "6. Acknowledgments",
  consent: `By signing below, you confirm that (a) you have read and understood this Agreement in a language you understand; (b) you understand that ${FIRM.legalName} is a separate legal entity from DetencionDefensa.com, Inc.; (c) you understand the limited scope of services and that the Firm is NOT your general attorney; (d) you consent to electronic signature and electronic delivery of legal documents; and (e) you have had the opportunity to ask questions before signing.`,
  signaturePrompt: "Type your full legal name as your electronic signature:",
  signatureNote:
    "Your IP address, browser, and the exact text of this agreement shown to you will be recorded with your signature.",
  acknowledgeLabel:
    "I have read and agree to this Limited-Scope Legal Services Agreement.",
  signButton: "Sign & Continue",
});

const buildEs = (): RetainerCopy => ({
  title: "Acuerdo de Servicios Legales de Alcance Limitado",
  intro: `Este Acuerdo de Servicios Legales de Alcance Limitado ("Acuerdo") es entre usted ("Cliente") y ${FIRM.legalName} ("la Firma"), a través de ${FIRM.attorney}, un abogado licenciado en Florida (${FIRM.flBarNumber}). Este Acuerdo rige únicamente los servicios limitados descritos a continuación y NO crea una relación general de abogado-cliente para ningún otro asunto.`,
  scopeHeading: "1. Alcance de los Servicios Legales (lo que la Firma SÍ hará)",
  scope: [
    "Revisar los borradores de los formularios federales generados a partir de sus respuestas — AO 242 (Petición de Habeas Corpus), AO 240 (Solicitud para Proceder In Forma Pauperis), JS 44 (Hoja de Carátula Civil) y un borrador de Moción para Nombramiento de Abogado — para verificar su suficiencia legal antes de guardarlos en su cuenta.",
    "Después de que usted (o su contacto designado) active el botón NOTIFICAR FAMILIA y DetencionDefensa.com localice a la persona detenida, la Firma completará el AO 242 agregando el nombre del demandado, el centro de detención, el número federal de detención y la fecha de arresto, y enviará el paquete completo por correo legal de EE. UU. a la persona detenida en el centro de detención.",
    "Comunicarse con usted (o su contacto designado) sobre el estado de la revisión y el envío.",
  ],
  outOfScopeHeading: "2. Lo que la Firma NO hará bajo este Acuerdo",
  outOfScope: [
    "Presentar documentos en la corte en su nombre. El paquete enviado es una presentación de autoayuda para que la persona detenida la presente pro se.",
    "Representarlo a usted o a la persona detenida en ninguna comparecencia, audiencia, moción o procedimiento judicial.",
    "Brindar asesoría migratoria, estrategia de defensa contra deportación, ni representación ante la corte de inmigración o DHS.",
    "Realizar cualquier otro trabajo legal no enumerado expresamente en la Sección 1.",
  ],
  feeHeading: `3. Honorarios del Abogado — Ninguno (Pro Bono)`,
  fee: `La Firma brinda los servicios limitados descritos en la Sección 1 PRO BONO — sin cargo alguno. Usted no le paga nada a la Firma. No hay tarifa plana, ni facturación por hora, ni anticipo, ni costo de ningún tipo por la revisión, la localización o el servicio de completar-y-enviar. Tampoco le paga nada a DetencionDefensa.com, Inc.: los servicios de software, traducción, mecanografía y almacenamiento se brindan gratis durante la crisis comunitaria y no se requiere tarjeta de crédito. Este compromiso pro bono es por un período limitado y puede terminarse por la Firma y DetencionDefensa.com, Inc. en cualquier momento. Si en el futuro se introduce alguna tarifa, se le dará aviso previo por escrito y no se le cobrará nada sin que usted firme primero un nuevo acuerdo de honorarios por escrito.`,
  terminationHeading: "4. Terminación",
  termination:
    "Cualquiera de las partes puede terminar este Acuerdo en cualquier momento mediante notificación escrita. Si usted termina antes de que la Firma complete su revisión, la Firma reembolsará cualquier parte de la tarifa plana aún no devengada.",
  noGuaranteeHeading: "5. Sin Garantía de Resultado",
  noGuarantee:
    "La Firma no hace ninguna promesa ni garantía sobre el resultado de ningún procedimiento judicial. Una petición de habeas corpus es una solicitud a un juez federal; solo el juez decide si concede el alivio.",
  consentHeading: "6. Reconocimientos",
  consent: `Al firmar abajo, usted confirma que (a) ha leído y comprendido este Acuerdo en un idioma que entiende; (b) entiende que ${FIRM.legalName} es una entidad legal separada de DetencionDefensa.com, Inc.; (c) entiende el alcance limitado de los servicios y que la Firma NO es su abogado general; (d) consiente la firma electrónica y la entrega electrónica de documentos legales; y (e) ha tenido la oportunidad de hacer preguntas antes de firmar.`,
  signaturePrompt: "Escriba su nombre legal completo como su firma electrónica:",
  signatureNote:
    "Se registrará junto con su firma su dirección IP, su navegador y el texto exacto de este acuerdo que se le mostró.",
  acknowledgeLabel:
    "He leído y acepto este Acuerdo de Servicios Legales de Alcance Limitado.",
  signButton: "Firmar y Continuar",
  translationNotice:
    "[BORRADOR — Esta traducción al español será reemplazada con una traducción legal certificada antes del lanzamiento.]",
});

const buildHt = (): RetainerCopy => ({
  ...buildEn(),
  translationNotice:
    "[HT TRADIKSYON NESESÈ — Ajans la ap montre vèsyon anglè a jiskaske yon tradiksyon legal sètifye an Kreyòl Ayisyen disponib.]",
});

export const RETAINER: Record<RetainerLang, RetainerCopy> = {
  en: buildEn(),
  es: buildEs(),
  ht: buildHt(),
};
