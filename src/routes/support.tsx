import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

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

function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            ← Home / Inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-8 text-center text-3xl font-bold text-foreground">
          Support / Ayuda / Sipò
        </h1>

        {/* English */}
        <section className="mb-12 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-foreground">English</h2>
          <p className="mb-6 text-muted-foreground">
            Need help with the DetencionDefensa app?
            <br />
            We are here to help. Email us and we will respond within 24 hours.
          </p>
          <p className="mb-8 font-medium text-foreground">
            Email:{" "}
            <a href="mailto:info@detenciondefensa.com" className="text-primary underline">
              info@detenciondefensa.com
            </a>
          </p>

          <h3 className="mb-3 text-lg font-semibold text-foreground">Common questions</h3>
          <div className="space-y-4">
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">
                The 6-digit code from the website did not work on my phone.
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Codes expire after 24 hours. Go back to the website and submit your intake form again to get a fresh code. If it still does not work, email us.
              </p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">
                I pressed the red button by accident.
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Open the app. You have 2 hours to enter your 4-digit PIN to cancel. If you cancel, an "all-clear" email is sent to your contacts automatically.
              </p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">
                I forgot my 4-digit PIN.
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Contact us at{" "}
                <a href="mailto:legal@detenciondefensa.com" className="text-primary underline">
                  legal@detenciondefensa.com
                </a>
                . We will help you reset it.
              </p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">
                My emergency contact did not get the email.
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Tell them to check their spam folder. The email comes from alerts@detenciondefensa.com. If it is still missing, email us and we will resend it.
              </p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">
                Is this app free?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Yes. Always. Forever.
              </p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">
                Will the government see my information?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                No. We do not share your information with any government agency unless we are forced to by a court order. See our Privacy Policy for full details.
              </p>
            </details>
          </div>
        </section>

        {/* Español */}
        <section className="mb-12 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-foreground">Español</h2>
          <p className="mb-6 text-muted-foreground">
            ¿Necesita ayuda con la aplicación DetencionDefensa?
            <br />
            Estamos aquí para ayudar. Envíenos un correo y le responderemos en 24 horas.
          </p>
          <p className="mb-8 font-medium text-foreground">
            Correo:{" "}
            <a href="mailto:info@detenciondefensa.com" className="text-primary underline">
              info@detenciondefensa.com
            </a>
          </p>

          <h3 className="mb-3 text-lg font-semibold text-foreground">Preguntas comunes</h3>
          <div className="space-y-4">
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">
                El código de 6 dígitos del sitio web no funcionó en mi teléfono.
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Los códigos expiran después de 24 horas. Regrese al sitio web y envíe su formulario de admisión otra vez para obtener un código nuevo. Si aún no funciona, escríbanos.
              </p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">
                Presioné el botón rojo por accidente.
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Abra la aplicación. Tiene 2 horas para ingresar su PIN de 4 dígitos y cancelar. Si cancela, se envía un correo de "todo bien" a sus contactos automáticamente.
              </p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">
                Olvidé mi PIN de 4 dígitos.
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Escríbanos a{" "}
                <a href="mailto:legal@detenciondefensa.com" className="text-primary underline">
                  legal@detenciondefensa.com
                </a>
                . Le ayudaremos a reiniciarlo.
              </p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">
                Mi contacto de emergencia no recibió el correo.
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Dígale que revise su carpeta de spam. El correo viene de alerts@detenciondefensa.com. Si aún no aparece, escríbanos y lo reenviaremos.
              </p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">
                ¿Es gratis la aplicación?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Sí. Siempre. Para siempre.
              </p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">
                ¿Verá el gobierno mi información?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                No. No compartimos su información con ninguna agencia del gobierno a menos que nos obliguen por orden judicial. Vea nuestra Política de Privacidad para más detalles.
              </p>
            </details>
          </div>
        </section>

        {/* Kreyòl Ayisyen */}
        <section className="mb-12 rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-foreground">Kreyòl Ayisyen</h2>
          <p className="mb-6 text-muted-foreground">
            Ou bezwen èd ak aplikasyon DetencionDefensa?
            <br />
            Nou la pou ede w. Voye yon imèl ban nou epi n ap reponn ou nan 24 èdtan.
          </p>
          <p className="mb-8 font-medium text-foreground">
            Imèl:{" "}
            <a href="mailto:info@detenciondefensa.com" className="text-primary underline">
              info@detenciondefensa.com
            </a>
          </p>

          <h3 className="mb-3 text-lg font-semibold text-foreground">Kesyon yo poze souvan</h3>
          <div className="space-y-4">
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">
                Kòd 6 chif sit entènèt la pa mache sou telefòn mwen.
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Kòd yo ekspire apre 24 èdtan. Retounen sou sit la epi soumèt fòm enfòmasyon w lan ankò pou jwenn yon nouvo kòd. Si li toujou pa mache, ekri nou.
              </p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">
                Mwen peze bouton wouj la pa erè.
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Louvri aplikasyon an. Ou gen 2 èdtan pou antre PIN 4 chif ou a pou anile. Si w anile, yon imèl "tout bagay anfòm" ap voye bay kontak ou yo otomatikman.
              </p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">
                Mwen bliye PIN 4 chif mwen an.
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Ekri nou nan{" "}
                <a href="mailto:legal@detenciondefensa.com" className="text-primary underline">
                  legal@detenciondefensa.com
                </a>
                . N ap ede w refè li.
              </p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">
                Kontak ijans mwen pa resevwa imèl la.
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Di li tcheke katye spam li. Imèl la soti nan alerts@detenciondefensa.com. Si li toujou pa parèt, ekri nou epi n ap voye l ankò.
              </p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">
                Èske aplikasyon an gratis?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Wi. Toujou. Pou tout tan.
              </p>
            </details>
            <details className="rounded-lg border bg-background p-4">
              <summary className="cursor-pointer font-medium text-foreground">
                Èske gouvènman an ap wè enfòmasyon m?
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Non. Nou pa pataje enfòmasyon w ak okenn ajans gouvènman sof si tribunal fòse nou. Gade Politik Konfidansyalite nou an pou plis detay.
              </p>
            </details>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/50">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            DetencionDefensa is a for profit-typing and translation tool with emergency delivery system. Not a law firm. Not legal advice. For urgent legal help, contact your an attorney in your area.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            © 2026 DetencionDefensa
          </p>
        </div>
      </footer>
    </div>
  );
}
