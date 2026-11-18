import { z } from "zod";
import type { Lang } from "@/context/LanguageContext";

export const VEHICLE_MINIMUM_NET = 500;
export const VEHICLE_REFERRAL_FEE = 250;
export const VEHICLE_BENCHMARK = "a recognized wholesale auction valuation guide (such as Manheim Market Report or J.D. Power wholesale)";
export const FLHSMV_FORMS = [
  { id: "HSMV 82053", label: "Power of Attorney", url: "https://www.flhsmv.gov/pdf/forms/82053.pdf" },
  { id: "HSMV 82995", label: "Secure Power of Attorney — use when the lender holds the title or the title is lost", url: "https://www.flhsmv.gov/pdf/forms/82995.pdf" },
  { id: "HSMV 82993", label: "Odometer Disclosure", url: "https://www.flhsmv.gov/pdf/forms/82993.pdf" },
  { id: "HSMV 82050", label: "Notice of Sale / Bill of Sale", url: "https://www.flhsmv.gov/pdf/forms/82050.pdf" },
] as const;

const optional = (max: number) => z.string().trim().max(max).default("");
export const vehicleIntakeSchema = z.object({
  year: z.string().trim().regex(/^(19|20)\d{2}$/, "Enter a four-digit year."),
  make: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(80),
  vin: z.string().trim().toUpperCase().regex(/^[A-HJ-NPR-Z0-9]{17}$/, "VIN must contain exactly 17 valid characters."),
  plate: z.string().trim().min(1).max(20),
  plateState: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "Use a two-letter state."),
  titleOwners: z.array(z.string().trim().min(2).max(160)).min(1).max(8),
  titleConnector: z.enum(["and", "or"]),
  lienholder: optional(160),
  titleHolder: z.enum(["owner", "lender", "lost"]),
  keysTitleLocation: z.string().trim().min(2).max(1000),
  insuranceCompany: optional(160),
  contactName: z.string().trim().min(2).max(160),
  contactRelationship: z.string().trim().min(2).max(100),
  contactPhone: z.string().trim().min(7).max(40).regex(/^\+?[\d ().-]+$/),
  proceeds: z.enum(["designated_contact", "facility", "law_firm", "split"]),
  proceedsDetails: optional(1000),
  agentType: z.enum(["family", "law_firm"]).default("family"),
  agentName: optional(160),
}).strict().superRefine((value, context) => {
  if (value.agentType === "family" && value.agentName.length < 2) {
    context.addIssue({ code: "custom", path: ["agentName"], message: "Name the family member who will act as agent." });
  }
  if (value.proceeds === "split" && value.proceedsDetails.length < 2) {
    context.addIssue({ code: "custom", path: ["proceedsDetails"], message: "Enter the split percentages and recipients." });
  }
});
export type VehicleIntake = z.infer<typeof vehicleIntakeSchema>;
export const vehicleEnrollmentInputSchema = z.object({
  intakeSessionId: z.string().trim().min(8).max(160),
  language: z.enum(["en", "es", "ht"]),
  ownerName: z.string().trim().min(2).max(160),
  vehicle: vehicleIntakeSchema,
}).strict();
export type VehicleEnrollmentInput = z.infer<typeof vehicleEnrollmentInputSchema>;

export function vehicleFromAnswers(answers: Record<string, unknown>): VehicleIntake {
  const text = (key: string) => typeof answers[key] === "string" ? String(answers[key]) : "";
  return vehicleIntakeSchema.parse({
    year: text("vehicle_year"), make: text("vehicle_make"), model: text("vehicle_model"), vin: text("vehicle_vin"),
    plate: text("vehicle_plate"), plateState: text("vehicle_plate_state"),
    titleOwners: text("vehicle_title_owners").split(/\n|,/).map((v) => v.trim()).filter(Boolean),
    titleConnector: text("vehicle_title_connector") || "and", lienholder: text("vehicle_lienholder"),
    titleHolder: text("vehicle_title_holder") || "owner", keysTitleLocation: text("vehicle_keys_title_location"),
    insuranceCompany: text("vehicle_insurance"), contactName: text("vehicle_contact_name"),
    contactRelationship: text("vehicle_contact_relationship"), contactPhone: text("vehicle_contact_phone"),
    proceeds: text("vehicle_proceeds") || "designated_contact", proceedsDetails: text("vehicle_proceeds_details"),
    agentType: text("vehicle_agent_type") || "family", agentName: text("vehicle_agent_name"),
  });
}

