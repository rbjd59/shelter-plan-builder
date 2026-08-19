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
    preview: "Your activation code and Android setup manual",
    greeting: (n: string) => (n ? `Hi ${n},` : "Hi,"),
    intro:
      "Your file has been received and your DetencionDefensa mobile app is ready to activate.",
    codeLabel: "Your activation code:",
    instructions: "Keep this email open while you set up the app. Follow the numbered instructions below.",
    androidBtn: "Download Android app",
    iosBtn: "Apple — Coming soon",
    keepSafe:
      "Keep this code somewhere safe. You will need it again if you reinstall the app.",
    soon: "Apple/iPhone: Coming soon. We will send you a new message when the Apple version is ready.",
    manualTitle: "Android quick-start manual",
    installSteps: [
      "Tap Download Android app. Wait until the full download finishes.",
      "Tap the completed download. If nothing opens, open Files or My Files, choose Downloads, and tap the file whose name starts with detenciondefensa and ends in .apk.",
      "If Android blocks it, tap Settings, allow installation from this source for Chrome, return, and tap Install. This permission can be turned off after installation.",
      "Open DetencionDefensa and enter the activation code shown above. Do not share the code outside your household.",
    ],
    setupTitle: "Set up and use the app",
    setupSteps: [
      "Contacts: open Contacts and add up to three trusted family contacts. Save each one. The legal team contacts are locked and cannot be changed.",
      "Documents: open Family Docs to confirm your prepared documents appear. Tap a document to view it.",
      "Bottom buttons: use the bottom navigation buttons to move between Home, Contacts, Family Docs, and Profile/Settings.",
      "Activation: use the red emergency/SOS control only when help is needed. Follow the confirmation shown on screen.",
      "Deactivation/cancel: if it was a mistake or the danger has passed, use the cancel/deactivation control and follow the on-screen hold or PIN instructions. Confirm that the app says the alert was canceled.",
      "Test safely: do not send a real alert just to practice. Review contacts and documents instead. Contact support if anything is missing.",
    ],
  },
  es: {
    preview: "Su codigo de activacion de DetencionDefensa",
    greeting: (n: string) => (n ? `Hola ${n},` : "Hola,"),
    intro:
      "Hemos recibido su expediente y su aplicacion movil de DetencionDefensa esta lista para activar.",
    codeLabel: "Su codigo de activacion:",
    instructions: "Mantenga este correo abierto mientras configura la app. Siga las instrucciones numeradas abajo.",
    androidBtn: "Descargar app para Android",
    iosBtn: "Apple — Próximamente",
    keepSafe:
      "Guarde este codigo en un lugar seguro. Lo necesitara si reinstala la aplicacion.",
    soon: "Apple/iPhone: Próximamente. Le enviaremos un nuevo mensaje cuando la versión de Apple esté lista.",
    manualTitle: "Manual de inicio rápido para Android",
    installSteps: [
      "Toque Descargar app para Android. Espere hasta que termine toda la descarga.",
      "Toque la descarga terminada. Si no abre, abra Archivos o Mis archivos, entre a Descargas y toque el archivo cuyo nombre comienza con detenciondefensa y termina en .apk.",
      "Si Android lo bloquea, toque Configuración, permita instalar desde esta fuente para Chrome, regrese y toque Instalar. Puede apagar este permiso después.",
      "Abra DetencionDefensa e ingrese el código de activación de arriba. No comparta el código fuera de su hogar.",
    ],
    setupTitle: "Configurar y utilizar la app",
    setupSteps: [
      "Contactos: abra Contactos y agregue hasta tres familiares de confianza. Guarde cada uno. Los contactos del equipo legal están bloqueados y no se pueden cambiar.",
      "Documentos: abra Documentos familiares para confirmar que aparecen sus documentos preparados. Toque uno para verlo.",
      "Botones inferiores: use los botones de navegación de abajo para ir a Inicio, Contactos, Documentos familiares y Perfil/Configuración.",
      "Activación: use el control rojo de emergencia/SOS solamente cuando necesite ayuda. Siga la confirmación en pantalla.",
      "Desactivar/cancelar: si fue un error o pasó el peligro, use el control de cancelar/desactivar y siga las instrucciones de mantener presionado o ingresar su PIN. Confirme que la app diga que la alerta fue cancelada.",
      "Prueba segura: no envíe una alerta real solamente para practicar. Revise sus contactos y documentos. Comuníquese con soporte si falta algo.",
    ],
  },
  ht: {
    preview: "Kod aktivasyon aplikasyon DetencionDefensa ou",
    greeting: (n: string) => (n ? `Bonjou ${n},` : "Bonjou,"),
    intro:
      "Nou resevwa dosye ou epi aplikasyon mobil DetencionDefensa ou pare pou aktive.",
    codeLabel: "Kod aktivasyon ou:",
    instructions: "Kenbe imèl sa ouvri pandan w ap konfigire app la. Swiv etap nimewote yo anba a.",
    androidBtn: "Telechaje app Android la",
    iosBtn: "Apple — Ap vini byento",
    keepSafe:
      "Kenbe kod sa a yon kote ki an sekirite. W ap bezwen l ankò si w reenstale aplikasyon an.",
    soon: "Apple/iPhone: Ap vini byento. N ap voye yon nouvo mesaj lè vèsyon Apple la pare.",
    manualTitle: "Manyèl demaraj rapid pou Android",
    installSteps: [
      "Peze Telechaje app Android la. Tann tout telechajman an fini.",
      "Peze telechajman ki fini an. Si anyen pa ouvri, ouvri Files oswa My Files, chwazi Downloads, epi peze fichye ki kòmanse ak detenciondefensa epi ki fini ak .apk.",
      "Si Android bloke li, peze Settings, pèmèt enstalasyon soti nan sous sa pou Chrome, retounen epi peze Install. Ou ka fèmen pèmisyon sa apre enstalasyon an.",
      "Ouvri DetencionDefensa epi antre kòd aktivasyon ki anwo a. Pa pataje kòd la deyò fanmi ou.",
    ],
    setupTitle: "Konfigire epi sèvi ak app la",
    setupSteps: [
      "Kontak: ouvri Contacts epi ajoute jiska twa moun fanmi ou fè konfyans. Sove chak kontak. Kontak ekip legal la bloke epi ou pa ka chanje yo.",
      "Dokiman: ouvri Family Docs pou verifye dokiman yo prepare pou ou parèt. Peze yon dokiman pou wè li.",
      "Bouton anba yo: sèvi ak bouton navigasyon anba ekran an pou ale nan Home, Contacts, Family Docs, ak Profile/Settings.",
      "Aktivasyon: sèvi ak kontwòl ijans/SOS wouj la sèlman lè ou bezwen èd. Swiv konfimasyon ki parèt sou ekran an.",
      "Dezaktive/anile: si se te yon erè oswa danje a pase, sèvi ak kontwòl anile/dezaktive a epi swiv enstriksyon pou kenbe bouton an oswa antre PIN ou. Verifye app la di alèt la anile.",
      "Teste san danje: pa voye yon vrè alèt sèlman pou pratike. Verifye kontak ak dokiman yo pito. Kontakte sipò si yon bagay manke.",
    ],
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

          <Heading as="h2" style={h2}>{t.manualTitle}</Heading>
          <Section style={manualBox}>
            {t.installSteps.map((step, index) => (
              <Text key={step} style={stepText}><strong>{index + 1}.</strong> {step}</Text>
            ))}
          </Section>

          <Section style={{ textAlign: "center", margin: "24px 0" }}>
            {apkUrl ? (
              <Button href={apkUrl} style={btnPrimary}>
                {t.androidBtn}
              </Button>
            ) : null}
            <br />
            <Text style={comingSoon}>{t.iosBtn}</Text>
          </Section>

          <Heading as="h2" style={h2}>{t.setupTitle}</Heading>
          <Section style={manualBox}>
            {t.setupSteps.map((step, index) => (
              <Text key={step} style={stepText}><strong>{index + 1}.</strong> {step}</Text>
            ))}
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
const h2 = { color: "#0b1220", fontSize: "18px", fontWeight: 700, margin: "24px 0 10px" };
const manualBox = { background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px 16px" };
const stepText = { color: "#1f2937", fontSize: "14px", lineHeight: "21px", margin: "9px 0" };
const comingSoon = { color: "#6b7280", fontSize: "14px", fontWeight: 700, margin: "14px 0 0" };
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
