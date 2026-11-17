import { LEAD_NOTIFY_EMAIL } from "../lead-notify";
import { Html, Head, Body, Container, Heading, Text, Link } from "@react-email/components";
import type { TemplateEntry } from "./registry";

function BusinessCallRequest({
  name,
  phone,
  language,
  details,
}: {
  name?: string;
  phone?: string;
  language?: string;
  details?: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ padding: "24px" }}>
          <Heading>Do Not Forget Your Business — call request</Heading>
          <Text>Assigned to Ricky Bitelman-Behar JD</Text>
          <Text>
            {name} · {phone} · {language}
          </Text>
          <Text style={{ whiteSpace: "pre-wrap" }}>{details}</Text>
          <Link href="https://donotforgetyourbusiness.com/admin/leads">
            Open the private lead inbox
          </Link>
        </Container>
      </Body>
    </Html>
  );
}

export const template = {
  component: BusinessCallRequest,
  subject: "Business call request assigned to you",
  to: LEAD_NOTIFY_EMAIL,
} satisfies TemplateEntry;
