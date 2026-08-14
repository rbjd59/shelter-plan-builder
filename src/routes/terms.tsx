import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useLang } from "@/context/LanguageContext";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — DetencionDefensa.com" },
      { name: "description", content: "Read and accept the Terms & Conditions before continuing to the AO 242 questions." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TermsPage,
});

const TERMS_EN = `Sorrentino Law Firm PLLC, a Florida law firm, operates this site under license from DetencionDefensa.com, Inc. and provides all legal services on it. DetencionDefensa.com, Inc. is strictly the technology developer and website/app operator: it builds and maintains the platform, translates and types your information onto government-published forms (Federal Form AO 242, Petition for Writ of Habeas Corpus, and the IFP fee-waiver request), and delivers them securely. It is not a law firm, it gives no legal advice, and it does not direct or control any legal service. The Firm has sole control of, and sole responsibility for, all legal work.

You ("You") are the petitioner. You give the facts. You sign the form. You file it with the court. You comply with all court rules and any post-filing requirements. We do not represent you. We do not appear in court for you. We do not select your forms, give legal advice, predict outcomes, or guarantee any result.

Attorney Review. Through a separate, optional engagement with an independent attorney, the typed draft of your Pro Se form may be reviewed for completeness and to check that signatures are notarized and that the form is mailed to the correct clerk of court with a pre-addressed envelope. That attorney does not agree to represent you in court, to file any papers, or to review any papers other than the draft AO 242 covered by the retainer agreement that you read and accept separately. Their services are limited by that retainer agreement.

Price. This is a free, pro bono engagement. There is no signup fee, no monthly fee, and no credit card is required. The attorney has agreed to prepare and review your documents pro bono for a limited period, and the emergency app is provided at no charge during the community crisis. This pro bono commitment may be ended at any time by DetencionDefensa.com and the attorney; if a fee is ever introduced in the future, you will be notified in advance and no charge will be made without your express consent. You may stop using the service at any time.

Your Data. Your information is used to populate your forms and to deliver the services you request. Sensitive identifiers stay on your device whenever possible. We do not sell your personal information.

Attorney–Client Relationship and Privilege. No attorney–client relationship is ever created with DetencionDefensa.com, Inc.; it is not a law firm. Your intake is collected by the Company only as the disclosed agent of Sorrentino Law Firm PLLC, under the Firm's supervision and confidentiality obligations, so your information is the Firm's client information and attorney–client privilege attaches through the Firm. An attorney–client relationship with the Firm begins only when the Firm accepts your matter and You sign its limited-scope engagement letter.

Eligibility & Accuracy. You represent that the information you provide is true to the best of your knowledge. False statements on a federal habeas petition may have serious legal consequences, including dismissal of your petition.

Acceptance. By checking the box below and clicking Continue, You confirm that You have read these Terms & Conditions in full and that You accept them. You may close this page at any time before clicking Continue.

This summary is provided in plain language for your convenience. The full, binding terms are available on request and at the time of checkout.`;

