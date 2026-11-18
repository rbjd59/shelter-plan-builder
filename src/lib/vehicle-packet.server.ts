import englishSource from "../../docs/vehicle-program/agreements.md?raw";
import spanishSource from "../../docs/vehicle-program/agreements.es.md?raw";
import haitianSource from "../../docs/vehicle-program/agreements.ht.md?raw";
import { textPacket } from "./service-packet.server";
import { FLHSMV_FORMS, VEHICLE_COURTESY_NOTICE, VEHICLE_DRAFT_NOTICE, type VehicleIntake } from "./vehicle-rescue";
import type { Lang } from "@/context/LanguageContext";

type PacketOptions = {
  language: Lang;
  ownerName?: string;
  vehicle?: VehicleIntake;
  approved?: boolean;
  reviewerName?: string;
  approvedAt?: string;
};
type Section = { heading: string; lines: string[]; pageBreak?: boolean };
const sources: Record<Lang, string> = { en: englishSource, es: spanishSource, ht: haitianSource };
const consumer = (language: Lang) => sources[language].split(language === "en" ? "## DEALER PARTICIPATION AGREEMENT" : "\n## DEALER PARTICIPATION AGREEMENT")[0];
const dealer = englishSource.split("## DEALER PARTICIPATION AGREEMENT")[1] ?? "";
const blank = "________________";

