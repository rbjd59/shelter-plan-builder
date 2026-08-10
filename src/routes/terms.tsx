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

const TERMS_EN = `DetencionDefensa.com is NOT a law firm and does not provide legal advice. We provide self-help services: translation and typing of basic, non-legal information onto government-published forms (Federal Form AO 242, Petition for Writ of Habeas Corpus, and the IFP fee-waiver request).

You ("You") are the petitioner. You give the facts. You sign the form. You file it with the court. You comply with all court rules and any post-filing requirements. We do not represent you. We do not appear in court for you. We do not select your forms, give legal advice, predict outcomes, or guarantee any result.

Attorney Review. Through a separate, optional engagement with an independent attorney, the typed draft of your Pro Se form may be reviewed for completeness and to check that signatures are notarized and that the form is mailed to the correct clerk of court with a pre-addressed envelope. That attorney does not agree to represent you in court, to file any papers, or to review any papers other than the draft AO 242 covered by the retainer agreement that you read and accept separately. Their services are limited by that retainer agreement.

Price. All fees are currently waived because of the community crisis, so the emergency app costs you nothing at this time. The standard price is $10/month and will not resume without advance notice to you. Attorney-created and reviewed documents are provided at no additional charge. The subscription may be canceled anytime. Refund terms are stated at checkout.

Your Data. Your information is used to populate your forms and to deliver the services you request. Sensitive identifiers stay on your device whenever possible. We do not sell your personal information.

No Attorney–Client Relationship. Using this site, paying for the Plan, completing the questions, or downloading any document does NOT create an attorney–client relationship between You and DetencionDefensa.com. An attorney–client relationship with the independent reviewing attorney exists only under the separate written retainer that You sign with them.

Eligibility & Accuracy. You represent that the information you provide is true to the best of your knowledge. False statements on a federal habeas petition may have serious legal consequences, including dismissal of your petition.

Acceptance. By checking the box below and clicking Continue, You confirm that You have read these Terms & Conditions in full and that You accept them. You may close this page at any time before clicking Continue.

This summary is provided in plain language for your convenience. The full, binding terms are available on request and at the time of checkout.`;

const TERMS_ES = `DetencionDefensa.com NO es un bufete de abogados y no brinda asesoría legal. Ofrecemos servicios de autoayuda: traducción y mecanografía de información básica, no legal, en formularios publicados por el gobierno (Formulario federal AO 242, Petición de Habeas Corpus y solicitud de exención de cuotas IFP).

Usted ("Usted") es el peticionario. Usted aporta los hechos. Usted firma el formulario. Usted lo presenta ante el tribunal. Usted cumple con todas las reglas del tribunal y con cualquier requisito posterior a la presentación. Nosotros no lo representamos. No comparecemos ante el tribunal por Usted. No seleccionamos sus formularios, no damos asesoría legal, no predecimos resultados ni garantizamos ningún resultado.

Revisión por abogado. A través de un acuerdo separado y opcional con un abogado independiente, el borrador mecanografiado de su formulario Pro Se podrá ser revisado para verificar que esté completo, que las firmas estén notarizadas y que el formulario se envíe al secretario del tribunal correcto con un sobre pre-direccionado. Ese abogado no acepta representarlo en el tribunal, ni presentar papeles, ni revisar otros papeles distintos del borrador AO 242 cubierto por el acuerdo de retención que Usted lea y acepte por separado.

Precio. Todas las tarifas están exoneradas actualmente por la crisis comunitaria, así que la app de emergencia no le cuesta nada en este momento. El precio estándar es de $10/mes y no se reanudará sin avisarle con anticipación. Los documentos creados y revisados por un abogado se proporcionan sin costo adicional. La suscripción puede cancelarse en cualquier momento. Los términos de reembolso se indican al pagar.

Sus datos. Su información se usa para llenar sus formularios y prestar los servicios que solicita. No vendemos su información personal.

Sin relación abogado–cliente. El uso de este sitio, el pago del Plan, completar las preguntas o descargar cualquier documento NO crea una relación abogado–cliente entre Usted y DetencionDefensa.com.

Veracidad. Usted declara que la información que proporciona es verdadera a su leal saber y entender. Las declaraciones falsas en una petición federal de habeas pueden tener consecuencias legales graves.

Aceptación. Al marcar la casilla a continuación y hacer clic en Continuar, Usted confirma que ha leído estos Términos y Condiciones en su totalidad y que los acepta.`;

const TERMS_HT = `DetencionDefensa.com SE PA yon kabinè avoka epi li pa bay konsèy legal. Nou bay sèvis pwòp tèt-ou: tradiksyon ak ekri enfòmasyon debaz, ki pa legal, sou fòm gouvènman an pibliye (Fòm federal AO 242, Petisyon Habeas Corpus, ak demann IFP).

Ou ("Ou") se petisyonè a. Ou bay enfòmasyon yo. Ou siyen fòm nan. Ou depoze li nan tribinal la. Ou respekte tout règ tribinal la. Nou pa reprezante w. Nou pa parèt nan tribinal pou ou. Nou pa chwazi fòm ou, nou pa bay konsèy legal, nou pa pwomèt okenn rezilta.

Revizyon Avoka. Atravè yon akò separe ak yon avoka endepandan, bouyon fòm Pro Se ou kapab revize pou verifye li konplè ak ke siyati yo notarize epi fòm nan voye nan grefye tribinal la kòrèk. Avoka sa a pa dakò pou reprezante w nan tribinal.

Pri. Tout frè yo anile kounye a akòz kriz kominotè a, kidonk app ijans la pa koute w anyen nan moman sa a. Pri estanda a se $10/mwa e li p ap rekòmanse san yo pa avèti w davans. Dokiman kreye ak revize pa avoka yo bay gratis. Ou ka anile abònman an nenpòt lè. Tèm ranbousman yo parèt lè ou peye.

Done ou. Enfòmasyon ou itilize pou ranpli fòm ou yo. Nou pa vann enfòmasyon pèsonèl ou.

Pa gen relasyon avoka-kliyan. Sèvi ak sit sa a oswa peye Plan an PA kreye yon relasyon avoka-kliyan.

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
