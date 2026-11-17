import { Link } from "@tanstack/react-router";
import { FIRM, COMPANY } from "@/lib/firm-info";
import { useLang } from "@/context/LanguageContext";
import { PRIVILEGE_NOTICE, PRIVILEGE_SCOPE, OPERATING_NOTICE, HOME_TRUST_AD_NOTICE, type DiscLang } from "@/lib/operating-disclosure";
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

        <p style={{ margin: 0, color: "#d4d4d8", borderLeft: `3px solid ${FIRM.accentColor}`, paddingLeft: 12 }}>
          {PRIVILEGE_NOTICE[(lang as DiscLang)] ?? PRIVILEGE_NOTICE.en}{" "}{PRIVILEGE_SCOPE[lang]}
        </p>

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
    companyHeading: "SaaS Platform Owner & Technology/Data Provider",
    notALawFirm: OPERATING_NOTICE.en,
    firmHeading: "Operator & Provider of All Legal Services",
    legalServicesBy: "Legal services are provided by",
    aSeparateFlLawFirm: "a separate Florida law firm",
    attorneyResponsible: "Attorney responsible for content",
    learnMoreAttorney: "Learn more about the attorney →",
    advertisingNotice:
      "The hiring of a lawyer is an important decision that should not be based solely upon advertisements. Before you decide, ask the lawyer to send you free written information about their qualifications and experience.",
    licenseNotice: OPERATING_NOTICE.en,
    adNotice: HOME_TRUST_AD_NOTICE.en,
    allRightsReserved: "All rights reserved",
    privacy: "Privacy",
    legalNotices: "Legal notices & disclosures",
    contact: "Contact",
  },
  es: {
    companyHeading: "Propietario de la plataforma SaaS y proveedor de tecnología y datos",
    notALawFirm: OPERATING_NOTICE.es,
    firmHeading: "Operador y Proveedor de Todos los Servicios Legales",
    legalServicesBy: "Los servicios legales son prestados por",
    aSeparateFlLawFirm: "una firma de abogados de Florida independiente",
    attorneyResponsible: "Abogado responsable del contenido",
    learnMoreAttorney: "Más información sobre el abogado →",
    advertisingNotice:
      "La contratación de un abogado es una decisión importante que no debe basarse únicamente en anuncios. Antes de decidir, pídale al abogado información escrita gratuita sobre sus calificaciones y experiencia.",
    licenseNotice: OPERATING_NOTICE.es,
    adNotice: HOME_TRUST_AD_NOTICE.es,
    allRightsReserved: "Todos los derechos reservados",
    privacy: "Privacidad",
    legalNotices: "Avisos legales y divulgaciones",
    contact: "Contacto",
  },
  ht: {
    companyHeading: "Pwopriyetè platfòm SaaS ak founisè teknoloji ak done",
    notALawFirm: OPERATING_NOTICE.ht,
    firmHeading: "Operatè ak Founisè Tout Sèvis Legal",
    legalServicesBy: "Sèvis legal yo bay pa",
    aSeparateFlLawFirm: "yon kabinè avoka Florid separe",
    attorneyResponsible: "Avoka responsab pou kontni",
    learnMoreAttorney: "Aprann plis sou avoka a →",
    advertisingNotice:
      "Anboche yon avoka se yon desizyon enpòtan ki pa dwe baze sèlman sou piblisite. Anvan ou deside, mande avoka a voye yo enfòmasyon ekri gratis sou kalifikasyon ak eksperyans li.",
    licenseNotice: OPERATING_NOTICE.ht,
    adNotice: HOME_TRUST_AD_NOTICE.ht,
    allRightsReserved: "Tout dwa rezève",
    privacy: "Konfidansyalite",
    legalNotices: "Avi legal ak divilgasyon",
    contact: "Kontak",
  },
} as const;
