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

        <p style={{ margin: 0, fontStyle: "italic", color: "#a1a1aa" }}>
          {t.advertisingNotice}
        </p>

        <p style={{ margin: 0, color: "#71717a", fontSize: 11 }}>
          © {new Date().getFullYear()} {COMPANY.legalName}. {t.allRightsReserved}.{" "}
          <Link to="/privacy" style={{ color: "#a1a1aa", textDecoration: "underline" }}>
            {t.privacy}
          </Link>
        </p>
      </div>
    </footer>
  );
}

const COPY = {
  en: {
    companyHeading: "Technology & Service Provider",
    notALawFirm:
      "DetencionDefensa.com is NOT a law firm and does not provide legal advice. It provides intake software, document translation, typing, and secure storage. on emergency app.",
    firmHeading: "Independent Legal Services",
    legalServicesBy: "Legal services are provided by",
    aSeparateFlLawFirm: "a separate Florida law firm",
    attorneyResponsible: "Attorney responsible for content",
    learnMoreAttorney: "Learn more about the attorney →",
    advertisingNotice:
      "The hiring of a lawyer is an important decision that should not be based solely upon advertisements. Before you decide, ask the lawyer to send you free written information about their qualifications and experience.",
    allRightsReserved: "All rights reserved",
    privacy: "Privacy",
  },
  es: {
    companyHeading: "Proveedor de Tecnología y Servicios",
    notALawFirm:
      "DetencionDefensa.com NO es una firma de abogados y no brinda asesoramiento legal. Ofrece software de admisión, traducción de documentos, mecanografía y almacenamiento seguro.",
    firmHeading: "Servicios Legales Independientes",
    legalServicesBy: "Los servicios legales son prestados por",
    aSeparateFlLawFirm: "una firma de abogados de Florida independiente",
    attorneyResponsible: "Abogado responsable del contenido",
    learnMoreAttorney: "Más información sobre el abogado →",
    advertisingNotice:
      "La contratación de un abogado es una decisión importante que no debe basarse únicamente en anuncios. Antes de decidir, pídale al abogado información escrita gratuita sobre sus calificaciones y experiencia.",
    allRightsReserved: "Todos los derechos reservados",
    privacy: "Privacidad",
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
    allRightsReserved: "Tout dwa rezève",
    privacy: "Konfidansyalite",
  },
} as const;
