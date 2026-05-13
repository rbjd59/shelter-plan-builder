import { useState } from "react";

type Lang = "en" | "es" | "ht";

const T = {
  en: {
    title: "Before you continue — please read & agree",
    intro: "DetencionDefensa.com is a self-help document preparation service. Like LegalZoom™ or DoNotPay™, we are not your attorney. Before continuing, please confirm you understand the following:",
    items: [
      "We are NOT a law firm and do NOT provide legal advice. No attorney-client relationship is created.",
      "We prepare standard federal court forms (AO 242 Petition for Writ of Habeas Corpus under 28 U.S.C. § 2241 and AO 240 In Forma Pauperis) using information YOU provide.",
      "You are responsible for reviewing every form, choosing your own legal grounds, signing, and filing with the proper court. We do not file on your behalf.",
      "Communications with us are NOT protected by attorney-client privilege.",
      "All fees are for document preparation services only and are non-refundable once forms are prepared.",
      "If you need legal advice, you should consult a licensed attorney.",
    ],
    accept: "I have read and agree to the terms above.",
    cont: "I Agree — Continue",
    must: "You must check the box to continue.",
  },
  es: {
    title: "Antes de continuar — lea y acepte",
    intro: "DetencionDefensa.com es un servicio de preparación de documentos de autoayuda. Al igual que LegalZoom™ o DoNotPay™, no somos su abogado. Antes de continuar, confirme que entiende lo siguiente:",
    items: [
      "NO somos un bufete de abogados y NO damos consejos legales. No se crea relación abogado-cliente.",
      "Preparamos formularios federales estándar (AO 242 Petición de Habeas Corpus bajo 28 U.S.C. § 2241 y AO 240 In Forma Pauperis) usando la información que USTED nos da.",
      "Usted es responsable de revisar cada formulario, elegir sus propios motivos legales, firmar y presentarlo ante el tribunal. Nosotros no presentamos por usted.",
      "Las comunicaciones con nosotros NO están protegidas por el privilegio abogado-cliente.",
      "Todos los pagos son por servicios de preparación de documentos y no son reembolsables una vez preparados los formularios.",
      "Si necesita consejo legal, debe consultar a un abogado licenciado.",
    ],
    accept: "He leído y acepto los términos anteriores.",
    cont: "Acepto — Continuar",
    must: "Debe marcar la casilla para continuar.",
  },
  ht: {
    title: "Anvan ou kontinye — li epi dakò",
    intro: "DetencionDefensa.com se yon sèvis preparasyon dokiman pou tèt ou. Tankou LegalZoom™ oswa DoNotPay™, nou pa avoka w. Anvan w kontinye, konfime ou konprann sa ki annapre yo:",
    items: [
      "Nou PA yon kabinè avoka epi nou PA bay konsèy legal. Pa gen relasyon avoka-kliyan.",
      "Nou prepare fòm federal estanda (AO 242 Petisyon Habeas Corpus dapre 28 U.S.C. § 2241 ak AO 240 In Forma Pauperis) ak enfòmasyon OU bay.",
      "Ou responsab pou revize chak fòm, chwazi rezon legal pa w, siyen, epi depoze l nan tribinal la. Nou pa depoze pou ou.",
      "Kominikasyon avèk nou PA pwoteje pa privilèj avoka-kliyan.",
      "Tout frè se pou sèvis preparasyon dokiman epi pa ranbousab yon fwa fòm yo prepare.",
      "Si w bezwen konsèy legal, konsilte yon avoka ki gen lisans.",
    ],
    accept: "Mwen li epi dakò ak tèm yo anwo a.",
    cont: "Mwen Dakò — Kontinye",
    must: "Ou dwe tcheke kazye a pou kontinye.",
  },
} as const;

export function DisclosureGate({
  lang,
  storageKey,
  children,
}: {
  lang: Lang;
  storageKey: string;
  children: React.ReactNode;
}) {
  const [accepted, setAccepted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(storageKey) === "1";
  });
  const [checked, setChecked] = useState(false);
  const [err, setErr] = useState(false);
  const t = T[lang];

  if (accepted) return <>{children}</>;

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#f6efe1", fontFamily: "Inter Tight, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ background: "#1a2436", borderRadius: 8, padding: 32, borderTop: "4px solid #e8a04a" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 16, fontFamily: "Fraunces, serif" }}>{t.title}</h1>
          <p style={{ fontSize: 14, color: "#cfc8b8", lineHeight: 1.6, marginBottom: 20 }}>{t.intro}</p>
          <ul style={{ paddingLeft: 20, marginBottom: 24 }}>
            {t.items.map((it, i) => (
              <li key={i} style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 10, color: "#f6efe1" }}>{it}</li>
            ))}
          </ul>
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", padding: 14, background: "#0b1220", border: `1px solid ${err ? "#ff8080" : "#3a4458"}`, borderRadius: 4, marginBottom: 16 }}>
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => { setChecked(e.target.checked); if (e.target.checked) setErr(false); }}
              style={{ marginTop: 3, width: 18, height: 18, cursor: "pointer" }}
            />
            <span style={{ fontSize: 14, lineHeight: 1.5 }}>{t.accept}</span>
          </label>
          {err && <p style={{ color: "#ff8080", fontSize: 13, marginBottom: 12 }}>{t.must}</p>}
          <button
            type="button"
            onClick={() => {
              if (!checked) { setErr(true); return; }
              try { window.localStorage.setItem(storageKey, "1"); } catch { /* ignore */ }
              setAccepted(true);
            }}
            style={{ background: "#e8a04a", color: "#0b1220", padding: "14px 28px", fontSize: 16, fontWeight: 700, border: "none", borderRadius: 4, cursor: "pointer", width: "100%" }}
          >
            {t.cont}
          </button>
        </div>
      </div>
    </div>
  );
}
