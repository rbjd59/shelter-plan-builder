import React from "react";
import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  name?: string;
  phone?: string;
  language?: string;
  source?: string;
  details?: string;
}

const LeadAssigned = ({ name, phone, language, source, details }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>A call request was assigned to you</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>A call request was assigned to you</Heading>
        <Text style={text}>Name: {name || "—"}</Text>
        <Text style={text}>Phone: {phone || "—"}</Text>
        <Text style={text}>Language: {(language || "—").toUpperCase()}</Text>
        <Text style={text}>Source: {source || "—"}</Text>
        {details ? <Text style={text}>{details}</Text> : null}
        <Text style={muted}>
          Open Mission Control → Leads to call back and update the status. A call request is not a
          client matter until the Firm accepts it in writing.
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: LeadAssigned,
  subject: "Call request assigned to you",
  displayName: "Lead assigned to staff",
  previewData: {
    name: "Maria Lopez",
    phone: "305-555-0100",
    language: "es",
    source: "business-call-intake",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "20px 25px" };
const h1 = { fontSize: "20px", color: "#1e2a44" };
const text = {
  fontSize: "14px",
  color: "#1f2937",
  margin: "4px 0",
  whiteSpace: "pre-wrap" as const,
};
const muted = { fontSize: "12px", color: "#6b7280", marginTop: "16px" };