const TERMS_ES = `Sorrentino Law Firm PLLC, una firma de abogados de Florida, opera este sitio bajo licencia de DetencionDefensa.com, Inc. y presta todos los servicios legales. DetencionDefensa.com, Inc. es estrictamente el desarrollador tecnológico y operador del sitio y de la aplicación: construye y mantiene la plataforma, traduce y mecanografía su información en formularios publicados por el gobierno (Formulario federal AO 242, Petición de Habeas Corpus y solicitud de exención de cuotas IFP) y los entrega de forma segura. No es una firma de abogados, no brinda asesoría legal y no dirige ni controla ningún servicio legal. La Firma tiene el control exclusivo y la responsabilidad exclusiva de todo el trabajo legal.

Usted ("Usted") es el peticionario. Usted aporta los hechos. Usted firma el formulario. Usted lo presenta ante el tribunal. Usted cumple con todas las reglas del tribunal y con cualquier requisito posterior a la presentación. Nosotros no lo representamos. No comparecemos ante el tribunal por Usted. No seleccionamos sus formularios, no damos asesoría legal, no predecimos resultados ni garantizamos ningún resultado.

Revisión por abogado. A través de un acuerdo separado y opcional con un abogado independiente, el borrador mecanografiado de su formulario Pro Se podrá ser revisado para verificar que esté completo, que las firmas estén notarizadas y que el formulario se envíe al secretario del tribunal correcto con un sobre pre-direccionado. Ese abogado no acepta representarlo en el tribunal, ni presentar papeles, ni revisar otros papeles distintos del borrador AO 242 cubierto por el acuerdo de retención que Usted lea y acepte por separado.

Precio. Este es un servicio gratuito, pro bono. No hay cuota de inscripción, no hay cuota mensual y no se requiere tarjeta de crédito. El abogado ha aceptado preparar y revisar sus documentos pro bono por un período limitado, y la app de emergencia se brinda sin cargo durante la crisis comunitaria. Este compromiso pro bono puede terminarse en cualquier momento por DetencionDefensa.com y el abogado; si en el futuro se introduce alguna tarifa, se le avisará con anticipación y no se le cobrará nada sin su consentimiento expreso. Puede dejar de usar el servicio en cualquier momento.

Sus datos. Su información se usa para llenar sus formularios y prestar los servicios que solicita. No vendemos su información personal.

Relación abogado–cliente y privilegio. Nunca se crea una relación abogado–cliente con DetencionDefensa.com, Inc.; no es una firma de abogados. Su información de admisión es recopilada por la empresa únicamente como agente divulgado de Sorrentino Law Firm PLLC, bajo la supervisión y las obligaciones de confidencialidad de la Firma, por lo que su información es información de cliente de la Firma y el privilegio abogado–cliente se aplica a través de la Firma. La relación abogado–cliente con la Firma comienza únicamente cuando la Firma acepta su asunto y Usted firma su carta de contratación de alcance limitado.

Veracidad. Usted declara que la información que proporciona es verdadera a su leal saber y entender. Las declaraciones falsas en una petición federal de habeas pueden tener consecuencias legales graves.

Aceptación. Al marcar la casilla a continuación y hacer clic en Continuar, Usted confirma que ha leído estos Términos y Condiciones en su totalidad y que los acepta.`;

const TERMS_HT = `Sorrentino Law Firm PLLC, yon kabinè avoka Florid, ap opere sit sa a anba yon lisans DetencionDefensa.com, Inc. bay, epi se li ki bay tout sèvis legal yo. DetencionDefensa.com, Inc. se sèlman devlopè teknoloji a ak operatè sit la ak aplikasyon an: li konstwi epi kenbe platfòm nan, li tradui epi ekri enfòmasyon w sou fòm gouvènman an pibliye (Fòm federal AO 242, Petisyon Habeas Corpus, ak demann IFP), epi li livre yo an sekirite. Li pa yon kabinè avoka, li pa bay konsèy legal, epi li pa dirije ni kontwole okenn sèvis legal. Kabinè a gen kontwòl total ak responsablite total pou tout travay legal.

Ou ("Ou") se petisyonè a. Ou bay enfòmasyon yo. Ou siyen fòm nan. Ou depoze li nan tribinal la. Ou respekte tout règ tribinal la. Nou pa reprezante w. Nou pa parèt nan tribinal pou ou. Nou pa chwazi fòm ou, nou pa bay konsèy legal, nou pa pwomèt okenn rezilta.

Revizyon Avoka. Atravè yon akò separe ak yon avoka endepandan, bouyon fòm Pro Se ou kapab revize pou verifye li konplè ak ke siyati yo notarize epi fòm nan voye nan grefye tribinal la kòrèk. Avoka sa a pa dakò pou reprezante w nan tribinal.

Pri. Sa a se yon sèvis gratis, pro bono. Pa gen frè enskripsyon, pa gen frè chak mwa, epi ou pa bezwen kat kredi. Avoka a dakò pou prepare epi revize dokiman ou yo pro bono pou yon peryòd limite, epi aplikasyon ijans lan bay san frè pandan kriz kominotè a. Angajman pro bono sa a ka fini nenpòt lè pa DetencionDefensa.com ak avoka a; si yo janm mete yon frè nan lavni, y ap avèti w davans e yo p ap chaje w anyen san konsantman eksprè ou. Ou ka sispann itilize sèvis la nenpòt lè.

Done ou. Enfòmasyon ou itilize pou ranpli fòm ou yo. Nou pa vann enfòmasyon pèsonèl ou.

Relasyon avoka-kliyan ak privilèj. Pa gen okenn relasyon avoka-kliyan ki kreye ak DetencionDefensa.com, Inc.; li pa yon kabinè avoka. Se konpayi an ki kolekte admisyon w, men sèlman kòm ajan deklare Sorrentino Law Firm PLLC, anba sipèvizyon ak obligasyon konfidansyalite Kabinè a, konsa enfòmasyon w se enfòmasyon kliyan Kabinè a epi privilèj avoka-kliyan aplike atravè Kabinè a. Relasyon avoka-kliyan ak Kabinè a kòmanse sèlman lè Kabinè a aksepte dosye w epi Ou siyen lèt angajman limite li a.

Aksepte. Lè ou tcheke bwat la epi ou klike Kontinye, ou konfime ou li tout Tèm ak Kondisyon yo epi ou aksepte yo.`;

