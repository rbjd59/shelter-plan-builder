import { Body, Button, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { PREPAREDNESS_COPY } from "../preparedness-content";
function FamilyPacketEmail({ name = "", language = "en", url = "" }: { name?: string; language?: "en" | "es" | "ht"; url?: string }) {
  const t = PREPAREDNESS_COPY[language];
  return <Html lang={language}><Head /><Preview>{t.packetHeading}</Preview><Body style={{ backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" }}><Container style={{ padding: "32px 24px" }}><Heading>DetencionDefensa.com</Heading><Text>{name}</Text><Heading as="h2">{t.packetHeading}</Heading><Text>{t.packetNote}</Text>{url && <Button href={url}>{t.download}</Button>}<Text>{t.habeas}</Text></Container></Body></Html>;
}
export const template = { component: FamilyPacketEmail, subject: (data: Record<string, unknown>) => PREPAREDNESS_COPY[data.language === "es" || data.language === "ht" ? data.language : "en"].packetHeading, displayName: "Family preparedness packet", previewData: { name: "Sample client", language: "en" } } satisfies TemplateEntry;