export const VEHICLE_FIELD_COPY: Record<Lang, Record<string, string>> = {
  en: {
    checkbox: "I have a vehicle (car, truck, or van)", title: "Your vehicle", intro: "Enter only vehicle and contact information. Do not enter immigration status, an A-number, SSN, bank or card numbers.",
    year: "Year", make: "Make", model: "Model", vin: "VIN — exactly 17 characters", plate: "License plate", plateState: "Plate state",
    titleOwners: "Every person on the title — one name per line", titleConnector: 'Does the title say "and" or "or"?', and: "And", or: "Or",
    lienholder: "Lender / lienholder name (optional)", titleHolder: "Who holds the paper title?", owner: "Me", lender: "Lender", lost: "Lost",
    keysTitleLocation: "Where are the keys and title kept?", insurance: "Insurance company (optional)", contactName: "Designated Contact — name",
    contactRelationship: "Designated Contact — relationship", contactPhone: "Designated Contact — phone", proceeds: "Who should receive sale money?",
    designated_contact: "Designated Contact", facility: "Commissary or trust account at the facility", law_firm: "Sorrentino Law Firm trust account", split: "Split between recipients",
    proceedsDetails: "Facility/account instructions or split percentages — never bank or card numbers", agentType: "Who should be agent under the power of attorney?",
    family: "A family member I name", lawFirmAgent: "A Sorrentino Law Firm staff member", agentName: "Family member agent — full name",
  },
  es: {
    checkbox: "Tengo un vehículo (carro, camioneta o van)", title: "Su vehículo", intro: "Ingrese solo información del vehículo y del contacto. No ingrese estatus migratorio, número A, SSN, números de banco o tarjetas.",
    year: "Año", make: "Marca", model: "Modelo", vin: "VIN — exactamente 17 caracteres", plate: "Placa", plateState: "Estado de la placa",
    titleOwners: "Todas las personas en el título — un nombre por línea", titleConnector: '¿El título dice "and" (y) u "or" (o)?', and: "Y / and", or: "O / or",
    lienholder: "Nombre del prestamista / acreedor (opcional)", titleHolder: "¿Quién tiene el título en papel?", owner: "Yo", lender: "Prestamista", lost: "Perdido",
    keysTitleLocation: "¿Dónde se guardan las llaves y el título?", insurance: "Compañía de seguros (opcional)", contactName: "Contacto Designado — nombre",
    contactRelationship: "Contacto Designado — parentesco", contactPhone: "Contacto Designado — teléfono", proceeds: "¿Quién debe recibir el dinero de la venta?",
    designated_contact: "Contacto Designado", facility: "Cuenta de comisaría o fideicomiso en el centro", law_firm: "Cuenta de fideicomiso de Sorrentino Law Firm", split: "Dividir entre destinatarios",
    proceedsDetails: "Instrucciones de depósito o porcentajes — nunca números de banco o tarjetas", agentType: "¿Quién debe ser el agente bajo el poder notarial?",
    family: "Un familiar que yo nombre", lawFirmAgent: "Un miembro del personal de Sorrentino Law Firm", agentName: "Familiar agente — nombre completo",
  },
  ht: {
    checkbox: "Mwen gen yon machin (machin, kamyon oswa van)", title: "Machin ou", intro: "Antre sèlman enfòmasyon machin ak kontak. Pa mete sitiyasyon imigrasyon, nimewo A, SSN, nimewo labank oswa kat.",
    year: "Ane", make: "Mak", model: "Modèl", vin: "VIN — egzakteman 17 karaktè", plate: "Plak", plateState: "Eta plak la",
    titleOwners: "Tout moun sou tit la — yon non pa liy", titleConnector: 'Èske tit la di "and" (e) oswa "or" (oswa)?', and: "E / and", or: "Oswa / or",
    lienholder: "Non prete / moun ki gen privilèj la (si genyen)", titleHolder: "Kiyès ki kenbe tit papye a?", owner: "Mwen menm", lender: "Prete a", lost: "Pèdi",
    keysTitleLocation: "Kote kle ak tit la ye?", insurance: "Konpayi asirans (si genyen)", contactName: "Kontak Dezyèm — non",
    contactRelationship: "Kontak Dezyèm — relasyon", contactPhone: "Kontak Dezyèm — telefòn", proceeds: "Kiyès ki dwe resevwa lajan vant lan?",
    designated_contact: "Kontak Dezyèm", facility: "Kont komisè oswa kont anfideykomis nan sant la", law_firm: "Kont anfideykomis Sorrentino Law Firm", split: "Separe ant plizyè moun",
    proceedsDetails: "Enstriksyon depo oswa pousantaj — pa janm nimewo labank oswa kat", agentType: "Kiyès ki dwe ajan nan prokurasyon an?",
    family: "Yon manm fanmi mwen nonmen", lawFirmAgent: "Yon manm pèsonèl Sorrentino Law Firm", agentName: "Manm fanmi ajan — non konplè",
  },
};

export const VEHICLE_DRAFT_NOTICE: Record<Lang, string> = {
  en: "DRAFT — PENDING ATTORNEY APPROVAL — DO NOT SIGN",
  es: "BORRADOR — PENDIENTE DE APROBACIÓN DEL ABOGADO — NO FIRMAR",
  ht: "BOUYON — AP TANN APOUBASYON AVOKA — PA SIYEN",
};
export const VEHICLE_COURTESY_NOTICE: Record<Lang, string> = {
  en: "English controlling text",
  es: "Traducción de cortesía — pendiente de revisión certificada. Se adjunta el texto inglés, que prevalece.",
  ht: "Tradiksyon koutwazi — ap tann revizyon sètifye. Tèks angle a tache; se li ki gen valè.",
};
