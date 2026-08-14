import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "@/context/LanguageContext";
import { FIRM, COMPANY } from "@/lib/firm-info";

export const Route = createFileRoute("/legal-notices")({
  head: () => ({
    meta: [
      { title: "Legal Notices & Disclosures — DetencionDefensa.com" },
      {
        name: "description",
        content:
          "Ownership, operation, advertising, and pro bono disclosures for DetencionDefensa.com, Inc. and Sorrentino Law Firm PLLC.",
      },
      { property: "og:title", content: "Legal Notices & Disclosures — DetencionDefensa.com" },
      {
        property: "og:description",
        content:
          "Ownership, operation, advertising, and pro bono disclosures for DetencionDefensa.com, Inc. and Sorrentino Law Firm PLLC.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LegalNoticesPage,
});

type Section = { h: string; p: string[] };

const COPY: Record<"en" | "es" | "ht", { title: string; updated: string; sections: Section[] }> = {
  en: {
    title: "Legal Notices & Disclosures",
    updated: "Applies to every page of this website and to the emergency app.",
    sections: [
      {
        h: "1. Two separate entities",
        p: [
          `${COMPANY.legalName} (a ${COMPANY.state}) owns this website, the brand, and the emergency app. It is a technology company. It is NOT a law firm, it does not practice law, and it does not give legal advice.`,
          `${FIRM.legalName} is a separate Florida law firm. All legal services, legal advice, and attorney-client relationships are provided by the Firm alone. Attorney responsible for content: ${FIRM.attorney} (${FIRM.flBarNumber}), ${FIRM.address}.`,
        ],
      },
      {
        h: "2. Ownership and operation (license)",
        p: [
          `This website and the app are owned by ${COMPANY.legalName} and are operated by ${FIRM.legalName} under a written license and services agreement. The Firm has editorial and operational control over all legal-facing content and is solely responsible for the legal function.`,
          `${COMPANY.legalName} receives a fixed license fee that does not vary with the number of clients, the value of any matter, or any fee collected. The Company does not share in any legal fee.`,
        ],
      },
      {
        h: "3. Dual-role disclosure",
        p: [
          "The attorney who owns the Firm also participates in the operation of this platform under the license. That dual role is disclosed here so you can evaluate it. You are always free to choose any other attorney, and you may end the relationship at any time.",
        ],
      },
      {
        h: "4. No fee — pro bono during the community crisis",
        p: [
          "The Firm is providing this limited-scope service pro bono during the current community crisis. There is no charge to you. The Firm may end the pro bono program in the future; if fees are ever introduced, you would be told in writing in advance and would have to agree before anything is charged.",
        ],
      },
      {
        h: "5. No attorney-client relationship until engagement",
        p: [
          "Using this website, submitting an inquiry, or completing intake does NOT by itself create an attorney-client relationship. A relationship begins only when the Firm accepts your matter and you sign the Firm's limited-scope engagement letter. Do not send time-sensitive or confidential information before then.",
        ],
      },
      {
        h: "6. What the Company does, and what it does not do",
        p: [
          "The Company provides intake software, translation, typing, document assembly, secure transmission, and the emergency notification app. Every document is reviewed by the Firm before it is finalized. The Company does not select legal strategy, does not advise you, and does not represent you.",
        ],
      },
      {
        h: "7. Data handling and zero retention",
        p: [
          "Intake information is collected for the Firm as its disclosed agent so that attorney-client privilege attaches to the intake channel. After the case bundle is transmitted to the Firm, the Company purges the client file from its systems and retains only an activation code and timestamps.",
          "The app does not track your location and does not report where you are. It sends only the alert you choose to send.",
        ],
      },
      {
        h: "8. Advertising",
        p: [
          "The hiring of a lawyer is an important decision that should not be based solely upon advertisements. Before you decide, ask the lawyer to send you free written information about their qualifications and experience.",
          "No result is guaranteed. Past results do not predict future outcomes. Every case is different.",
          "Advertisements on this site for Save My Home Trust and related products are paid or bartered advertising for a separate, non-legal service. They are not a legal recommendation, and you are never required to use any advertised service or any particular attorney.",
        ],
      },
      {
        h: "9. Not legal advice; not an emergency service",
        p: [
          "Information on this site is general and is not legal advice for your situation. The emergency app is a notification tool. It is not a 911 replacement and cannot guarantee response times, delivery of any message, or that anyone will be located.",
        ],
      },
      {
        h: "10. Questions and complaints",
        p: [
          `Legal questions: ${FIRM.legalName}, ${FIRM.address}, ${FIRM.phone}. Website or app questions: ${COMPANY.legalName} at info@detenciondefensa.com.`,
        ],
      },
    ],
  },
  es: {
    title: "Avisos Legales y Divulgaciones",
    updated: "Aplica a todas las páginas de este sitio web y a la aplicación de emergencia.",
    sections: [
      {
        h: "1. Dos entidades separadas",
        p: [
          `${COMPANY.legalName} (una corporación de Delaware) es dueña de este sitio web, la marca y la aplicación. Es una empresa de tecnología. NO es una firma de abogados, no practica derecho y no brinda asesoramiento legal.`,
          `${FIRM.legalName} es una firma de abogados de Florida independiente. Todos los servicios legales, el asesoramiento legal y las relaciones abogado-cliente son prestados únicamente por la Firma. Abogado responsable del contenido: ${FIRM.attorney} (${FIRM.flBarNumber}), ${FIRM.address}.`,
        ],
      },
      {
        h: "2. Propiedad y operación (licencia)",
        p: [
          `Este sitio web y la aplicación son propiedad de ${COMPANY.legalName} y son operados por ${FIRM.legalName} bajo un acuerdo escrito de licencia y servicios. La Firma tiene control editorial y operativo sobre todo el contenido legal y es la única responsable de la función legal.`,
          `${COMPANY.legalName} recibe una tarifa de licencia fija que no varía según la cantidad de clientes, el valor de ningún asunto ni ningún honorario cobrado. La empresa no participa en ningún honorario legal.`,
        ],
      },
      {
        h: "3. Divulgación de doble función",
        p: [
          "El abogado dueño de la Firma también participa en la operación de esta plataforma bajo la licencia. Esa doble función se divulga aquí para que usted pueda evaluarla. Usted siempre es libre de elegir a cualquier otro abogado y puede terminar la relación en cualquier momento.",
        ],
      },
      {
        h: "4. Sin costo — pro bono durante la crisis comunitaria",
        p: [
          "La Firma brinda este servicio de alcance limitado pro bono durante la crisis comunitaria actual. No hay ningún cargo para usted. La Firma podría terminar el programa pro bono en el futuro; si alguna vez se introdujeran honorarios, se le informaría por escrito con anticipación y usted tendría que aceptarlos antes de cualquier cobro.",
        ],
      },
      {
        h: "5. No hay relación abogado-cliente hasta la contratación",
        p: [
          "Usar este sitio, enviar una consulta o completar la admisión NO crea por sí solo una relación abogado-cliente. La relación comienza únicamente cuando la Firma acepta su asunto y usted firma la carta de contratación de alcance limitado. No envíe información urgente o confidencial antes de eso.",
        ],
      },
      {
        h: "6. Qué hace la empresa y qué no hace",
        p: [
          "La empresa provee software de admisión, traducción, mecanografía, armado de documentos, transmisión segura y la aplicación de notificación de emergencia. Cada documento es revisado por la Firma antes de finalizarse. La empresa no elige la estrategia legal, no le asesora y no le representa.",
        ],
      },
      {
        h: "7. Manejo de datos y retención cero",
        p: [
          "La información de admisión se recopila para la Firma como su agente divulgado, de modo que el privilegio abogado-cliente cubra el canal de admisión. Después de transmitir el paquete a la Firma, la empresa elimina el archivo del cliente de sus sistemas y conserva únicamente un código de activación y las marcas de tiempo.",
          "La aplicación no rastrea su ubicación ni informa dónde está. Solo envía la alerta que usted decide enviar.",
        ],
      },
      {
        h: "8. Publicidad",
        p: [
          "La contratación de un abogado es una decisión importante que no debe basarse únicamente en anuncios. Antes de decidir, pídale al abogado información escrita gratuita sobre sus calificaciones y experiencia.",
          "No se garantiza ningún resultado. Los resultados pasados no predicen resultados futuros. Cada caso es diferente.",
          "Los anuncios en este sitio sobre Save My Home Trust y productos relacionados son publicidad pagada o intercambiada de un servicio separado que no es legal. No son una recomendación legal, y usted nunca está obligado a usar ningún servicio anunciado ni ningún abogado en particular.",
        ],
      },
      {
        h: "9. No es asesoramiento legal; no es un servicio de emergencia",
        p: [
          "La información de este sitio es general y no constituye asesoramiento legal para su situación. La aplicación de emergencia es una herramienta de notificación. No reemplaza al 911 y no puede garantizar tiempos de respuesta, la entrega de ningún mensaje ni que se localice a alguien.",
        ],
      },
      {
        h: "10. Preguntas y quejas",
        p: [
          `Preguntas legales: ${FIRM.legalName}, ${FIRM.address}, ${FIRM.phone}. Preguntas sobre el sitio o la aplicación: ${COMPANY.legalName}, info@detenciondefensa.com.`,
        ],
      },
    ],
  },
  ht: {
    title: "Avi Legal ak Divilgasyon",
    updated: "Aplike sou chak paj sit sa a ak sou aplikasyon dijans lan.",
    sections: [
      {
        h: "1. De antite separe",
        p: [
          `${COMPANY.legalName} (yon konpayi Delaware) posede sit sa a, mak la, ak aplikasyon an. Se yon konpayi teknoloji. Li SE PA yon kabinè avoka, li pa pratike lalwa, epi li pa bay konsèy legal.`,
          `${FIRM.legalName} se yon kabinè avoka Florid separe. Tout sèvis legal, konsèy legal, ak relasyon avoka-kliyan se kabinè a sèl ki bay yo. Avoka responsab pou kontni: ${FIRM.attorney} (${FIRM.flBarNumber}), ${FIRM.address}.`,
        ],
      },
      {
        h: "2. Pwopriyete ak operasyon (lisans)",
        p: [
          `Sit sa a ak aplikasyon an se pwopriyete ${COMPANY.legalName} epi se ${FIRM.legalName} k ap opere yo anba yon akò lisans ak sèvis ekri. Kabinè a gen kontwòl editoryal ak operasyonèl sou tout kontni legal epi li sèl responsab fonksyon legal la.`,
          `${COMPANY.legalName} resevwa yon frè lisans fiks ki pa chanje selon kantite kliyan, valè yon dosye, oswa okenn frè yo kolekte. Konpayi an pa patisipe nan okenn frè legal.`,
        ],
      },
      {
        h: "3. Divilgasyon doub wòl",
        p: [
          "Avoka ki posede kabinè a patisipe tou nan operasyon platfòm sa a anba lisans lan. Nou divilge doub wòl sa a pou ou ka evalye l. Ou toujou lib pou chwazi nenpòt lòt avoka epi ou ka mete fen nan relasyon an nenpòt ki lè.",
        ],
      },
      {
        h: "4. Pa gen frè — pro bono pandan kriz kominotè a",
        p: [
          "Kabinè a bay sèvis limite sa a pro bono pandan kriz kominotè a. Pa gen okenn chaj pou ou. Kabinè a ka mete fen nan pwogram pro bono a alavni; si yo ta janm entwodwi frè, yo ta enfòme ou alekri davans epi ou ta dwe dakò anvan yo chaje anyen.",
        ],
      },
      {
        h: "5. Pa gen relasyon avoka-kliyan jiskaske gen angajman",
        p: [
          "Itilize sit sa a, voye yon demann, oswa ranpli admisyon PA kreye pou kont li yon relasyon avoka-kliyan. Relasyon an kòmanse sèlman lè kabinè a aksepte dosye ou epi ou siyen lèt angajman limite kabinè a. Pa voye enfòmasyon ijan oswa konfidansyèl anvan sa.",
        ],
      },
      {
        h: "6. Sa konpayi an fè, ak sa li pa fè",
        p: [
          "Konpayi an bay lojisyèl admisyon, tradiksyon, daktilografi, preparasyon dokiman, transmisyon an sekirite, ak aplikasyon notifikasyon dijans lan. Kabinè a revize chak dokiman anvan yo finalize l. Konpayi an pa chwazi estrateji legal, li pa konseye ou, epi li pa reprezante ou.",
        ],
      },
      {
        h: "7. Jesyon done ak zewo retansyon",
        p: [
          "Nou kolekte enfòmasyon admisyon pou kabinè a kòm ajan divilge li, konsa privilèj avoka-kliyan kouvri kanal admisyon an. Apre nou voye pakè a bay kabinè a, konpayi an efase dosye kliyan an nan sistèm li epi li kenbe sèlman yon kòd aktivasyon ak dat.",
          "Aplikasyon an pa swiv kote ou ye epi li pa rapòte kote ou ye. Li voye sèlman alèt ou chwazi voye a.",
        ],
      },
      {
        h: "8. Piblisite",
        p: [
          "Anboche yon avoka se yon desizyon enpòtan ki pa dwe baze sèlman sou piblisite. Anvan ou deside, mande avoka a voye ba ou enfòmasyon ekri gratis sou kalifikasyon ak eksperyans li.",
          "Pa gen okenn rezilta garanti. Rezilta pase pa predi rezilta fiti. Chak dosye diferan.",
          "Piblisite sou sit sa a pou Save My Home Trust ak pwodwi ki gen rapò se piblisite peye oswa echanje pou yon sèvis separe ki pa legal. Se pa yon rekòmandasyon legal, epi ou pa janm oblije itilize okenn sèvis ki anonse ni okenn avoka an patikilye.",
        ],
      },
      {
        h: "9. Se pa konsèy legal; se pa yon sèvis dijans",
        p: [
          "Enfòmasyon sou sit sa a jeneral epi se pa konsèy legal pou sitiyasyon ou. Aplikasyon dijans lan se yon zouti notifikasyon. Li pa ranplase 911 epi li pa ka garanti tan repons, livrezon okenn mesaj, ni ke y ap jwenn yon moun.",
        ],
      },
      {
        h: "10. Kesyon ak plent",
        p: [
          `Kesyon legal: ${FIRM.legalName}, ${FIRM.address}, ${FIRM.phone}. Kesyon sou sit la oswa aplikasyon an: ${COMPANY.legalName}, info@detenciondefensa.com.`,
        ],
      },
    ],
  },
};

function LegalNoticesPage() {
  const { lang } = useLang();
  const t = COPY[lang] ?? COPY.es;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        color: "#e8e4dc",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "56px 20px",
      }}
    >
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "Fraunces, serif", fontSize: 34, fontWeight: 700, marginBottom: 6 }}>
          {t.title}
        </h1>
        <p style={{ color: "#8d8a80", fontSize: 13, marginBottom: 32 }}>{t.updated}</p>
        {t.sections.map((s) => (
          <section key={s.h} style={{ marginBottom: 28 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 8,
                color: "#f6efe1",
                borderLeft: `3px solid ${FIRM.accentColor}`,
                paddingLeft: 10,
              }}
            >
              {s.h}
            </h2>
            {s.p.map((para, i) => (
              <p key={i} style={{ fontSize: 14, lineHeight: 1.7, color: "#c9c5bc", marginBottom: 10 }}>
                {para}
              </p>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