function markdownSections(markdown: string): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const raw of markdown.split("\n")) {
    const line = raw.trim();
    if (!line || /^Status:|^Estado:|^Statut:|^Traducción de cortesía|^Tradiksyon koutwazi/.test(line)) continue;
    if (line.startsWith("##")) {
      if (current) sections.push(current);
      current = { heading: line.replace(/^#+\s*/, ""), lines: [], pageBreak: true };
    } else if (current && !line.startsWith("#")) current.lines.push(line);
  }
  if (current) sections.push(current);
  return sections;
}

const coverCopy: Record<Lang, { title: string; instructions: string[]; info: string; forms: string }> = {
  en: {
    title: "Vehicle Rescue Packet — Cover sheet and instructions",
    instructions: [
      "DRAFT: do not sign until Sorrentino Law Firm, PLLC approves this packet for you.",
      "Every titled owner must sign the Vehicle Rescue Agreement and the required state forms. The Designated Contact acknowledges the role. The Agent signs Schedule C.",
      "The Authorization to Release Impounded Vehicle must be notarized. Check whether the notarization is physical presence or online. Sign other documents only where indicated.",
      "Give original signed forms to Sorrentino Law Firm, PLLC for review and safe handling. Keep copies for yourself and your Designated Contact. Official Florida forms are obtained from FLHSMV; they are not re-hosted in this packet.",
      "Complete the Dealer transport cost, vehicle mileage, dealer identity and license, lien account last four digits, settlement figures and all remaining blanks before signing. Do not write bank or card numbers in this packet.",
    ],
    info: "Vehicle information sheet",
    forms: "State forms — official FLHSMV links",
  },
  es: {
    title: "Paquete de Rescate de Vehículo — Portada e instrucciones",
    instructions: [
      "BORRADOR: no firme hasta que Sorrentino Law Firm, PLLC apruebe este paquete para usted.",
      "Cada propietario en el título debe firmar el Acuerdo de Rescate de Vehículo y los formularios estatales requeridos. El Contacto Designado reconoce su función. El Apoderado firma el Anexo C.",
      "La Autorización para Liberar un Vehículo Retenido debe ser notarizada. Indique si la notarización es en presencia física o en línea. Firme los demás documentos solo donde se indique.",
      "Entregue los formularios originales firmados a Sorrentino Law Firm, PLLC para revisión y custodia. Guarde copias para usted y su Contacto Designado. Los formularios oficiales de Florida se obtienen de FLHSMV; no se vuelven a alojar en este paquete.",
      "Complete el costo fijo de transporte, millaje, datos y licencia del concesionario, últimos cuatro dígitos del préstamo, cifras de liquidación y todos los espacios antes de firmar. No escriba números de banco o tarjetas.",
    ],
    info: "Hoja de información del vehículo",
    forms: "Formularios estatales — enlaces oficiales de FLHSMV",
  },
  ht: {
    title: "Pakè Rekiperasyon Machin — Paj kouvèti ak enstriksyon",
    instructions: [
      "BOUYON: pa siyen jiskaske Sorrentino Law Firm, PLLC apwouve pakè sa a pou ou.",
      "Chak pwopriyetè sou tit la dwe siyen Akò Rekiperasyon Machin nan ak fòm eta obligatwa yo. Kontak Deziyen an rekonèt wòl li. Ajan an siyen Lis C.",
      "Otorizasyon pou Libere Machin nan Fouri a dwe notarize. Make si notarizasyon an fizik oswa sou entènèt. Siyen lòt dokiman sèlman kote yo endike.",
      "Bay Sorrentino Law Firm, PLLC orijinal dokiman siyen yo pou revizyon ak konsèvasyon. Kenbe kopi pou ou ak Kontak Deziyen ou. Jwenn fòm ofisyèl Florid yo sou FLHSMV; pakè sa a pa re-woztaj yo.",
      "Ranpli pri fiks transpò, kilometraj, enfòmasyon ak lisans konsesyonè, 4 dènye chif kont pre a, kalkil règleman ak tout espas anvan ou siyen. Pa ekri nimewo labank oswa kat.",
    ],
    info: "Fich enfòmasyon machin",
    forms: "Fòm eta yo — lyen ofisyèl FLHSMV",
  },
};

function vehicleLines(vehicle?: VehicleIntake) {
  if (!vehicle) return [
    `Owner(s): ${blank}`, `Year / Make / Model: ${blank}`, `VIN: ${blank}`, `Plate / State: ${blank}`,
    `Title connection (and/or): ${blank}`, `Lienholder (optional): ${blank}`, `Paper title held by: ${blank}`,
    `Keys and title location: ${blank}`, `Insurance (optional): ${blank}`, `Designated Contact / relationship / phone: ${blank}`,
    `Proceeds direction: ${blank}`, `Agent / agent type: ${blank}`,
  ];
  return [
    `Owner(s): ${vehicle.titleOwners.join("; ")}`,
    `Year / Make / Model: ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    `VIN: ${vehicle.vin}`, `Plate / State: ${vehicle.plate} / ${vehicle.plateState}`,
    `Title connection: ${vehicle.titleConnector}`, `Lienholder: ${vehicle.lienholder || "None supplied"}`,
    `Paper title held by: ${vehicle.titleHolder}`, `Keys and title location: ${vehicle.keysTitleLocation}`,
    `Insurance: ${vehicle.insuranceCompany || "Not supplied"}`,
    `Designated Contact: ${vehicle.contactName}; relationship: ${vehicle.contactRelationship}; phone: ${vehicle.contactPhone}`,
    `Proceeds direction: ${vehicle.proceeds}${vehicle.proceedsDetails ? ` — ${vehicle.proceedsDetails}` : ""}`,
    `Agent: ${vehicle.agentType === "law_firm" ? "A Sorrentino Law Firm staff member assigned in the reviewed document" : vehicle.agentName}`,
  ];
}

export async function vehicleRescuePacket(options: PacketOptions) {
  const { language, ownerName, vehicle, approved, reviewerName, approvedAt } = options;
  const copy = coverCopy[language];
  const notice = approved
    ? `ATTORNEY APPROVED — ${reviewerName ?? "Sorrentino Law Firm, PLLC"} — ${approvedAt ?? ""}`
    : VEHICLE_DRAFT_NOTICE[language];
  const names = vehicle?.titleOwners.join("; ") || ownerName || blank;
  const agent = vehicle?.agentType === "law_firm" ? "Sorrentino Law Firm staff member named in the final reviewed packet" : vehicle?.agentName || blank;
  const agreement = consumer(language)
    .replace("Owner has appointed ____ as attorney-in-fact", `Owner has appointed ${agent} as attorney-in-fact`)
    .replace("I, ____, the registered owner", `I, ${names}, the registered owner`)
    .replace("I authorize ____ (lienholder)", `I authorize ${vehicle?.lienholder || blank} (lienholder)`)
    .replace("to my Agent ____ and to the Partner Dealer", `to my Agent ${agent} and to the Partner Dealer`);
  const instructions = [...copy.instructions];
  if (approved) instructions[0] = language === "es"
    ? "APROBADO POR EL ABOGADO: use este paquete aprobado y siga las instrucciones de firma. Cualquier cambio posterior requiere una nueva revisión."
    : language === "ht"
      ? "AVOKA A APROUVE: sèvi ak pakè apwouve sa a epi swiv enstriksyon siyati yo. Nenpòt chanjman pita mande yon nouvo revizyon."
      : "ATTORNEY APPROVED: use this approved packet and follow the signing instructions. Any later change requires a new review.";
  const sections: Section[] = [
    { heading: copy.title, lines: [...instructions, `Owner / client: ${ownerName || names}`, `Language: ${language.toUpperCase()}`] },
    { heading: copy.info, lines: vehicleLines(vehicle), pageBreak: true },
    ...(language !== "en" ? [{ heading: VEHICLE_COURTESY_NOTICE[language], lines: [] as string[], pageBreak: true }] : []),
    ...markdownSections(agreement),
    ...(language !== "en" ? [
      { heading: "ENGLISH CONTROLLING TEXT — ATTACHED", lines: ["The English version controls over every courtesy translation."], pageBreak: true },
      ...markdownSections(consumer("en").replace("Owner has appointed ____ as attorney-in-fact", `Owner has appointed ${agent} as attorney-in-fact`)),
    ] : []),
    {
      heading: copy.forms,
      lines: [
        ...FLHSMV_FORMS.map((form) => `${form.id} — ${form.label}: ${form.url}`),
        "If a direct link does not open, use the official FLHSMV forms page: https://www.flhsmv.gov/forms/",
        "HSMV 82995 is used when the lender holds the title or the title is lost. Complete and sign the official forms only as directed in the attorney-approved instructions.",
      ],
      pageBreak: true,
    },
  ];
  return textPacket(`Vehicle Rescue Packet — ${ownerName || names}`, sections, {
    notice,
    watermark: !approved,
    pageLabel: language === "es" ? "Página" : language === "ht" ? "Paj" : "Page",
  });
}

export async function dealerParticipationAgreementPdf() {
  return textPacket("DEALER PARTICIPATION AGREEMENT", [
    { heading: "DEALER PARTICIPATION AGREEMENT — DRAFT", lines: ["PENDING ATTORNEY APPROVAL — DO NOT SIGN"] },
    ...markdownSections(`## DEALER PARTICIPATION AGREEMENT\n${dealer}`),
  ], { notice: VEHICLE_DRAFT_NOTICE.en, watermark: true });
}