const COPY = {
  es: { eyebrow: "Términos y Condiciones", title: "Por favor lea los Términos y Condiciones", intro: "Antes de continuar a las preguntas para crear su formulario federal AO 242, lea estos términos completos. Debe desplazarse hasta el final.", body: TERMS_ES, confirm: "He leído y acepto los Términos y Condiciones.", continue: "Continuar a las preguntas →", mustScroll: "Desplácese hasta el final para continuar.", back: "← Volver" },
  en: { eyebrow: "Terms & Conditions", title: "Please read the Terms & Conditions", intro: "Before continuing to the questions that create your federal AO 242 form, read these terms in full. You must scroll to the bottom.", body: TERMS_EN, confirm: "I have read and agree to the Terms & Conditions.", continue: "Continue to questions →", mustScroll: "Scroll to the bottom to continue.", back: "← Back" },
  ht: { eyebrow: "Tèm ak Kondisyon", title: "Tanpri li Tèm ak Kondisyon yo", intro: "Anvan ou kontinye nan kesyon ki kreye fòm federal AO 242 ou, li tèm sa yo nèt. Ou dwe desann jiska anba.", body: TERMS_HT, confirm: "Mwen li epi mwen dakò avèk Tèm ak Kondisyon yo.", continue: "Kontinye nan kesyon yo →", mustScroll: "Desann jiska anba pou kontinye.", back: "← Tounen" },
};

function TermsPage() {
  const { lang } = useLang();
  const t = COPY[lang];
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setScrolled(false);
    setChecked(false);
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = 0;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setScrolled(true);
    };
    el.addEventListener("scroll", onScroll);
    if (el.scrollHeight <= el.clientHeight + 8) setScrolled(true);
    return () => el.removeEventListener("scroll", onScroll);
  }, [lang]);

  const canContinue = scrolled && checked;

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", padding: "2rem 1rem 4rem", fontFamily: "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif", color: "#1e293b" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <button onClick={() => navigate({ to: "/" })} style={{ background: "none", border: "none", color: "#1e40af", fontSize: 14, cursor: "pointer", padding: 0, marginBottom: "1rem" }}>{t.back}</button>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".18em", color: "#1e40af", textTransform: "uppercase", marginBottom: ".5rem" }}>{t.eyebrow}</div>
        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.2rem)", fontWeight: 800, margin: "0 0 .75rem" }}>{t.title}</h1>
        <p style={{ color: "#64748b", margin: "0 0 1.5rem", lineHeight: 1.55 }}>{t.intro}</p>
        <div ref={scrollRef} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "1.25rem", height: 360, overflowY: "auto", lineHeight: 1.6, fontSize: 14, whiteSpace: "pre-wrap" }}>
          {t.body}
        </div>
        {!scrolled && <p style={{ color: "#dc2626", fontSize: 13, margin: ".75rem 0 0" }}>{t.mustScroll}</p>}
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: "1.25rem", opacity: scrolled ? 1 : 0.55, cursor: scrolled ? "pointer" : "not-allowed" }}>
          <input type="checkbox" disabled={!scrolled} checked={checked} onChange={(e) => setChecked(e.target.checked)} style={{ marginTop: 4, width: 18, height: 18 }} />
          <span style={{ fontSize: 15 }}>{t.confirm}</span>
        </label>
        <button disabled={!canContinue} onClick={() => navigate({ to: "/checkout", search: { lang } as never })} style={{ marginTop: "1.5rem", width: "100%", padding: "14px 22px", borderRadius: 999, border: "none", background: canContinue ? "#e8a04a" : "#cbd5e1", color: canContinue ? "#0f1830" : "#64748b", fontWeight: 800, fontSize: 15, letterSpacing: ".08em", textTransform: "uppercase", cursor: canContinue ? "pointer" : "not-allowed", boxShadow: canContinue ? "0 8px 24px rgba(0,0,0,0.18)" : "none" }}>{t.continue}</button>
      </div>
    </main>
  );
}
