import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/context/LanguageContext";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support / Ayuda / Sipò — DetencionDefensa" },
      { name: "description", content: "Get help with the DetencionDefensa app. Support in English, Spanish, and Haitian Creole." },
      { property: "og:title", content: "Support / Ayuda / Sipò — DetencionDefensa" },
      { property: "og:description", content: "Get help with the DetencionDefensa app. Support in English, Spanish, and Haitian Creole." },
      { property: "og:url", content: "https://detenciondefensa.com/support" },
    ],
    links: [
      { rel: "canonical", href: "https://detenciondefensa.com/support" },
    ],
  }),
  component: SupportPage,
});

const COPY = {
  en: {
    home: "← Home",
    pageTitle: "Support / Ayuda / Sipò",
    langLabel: "English",
    intro1: "Need help with the DetencionDefensa app?",
    intro2: "We are here to help. Email us and we will respond within 24 hours.",
    emailLabel: "Email:",
    faqTitle: "Common questions",
    q1: "The 6-digit code from the website did not work on my phone.",
    a1: "Codes expire after 24 hours. Go back to the website and submit your intake form again to get a fresh code. If it still does not work, email us.",
    q2: "I pressed the red button by accident.",
    a2: 'Open the app. You have 2 hours to enter your 4-digit PIN to cancel. If you cancel, an "all-clear" email is sent to your contacts automatically.',
    q3: "I forgot my 4-digit PIN.",
    a3pre: "Contact us at",
    a3post: ". We will help you reset it.",
    q4: "My emergency contact did not get the email.",
    a4: "Tell them to check their spam folder. The email comes from alerts@detenciondefensa.com. If it is still missing, email us and we will resend it.",
    q5: "Is this app free?",
    a5: "Yes. All fees are waived right now because of the community crisis, so it costs you nothing. If that ever changes, we will tell you first and you will never be charged without your consent.",
    q6: "Will the government see my information?",
    a6: "No. We do not share your information with any government agency unless we are forced to by a court order. See our Privacy Policy for full details.",
    footer: "DetencionDefensa is a for profit-typing and translation tool with emergency delivery system. Not a law firm. Not legal advice. For urgent legal help, contact your an attorney in your area.",
    copyright: "© 2026 DetencionDefensa",
  },
  es: {
    home: "← Inicio",
    pageTitle: "Support / Ayuda / Sipò",
    langLabel: "Español",
    intro1: "¿Necesita ayuda con la aplicación DetencionDefensa?",
    intro2: "Estamos aquí para ayudar. Envíenos un correo y le responderemos en 24 horas.",
    emailLabel: "Correo:",
    faqTitle: "Preguntas comunes",
    q1: "El código de 6 dígitos del sitio web no funcionó en mi teléfono.",
    a1: "Los códigos expiran después de 24 horas. Regrese al sitio web y envíe su formulario de admisión otra vez para obtener un código nuevo. Si aún no funciona, escríbanos.",
    q2: "Presioné el botón rojo por accidente.",
    a2: 'Abra la aplicación. Tiene 2 horas para ingresar su PIN de 4 dígitos y cancelar. Si cancela, se envía un correo de "todo bien" a sus contactos automáticamente.',
    q3: "Olvidé mi PIN de 4 dígitos.",
    a3pre: "Escríbanos a",
    a3post: ". Le ayudaremos a reiniciarlo.",
    q4: "Mi contacto de emergencia no recibió el correo.",
    a4: "Dígale que revise su carpeta de spam. El correo viene de alerts@detenciondefensa.com. Si aún no aparece, escríbanos y lo reenviaremos.",
    q5: "¿Es gratis la aplicación?",
    a5: "Sí. Todas las tarifas están exoneradas ahora por la crisis comunitaria, así que no le cuesta nada. Si eso cambia alguna vez, se lo avisaremos primero y nunca se le cobrará sin su consentimiento.",
    q6: "¿Verá el gobierno mi información?",
    a6: "No. No compartimos su información con ninguna agencia del gobierno a menos que nos obliguen por orden judicial. Vea nuestra Política de Privacidad para más detalles.",
    footer: "DetencionDefensa es una herramienta de mecanografía y traducción con fines de lucro con sistema de entrega de emergencia. No es un bufete de abogados. No es asesoría legal. Para ayuda legal urgente, comuníquese con un abogado en su área.",
    copyright: "© 2026 DetencionDefensa",
  },
  ht: {
    home: "← Akèy",
    pageTitle: "Support / Ayuda / Sipò",
    langLabel: "Kreyòl Ayisyen",
    intro1: "Ou bezwen èd ak aplikasyon DetencionDefensa?",
    intro2: "Nou la pou ede w. Voye yon imèl ban nou epi n ap reponn ou nan 24 èdtan.",
    emailLabel: "Imèl:",
    faqTitle: "Kesyon yo poze souvan",
    q1: "Kòd 6 chif sit entènèt la pa mache sou telefòn mwen.",
    a1: "Kòd yo ekspire apre 24 èdtan. Retounen sou sit la epi soumèt fòm enfòmasyon w lan ankò pou jwenn yon nouvo kòd. Si li toujou pa mache, ekri nou.",
    q2: "Mwen peze bouton wouj la pa erè.",
    a2: 'Louvri aplikasyon an. Ou gen 2 èdtan pou antre PIN 4 chif ou a pou anile. Si w anile, yon imèl "tout bagay anfòm" ap voye bay kontak ou yo otomatikman.',
    q3: "Mwen bliye PIN 4 chif mwen an.",
    a3pre: "Ekri nou nan",
    a3post: ". N ap ede w refè li.",
    q4: "Kontak ijans mwen pa resevwa imèl la.",
    a4: "Di li tcheke katye spam li. Imèl la soti nan alerts@detenciondefensa.com. Si li toujou pa parèt, ekri nou epi n ap voye l ankò.",
    q5: "Èske aplikasyon an gratis?",
    a5: "Wi. Tout frè yo anile kounye a akòz kriz kominotè a, kidonk li pa koute w anyen. Si sa janm chanje, n ap di w anvan e yo p ap janm chaje w san konsantman w.",
    q6: "Èske gouvènman an ap wè enfòmasyon m?",
    a6: "Non. Nou pa pataje enfòmasyon w ak okenn ajans gouvènman sof si tribunal fòse nou. Gade Politik Konfidansyalite nou an pou plis detay.",
    footer: "DetencionDefensa se yon zouti tapaj ak tradiksyon pou pwofi ak sistèm livrezon ijans. Se pa yon biwo avoka. Se pa konsèy legal. Pou èd legal ijan, kontakte yon avoka nan zòn ou.",
    copyright: "© 2026 DetencionDefensa",
  },
} as const;

