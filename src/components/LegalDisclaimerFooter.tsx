import { Link } from "@tanstack/react-router";
import { FIRM, COMPANY } from "@/lib/firm-info";
import { useLang } from "@/context/LanguageContext";
import StaffAccessTile from "@/components/StaffAccessPinBox";

/**
 * Global legal footer mandated on every page that references legal services.
 * - Florida Bar Rule 4-7 (advertising) — Firm name + geographic location.
 * - "Not a law firm" disclaimer separates the tech entity from the law firm.
 * - Dual-role disclosure required by Florida Bar Rule 4-1.7 when the same
 *   principal owns or controls both entities.
 */
export function LegalDisclaimerFooter() {
  const { lang } = useLang();
  const t = COPY[lang] ?? COPY.en;

  return (
    <footer
      role="contentinfo"
      style={{
        background: "#0b0b0e",
        color: "#d4d4d8",
        padding: "32px 20px 48px",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 12,
        lineHeight: 1.6,
        borderTop: `3px solid ${FIRM.accentColor}`,
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gap: 18 }}>
        <div>
          <strong style={{ color: "#fff", display: "block", marginBottom: 4 }}>
            {t.companyHeading}
          </strong>
          <span>
            {COMPANY.legalName} ({COMPANY.state}). {t.notALawFirm}
          </span>
        </div>

        <div style={{ borderLeft: `3px solid ${FIRM.accentColor}`, paddingLeft: 12 }}>
          <strong style={{ color: "#fff", display: "block", marginBottom: 4 }}>
            {t.firmHeading}
          </strong>
          <span>
            {t.legalServicesBy} <strong>{FIRM.legalName}</strong>, {t.aSeparateFlLawFirm}.{" "}
            {t.attorneyResponsible}: {FIRM.attorney} ({FIRM.flBarNumber}). {FIRM.address}.{" "}
            <Link to="/attorney" style={{ color: FIRM.accentColor, textDecoration: "underline" }}>
              {t.learnMoreAttorney}
            </Link>
          </span>
        </div>

        <p style={{ margin: 0, color: "#d4d4d8" }}>{t.licenseNotice}</p>

        <p style={{ margin: 0, color: "#a1a1aa", fontSize: 11 }}>{t.adNotice}</p>

        <p style={{ margin: 0, fontStyle: "italic", color: "#a1a1aa" }}>
          {t.advertisingNotice}
        </p>

        <p style={{ margin: 0, color: "#71717a", fontSize: 11 }}>
          © {new Date().getFullYear()} {COMPANY.legalName}. {t.allRightsReserved}.{" "}
          <Link to="/privacy" style={{ color: "#a1a1aa", textDecoration: "underline" }}>
            {t.privacy}
          </Link>
          {" · "}
          <Link to="/legal-notices" style={{ color: "#a1a1aa", textDecoration: "underline" }}>
            {t.legalNotices}
          </Link>
          {" · "}
          <Link to="/contacto" style={{ color: "#a1a1aa", textDecoration: "underline" }}>
            {t.contact}
          </Link>
        </p>

        <div
          style={{
            marginTop: 8,
            paddingTop: 16,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <StaffAccessTile />
        </div>
      </div>
    </footer>
  );
}

const COPY = {
  en: {
    companyHeading: "Site Owner & Technology Provider",
    notALawFirm:
      "Sorrentino Law Firm PLLC operates this site under license from DetencionDefensa.com, Inc. DetencionDefensa.com, Inc. is strictly the technology developer and website/app operator — it is not a law firm, gives no legal advice, and does not direct or control any legal service. The Firm has sole control of, and sole responsibility for, all legal services, legal advice, legal content, and attorney-client relationships.",
    firmHeading: "Operator & Provider of All Legal Services",
    legalServicesBy: "Legal services are provided by",
    aSeparateFlLawFirm: "a separate Florida law firm",
    attorneyResponsible: "Attorney responsible for content",
    learnMoreAttorney: "Learn more about the attorney →",
    advertisingNotice:
      "The hiring of a lawyer is an important decision that should not be based solely upon advertisements. Before you decide, ask the lawyer to send you free written information about their qualifications and experience.",
    licenseNotice:
      "This website and the DetencionDefensa emergency app are owned by DetencionDefensa.com, Inc. and are operated by Sorrentino Law Firm PLLC under a license agreement. The Firm is solely responsible for all legal services, legal advice, and attorney-client relationships offered through this site. DetencionDefensa.com, Inc. receives a fixed license fee and does not share in any legal fee.",
    adNotice:
      "Advertisements on this site for Save My Home Trust and related products are paid or bartered advertising for a separate, non-legal service. They are not a legal recommendation, and you are never required to use any advertised service or any particular attorney.",
    allRightsReserved: "All rights reserved",
    privacy: "Privacy",
    legalNotices: "Legal notices & disclosures",
    contact: "Contact",
  },
  es: {
    companyHeading: "Propietario del Sitio y Proveedor de Tecnología",
    notALawFirm:
      "Sorrentino Law Firm PLLC opera este sitio bajo licencia de DetencionDefensa.com, Inc. DetencionDefensa.com, Inc. es estrictamente el desarrollador tecnológico y operador del sitio y de la aplicación — no es una firma de abogados, no brinda asesoramiento legal y no dirige ni controla ningún servicio legal. La Firma tiene el control exclusivo y la responsabilidad exclusiva de todos los servicios legales, el asesoramiento legal, el contenido legal y las relaciones abogado-cliente.",
    firmHeading: "Operador y Proveedor de Todos los Servicios Legales",
    legalServicesBy: "Los servicios legales son prestados por",
    aSeparateFlLawFirm: "una firma de abogados de Florida independiente",
    attorneyResponsible: "Abogado responsable del contenido",
    learnMoreAttorney: "Más información sobre el abogado →",
    advertisingNotice:
      "La contratación de un abogado es una decisión importante que no debe basarse únicamente en anuncios. Antes de decidir, pídale al abogado información escrita gratuita sobre sus calificaciones y experiencia.",
    licenseNotice:
      "Este sitio web y la aplicación de emergencia DetencionDefensa son propiedad de DetencionDefensa.com, Inc. y son operados por Sorrentino Law Firm PLLC bajo un acuerdo de licencia. La Firma es la única responsable de todos los servicios legales, asesoramiento legal y relaciones abogado-cliente ofrecidos a través de este sitio. DetencionDefensa.com, Inc. recibe una tarifa de licencia fija y no participa en ningún honorario legal.",
    adNotice:
      "Los anuncios en este sitio sobre Save My Home Trust y productos relacionados son publicidad pagada o intercambiada de un servicio separado que no es legal. No son una recomendación legal, y usted nunca está obligado a usar ningún servicio anunciado ni ningún abogado en particular.",
    allRightsReserved: "Todos los derechos reservados",
    privacy: "Privacidad",
    legalNotices: "Avisos legales y divulgaciones",
    contact: "Contacto",
  },
  ht: {
    companyHeading: "Founisè Teknoloji ak Sèvis",
    notALawFirm:
      "DetencionDefensa.com SE PA yon kabinè avoka epi li pa bay konsèy legal. Li bay lojisyèl admisyon, tradiksyon dokiman, daktilografi, ak depo an sekirite.",
    firmHeading: "Sèvis Legal Endepandan",
    legalServicesBy: "Sèvis legal yo bay pa",
    aSeparateFlLawFirm: "yon kabinè avoka Florid separe",
    attorneyResponsible: "Avoka responsab pou kontni",
    learnMoreAttorney: "Aprann plis sou avoka a →",
    advertisingNotice:
      "Anboche yon avoka se yon desizyon enpòtan ki pa dwe baze sèlman sou piblisite. Anvan ou deside, mande avoka a voye yo enfòmasyon ekri gratis sou kalifikasyon ak eksperyans li.",
    licenseNotice:
      "Sit entènèt sa a ak aplikasyon dijans DetencionDefensa se pwopriyete DetencionDefensa.com, Inc. epi se Sorrentino Law Firm PLLC k ap opere yo anba yon akò lisans. Kabinè a sèl responsab pou tout sèvis legal, konsèy legal, ak relasyon avoka-kliyan yo ofri atravè sit sa a. DetencionDefensa.com, Inc. resevwa yon frè lisans fiks epi li pa patisipe nan okenn frè legal.",
    adNotice:
      "Piblisite sou sit sa a pou Save My Home Trust ak pwodwi ki gen rapò se piblisite peye oswa echanje pou yon sèvis separe ki pa legal. Se pa yon rekòmandasyon legal, epi ou pa janm oblije itilize okenn sèvis ki anonse ni okenn avoka an patikilye.",
    allRightsReserved: "Tout dwa rezève",
    privacy: "Konfidansyalite",
    legalNotices: "Avi legal ak divilgasyon",
    contact: "Kontak",
  },
} as const;
