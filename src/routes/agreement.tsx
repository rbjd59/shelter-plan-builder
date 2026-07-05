import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { readSiteLang } from "@/lib/site-lang";
import { getSessionAddons } from "@/utils/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";

const searchSchema = z.object({
  lang: z.enum(["en", "es", "ht"]).catch("es"),
  session_id: z.string().optional(),
});

export const Route = createFileRoute("/agreement")({
  validateSearch: searchSchema,
  component: AgreementPage,
  head: () => ({
    meta: [
      { title: "Agreement — DetencionDefensa.com" },
      { name: "description", content: "Read and accept the Terms of Service and Limited Attorney-Client Retainer Agreement." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type Lang = "en" | "es" | "ht";

const T = {
  en: {
    title: "You must agree before continuing",
    sub: "Please scroll through and read BOTH agreements below. The checkbox will activate once you have scrolled to the end.",
    tosTitle: "Terms of Service — DetencionDefensa.com",
    tos: [
      "DetencionDefensa.com is a self-help document preparation service. We are NOT a law firm and we do NOT provide legal advice.",
      "We prepare standard federal court forms (AO 242 Petition for Writ of Habeas Corpus under 28 U.S.C. § 2241 and AO 240 In Forma Pauperis) using information that YOU provide.",
      "You are responsible for reviewing every form, choosing your own legal grounds, signing, and filing with the proper U.S. District Court. We do not file on your behalf.",
      "Communications between you and DetencionDefensa.com staff are NOT protected by attorney-client privilege.",
      "All fees paid to DetencionDefensa.com are for document translation, typing, and preparation services and are non-refundable once forms are prepared.",
      "If you need legal advice, you should consult a licensed attorney.",
      "By continuing, you agree these Terms of Service govern your use of DetencionDefensa.com.",
    ],
    retainerTitle: "Limited Attorney-Client Retainer Agreement — Rosario Sorrentino, Esq.",
    retainer: [
      "This Limited Retainer Agreement is between you (\"Client\") and Rosario Sorrentino, Esq., a Florida-licensed attorney.",
      "The scope of representation is strictly LIMITED to: (a) reviewing the AO 242 and AO 240 forms prepared from your intake answers before they are delivered to you, and (b) completing and mailing the prepared forms to the appropriate facility if you are detained.",
      "Attorney does NOT represent you in immigration court, removal proceedings, bond hearings, or any other matter outside the limited scope above.",
      "An attorney-client relationship is created only for the limited scope described above. Information you provide that is reviewed by Attorney is protected by attorney-client privilege.",
      "Attorney's fee for this limited representation is included in the $199 paid to DetencionDefensa.com and is non-refundable once review begins.",
      "You may terminate this limited representation at any time in writing. Attorney may withdraw consistent with the Florida Rules of Professional Conduct.",
      "By continuing, you acknowledge you have read this Limited Retainer Agreement and agree to its terms.",
    ],
    scrollHint: "↓ Scroll to the end to enable the checkbox",
    accept: "I have READ both agreements above and I AGREE to be bound by them.",
    cont: "I Agree — Begin Intake",
    must: "You must check the box to continue.",
    notScrolled: "Please scroll to the bottom of both agreements before checking the box.",
  },
  es: {
    title: "Debe aceptar antes de continuar",
    sub: "Lea ambos acuerdos abajo. La casilla se activará cuando llegue al final.",
    tosTitle: "Términos del Servicio — DetencionDefensa.com",
    tos: [
      "DetencionDefensa.com es un servicio de preparación de documentos de autoayuda. NO somos un bufete de abogados y NO damos consejos legales.",
      "Preparamos formularios federales estándar (AO 242 Petición de Habeas Corpus bajo 28 U.S.C. § 2241 y AO 240 In Forma Pauperis) usando la información que USTED nos proporciona.",
      "Usted es responsable de revisar cada formulario, elegir sus propios motivos legales, firmar y presentarlo ante el Tribunal de Distrito de EE.UU. correspondiente. Nosotros no presentamos por usted.",
      "Las comunicaciones entre usted y el personal de DetencionDefensa.com NO están protegidas por el privilegio abogado-cliente.",
      "Todas las tarifas pagadas a DetencionDefensa.com son por servicios de traducción, mecanografía y preparación de documentos y no son reembolsables una vez preparados los formularios.",
      "Si necesita consejo legal, debe consultar a un abogado licenciado.",
      "Al continuar, usted acepta que estos Términos del Servicio rigen su uso de DetencionDefensa.com.",
    ],
    retainerTitle: "Acuerdo Limitado de Retención Abogado-Cliente — Rosario Sorrentino, Esq.",
    retainer: [
      "Este Acuerdo Limitado de Retención es entre usted (\"Cliente\") y Rosario Sorrentino, Esq., un abogado licenciado en Florida.",
      "El alcance de la representación se limita estrictamente a: (a) revisar los formularios AO 242 y AO 240 preparados con sus respuestas antes de entregárselos, y (b) completar y enviar por correo los formularios preparados al centro correspondiente si usted es detenido.",
      "El Abogado NO lo representa en tribunal de inmigración, procedimientos de remoción, audiencias de fianza ni ningún otro asunto fuera del alcance limitado anterior.",
      "Se crea una relación abogado-cliente solo para el alcance limitado descrito. La información que usted proporciona y que es revisada por el Abogado está protegida por el privilegio abogado-cliente.",
      "La tarifa del Abogado por esta representación limitada está incluida en los $199 pagados a DetencionDefensa.com y no es reembolsable una vez iniciada la revisión.",
      "Usted puede terminar esta representación limitada en cualquier momento por escrito. El Abogado puede retirarse conforme a las Reglas de Conducta Profesional de Florida.",
      "Al continuar, reconoce que ha leído este Acuerdo Limitado de Retención y acepta sus términos.",
    ],
    scrollHint: "↓ Desplace hasta el final para activar la casilla",
    accept: "He LEÍDO ambos acuerdos arriba y ACEPTO quedar obligado por ellos.",
    cont: "Acepto — Comenzar Formulario",
    must: "Debe marcar la casilla para continuar.",
    notScrolled: "Desplácese hasta el final de ambos acuerdos antes de marcar la casilla.",
  },
  ht: {
    title: "Ou dwe dakò anvan w kontinye",
    sub: "Tanpri li toulède akò yo anba a. Kazye a ap aktive lè w rive nan fen an.",
    tosTitle: "Tèm Sèvis la — DetencionDefensa.com",
    tos: [
      "DetencionDefensa.com se yon sèvis preparasyon dokiman pou tèt ou. Nou PA yon kabinè avoka epi nou PA bay konsèy legal.",
      "Nou prepare fòm federal estanda (AO 242 Petisyon Habeas Corpus dapre 28 U.S.C. § 2241 ak AO 240 In Forma Pauperis) ak enfòmasyon OU bay.",
      "Ou responsab pou revize chak fòm, chwazi rezon legal pa w, siyen, epi depoze l nan Tribinal Distri Etazini ki apwopriye a. Nou pa depoze pou ou.",
      "Kominikasyon ant ou ak anplwaye DetencionDefensa.com PA pwoteje pa privilèj avoka-kliyan.",
      "Tout frè ou peye DetencionDefensa.com se pou sèvis tradiksyon, tap, ak preparasyon dokiman epi pa ranbousab yon fwa fòm yo prepare.",
      "Si w bezwen konsèy legal, konsilte yon avoka ki gen lisans.",
      "Lè w kontinye, ou dakò ke Tèm Sèvis sa yo gouvène itilizasyon ou nan DetencionDefensa.com.",
    ],
    retainerTitle: "Akò Retansyon Limite Avoka-Kliyan — Rosario Sorrentino, Esq.",
    retainer: [
      "Akò Retansyon Limite sa a se ant ou (\"Kliyan\") ak Rosario Sorrentino, Esq., yon avoka ki gen lisans nan Florida.",
      "Pòte reprezantasyon an LIMITE strikteman a: (a) revize fòm AO 242 ak AO 240 yo prepare ak repons ou yo anvan yo livre yo ba ou, ak (b) ranpli epi voye fòm yo nan adrès sant lan si yo detni w.",
      "Avoka a PA reprezante w nan tribinal imigrasyon, pwosedi depòtasyon, odyans kosyon, oswa nenpòt lòt zafè andeyò pòte limite anwo a.",
      "Yon relasyon avoka-kliyan kreye sèlman pou pòte limite ki dekri a. Enfòmasyon ou bay ke Avoka a revize pwoteje pa privilèj avoka-kliyan.",
      "Frè Avoka a pou reprezantasyon limite sa a enkli nan $199 ou peye DetencionDefensa.com epi pa ranbousab yon fwa revizyon an kòmanse.",
      "Ou ka mete fen nan reprezantasyon limite sa a nenpòt lè alekri. Avoka a ka retire l konfòmeman ak Règ Konduit Pwofesyonèl Florida.",
      "Lè w kontinye, ou rekonèt ou li Akò Retansyon Limite sa a epi dakò ak tèm li yo.",
    ],
    scrollHint: "↓ Desann jouk nan fen an pou aktive kazye a",
    accept: "Mwen LI toulède akò yo anwo epi mwen DAKÒ pou yo lye m.",
    cont: "Mwen Dakò — Kòmanse Fòm",
    must: "Ou dwe tcheke kazye a pou kontinye.",
    notScrolled: "Tanpri desann jouk nan fen toulède akò yo anvan w tcheke kazye a.",
  },
} as const;

function AgreementPage() {
  const { lang, session_id } = Route.useSearch();
  const L = lang as Lang;
  const t = T[L];
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const STORAGE_KEY = `dd_agreement_accepted_v1_${L}`;
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [checked, setChecked] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const addonsFn = useServerFn(getSessionAddons);

  // If Stripe returned us with a session_id, persist which add-ons the
  // customer actually paid for. The intake page reads these flags to gate
  // add-on-only sections (e.g. Family Readiness contact).
  useEffect(() => {
    if (typeof window === "undefined" || !session_id) return;
    (async () => {
      try {
        const result = await addonsFn({
          data: { sessionId: session_id, environment: getStripeEnvironment() },
        });
        window.localStorage.setItem(
          "dd_addons_v1",
          JSON.stringify({
            readiness: !!result.readinessPaid,
            petRescue: !!result.petRescuePaid,
          }),
        );
      } catch {
        // non-fatal — intake will fall back to hiding gated sections
      }
    })();
  }, [session_id, addonsFn]);


  // Fallback: if URL has no valid ?lang=, replace with the site-selected lang.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const u = new URLSearchParams(window.location.search).get("lang");
    if (u !== "es" && u !== "en" && u !== "ht") {
      const site = readSiteLang();
      navigate({ to: "/agreement", search: { lang: site }, replace: true });
    }
  }, [navigate]);

  // If user has previously accepted, skip the gate and go straight to /intake.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY) === "1") {
      navigate({ to: "/intake", search: { lang: L } });
    }
  }, [L, navigate, STORAGE_KEY]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
      setScrolledToEnd(true);
    }
  };

  // If the content fits without needing to scroll, unlock immediately.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      if (el.scrollHeight <= el.clientHeight + 8) setScrolledToEnd(true);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const submit = () => {
    if (!scrolledToEnd) { setErr(t.notScrolled); return; }
    if (!checked) { setErr(t.must); return; }
    try { window.localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
    navigate({ to: "/intake", search: { lang: L } });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#f6efe1", fontFamily: "Inter Tight, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 48px" }}>
        <div style={{ background: "#1a2436", borderRadius: 8, padding: 28, borderTop: "4px solid #e8a04a" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 10, fontFamily: "Fraunces, serif" }}>{t.title}</h1>
          <p style={{ fontSize: 14, color: "#cfc8b8", lineHeight: 1.6, marginBottom: 16 }}>{t.sub}</p>

          <div style={{ fontSize: 12, color: "#e8a04a", textAlign: "center", marginBottom: 6 }}>{!scrolledToEnd && t.scrollHint}</div>

          <div
            ref={scrollRef}
            onScroll={onScroll}
            style={{
              background: "#0b1220",
              border: `2px solid ${scrolledToEnd ? "#4ade80" : "#3a4458"}`,
              borderRadius: 4,
              padding: 20,
              height: 380,
              overflowY: "auto",
              marginBottom: 20,
              fontSize: 13.5,
              lineHeight: 1.65,
              color: "#f6efe1",
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: "#e8a04a" }}>{t.tosTitle}</h2>
            {t.tos.map((p, i) => (
              <p key={`tos-${i}`} style={{ marginBottom: 12 }}>{i + 1}. {p}</p>
            ))}
            <hr style={{ border: "none", borderTop: "1px solid #3a4458", margin: "24px 0" }} />
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: "#e8a04a" }}>{t.retainerTitle}</h2>
            {t.retainer.map((p, i) => (
              <p key={`ret-${i}`} style={{ marginBottom: 12 }}>{i + 1}. {p}</p>
            ))}
            <p style={{ marginTop: 16, fontStyle: "italic", color: "#a8a59a", textAlign: "center" }}>— end of agreements —</p>
          </div>

          <label
            style={{
              display: "flex", gap: 10, alignItems: "flex-start", padding: 14,
              background: "#0b1220", border: `1px solid ${err ? "#ff8080" : "#3a4458"}`,
              borderRadius: 4, marginBottom: 14,
              opacity: scrolledToEnd ? 1 : 0.5,
              cursor: scrolledToEnd ? "pointer" : "not-allowed",
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={!scrolledToEnd}
              onChange={(e) => { setChecked(e.target.checked); setErr(null); }}
              style={{ marginTop: 3, width: 18, height: 18 }}
            />
            <span style={{ fontSize: 14, lineHeight: 1.5 }}>{t.accept}</span>
          </label>

          {err && <p style={{ color: "#ff8080", fontSize: 13, marginBottom: 12 }}>{err}</p>}

          <button
            type="button"
            onClick={submit}
            disabled={!scrolledToEnd || !checked}
            style={{
              background: scrolledToEnd && checked ? "#e8a04a" : "#3a4458",
              color: scrolledToEnd && checked ? "#0b1220" : "#888",
              padding: "14px 28px", fontSize: 16, fontWeight: 700, border: "none", borderRadius: 4,
              cursor: scrolledToEnd && checked ? "pointer" : "not-allowed", width: "100%",
            }}
          >
            {t.cont}
          </button>
        </div>
        <Link to="/checkout" search={{ lang: L }} style={{ display: "inline-block", marginTop: 16, color: "#a8a59a", fontSize: 13 }}>← {L === "es" ? "Volver" : L === "ht" ? "Tounen" : "Back"}</Link>
      </div>
    </div>
  );
}
