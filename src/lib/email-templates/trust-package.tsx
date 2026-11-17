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
  },
  es: {
    title: "Su PDF de Save My Home Trust",
    download: "Descargar mi PDF",
    note: "Este es su borrador, no un fideicomiso firmado. No firme ni transfiera su casa hasta que el abogado apruebe los documentos completos.",
    expiry: "Este enlace privado dura 7 días. Pida otro enlace a nuestro equipo si lo necesita.",
  },
  ht: {
    title: "PDF Save My Home Trust ou a",
    download: "Telechaje PDF mwen",
    note: "Sa a se bouyon preparasyon ou, pa yon trust siyen. Pa siyen ni transfere kay ou jiskaske avoka a apwouve tout dokiman yo.",
    expiry: "Lyen prive sa a mache pandan 7 jou. Mande ekip nou an yon lòt lyen si ou bezwen li.",
  },
};
export const template = {
  component: ({
    name = "",
    language = "en",
    downloadUrl = "",
  }: {
    name?: string;
    language?: "en" | "es" | "ht";
    downloadUrl?: string;
  }) => {
    const c = copy[language];
    return (
      <Html lang={language}>
        <Head />
        <Preview>{c.title}</Preview>
        <Body style={{ backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" }}>
          <Container style={{ padding: 24, maxWidth: 600 }}>
            <Heading>{c.title}</Heading>
            <Text>{name}</Text>
            <Text>{c.note}</Text>
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
  subject: (data: Record<string, unknown>) =>
    copy[data.language === "es" ? "es" : data.language === "ht" ? "ht" : "en"].title,
  displayName: "Save My Home Trust client PDF",
} satisfies TemplateEntry;
