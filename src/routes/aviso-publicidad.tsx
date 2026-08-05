import { createFileRoute, Link } from "@tanstack/react-router";
import { FIRM, COMPANY } from "@/lib/firm-info";

export const Route = createFileRoute("/aviso-publicidad")({
  component: AvisoPublicidad,
  head: () => ({
    meta: [
      { title: "Aviso de publicidad legal — DetencionDefensa.com" },
      {
        name: "description",
        content:
          "Attorney advertising notice, dual-role disclosure, sponsorship terms and data-use policy for DetencionDefensa.com, Inc. and Sorrentino Law Firm PLLC.",
      },
      { property: "og:title", content: "Aviso de publicidad legal — DetencionDefensa.com" },
      { property: "og:description", content: "Attorney advertising notice and disclosures for DetencionDefensa.com, Inc." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://detenciondefensa.com/aviso-publicidad" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://detenciondefensa.com/aviso-publicidad" }],
  }),
});

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-2 font-display text-xl text-foreground">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function AvisoPublicidad() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="mb-2 font-display text-3xl text-foreground">
          Aviso de publicidad legal · Attorney Advertising Notice · Avi piblisite avoka
        </h1>
        <p className="mb-10 text-sm text-muted-foreground">
          {COMPANY.legalName} — {COMPANY.state}
        </p>

        <Block title="1. DetencionDefensa.com, Inc. no es un bufete de abogados">
          <p>
            {COMPANY.legalName} es una {COMPANY.state} de tecnología. NO es un bufete de abogados y NO presta servicios
            legales ni da asesoría legal. Los servicios legales los presta {FIRM.legalName}, un bufete de Florida
            separado, a través de {FIRM.attorney} ({FIRM.flBarNumber}), {FIRM.address}.
          </p>
          <p>
            {COMPANY.legalName} is not a law firm and does not provide legal services or legal advice. Legal services are
            provided by {FIRM.legalName}, a separate Florida law firm.
          </p>
        </Block>

        <Block title="2. Alcance limitado de la representación (Regla 4-1.2(c))">
          <p>
            Al inscribirse, usted contrata a {FIRM.legalName} de forma limitada y por escrito únicamente para revisar y
            aprobar los borradores de sus formularios federales y, si se activa la alerta, completarlos y enviarlos por
            correo. Esto NO incluye comparecencias en corte, audiencias, ni representación ante la corte de inmigración o
            DHS. Cualquier representación adicional requiere un acuerdo separado.
          </p>
        </Block>

        <Block title="3. Divulgación de doble función (Regla 4-1.7)">
          <p>
            {FIRM.attorney} tiene un interés tanto en {COMPANY.legalName} como en {FIRM.legalName}. Esta relación se
            divulga conforme a la Regla 4-1.7 del Colegio de Abogados de Florida. Los honorarios del abogado se depositan
            directamente en la cuenta IOLTA del bufete y no se comparten con no abogados.
          </p>
        </Block>

        <Block title="4. Patrocinio y costo">
          <p>
            El plan de preparación se ofrece sin costo para el usuario. Refuge Outreach, Inc., una organización sin fines
            de lucro 501(c)(3) constituida en 2009, cubre el costo de la plataforma y el honorario del abogado. El
            patrocinio está limitado a 1,000 familias en los condados de Broward y Miami-Dade y dura mientras haya fondos
            de patrocinio disponibles. No se solicita tarjeta de crédito y no hay cargos futuros.
          </p>
        </Block>

        <Block title="5. Sin garantía de resultado">
          <p>
            Este plan NO otorga estatus migratorio, NO detiene una deportación y NO garantiza su liberación. Es un plan de
            preparación para que su familia y sus documentos estén listos si usted es detenido. Ningún abogado puede
            garantizar el resultado de un procedimiento judicial.
          </p>
        </Block>

        <Block title="6. Uso de datos">
          <p>
            La información de las personas inscritas bajo el patrocinio no se vende ni se comparte con prestamistas,
            inversionistas ni terceros de mercadeo — incluido SaveMyHomeTrust — sin un consentimiento escrito separado.
            SaveMyHomeTrust.com es una empresa afiliada bajo propiedad común, no una subsidiaria.
          </p>
        </Block>

        <Block title="7. Aviso de publicidad de abogados">
          <p>
            La contratación de un abogado es una decisión importante que no debe basarse únicamente en anuncios. Antes de
            decidir, pida información gratuita y por escrito sobre nuestras calificaciones y experiencia.{" "}
            {FIRM.legalName} · {FIRM.address} · {FIRM.phone}.
          </p>
        </Block>

        <Link to="/" className="inline-block text-sm font-semibold text-firm hover:underline">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}
