import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  code?: string;
  language?: "en" | "es" | "ht";
  apkUrl?: string;
  testflightUrl?: string;
  fullName?: string;
}

const COPY = {
  en: {
    preview: "Your DetencionDefensa app activation code",
    greeting: (n: string) => (n ? `Hi ${n},` : "Hi,"),
    intro:
      "Your file has been received and your DetencionDefensa mobile app is ready to activate.",
    codeLabel: "Your activation code:",
    instructions: "Install the app on the phone you want protected, then enter this code on the activation screen.",
    androidBtn: "Download the app (Android)",
    iosBtn: "Join the iOS test build",
    keepSafe:
      "Keep this code somewhere safe. You will need it again if you reinstall the app.",
    soon: "If you do not see the buttons above, the iOS / Android store releases are coming soon.",
  },
  es: {
    preview: "Su codigo de activacion de DetencionDefensa",
    greeting: (n: string) => (n ? `Hola ${n},` : "Hola,"),
    intro:
      "Hemos recibido su expediente y su aplicacion movil de DetencionDefensa esta lista para activar.",
    codeLabel: "Su codigo de activacion:",
    instructions:
      "Instale la aplicacion en el telefono que desea proteger, luego ingrese este codigo en la pantalla de activacion.",
    androidBtn: "Descargar la app (Android)",
    iosBtn: "Unirse a la prueba de iOS",
    keepSafe:
      "Guarde este codigo en un lugar seguro. Lo necesitara si reinstala la aplicacion.",
    soon: "Si no ve los botones arriba, las versiones de la App Store / Play Store estaran disponibles pronto.",
  },
  ht: {
    preview: "Kod aktivasyon aplikasyon DetencionDefensa ou",
    greeting: (n: string) => (n ? `Bonjou ${n},` : "Bonjou,"),
    intro:
      "Nou resevwa dosye ou epi aplikasyon mobil DetencionDefensa ou pare pou aktive.",
    codeLabel: "Kod aktivasyon ou:",
    instructions:
      "Enstale aplikasyon an sou telefon w vle pwoteje a, apre sa antre kod sa a nan ekran aktivasyon an.",
    androidBtn: "Telechaje aplikasyon an (Android)",
    iosBtn: "Antre nan tes iOS la",
    keepSafe:
      "Kenbe kod sa a yon kote ki an sekirite. W ap bezwen l ankò si w reenstale aplikasyon an.",
    soon: "Si w pa wè bouton yo anwo, vèsyon App Store / Play Store ap vini byento.",
  },
};

const Email = ({
  code = "XXXXXXXX",
  language = "en",
  apkUrl,
  testflightUrl,
  fullName = "",
}: Props) => {
  const t = COPY[language] ?? COPY.en;
  return (
    <Html lang={language} dir="ltr">
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>DetencionDefensa</Heading>
          <Text style={text}>{t.greeting(fullName)}</Text>
          <Text style={text}>{t.intro}</Text>

          <Section style={codeBox}>
            <Text style={codeLabel}>{t.codeLabel}</Text>
            <Text style={codeStyle}>{code}</Text>
          </Section>

          <Text style={text}>{t.instructions}</Text>

          <Section style={{ textAlign: "center", margin: "24px 0" }}>
            {apkUrl ? (
              <Button href={apkUrl} style={btnPrimary}>
                {t.androidBtn}
              </Button>
            ) : null}
            {testflightUrl ? (
              <>
                <br />
                <Button href={testflightUrl} style={btnSecondary}>
                  {t.iosBtn}
                </Button>
              </>
            ) : null}
          </Section>

          <Hr style={hr} />
          <Text style={small}>{t.keepSafe}</Text>
          <Text style={small}>{t.soon}</Text>
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: Email,
  subject: (data: Record<string, any>) => {
    const lang = data?.language ?? "en";
    if (lang === "es") return "Su codigo de activacion de la app DetencionDefensa";
    if (lang === "ht") return "Kod aktivasyon aplikasyon DetencionDefensa ou";
    return "Your DetencionDefensa app activation code";
  },
  displayName: "App Activation Code",
  previewData: {
    code: "K7M9P2Q4",
    language: "en",
    fullName: "Maria",
    apkUrl: "https://example.com/app.apk",
    testflightUrl: "https://testflight.apple.com/join/example",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Inter, Arial, sans-serif" };
const container = { padding: "32px 28px", maxWidth: "560px", margin: "0 auto" };
const h1 = { color: "#0b1220", fontSize: "22px", fontWeight: 700, marginBottom: "8px" };
const text = { color: "#1f2937", fontSize: "15px", lineHeight: "22px", margin: "12px 0" };
const codeBox = {
  background: "#fff7ed",
  border: "2px solid #e8a04a",
  borderRadius: "8px",
  padding: "20px",
  textAlign: "center" as const,
  margin: "20px 0",
};
const codeLabel = { color: "#92400e", fontSize: "13px", margin: "0 0 8px", fontWeight: 600 };
const codeStyle = {
  color: "#0b1220",
  fontSize: "32px",
  fontWeight: 700,
  letterSpacing: "6px",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  margin: "0",
};
const btnPrimary = {
  background: "#e8a04a",
  color: "#0b1220",
  padding: "12px 22px",
  borderRadius: "6px",
  fontSize: "15px",
  fontWeight: 700,
  textDecoration: "none",
  display: "inline-block",
};
const btnSecondary = {
  background: "#0b1220",
  color: "#ffffff",
  padding: "12px 22px",
  borderRadius: "6px",
  fontSize: "15px",
  fontWeight: 700,
  textDecoration: "none",
  display: "inline-block",
  marginTop: "10px",
};
const hr = { borderColor: "#e5e7eb", margin: "24px 0" };
const small = { color: "#6b7280", fontSize: "12px", lineHeight: "18px", margin: "8px 0" };
