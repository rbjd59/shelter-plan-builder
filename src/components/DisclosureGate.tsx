import { useState } from "react";

type Lang = "en" | "es" | "ht";

const T = {
  en: {
    title: "Before you continue — please read & agree",
    intro:
      "Sorrentino Law Firm PLLC operates this site under license from DetencionDefensa.com, Inc. The Firm provides all legal services. Before continuing, please confirm you understand the following:",
    items: [
      "DetencionDefensa.com, Inc. is strictly the technology developer and website/app operator. It is not a law firm, gives no legal advice, and does not control any legal service. Sorrentino Law Firm PLLC has sole control of all legal work.",
      "Your intake is collected by the Company only as the Firm's disclosed agent, so your information is the Firm's client information and attorney-client privilege attaches through the Firm.",
      "An attorney-client relationship with the Firm begins only when the Firm accepts your matter and you sign its limited-scope engagement letter.",
      "The Firm reviews and approves your federal court forms (AO 242 Petition for Writ of Habeas Corpus under 28 U.S.C. § 2241 and AO 240 In Forma Pauperis), prepared from information YOU provide.",
      "The engagement is limited in scope: you sign and file your own documents with the proper court. No one appears in court for you unless the Firm separately agrees in writing.",
      "There is no fee. The Firm provides this limited-scope service pro bono during the community crisis.",
      "Review every document for accuracy before you sign it.",
    ],
    accept: "I have read and agree to the terms above.",
    cont: "I Agree — Continue",
    must: "You must check the box to continue.",
  },
  es: {
    title: "Antes de continuar — lea y acepte",
    intro:
      "Sorrentino Law Firm PLLC opera este sitio bajo licencia de DetencionDefensa.com, Inc. La Firma presta todos los servicios legales. Antes de continuar, confirme que entiende lo siguiente:",
    items: [
      "DetencionDefensa.com, Inc. es estrictamente el desarrollador tecnológico y operador del sitio y de la aplicación. No es una firma de abogados, no brinda asesoramiento legal y no controla ningún servicio legal. Sorrentino Law Firm PLLC tiene el control exclusivo de todo el trabajo legal.",
      "Su información de admisión es recopilada por la empresa únicamente como agente divulgado de la Firma, por lo que su información es información de cliente de la Firma y el privilegio abogado-cliente se aplica a través de la Firma.",
      "La relación abogado-cliente con la Firma comienza únicamente cuando la Firma acepta su asunto y usted firma su carta de contratación de alcance limitado.",
      "La Firma revisa y aprueba sus formularios federales (AO 242 Petición de Habeas Corpus bajo 28 U.S.C. § 2241 y AO 240 In Forma Pauperis), preparados con la información que USTED proporciona.",
      "La representación es de alcance limitado: usted firma y presenta sus propios documentos ante el tribunal. Nadie comparece en el tribunal por usted a menos que la Firma lo acuerde por escrito por separado.",
      "No hay ningún costo. La Firma brinda este servicio de alcance limitado pro bono durante la crisis comunitaria.",
      "Revise cada documento para verificar su exactitud antes de firmarlo.",
    ],
    accept: "He leído y acepto los términos anteriores.",
    cont: "Acepto — Continuar",
    must: "Debe marcar la casilla para continuar.",
  },
  ht: {
    title: "Anvan ou kontinye — li epi dakò",
    intro:
      "Se Sorrentino Law Firm PLLC k ap opere sit sa a anba yon lisans DetencionDefensa.com, Inc. bay. Kabinè a bay tout sèvis legal yo. Anvan w kontinye, konfime ou konprann sa ki annapre yo:",
    items: [
      "DetencionDefensa.com, Inc. se sèlman devlopè teknoloji a ak operatè sit la ak aplikasyon an. Li pa yon kabinè avoka, li pa bay konsèy legal, epi li pa kontwole okenn sèvis legal. Sorrentino Law Firm PLLC gen kontwòl total sou tout travay legal.",
      "Se konpayi an ki kolekte enfòmasyon admisyon w, men sèlman kòm ajan deklare Kabinè a, konsa enfòmasyon w se enfòmasyon kliyan Kabinè a epi privilèj avoka-kliyan aplike atravè Kabinè a.",
      "Relasyon avoka-kliyan ak Kabinè a kòmanse sèlman lè Kabinè a aksepte dosye w epi ou siyen lèt angajman limite li a.",
      "Kabinè a revize epi apwouve fòm federal ou yo (AO 242 Petisyon Habeas Corpus dapre 28 U.S.C. § 2241 ak AO 240 In Forma Pauperis), ki prepare ak enfòmasyon OU bay.",
      "Angajman an gen yon sijè limite: ou siyen epi depoze pwòp dokiman ou nan tribinal la. Pèsonn pa parèt nan tribinal pou ou sof si Kabinè a dakò separeman alekri.",
      "Pa gen okenn frè. Kabinè a bay sèvis limite sa a pro bono pandan kriz kominotè a.",
      "Revize chak dokiman pou egzaktitid anvan ou siyen l.",
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
