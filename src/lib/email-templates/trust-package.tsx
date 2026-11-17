import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Button,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { FIRM } from "@/lib/firm-info";
const copy = {
  en: {
    title: "Your Save My Home Trust PDF",
    download: "Download my PDF",
    note: "This is your preparation draft, not a signed trust. Do not sign or transfer your home until the attorney approves the complete documents.",
    expiry: "This private link works for 7 days. Ask our team for a new link if needed.",
    businessTitle: "Your Do Not Forget Your Business trust PDF",
    businessNote:
      "Your PDF includes the business trust agreement, schedules, trustee acceptance, paralegal preparation page and monthly-fee record. It is not a signed trust or a bill. Do not sign or transfer business ownership until the attorney approves the complete documents.",
  },
  es: {
    title: "Su PDF de Save My Home Trust",
    download: "Descargar mi PDF",
    note: "Este es su borrador, no un fideicomiso firmado. No firme ni transfiera su casa hasta que el abogado apruebe los documentos completos.",
    expiry: "Este enlace privado dura 7 días. Pida otro enlace a nuestro equipo si lo necesita.",
    businessTitle: "Su PDF del fideicomiso de Do Not Forget Your Business",
    businessNote:
      "Su PDF incluye el acuerdo del fideicomiso, los anexos, la aceptación del fiduciario, la página de preparación del paralegal y el registro de la cuota mensual. No es un fideicomiso firmado ni una factura. No firme ni transfiera el negocio hasta que el abogado apruebe todos los documentos.",
  },
  ht: {
    title: "PDF Save My Home Trust ou a",
    download: "Telechaje PDF mwen",
    note: "Sa a se bouyon preparasyon ou, pa yon trust siyen. Pa siyen ni transfere kay ou jiskaske avoka a apwouve tout dokiman yo.",
    expiry: "Lyen prive sa a mache pandan 7 jou. Mande ekip nou an yon lòt lyen si ou bezwen li.",
    businessTitle: "PDF fidisi Do Not Forget Your Business ou a",
    businessNote:
      "PDF ou a gen akò fidisi a, anèks yo, akseptasyon fidisyè a, paj preparasyon paralegal la ak rejis frè pa mwa a. Se pa yon fidisi siyen ni yon bòdwo. Pa siyen ni transfere biznis ou jiskaske avoka a apwouve tout dokiman yo.",
  },
};
export const template = {
  component: ({
    name = "",
    language = "en",
    downloadUrl = "",
    packageKind = "home",
  }: {
    name?: string;
    language?: "en" | "es" | "ht";
    downloadUrl?: string;
    packageKind?: "home" | "business";
  }) => {
    const c = copy[language];
    const title = packageKind === "business" ? c.businessTitle : c.title;
    return (
      <Html lang={language}>
        <Head />
        <Preview>{title}</Preview>
        <Body style={{ backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" }}>
          <Container style={{ padding: 24, maxWidth: 600 }}>
            <Heading>{title}</Heading>
            <Text>{name}</Text>
            <Text>{packageKind === "business" ? c.businessNote : c.note}</Text>
            <Button href={downloadUrl}>{c.download}</Button>
            <Text>{c.expiry}</Text>
            <Text>
              {FIRM.legalName} · {FIRM.city}
            </Text>
          </Container>
        </Body>
      </Html>
    );
  },
  subject: (data: Record<string, unknown>) => {
    const c = copy[data.language === "es" ? "es" : data.language === "ht" ? "ht" : "en"];
    return data.packageKind === "business" ? c.businessTitle : c.title;
  },
  displayName: "Client home or business trust PDF",
} satisfies TemplateEntry;
