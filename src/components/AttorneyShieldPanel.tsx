import { useLang, type Lang } from "@/context/LanguageContext";

/**
 * Trilingual zero-retention / privilege / no-tracking panel.
 * Describes what the system does — deliberately avoids absolute guarantees
 * about what a court will or will not order.
 */
const COPY = {
  en: {
    heading: "The Attorney Shield",
    sub: "Your file lives with the law firm, not with us.",
    points: [
      {
        label: "Zero retention",
        desc: "DetencionDefensa.com does not keep your file. Your information is transmitted to Sorrentino Law Firm PLLC and deleted from our systems. All we retain is your activation code.",
      },
      {
        label: "Attorney-client privilege",
        desc: "Your intake is collected for Sorrentino Law Firm PLLC as its agent, and is held by the firm as attorney-client privileged material under federal and Florida law.",
      },
      {
        label: "No location tracking",
        desc: "The app does not track your location. It does not report where you are, ever. It only sends the alert you choose to send.",
      },
      {
        label: "Only a code",
        desc: "Before you trigger an alert, our systems hold nothing but an activation code. There is no name, no address, and no document to hand over.",
      },
    ],
  },
  es: {
    heading: "El Escudo del Abogado",
    sub: "Su expediente vive con el bufete, no con nosotros.",
    points: [
      {
        label: "Cero retención",
        desc: "DetencionDefensa.com no guarda su expediente. Su información se transmite a Sorrentino Law Firm PLLC y se elimina de nuestros sistemas. Lo único que conservamos es su código de activación.",
      },
      {
        label: "Privilegio abogado-cliente",
        desc: "Su admisión se recopila para Sorrentino Law Firm PLLC como su agente, y el bufete la conserva como material protegido por el privilegio abogado-cliente bajo la ley federal y de Florida.",
      },
      {
        label: "Sin rastreo de ubicación",
        desc: "La aplicación no rastrea su ubicación. Nunca informa dónde está usted. Solo envía la alerta que usted decide enviar.",
      },
      {
        label: "Solo un código",
        desc: "Antes de que usted active una alerta, nuestros sistemas solo tienen un código de activación. No hay nombre, ni dirección, ni documento que entregar.",
      },
    ],
  },
  ht: {
    heading: "Boukliye Avoka a",
    sub: "Dosye ou rete nan men kabinè avoka a, se pa nan men nou.",
    points: [
      {
        label: "Zewo konsèvasyon",
        desc: "DetencionDefensa.com pa kenbe dosye ou. Enfòmasyon ou voye bay Sorrentino Law Firm PLLC epi yo efase l nan sistèm nou yo. Sèl bagay nou kenbe se kòd aktivasyon ou.",
      },
      {
        label: "Privilèj avoka-kliyan",
        desc: "Enfòmasyon antre ou yo kolekte pou Sorrentino Law Firm PLLC kòm ajan li, epi kabinè a kenbe yo kòm materyèl pwoteje pa privilèj avoka-kliyan anba lwa federal ak lwa Florid.",
      },
      {
        label: "Pa gen swiv kote ou ye",
        desc: "Aplikasyon an pa swiv kote ou ye. Li pa janm rapòte kote ou ye. Li voye sèlman alèt ou chwazi voye a.",
      },
      {
        label: "Sèlman yon kòd",
        desc: "Anvan ou deklanche yon alèt, sistèm nou yo pa gen anyen apa yon kòd aktivasyon. Pa gen non, pa gen adrès, pa gen dokiman pou remèt.",
      },
    ],
  },
} satisfies Record<Lang, { heading: string; sub: string; points: { label: string; desc: string }[] }>;

export function AttorneyShieldPanel() {
  const { lang } = useLang();
  const t = COPY[lang];

  return (
    <section
      aria-labelledby="attorney-shield-heading"
      style={{
        background: "rgba(107,79,79,0.18)",
        border: "2px solid #6B4F4F",
        borderRadius: 12,
        padding: "1.25rem 1.25rem 1.5rem",
        margin: "0 0 2rem",
      }}
    >
      <h2
        id="attorney-shield-heading"
        style={{
          fontFamily: '"Roboto Slab", Georgia, serif',
          fontSize: "1.35rem",
          fontWeight: 700,
          color: "#e8a04a",
          margin: "0 0 0.25rem",
        }}
      >
        {t.heading}
      </h2>
      <p style={{ margin: "0 0 1rem", fontSize: 15, color: "rgba(255,255,255,0.85)" }}>{t.sub}</p>

      <dl style={{ margin: 0, display: "grid", gap: "0.9rem" }}>
        {t.points.map((p) => (
          <div key={p.label}>
            <dt style={{ fontWeight: 700, fontSize: 15, color: "#ffffff", marginBottom: 2 }}>
              {p.label}
            </dt>
            <dd style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, color: "rgba(255,255,255,0.9)" }}>
              {p.desc}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default AttorneyShieldPanel;
