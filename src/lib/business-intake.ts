import { z } from "zod";

export const BUSINESS_INTAKE_ASSIGNEE = {
  name: "Ricky Bitelman-Behar JD",
  userId: "e4561f24-6366-4257-9510-8ff666ec7210",
  email: "rbjd59@detenciondefensa.com",
};

export const businessIntakeSchema = z.object({
  requestId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(120),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(40)
    .regex(/^\+?[\d ().-]+$/)
    .refine((v) => v.replace(/\D/g, "").length >= 7),
  email: z.union([z.literal(""), z.string().trim().email().max(200)]).default(""),
  language: z.enum(["en", "es", "ht"]),
  businessName: z.string().trim().max(160).default(""),
  work: z.string().trim().min(2).max(200),
  city: z.string().trim().max(120).default(""),
  bestTime: z.string().trim().max(200).default(""),
  message: z.string().trim().max(2000).default(""),
  consent: z.literal(true),
});

export const BUSINESS_INTAKE_COPY = {
  en: {
    title: "Ask for a call",
    body: "Tell us about your work. Ricky Bitelman-Behar JD will handle your request.",
    back: "Back to the business site",
    name: "Your full name",
    phone: "Phone number",
    email: "Email (optional)",
    business: "Business name (optional)",
    work: "What work do you do?",
    city: "City and state (optional)",
    time: "When can we call? Include your time zone (optional)",
    message: "What do you need help with? (optional)",
    consent: "You may contact me about this request.",
    send: "Request a call",
    sending: "Saving your request…",
    saved: "Your request is saved.",
    assigned:
      "Assigned to Ricky Bitelman-Behar JD. Your preferred time is a request, not a confirmed appointment.",
    error: "We could not save your request. Check your details and try again, or call us.",
    privacy: "Do not enter immigration details, ID numbers, bank details or passwords.",
    call: "Call now",
    note: "Requesting a call does not sign you up for paid services or create an attorney-client relationship.",
  },
  es: {
    title: "Pida una llamada",
    body: "Cuéntenos sobre su trabajo. Ricky Bitelman-Behar JD atenderá su solicitud.",
    back: "Volver al sitio del negocio",
    name: "Su nombre completo",
    phone: "Número de teléfono",
    email: "Correo electrónico (opcional)",
    business: "Nombre del negocio (opcional)",
    work: "¿Qué trabajo hace?",
    city: "Ciudad y estado (opcional)",
    time: "¿Cuándo podemos llamar? Incluya su zona horaria (opcional)",
    message: "¿Con qué necesita ayuda? (opcional)",
    consent: "Pueden contactarme sobre esta solicitud.",
    send: "Pedir una llamada",
    sending: "Guardando su solicitud…",
    saved: "Su solicitud está guardada.",
    assigned: "Asignada a Ricky Bitelman-Behar JD. La hora que pidió no es una cita confirmada.",
    error: "No pudimos guardar su solicitud. Revise sus datos e inténtelo de nuevo, o llámenos.",
    privacy:
      "No escriba datos migratorios, números de identificación, datos bancarios ni contraseñas.",
    call: "Llame ahora",
    note: "Pedir una llamada no lo inscribe en servicios de pago ni crea una relación abogado-cliente.",
  },
  ht: {
    title: "Mande yon apèl",
    body: "Di nou ki travay ou fè. Ricky Bitelman-Behar JD ap okipe demann ou an.",
    back: "Retounen sou sit biznis la",
    name: "Non konplè ou",
    phone: "Nimewo telefòn",
    email: "Imèl (si ou vle)",
    business: "Non biznis la (si ou vle)",
    work: "Ki travay ou fè?",
    city: "Vil ak eta (si ou vle)",
    time: "Kilè nou ka rele? Mete zòn lè ou (si ou vle)",
    message: "Ki èd ou bezwen? (si ou vle)",
    consent: "Nou ka kontakte m pou demann sa a.",
    send: "Mande yon apèl",
    sending: "N ap anrejistre demann ou…",
    saved: "Demann ou an anrejistre.",
    assigned: "Ricky Bitelman-Behar JD ap okipe li. Lè ou mande a se pa yon randevou konfime.",
    error: "Nou pa t ka anrejistre demann ou. Verifye enfòmasyon yo epi eseye ankò, oswa rele nou.",
    privacy: "Pa mete detay imigrasyon, nimewo idantite, enfòmasyon labank oswa modpas.",
    call: "Rele kounye a",
    note: "Mande yon apèl pa enskri ou nan sèvis ki gen frè ni kreye yon relasyon avoka-kliyan.",
  },
};
