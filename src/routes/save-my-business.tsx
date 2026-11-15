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
    eyebrow: "Save My Business",
    title: "Your route is a business. Do not walk away from it.",
    intro: "Lawn, pool, cleaning and trade accounts can have value. Ask how a trust-owned C-corporation may help you keep, transfer or sell what you built.",
    cards: [
      { title: "Keep your accounts together", points: ["List your customers, workers, tools and contracts.", "A corporation can hold the business if the law and contracts allow it.", "A trust can own the corporation."] },
      { title: "Plan who can run it", points: ["Qualified U.S. officers may run the company.", "Review licenses, taxes and worker rules first.", "Remote operation is not guaranteed."] },
      { title: "Plan a sale or transfer", points: ["A clear company record can help a buyer review the route.", "A business broker may help value and sell it.", "No sale price or income is promised."] },
    ],
    cta: "Visit Save My Business",
    review: "Ask for a business review",
    disclosure: "This is a commercial planning service, not a guarantee of legal, tax or business results. Trust structures and legal review are performed in conjunction with Sorrentino Law Firm PLLC. Trust and corporate setup cost extra. A business broker may charge a commission. Ask for all fees in writing.",
    home: "Back to home",
  },
  es: {
    eyebrow: "Save My Business",
    title: "Su ruta es un negocio. No la abandone.",
    intro: "Las cuentas de jardines, piscinas, limpieza y oficios pueden tener valor. Pregunte cómo una corporación C dentro de un fideicomiso puede ayudarle a conservar, transferir o vender lo que construyó.",
    cards: [
      { title: "Mantenga sus cuentas juntas", points: ["Haga una lista de clientes, trabajadores, equipos y contratos.", "Una corporación puede tener el negocio si la ley y los contratos lo permiten.", "Un fideicomiso puede ser dueño de la corporación."] },
      { title: "Planee quién lo manejará", points: ["Oficiales calificados en EE.UU. pueden manejar la empresa.", "Revise licencias, impuestos y reglas de trabajo primero.", "No se garantiza poder manejarlo desde otro país."] },
      { title: "Planee una venta o traspaso", points: ["Buenos registros ayudan al comprador a revisar la ruta.", "Un corredor de negocios puede ayudar con el valor y la venta.", "No se promete precio de venta ni ingresos."] },
    ],
    cta: "Visite Save My Business",
    review: "Pida una revisión de su negocio",
    disclosure: "Este es un servicio comercial de planificación, no una garantía de resultados legales, fiscales o comerciales. Las estructuras de fideicomiso y la revisión legal se realizan junto con Sorrentino Law Firm PLLC. Crear el fideicomiso y la corporación cuesta aparte. Un corredor puede cobrar una comisión. Pida todos los costos por escrito.",
    home: "Volver al inicio",
  },
  ht: {
    eyebrow: "Save My Business",
    title: "Wout ou se yon biznis. Pa abandone li.",
    intro: "Kont gazon, pisin, netwayaj ak travay atizana ka gen valè. Mande kijan yon kòporasyon C yon fidisi posede ka ede ou kenbe, transfere oswa vann sa ou bati a.",
    cards: [
      { title: "Kenbe kont ou yo ansanm", points: ["Fè lis kliyan, travayè, zouti ak kontra ou.", "Yon kòporasyon ka kenbe biznis la si lalwa ak kontra pèmèt.", "Yon fidisi ka posede kòporasyon an."] },
      { title: "Planifye kiyès k ap jere li", points: ["Ofisyè kalifye Ozetazini ka jere konpayi an.", "Verifye lisans, taks ak règ travay anvan.", "Yo pa garanti ou ka jere li aletranje."] },
      { title: "Planifye yon vant oswa transfè", points: ["Bon rejis ka ede yon achtè revize wout la.", "Yon koutye biznis ka ede evalye epi vann li.", "Yo pa pwomèt pri vant ni revni."] },
    ],
    cta: "Vizite Save My Business",
    review: "Mande yon revizyon pou biznis ou",
    disclosure: "Sa a se yon sèvis planifikasyon komèsyal, pa yon garanti rezilta legal, fiskal oswa komèsyal. Estrikti fidisi ak revizyon legal fèt ansanm ak Sorrentino Law Firm PLLC. Kreye fidisi ak kòporasyon koute apa. Yon koutye ka pran komisyon. Mande tout frè alekri.",
    home: "Retounen lakay",
  },
} as const;

export const Route = createFileRoute("/save-my-business")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Save My Business — Trust-Owned C-Corporation Planning" },
      { name: "description", content: "Explore ways to preserve, operate, transfer or sell lawn, pool, cleaning and trade routes through a trust-owned C-corporation." },
      { property: "og:title", content: "Save My Business — Detención Defensa" },
      { property: "og:description", content: "Plan for your customer accounts, equipment and business value before an emergency. No outcome is guaranteed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SaveMyBusinessPage,
});

function SaveMyBusinessPage() {
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
            <Button asChild className="home-primary"><a href={withLang("https://savemybusiness.com", lang)} target="_blank" rel="noopener noreferrer">{t.cta}<ArrowRight /></a></Button>
            <Button asChild variant="outline"><Link to="/" search={{ lang }} hash="request-review">{t.review}<ArrowRight /></Link></Button>
          </div>
          <p className="public-program-disclosure">{t.disclosure}</p>
          <p className="public-program-extra"><Link to="/" search={{ lang }}>← {t.home}</Link></p>
        </div>
      </section>
    </main>
  );
}
