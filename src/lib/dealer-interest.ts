import { z } from "zod";

export const dealerInterestSchema = z.object({
  requestId: z.string().uuid(),
  dealershipName: z.string().trim().min(2).max(160),
  licenseNumber: z.string().trim().min(2).max(80),
  contactName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(40).regex(/^\+?[\d ().-]+$/).refine((value) => value.replace(/\D/g, "").length >= 7),
  email: z.string().trim().email().max(200),
  counties: z.string().trim().min(2).max(500),
  language: z.enum(["en", "es"]),
  consent: z.literal(true),
});

export type DealerInterest = z.infer<typeof dealerInterestSchema>;

/** Only the fields the dealer entered are included in the staff lead. */
export function dealerLeadFields(data: DealerInterest) {
  return {
    id: data.requestId,
    full_name: data.contactName,
    phone: data.phone.replace(/\D/g, ""),
    email: data.email,
    language: data.language,
    city: data.counties,
    need: data.dealershipName,
    message: [
      `Dealership: ${data.dealershipName}`,
      `Florida dealer license: ${data.licenseNumber}`,
      `Counties served: ${data.counties}`,
      "Contact permission: yes",
    ].join("\n"),
    source: "dealer-interest",
    status: "new",
  };
}

export function dealerAlertText(data: DealerInterest) {
  return `New dealer interest: ${data.dealershipName}. Contact: ${data.contactName}, ${data.phone}. Counties: ${data.counties}. Ref ${data.requestId.slice(0, 6).toUpperCase()}. See staff leads.`;
}

export const DEALER_INTEREST_COPY = {
  en: {
    title: "For licensed Florida dealers",
    subtitle: "Help families retrieve a vehicle, stop storage fees from growing, and receive a clear written offer.",
    programTitle: "How the dealer program works",
    programBody: "The owner plans ahead through DetencionDefensa. After a covered event, your dealership decides whether to accept the vehicle. You deal with the owner's Designated Contact and pay the owner directly.",
    obligationsTitle: "What participating dealers agree to do",
    obligations: [
      "Accept or decline a request within 4 business hours.",
      "Retrieve an accepted vehicle within 48 hours, unless a legal hold or the yard prevents release.",
      "Pay at least the Guaranteed Minimum Price: the wholesale auction benchmark on retrieval day, adjusted only for documented condition items with photos.",
      "Send photos, a condition report, the benchmark printout and a written offer within 24 hours of retrieval.",
      "Let the owner refuse the offer within 48 hours. Do not pressure the owner or the family.",
      "Pay the owner or the person's chosen recipient directly within 3 business days after acceptance. Never route owner money through DetencionDefensa.",
      "Never ask about immigration status. It is not needed for this program.",
      "Keep a Florida dealer license, required bond and garage liability insurance active, and allow reasonable record audits.",
    ],
    feeTitle: "Referral fee",
    feeBody: "Dealers pay DetencionDefensa a flat per-vehicle referral fee for each vehicle accepted — see agreement. The owner pays DetencionDefensa nothing, and the fee is not taken from the owner's money.",
    reviewTitle: "Draft documents",
    reviewBody: "The Dealer Participation Agreement is in final attorney review. Do not retrieve or buy a vehicle under this program until the final agreement is signed.",
    download: "Download the Dealer Participation Agreement (draft)",
    formTitle: "Tell us about your dealership",
    formBody: "We will contact you before asking you to sign or accept a vehicle.",
    dealership: "Dealership name",
    license: "Florida dealer license number",
    contact: "Contact name",
    phone: "Phone",
    email: "Email",
    counties: "Florida counties you serve",
    consent: "You may contact me about dealer participation.",
    submit: "Send dealer interest",
    sending: "Saving your request…",
    saved: "Your request is saved. Our team will contact you.",
    error: "We could not save your request. Check every field and try again.",
    privacy: "Do not enter customer immigration information or other sensitive customer details.",
    back: "Back to Don't Lose Your Car",
  },
  es: {
    title: "Para concesionarios autorizados de Florida",
    subtitle: "Ayude a las familias a recuperar un vehículo, detener el aumento de los cargos de almacenaje y recibir una oferta clara por escrito.",
    programTitle: "Cómo funciona el programa para concesionarios",
    programBody: "El propietario planifica con DetencionDefensa. Después de un evento cubierto, su concesionario decide si acepta el vehículo. Usted trata con el Contacto Designado del propietario y paga directamente al propietario.",
    obligationsTitle: "Lo que los concesionarios participantes aceptan hacer",
    obligations: [
      "Aceptar o rechazar una solicitud dentro de 4 horas hábiles.",
      "Recuperar un vehículo aceptado dentro de 48 horas, salvo que una retención legal o el lote impida la entrega.",
      "Pagar al menos el Precio Mínimo Garantizado: el valor de referencia de subasta mayorista el día de la recuperación, ajustado solo por daños documentados con fotos.",
      "Enviar fotos, un informe de condición, el comprobante del valor de referencia y una oferta escrita dentro de 24 horas de la recuperación.",
      "Permitir que el propietario rechace la oferta dentro de 48 horas. No presione al propietario ni a la familia.",
      "Pagar directamente al propietario o a la persona que él elija dentro de 3 días hábiles después de aceptar. Nunca pase el dinero del propietario por DetencionDefensa.",
      "Nunca preguntar sobre el estatus migratorio. No se necesita para este programa.",
      "Mantener activos la licencia de concesionario de Florida, la fianza requerida y el seguro de responsabilidad de garaje, y permitir auditorías razonables de los registros.",
    ],
    feeTitle: "Tarifa de referencia",
    feeBody: "Los concesionarios pagan a DetencionDefensa una tarifa fija de referencia por cada vehículo aceptado; consulte el acuerdo. El propietario no paga nada a DetencionDefensa y la tarifa no se descuenta de su dinero.",
    reviewTitle: "Documentos preliminares",
    reviewBody: "El Acuerdo de Participación del Concesionario está en revisión legal final. No recupere ni compre un vehículo bajo este programa hasta firmar el acuerdo final.",
    download: "Descargar el Acuerdo de Participación del Concesionario (borrador)",
    formTitle: "Cuéntenos sobre su concesionario",
    formBody: "Nos comunicaremos con usted antes de pedirle que firme o acepte un vehículo.",
    dealership: "Nombre del concesionario",
    license: "Número de licencia de concesionario de Florida",
    contact: "Nombre del contacto",
    phone: "Teléfono",
    email: "Correo electrónico",
    counties: "Condados de Florida que atiende",
    consent: "Pueden contactarme sobre la participación como concesionario.",
    submit: "Enviar interés como concesionario",
    sending: "Guardando su solicitud…",
    saved: "Su solicitud está guardada. Nuestro equipo se comunicará con usted.",
    error: "No pudimos guardar su solicitud. Revise todos los campos e inténtelo de nuevo.",
    privacy: "No escriba información migratoria de clientes ni otros datos confidenciales de clientes.",
    back: "Volver a No Pierdas Tu Carro",
  },
} as const;
