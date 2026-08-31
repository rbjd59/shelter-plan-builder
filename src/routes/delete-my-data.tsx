import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang } from "@/context/LanguageContext";

export const Route = createFileRoute("/delete-my-data")({
  head: () => ({
    meta: [
      { title: "Delete My Data — DetencionDefensa" },
      {
        name: "description",
        content:
          "Request deletion of your DetencionDefensa account and personal data. Instructions in English, Spanish, and Haitian Creole.",
      },
      { property: "og:title", content: "Delete My Data — DetencionDefensa" },
      {
        property: "og:description",
        content:
          "Request deletion of your DetencionDefensa account and personal data. Instructions in English, Spanish, and Haitian Creole.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://detenciondefensa.com/delete-my-data" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Delete My Data — DetencionDefensa" },
      {
        name: "twitter:description",
        content:
          "Request deletion of your DetencionDefensa account and personal data. Instructions in English, Spanish, and Haitian Creole.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://detenciondefensa.com/delete-my-data" },
    ],
  }),
  component: DeleteMyDataPage,
});

const COPY = {
  en: {
    home: "← Home",
    pageTitle: "Delete My Data",
    appAndDeveloper:
      "This page applies to DetencionDefensa SOS, developed and published by Nestor J. Bittelman on behalf of DetencionDefensa.com, Inc.",
    intro:
      "You can request that we delete all personal information associated with your DetencionDefensa account at any time.",
    step1Title: "1. Send us a request",
    step1Text: "Email us from the address you used when you signed up, or include your activation code so we can find your record.",
    emailLabel: "Email:",
    step2Title: "2. What we delete",
    step2Items: [
      "Your name, A-number, date of birth, and country of citizenship",
      "Your emergency contacts and their phone numbers / emails",
      "Your case intake answers and facility information",
      "Your activation code, PIN, and any app pairing data",
    ],
    step3Title: "3. What we keep",
    step3Items: [
      "Billing or payment records required by law (if any)",
      "Anonymized logs used only for security or abuse prevention",
    ],
    step4Title: "4. Timing",
    step4Text:
      "We will confirm your request within 48 hours and complete deletion within 7 days, unless we are required by law to keep certain records longer. Accounts and personal data that remain inactive and are not subject to a legal hold are automatically deleted within 90 days.",
    footer: "Sorrentino Law Firm PLLC operates this site under license from DetencionDefensa.com, Inc. and provides all legal services. DetencionDefensa.com, Inc. is strictly the technology developer and operator of the typing, translation, and emergency delivery system; it is not a law firm and gives no legal advice.",
    copyright: "© 2026 DetencionDefensa",
  },
  es: {
    home: "← Inicio",
    pageTitle: "Eliminar mis datos",
    appAndDeveloper:
      "Esta página aplica a DetencionDefensa SOS, desarrollada y publicada por Nestor J. Bittelman en nombre de DetencionDefensa.com, Inc.",
    intro:
      "Puede solicitar que eliminemos toda la información personal asociada con su cuenta de DetencionDefensa en cualquier momento.",
    step1Title: "1. Envíenos una solicitud",
    step1Text: "Envíenos un correo desde la dirección que usó al registrarse, o incluya su código de activación para que podamos encontrar su registro.",
    emailLabel: "Correo:",
    step2Title: "2. Lo que eliminamos",
    step2Items: [
      "Su nombre, número A, fecha de nacimiento y país de ciudadanía",
      "Sus contactos de emergencia y sus números de teléfono / correos electrónicos",
      "Las respuestas de admisión de su caso y la información de la instalación",
      "Su código de activación, PIN y cualquier dato de emparejamiento de la aplicación",
    ],
    step3Title: "3. Lo que conservamos",
    step3Items: [
      "Registros de facturación o pago requeridos por ley (si los hay)",
      "Registros anonimizados que solo se usan para seguridad o prevención de abusos",
    ],
    step4Title: "4. Plazo",
    step4Text:
      "Confirmaremos su solicitud dentro de 48 horas y completaremos la eliminación dentro de 7 días, a menos que la ley nos exija conservar ciertos registros por más tiempo. Las cuentas y los datos personales que permanezcan inactivos y no estén sujetos a una retención legal se eliminan automáticamente dentro de 90 días.",
    footer: "Sorrentino Law Firm PLLC opera este sitio bajo licencia de DetencionDefensa.com, Inc. y presta todos los servicios legales. DetencionDefensa.com, Inc. es estrictamente el desarrollador tecnológico y operador del sistema de mecanografía, traducción y entrega de emergencia; no es una firma de abogados y no brinda asesoría legal.",
    copyright: "© 2026 DetencionDefensa",
  },
  ht: {
    home: "← Akèy",
    pageTitle: "Efase done mwen yo",
    appAndDeveloper:
      "Paj sa a aplike a DetencionDefensa SOS, ki devlope e ki pibliye pa Nestor J. Bittelman pou kont DetencionDefensa.com, Inc.",
    intro:
      "Ou ka mande nou efase tout enfòmasyon pèsonèl ki asosye ak kont DetencionDefensa ou a nenpòt lè.",
    step1Title: "1. Voye yon demann ban nou",
    step1Text: "Voye yon imèl nou soti nan adrès ou te itilize lè ou te anrejistre, oswa mete kòd aktivasyon ou pou nou ka jwenn dosye ou.",
    emailLabel: "Imèl:",
    step2Title: "2. Sa nou efase",
    step2Items: [
      "Non ou, nimewo A, dat nesans, ak peyi sitwayènte ou",
      "Kontak ijans ou yo ak nimewo telefòn / imèl yo",
      "Repons admisyon ka ou yo ak enfòmasyon sou etablisman an",
      "Kòd aktivasyon ou, PIN, ak nenpòt done koneksyon aplikasyon an",
    ],
    step3Title: "3. Sa nou kenbe",
    step3Items: [
      "Dosye fati oswa peman ki lalwa egzije (si genyen)",
      "Jounal anonimizé ki sèlman itilize pou sekirite oswa anpeche abi",
    ],
    step4Title: "4. Tan",
    step4Text:
      "N ap konfime demann ou nan lespas 48 èdtan e n ap fin efase done yo nan 7 jou, eksepte si lalwa egzije nou konsève sèten dosye pi lontan. Kont ak done pèsonèl ki rete inaktif e ki pa sijè a yon kenbe legal efase otomatikman nan 90 jou.",
    footer: "Se Sorrentino Law Firm PLLC k ap opere sit sa a anba yon lisans DetencionDefensa.com, Inc. bay, epi se li ki bay tout sèvis legal. DetencionDefensa.com, Inc. se sèlman devlopè teknoloji a ak operatè sistèm daktilografi, tradiksyon, ak livrezon dijans lan; li pa yon kabinè avoka epi li pa bay konsèy legal.",
    copyright: "© 2026 DetencionDefensa",
  },
} as const;

function DeleteMyDataPage() {
  const { lang } = useLang();
  const t = COPY[lang];
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            {t.home}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-2 text-center text-3xl font-bold text-foreground">
          {t.pageTitle}
        </h1>
        <p className="mb-6 text-center text-sm font-medium text-foreground">
          {t.appAndDeveloper}
        </p>

        <section className="mb-8 rounded-xl border bg-card p-6 shadow-sm">
          <p className="mb-6 text-muted-foreground leading-relaxed">{t.intro}</p>

          <h2 className="mb-2 text-xl font-semibold text-foreground">{t.step1Title}</h2>
          <p className="mb-4 text-muted-foreground leading-relaxed">
            {t.step1Text}
          </p>
          <p className="mb-6 font-medium text-foreground">
            {t.emailLabel}{" "}
            <a href="mailto:legal@detenciondefensa.com?subject=Delete%20my%20data" className="text-primary underline">
              legal@detenciondefensa.com
            </a>
          </p>

          <h2 className="mb-2 text-xl font-semibold text-foreground">{t.step2Title}</h2>
          <ul className="mb-6 list-disc pl-5 space-y-1 text-muted-foreground leading-relaxed">
            {t.step2Items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2 className="mb-2 text-xl font-semibold text-foreground">{t.step3Title}</h2>
          <ul className="mb-6 list-disc pl-5 space-y-1 text-muted-foreground leading-relaxed">
            {t.step3Items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <h2 className="mb-2 text-xl font-semibold text-foreground">{t.step4Title}</h2>
          <p className="text-muted-foreground leading-relaxed">{t.step4Text}</p>
        </section>
      </main>

      <footer className="border-t bg-background/50">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">{t.footer}</p>
          <p className="mt-2 text-xs text-muted-foreground">{t.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