function SupportPage() {
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

      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-8 text-center text-3xl font-bold text-foreground">
          {t.pageTitle}
        </h1>

        <section className="mb-12 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-foreground">{t.langLabel}</h2>
          <p className="mb-6 text-muted-foreground">
            {t.intro1}
            <br />
            {t.intro2}
          </p>
          <p className="mb-8 font-medium text-foreground">
            {t.emailLabel}{" "}
            <a href="mailto:info@detenciondefensa.com" className="text-primary underline">
              info@detenciondefensa.com
            </a>
          </p>

          <h3 className="mb-3 text-lg font-semibold text-foreground">{t.faqTitle}</h3>
          <div className="space-y-4">
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">{t.q1}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{t.a1}</p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">{t.q2}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{t.a2}</p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">{t.q3}</summary>
              <p className="mt-2 text-sm text-muted-foreground">
                {t.a3pre}{" "}
                <a href="mailto:legal@detenciondefensa.com" className="text-primary underline">
                  legal@detenciondefensa.com
                </a>
                {t.a3post}
              </p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">{t.q4}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{t.a4}</p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">{t.q5}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{t.a5}</p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">{t.q6}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{t.a6}</p>
            </details>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/50">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            {t.footer}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {t.copyright}
          </p>
        </div>
      </footer>
    </div>
  );
}
