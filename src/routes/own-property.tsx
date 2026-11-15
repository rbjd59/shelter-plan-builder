import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomePoints } from "@/components/HomePoints";
import { withLang } from "@/lib/outbound-lang";
import "@/home-review.css";

const search = z.object({ lang: z.enum(["en", "es", "ht"]).catch("en") });

const COPY = {
  en: {
    eyebrow: "Save My Home Trust",
    title: "Make a plan for your home before an emergency.",
    intro: "Do not wait until you are detained or behind on payments. Ask what may work for your home, your loan and your family.",
    cards: [
      { title: "Deed into a trust", points: ["A lawyer may move the home deed into a trust when it fits your case.", "The trust may apply for its own EIN tax number.", "Your lender, title company and lawyer must review the details."] },
      { title: "Ask about a 50–65% loan", points: ["Some asset-based lenders may consider a loan for 50–65% of the home's value.", "The lender looks at value, debt, title and its own rules.", "Approval, rate and cash amount are not promised."] },
      { title: "Do not sign in a panic", points: ["A fast cash buyer may offer much less than your home is worth.", "Ask a lawyer or trusted real estate professional to review the papers.", "Planning early gives you more time to compare choices."] },
    ],
    cta: "Visit Save My Home Trust",
    review: "Ask for a home review",
    disclosure: "This is a commercial planning service. Trust structures and legal review are performed in conjunction with Sorrentino Law Firm PLLC. Trust setup and other services cost extra. A trust does not erase a mortgage or guarantee protection, a loan or a sale. Ask for all fees in writing.",
    propertyHelp: "Need someone to manage, rent or sell property while you are outside the U.S.?",
    propertyLink: "Visit DefenderMiCasa.com",
    home: "Back to home",
  },
  es: {
    eyebrow: "Save My Home Trust",
    title: "Haga un plan para su casa antes de una emergencia.",
    intro: "No espere hasta estar detenido o atrasado en los pagos. Pregunte qué puede funcionar para su casa, su préstamo y su familia.",
    cards: [
      { title: "Escritura a un fideicomiso", points: ["Un abogado puede pasar la escritura a un fideicomiso si sirve para su caso.", "El fideicomiso puede pedir su propio número de impuestos EIN.", "El prestamista, la compañía de título y el abogado deben revisar los detalles."] },
      { title: "Pregunte por un préstamo de 50–65%", points: ["Algunos prestamistas pueden considerar un préstamo de 50–65% del valor de la casa.", "El prestamista revisa el valor, la deuda, el título y sus propias reglas.", "No se prometen aprobación, tasa ni cantidad de dinero."] },
      { title: "No firme por pánico", points: ["Un comprador de efectivo rápido puede ofrecer mucho menos de lo que vale su casa.", "Pida a un abogado o profesional de confianza que revise los papeles.", "Planear temprano le da más tiempo para comparar opciones."] },
    ],
    cta: "Visite Save My Home Trust",
    review: "Pida una revisión de su casa",
    disclosure: "Este es un servicio comercial de planificación. Las estructuras de fideicomiso y la revisión legal se realizan junto con Sorrentino Law Firm PLLC. El fideicomiso y otros servicios cuestan aparte. Un fideicomiso no borra la hipoteca ni garantiza protección, préstamo o venta. Pida todos los costos por escrito.",
    propertyHelp: "¿Necesita a alguien para administrar, alquilar o vender su propiedad mientras está fuera de EE.UU.?",
    propertyLink: "Visite DefenderMiCasa.com",
    home: "Volver al inicio",
  },
  ht: {
    eyebrow: "Save My Home Trust",
    title: "Fè yon plan pou kay ou anvan yon ijans.",
    intro: "Pa tann yo arete ou oswa bòdwo a reta. Mande sa ki ka mache pou kay ou, prè ou ak fanmi ou.",
    cards: [
      { title: "Mete tit kay la nan yon fidisi", points: ["Yon avoka ka mete tit kay la nan yon fidisi si sa mache pou dosye ou.", "Fidisi a ka mande pwòp nimewo taks EIN.", "Prestataire, konpayi tit ak avoka dwe revize detay yo."] },
      { title: "Mande sou yon prè 50–65%", points: ["Gen prestataire ki ka konsidere yon prè pou 50–65% valè kay la.", "Prestataire a gade valè, dèt, tit ak pwòp règ li.", "Yo pa pwomèt apwobasyon, to ni kantite lajan."] },
      { title: "Pa siyen nan panik", points: ["Yon achtè kach rapid ka ofri anpil mwens pase valè kay ou.", "Mande yon avoka oswa pwofesyonèl imobilye ou fè konfyans revize papye yo.", "Planifye bonè ba ou plis tan pou konpare chwa."] },
    ],
    cta: "Vizite Save My Home Trust",
    review: "Mande yon revizyon pou kay ou",
    disclosure: "Sa a se yon sèvis planifikasyon komèsyal. Estrikti fidisi ak revizyon legal fèt ansanm ak Sorrentino Law Firm PLLC. Fidisi ak lòt sèvis koute apa. Yon fidisi pa efase ipotèk epi li pa garanti pwoteksyon, prè oswa vant. Mande tout frè alekri.",
    propertyHelp: "Ou bezwen yon moun pou jere, lwe oswa vann pwopriyete ou pandan ou deyò Etazini?",
    propertyLink: "Vizite DefenderMiCasa.com",
    home: "Retounen lakay",
  },
} as const;

export const Route = createFileRoute("/own-property")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Save My Home Trust — Home Equity Planning" },
      { name: "description", content: "Ask about deeding your home to a trust, a possible 50–65% asset-based loan, and ways to avoid a rushed cash sale." },
      { property: "og:title", content: "Save My Home Trust — Detención Defensa" },
      { property: "og:description", content: "Make a plan for your home before an emergency. Loans, protection and sales are not guaranteed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OwnPropertyPage,
});

function OwnPropertyPage() {
  const { lang } = Route.useSearch();
  const t = COPY[lang];
  return (
    <main className="home-redesign public-program-page">
      <section className="public-program-hero">
        <div className="home-container">
          <p className="home-readiness-eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </div>
      </section>
      <section className="public-program-body">
        <div className="home-container">
          <div className="public-program-grid">
            {t.cards.map((card) => <article key={card.title}><h2>{card.title}</h2><HomePoints items={[...card.points]} /></article>)}
          </div>
          <div className="public-program-actions">
            <Button asChild className="home-primary"><a href={withLang("https://savemyhometrust.com/trust", lang)} target="_blank" rel="noopener noreferrer">{t.cta}<ArrowRight /></a></Button>
            <Button asChild variant="outline"><Link to="/" search={{ lang }} hash="request-review">{t.review}<ArrowRight /></Link></Button>
          </div>
          <p className="public-program-disclosure">{t.disclosure}</p>
          <p className="public-program-extra">{t.propertyHelp} <a href={`https://www.defendermicasa.com/?lang=${lang}`} target="_blank" rel="noopener noreferrer">{t.propertyLink} →</a></p>
          <p className="public-program-extra"><Link to="/" search={{ lang }}>← {t.home}</Link></p>
        </div>
      </section>
    </main>
  );
}
