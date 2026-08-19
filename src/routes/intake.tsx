import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PrivilegeNotice } from "@/components/PrivilegeNotice";
import { useEffect, useState, useMemo, useRef } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { submitDemoIntake } from "@/utils/payments.functions";
import { pairIntakeWithApp } from "@/lib/intake-pair.functions";
import { notifyIntakeWebhook } from "@/lib/intake-webhook.functions";
import { sendIntakeNotifications } from "@/lib/sms-notifications.functions";
import { loadIntakeDraft, saveIntakeDraft, clearIntakeDraft } from "@/lib/intake-drafts.functions";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";


import { BilingualField } from "@/components/intake/BilingualField";
import { AuthSaveBar } from "@/components/intake/AuthSaveBar";
import { readSiteLang } from "@/lib/site-lang";
import { resolveIntakeGate } from "@/lib/intake-gate";


const searchSchema = z.object({
  session_id: z.string().optional(),
  lang: z.enum(["en", "es", "ht"]).catch("es"),
});

export const Route = createFileRoute("/intake")({
  validateSearch: searchSchema,
  component: IntakePage,
  head: () => ({
    meta: [
      { title: "Intake — DetencionDefensa.com" },
      {
        name: "description",
        content:
          "Complete your DetencionDefensa.com intake: emergency contacts, asset designations, and family protection plan.",
      },
      { property: "og:title", content: "Intake — DetencionDefensa.com" },
      {
        property: "og:description",
        content: "Complete your defense plan intake — emergency contacts and asset designations.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://detenciondefensa.com/intake" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://detenciondefensa.com/intake" }],
  }),
});

type Lang = "en" | "es" | "ht";
type FieldDef = {
  key: string;
  label: Record<Lang, string>;
  hint?: Record<Lang, string>;
  type?: "text" | "textarea" | "date" | "checkbox" | "yes_no" | "number" | "email" | "tel";
  disabled?: boolean;
};


const sections: { id: string; title: Record<Lang, string>; intro: Record<Lang, string>; fields: FieldDef[] }[] = [
  {
    id: "petitioner",
    title: { en: "1. About You", es: "1. Sobre el Peticionario", ht: "1. Konsènan Petisyonè a" },
    intro: {
      en: "Form AO 242 — Petition for Writ of Habeas Corpus under 28 U.S.C. § 2241.",
      es: "Formulario AO 242 — Petición de Habeas Corpus bajo 28 U.S.C. § 2241.",
      ht: "Fòm AO 242 — Petisyon pou Habeas Corpus dapre 28 U.S.C. § 2241.",
    },
    fields: [
      { key: "full_name", label: { en: "Name on U.S. Documents / Immigration Forms", es: "Nombre legal completo", ht: "Non legal konplè" } },
      { key: "client_email", type: "email", label: { en: "Your email (app link and case notices)", es: "Su correo electrónico (enlace de la app y avisos del caso)", ht: "Imèl ou (lyen app la ak avi sou dosye a)" } },
      { key: "client_mobile", type: "tel", label: { en: "Your mobile phone (app link by SMS)", es: "Su teléfono celular (enlace de la app por SMS)", ht: "Telefòn mobil ou (lyen app la pa SMS)" } },
      { key: "other_names_used", label: { en: "Other names used", es: "Otros nombres usados", ht: "Lòt non yo te itilize" } },
      { key: "a_number", label: { en: "Alien Registration Number (A#)", es: "Número de Registro de Extranjero (A#)", ht: "Nimewo Anrejistreman Etranje (A#)" } },
      { key: "dob", label: { en: "Date of birth", es: "Fecha de nacimiento", ht: "Dat nesans" }, type: "date" },
      { key: "place_of_birth", label: { en: "Place of birth / country of origin (city, state/province, country)", es: "Lugar de nacimiento / país de origen (ciudad, estado/provincia, país)", ht: "Kote ou te fèt / peyi orijin (vil, eta/pwovens, peyi)" } },
    ],
  },
  {
    id: "detainer",
    title: { en: "2. Immigration Status", es: "2. Detención de ICE", ht: "2. Detainer ICE" },
    intro: {
      en: "Has Immigration issued a Order of Removal",
      es: "Información sobre la retención migratoria.",
      ht: "Enfòmasyon sou kenbe imigrasyon an.",
    },
    fields: [
      { key: "serious_felony", type: "yes_no", label: { en: "Have you ever been convicted of a serious felony anywhere?", es: "¿Alguna vez ha sido condenado por un delito grave en cualquier lugar?", ht: "Èske ou janm te kondane pou yon krim grav nenpòt kote?" } },
      { key: "prior_immigration_proceedings", type: "textarea", label: { en: "Describe prior Immigration Status", es: "Describa procedimientos migratorios anteriores", ht: "Dekri pwosedi imigrasyon anvan" } },
    ],
  },

  {
    id: "grounds",
    title: { en: "3. Why you believe you should not be detained by ICE ", es: "3. Motivos de la Petición", ht: "3. Rezon pou Petisyon an" },
    intro: {
      en: "Check the grounds that apply. We do NOT choose your legal grounds. If you are not sure the Attorney will complete them, Leave them blank.",
      es: "Marque los motivos que apliquen. NOSOTROS NO elegimos sus motivos legales.",
      ht: "Tcheke rezon yo. Nou PA chwazi rezon legal pou ou.",
    },
    fields: [],
  },
  {
    id: "mailto",
    title: {
      en: "5. Emergency Contact",
      es: "5. Contacto de Emergencia",
      ht: "5. Kontak Ijans",
    },
    intro: {
      en: "This person is notified by SMS and email the moment you press NOTIFY FAMILY in the app.",
      es: "Esta persona recibe SMS y correo cuando active AVISAR A FAMILIA en la app.",
      ht: "Moun sa a resevwa SMS ak imèl lè ou peze AVIZE FANMI nan app la.",
    },
    fields: [
      { key: "emergency_contact_name", label: { en: "Emergency contact full name", es: "Nombre completo del contacto de emergencia", ht: "Non konplè kontak ijans" } },
      { key: "emergency_contact_email", label: { en: "Emergency contact email", es: "Correo del contacto de emergencia", ht: "Imèl kontak ijans" } },
      { key: "emergency_contact_phone", label: { en: "Emergency contact phone (for SMS)", es: "Teléfono del contacto de emergencia (para SMS)", ht: "Telefòn kontak ijans (pou SMS)" } },
    ],
  },

  {
    id: "second_emergency",
    title: { en: "6. Second Emergency Contact", es: "6. Segundo Contacto de Emergencia", ht: "6. Dezyèm Kontak Ijans" },
    intro: {
      en: "A backup contact notified by the app if we cannot reach the first emergency contact.",

      es: "Un contacto de respaldo notificado por la app si no podemos contactar al primero.",
      ht: "Yon kontak rezèv app la notifye si nou pa ka jwenn premye kontak la.",
    },
    fields: [
      { key: "emergency_contact_2_name", label: { en: "Full name", es: "Nombre completo", ht: "Non konplè" } },
      { key: "emergency_contact_2_email", label: { en: "Email", es: "Correo electrónico", ht: "Imèl" } },
      { key: "emergency_contact_2_phone", label: { en: "Phone (with WhatsApp if applicable)", es: "Teléfono (WhatsApp)", ht: "Telefòn (WhatsApp)" } },
    ],
  },
  {
    id: "attorney_file",
    title: { en: "7. For Your Attorney", es: "7. Para Su Abogado", ht: "7. Pou Avoka Ou" },
    intro: {
      en: "These answers go only to your attorney to help build the strongest argument. If you do not know or do not remember, leave it blank.",
      es: "Estas respuestas son solo para su abogado, para construir el mejor argumento. Si no sabe o no recuerda, deje en blanco.",
      ht: "Repons sa yo ale sèlman bay avoka ou pou ede l fè pi bon agiman. Si ou pa konnen oswa pa sonje, kite vid.",
    },
    fields: [
      { key: "atty_entry_manner", type: "textarea", label: { en: "How did you come into the U.S.? (airport/port with a visa, crossed the border, by boat, don't remember)", es: "¿Cómo entró a EE.UU.? (aeropuerto/puerto con visa, cruzó la frontera, por barco, no recuerda)", ht: "Kijan ou te antre Etazini? (ayewopò/pò ak yon viza, travèse fwontyè a, pa bato, pa sonje)" } },
      { key: "atty_entry_date", label: { en: "When did you come into the U.S.? (month and year, approximate is fine)", es: "¿Cuándo entró a EE.UU.? (mes y año, aproximado está bien)", ht: "Kilè ou te antre Etazini? (mwa ak ane, apeprè dakò)" } },
      { key: "atty_prior_ice", type: "textarea", label: { en: "Have you ever been paroled, released, or taken in by ICE before this time? (when and what happened)", es: "¿Alguna vez ICE le dio parole, lo liberó o lo detuvo antes? (cuándo y qué pasó)", ht: "Èske ICE te janm bay ou parole, lage ou, oswa kenbe ou anvan? (kilè e sa ki te pase)" } },
      { key: "atty_relief_applied", type: "textarea", label: { en: "Did you ever apply for asylum, TPS, DACA, U-visa, or any other immigration help? (which one, when, status)", es: "¿Solicitó asilo, TPS, DACA, visa U, u otra ayuda migratoria? (cuál, cuándo, estado)", ht: "Èske ou te janm aplike pou azil, TPS, DACA, viza U, oswa lòt èd imigrasyon? (kilès, kilè, estati)" } },
      { key: "atty_two_years_us", type: "textarea", label: { en: "Have you been living in the U.S. for more than 2 years without leaving?", es: "¿Ha vivido en EE.UU. más de 2 años sin salir?", ht: "Èske ou ap viv Ozetazini plis pase 2 ane san ou pa soti?" } },
      
      { key: "atty_us_family", type: "textarea", label: { en: "Do you have a spouse, child, or parent who is a U.S. citizen or legal resident? (who and their status)", es: "¿Tiene esposo/a, hijo/a o padre/madre que sea ciudadano o residente legal de EE.UU.? (quién y su estatus)", ht: "Èske ou gen mari/madanm, pitit, oswa paran ki sitwayen oswa rezidan legal Ameriken? (kilès ak estati yo)" } },
      { key: "atty_address_years", label: { en: "How long have you lived at your current address?", es: "¿Cuánto tiempo ha vivido en su dirección actual?", ht: "Konbyen tan ou ap viv nan adrès aktyèl ou a?" } },
      { key: "atty_work", type: "textarea", label: { en: "Do you work in the U.S.? (employer name and how long)", es: "¿Trabaja en EE.UU.? (nombre del empleador y cuánto tiempo)", ht: "Èske ou travay Ozetazini? (non anplwayè a ak konbyen tan)" } },
      { key: "atty_property", type: "textarea", label: { en: "Do you own a home, car, or business in the U.S.?", es: "¿Es dueño de una casa, carro o negocio en EE.UU.?", ht: "Èske ou gen yon kay, machin, oswa biznis Ozetazini?" } },
      { key: "atty_serious_crime", type: "textarea", label: { en: "Have you ever been arrested in the USA for a serious crime? (if yes, briefly: what and outcome)", es: "¿Alguna vez lo arrestaron en EE.UU. por un delito grave? (si sí, brevemente: qué y resultado)", ht: "Èske yo te janm arete ou Ozetazini pou yon krim grav? (si wi, an kèk mo: ki sa epi rezilta)" } },
      { key: "atty_medical", type: "textarea", label: { en: "Do you have any serious medical conditions or take prescription medication?", es: "¿Tiene alguna condición médica seria o toma medicamento recetado?", ht: "Èske ou gen pwoblèm medikal grav oswa pran medikaman preskripsyon?" } },
      { key: "atty_fear_return", type: "textarea", label: { en: "Are you afraid to return to your home country? Why? (gangs, government, family, religion, politics, persecution)", es: "¿Tiene miedo de regresar a su país? ¿Por qué? (pandillas, gobierno, familia, religión, política, persecución)", ht: "Èske ou pè retounen nan peyi ou? Poukisa? (gang, gouvènman, fanmi, relijyon, politik, pèsekisyon)" } },
      { key: "atty_dependents", type: "textarea", label: { en: "Does anyone depend on you for money or care? (who)", es: "¿Alguien depende de usted para dinero o cuidado? (quién)", ht: "Èske gen moun ki depann sou ou pou lajan oswa swen? (kilès)" } },
      { key: "atty_missed_court", type: "textarea", label: { en: "Have you ever missed an immigration court date or forgotten to send a change of address to immigration?", es: "¿Alguna vez faltó a una cita en la corte de inmigración o se olvidó de enviar cambio de dirección a inmigración?", ht: "Èske ou te janm manke yon dat tribinal imigrasyon oswa bliye voye yon chanjman adrès bay imigrasyon?" } },
    ],
  },
];


const UI = {
  en: {
    title: "Intake — DetencionDefensa.com",
    sub: "Answer every question you can. If you do not know an answer, leave it blank — the attorney will fill it in.",
    upl: "The information below is translated and typed onto the Pro Se Federal Habeas Corpus Form AO 242. Sorrentino Law Firm PLLC reviews every document; the petitioner signs and files.",
    submit: "Submit answers",
    submitting: "Submitting…",
    done: "Check your email. We just sent you a link to download the emergency app. When you receive it, follow the instructions after you enter in the activation code above. We have transferred the draft documents to your phone and scrubbed our servers of your information for your safety.",
    spamTitle: "IMPORTANT — don't let our emails go to spam",
    spamBody: "If you don't see our email, check your spam/junk folder. To make sure future emergency emails reach you, tap the button below to send us a quick test email. This trains your phone to trust intake@gohomesooner.com so our alerts always arrive.",
    spamBtn: "Send test email now",
    spamSubject: "Test — please whitelist this address",
    spamMailBody: "Hi, I am sending this so my phone recognizes your address and does not send your emails to spam. No reply needed.",
    notpaid: "We could not verify your payment. Please return to checkout.",
    backToSite: "Return to home",
    verifying: "Verifying payment…",
  },
  es: {
    title: "Intake — DetencionDefensa.com",
    sub: "Responda cada pregunta que pueda. Si no sabe una respuesta, déjela en blanco — el abogado la completará.",
    upl: "La información a continuación se traduce y se mecanografía en el Formulario Federal Pro Se de Habeas Corpus AO 242. Sorrentino Law Firm PLLC revisa cada documento; el peticionario firma y presenta.",
    submit: "Enviar respuestas",
    submitting: "Enviando…",
    done: "Revise su correo electrónico. Acabamos de enviarle un enlace para descargar la app de emergencia. Cuando lo reciba, siga las instrucciones después de ingresar el código de activación de arriba. Hemos transferido los documentos borrador a su teléfono y borrado su información de nuestros servidores para su seguridad.",
    spamTitle: "IMPORTANTE — no deje que nuestros correos vayan a spam",
    spamBody: "Si no ve nuestro correo, revise la carpeta de spam/correo no deseado. Para asegurarse de recibir nuestros correos de emergencia, toque el botón abajo para enviarnos un correo de prueba. Esto le enseña a su teléfono a confiar en intake@gohomesooner.com.",
    spamBtn: "Enviar correo de prueba ahora",
    spamSubject: "Prueba — por favor agregue esta dirección a contactos",
    spamMailBody: "Hola, envío este correo para que mi teléfono reconozca su dirección y no envíe sus correos a spam. No es necesario responder.",
    notpaid: "No pudimos verificar su pago. Vuelva al pago.",
    backToSite: "Volver al inicio",
    verifying: "Verificando pago…",
  },
  ht: {
    title: "Intake — DetencionDefensa.com",
    sub: "Reponn chak kesyon ou kapab. Si ou pa konnen yon repons, kite l vid — avoka a ap ranpli l.",
    upl: "Enfòmasyon anba a tradui epi ekri sou Fòm Federal Pro Se Habeas Corpus AO 242. Sorrentino Law Firm PLLC revize chak dokiman; petisyonè a siyen epi depoze.",
    submit: "Voye repons",
    submitting: "K ap voye…",
    done: "Tcheke imèl ou. Nou fenk voye yon lyen pou telechaje app ijans la. Lè ou resevwa l, swiv enstriksyon yo apre ou antre kòd aktivasyon anwo a. Nou transfere dokiman bouyon yo nan telefòn ou e efase enfòmasyon ou yo nan sèvè nou pou sekirite w.",
    spamTitle: "ENPÒTAN — pa kite imèl nou yo ale nan spam",
    spamBody: "Si ou pa wè imèl nou an, tcheke katab spam/junk lan. Pou asire imèl ijans rive jwenn ou, peze bouton anba a pou voye yon imèl tès ba nou. Sa montre telefòn ou pou l fè konfyans intake@gohomesooner.com.",
    spamBtn: "Voye imèl tès la kounye a",
    spamSubject: "Tès — tanpri ajoute adrès sa a",
    spamMailBody: "Bonjou, m ap voye sa pou telefòn mwen rekonèt adrès ou epi pa voye imèl ou yo nan spam. Pa bezwen reponn.",
    notpaid: "Nou pa kapab verifye peman ou.",
    backToSite: "Tounen lakay",
    verifying: "K ap verifye peman…",
  },
} as const;

function IntakePage() {
  const { session_id, lang } = Route.useSearch();
  const navigate = useNavigate();
  const [resolvedLang, setResolvedLang] = useState<Lang | null>(null);

  // Jump to the top as soon as the route mounts, so arriving from a CTA
  // half-way down the home page never leaves the user staring at the footer.
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rawLang = new URLSearchParams(window.location.search).get("lang");
    const decision = resolveIntakeGate({
      rawLang,
      siteLang: readSiteLang(),
      isAccepted: (l) =>
        window.localStorage.getItem(`dd_agreement_accepted_v1_${l}`) === "1",
    });

    if (decision.kind === "rewrite") {
      navigate({ to: "/intake", search: { lang: decision.lang }, replace: true });
      return;
    }
    if (decision.kind === "agreement") {
      navigate({ to: "/agreement", search: { lang: decision.lang }, replace: true });
      return;
    }
    setResolvedLang(decision.lang);
  }, [lang, navigate]);

  // The gate renders nothing on the first pass, so the browser keeps the
  // scroll offset from the page the user came from and the intake appears
  // to open half-way down. Force the top once the form is ready.
  useEffect(() => {
    if (!resolvedLang || typeof window === "undefined") return;
    window.scrollTo(0, 0);
  }, [resolvedLang]);

  if (!resolvedLang) return null;
  return <IntakeInner sessionId={session_id} L={resolvedLang} ui={UI[resolvedLang]} />;
}



function IntakeInner({ sessionId: _session_id, L, ui }: { sessionId: string | undefined; L: Lang; ui: typeof UI[Lang] }) {

  const submitFn = useServerFn(submitDemoIntake);
  const pairFn = useServerFn(pairIntakeWithApp);
  const webhookFn = useServerFn(notifyIntakeWebhook);
  const smsNotifyFn = useServerFn(sendIntakeNotifications);
  const loadDraftFn = useServerFn(loadIntakeDraft);
  const saveDraftFn = useServerFn(saveIntakeDraft);
  const clearDraftFn = useServerFn(clearIntakeDraft);

  const [status, setStatus] = useState<"ready" | "submitting" | "done" | "error">("ready");
  const [errMsg, setErrMsg] = useState("");
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({ addon_asset_protection: true });
  const [englishAnswers, setEnglishAnswers] = useState<Record<string, string>>({});
  const [approvals, setApprovals] = useState<Record<string, boolean>>({});
  const [smsConsent, setSmsConsent] = useState(false);
  const [readinessPaid, setReadinessPaid] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const skipNextSaveRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("dd_addons_v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as { readiness?: boolean };
      setReadinessPaid(!!parsed.readiness);
    } catch {
      /* ignore */
    }
  }, []);

  // Track auth state
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_ev, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load draft when user signs in
  useEffect(() => {
    if (!user) {
      setDraftLoaded(false);
      return;
    }
    let cancelled = false;
    loadDraftFn()
      .then((draft) => {
        if (cancelled || !draft) {
          setDraftLoaded(true);
          return;
        }
        skipNextSaveRef.current = true;
        setAnswers(draft.answers);
        setEnglishAnswers(draft.englishAnswers);
        setApprovals(draft.approvals);
        setDraftLoaded(true);
      })
      .catch((e) => {
        console.error("Load draft failed:", e);
        setDraftLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user, loadDraftFn]);

  // Autosave on changes (debounced) when signed in
  useEffect(() => {
    if (!user || !draftLoaded) return;
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      saveDraftFn({
        data: {
          answers: answers as Record<string, string | boolean | number | null>,
          englishAnswers,
          approvals,
          language: L,
          sessionId: _session_id ?? null,
        },
      }).catch((e) => console.error("Save draft failed:", e));
    }, 1200);
    return () => clearTimeout(timer);
  }, [answers, englishAnswers, approvals, user, draftLoaded, L, _session_id, saveDraftFn]);


  const isBilingual = L !== "en";


  const requiredApprovals = useMemo(() => {
    const keys: string[] = [];
    for (const s of sections) for (const f of s.fields) {
      if (f.disabled) continue;
      if (f.type === "checkbox" || f.type === "number" || f.type === "date") continue;
      const v = (answers[f.key] as string) || "";
      if (v.trim()) keys.push(f.key);
    }
    return keys;
  }, [answers]);
  const allApproved = !isBilingual || requiredApprovals.every((k) => approvals[k]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allApproved) {
      setErrMsg(L === "es" ? "Apruebe todas las traducciones al inglés antes de enviar." : L === "ht" ? "Apwouve tout tradiksyon Angle yo anvan w voye." : "Approve all English translations before submitting.");
      setStatus("error");
      return;
    }
    if (!smsConsent) {
      setErrMsg(L === "es" ? "Marque la casilla de consentimiento de SMS para continuar." : L === "ht" ? "Tcheke kazye konsantman SMS la pou kontinye." : "Please check the SMS consent box to continue.");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    try {
      // Merge: English-approved values overwrite native values for PDF filling;
      // preserve the native originals under "<key>__native" for record copies.
      const merged: Record<string, string | boolean> = {
        ...answers,
        sms_consent: true,
        sms_consent_text:
          "I agree to receive SMS messages from DetencionDefensa.com, Inc. at the phone number provided, including an activation code and emergency-case notifications. Message and data rates may apply. Message frequency varies. Reply STOP to unsubscribe, HELP for help.",
        sms_consent_at: new Date().toISOString(),
      };
      if (isBilingual) {
        for (const [k, v] of Object.entries(answers)) {
          if (typeof v === "string" && englishAnswers[k]) {
            merged[`${k}__native`] = v;
            merged[k] = englishAnswers[k];
          }
        }
      }
      // Persist and provision locally first. This guarantees the paying client
      // appears on both boards and gives every downstream system the same code.
      const hasPairableData =
        !!(merged.full_name || merged.a_number || merged.dob);
      const intakeSessionId = `lovable_session_${crypto.randomUUID()}`;
      const submission = await submitFn({
        data: {
          answers: merged,
          language: L,
          intakeSessionId,
        },
      });
      const [pairResult, webhookResult] = await Promise.all([
        hasPairableData
          ? pairFn({ data: { answers: merged, intakeSessionId } }).catch((err) => {
              console.error("Pairing failed:", err);
              return null;
            })
          : Promise.resolve(null),
        hasPairableData
          ? webhookFn({
              data: { answers: merged, intakeSessionId, language: L },
            }).catch((err) => {
              console.error("Intake webhook failed:", err);
              return null;
            })
          : Promise.resolve(null),
      ]);
      const canonicalCode = submission.activationCode ?? webhookResult?.inviteCode ?? pairResult?.code ?? null;
      if (pairResult?.code) setPairCode(pairResult.code);
      if (canonicalCode) setInviteCode(canonicalCode);
      // Fire-and-forget SMS notifications (client confirmation + staff alert).
       const contactPhoneRaw = typeof merged.client_mobile === "string" ? merged.client_mobile : null;
      const contactNameRaw = typeof merged.full_name === "string" ? merged.full_name : null;
      const intakeSessionIdForSms = intakeSessionId;
      smsNotifyFn({
        data: {
          intakeSessionId: intakeSessionIdForSms,
          contactPhone: contactPhoneRaw,
          contactName: contactNameRaw,
          language: L,
          inviteCode: (() => {
             const raw = canonicalCode;
            return raw ? `${raw}-${L.toUpperCase()}` : null;
          })(),
        },
      }).catch((err) => console.error("SMS notify failed:", err));
      // Clear the saved draft — this intake is complete.
      if (user) {
        clearDraftFn().catch((e) => console.error("Clear draft failed:", e));
      }
      setStatus("done");
    } catch (err) {
      setErrMsg((err as Error).message);
      setStatus("error");
    }
  };

  const wrap: React.CSSProperties = { minHeight: "100vh", background: "#0b1220", color: "#f6efe1", fontFamily: "Inter Tight, system-ui, sans-serif" };
  const container: React.CSSProperties = { maxWidth: isBilingual ? 1100 : 760, margin: "0 auto", padding: "32px 24px 96px" };

  if (status === "done") {
    const rawCode = inviteCode || pairCode || "PENDING";
    // Language-tagged activation code: phone app reads the suffix to open in
    // the client's language automatically.
    const code = rawCode === "PENDING" ? rawCode : `${rawCode}-${L.toUpperCase()}`;
    const T = {
      en: {
        heading: "Your app is ready to download",
        codeLabel: "Your activation code",
        iphone: "Download — iPhone",
        android: "Download — Android",
        soon: "Coming Soon",
        compatTitle: "Phone compatibility",
        compat: [
          "iPhone 16 Pro Max",
          "iPhone 15",
          "Samsung Galaxy S25",
          "Google Pixel 9",
          "Other Android",
        ],
        stepsTitle: "Next steps",
        steps: [
          "Download the app",
          "Enter your activation code",
          "Follow the instructions in the app",
        ],
        formsTitle: "Prepared draft forms",
        formsNote: "DRAFT — For Reference Only. The real documents are sent by the attorney.",
        form1: "AO 242 — Application to Register Permanent Residence",
        form2: "AO 240 — No-charge civil proceeding form",
        back: "Return to home",
      },
      es: {
        heading: "Su aplicación está lista para descargar",
        codeLabel: "Su código de activación",
        iphone: "Descargar — iPhone",
        android: "Descargar — Android",
        soon: "Próximamente",
        compatTitle: "Compatibilidad de teléfonos",
        compat: [
          "iPhone 16 Pro Max",
          "iPhone 15",
          "Samsung Galaxy S25",
          "Google Pixel 9",
          "Otro Android",
        ],
        stepsTitle: "Próximos pasos",
        steps: [
          "Descargue la aplicación",
          "Ingrese su código de activación",
          "Siga las instrucciones en la aplicación",
        ],
        formsTitle: "Formularios borrador preparados",
        formsNote: "BORRADOR — Solo para referencia. Los documentos reales los envía el abogado.",
        form1: "AO 242 — Solicitud para Registrar Residencia Permanente",
        form2: "AO 240 — Formulario civil sin cargo",
        back: "Volver al inicio",
      },
      ht: {
        heading: "App ou pare pou telechaje",
        codeLabel: "Kòd aktivasyon ou",
        iphone: "Telechaje — iPhone",
        android: "Telechaje — Android",
        soon: "Byento",
        compatTitle: "Konpatibilite telefòn",
        compat: [
          "iPhone 16 Pro Max",
          "iPhone 15",
          "Samsung Galaxy S25",
          "Google Pixel 9",
          "Lòt Android",
        ],
        stepsTitle: "Pwochen etap",
        steps: [
          "Telechaje app la",
          "Antre kòd aktivasyon ou",
          "Swiv enstriksyon yo nan app la",
        ],
        formsTitle: "Fòm bouyon prepare",
        formsNote: "BOUYON — Pou referans sèlman. Avoka a voye vrè dokiman yo.",
        form1: "AO 242 — Aplikasyon pou Anrejistre Rezidans Pèmanan",
        form2: "AO 240 — Fòm pwosedi sivil san frè",
        back: "Tounen lakay",
      },
    }[L];

    const downloadBtn: React.CSSProperties = {
      flex: "1 1 220px",
      padding: "18px 22px",
      borderRadius: 10,
      textAlign: "center",
      fontSize: 17,
      fontWeight: 800,
      cursor: "pointer",
      border: 0,
      display: "block",
    };

    return (
      <div style={wrap}><div style={container}>
        <h1 style={{ fontSize: 32, fontWeight: 700, fontFamily: "Fraunces, serif", margin: "0 0 24px", color: "#fff5d6" }}>
          {T.heading}
        </h1>

        {/* Activation code */}
        <div style={{ background: "#1a2436", border: "2px solid #2d6a4f", padding: 28, borderRadius: 12, textAlign: "center", marginBottom: 24 }}>
          <p style={{ margin: "0 0 10px", fontSize: 12, letterSpacing: 2, fontWeight: 700, color: "#7fd9a8" }}>
            {T.codeLabel.toUpperCase()}
          </p>
          <p style={{ margin: 0, fontSize: 48, fontWeight: 900, letterSpacing: 10, color: "#fff5d6", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
            {code}
          </p>
        </div>

        {/* Download buttons */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 8 }}>
          <div style={{ flex: "1 1 220px" }}>
            <a href={`/download?p=ios&code=${encodeURIComponent(code)}`} style={{ ...downloadBtn, background: "#000", color: "#fff", textDecoration: "none" }}>
              {T.iphone}
            </a>
          </div>
          <div style={{ flex: "1 1 220px" }}>
            <a href={`/download?p=android&code=${encodeURIComponent(code)}`} style={{ ...downloadBtn, background: "#1b8a3a", color: "#fff", textDecoration: "none" }}>
              {T.android}
            </a>
          </div>
        </div>

        {/* Compatibility */}
        <div style={{ background: "#1a2436", border: "1px solid #2d3548", padding: 20, borderRadius: 10, marginTop: 24 }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "#fff5d6" }}>{T.compatTitle}</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {T.compat.map((m) => (
              <li key={m} style={{ display: "flex", alignItems: "center", padding: "6px 0", color: "#e6e1d2", fontSize: 15 }}>
                <span style={{ color: "#7fd9a8", fontWeight: 900, marginRight: 10, fontSize: 18 }}>✓</span>
                {m}
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div style={{ background: "#1a2436", border: "1px solid #2d3548", padding: 20, borderRadius: 10, marginTop: 16 }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: "#fff5d6" }}>{T.stepsTitle}</h2>
          <ol style={{ paddingLeft: 22, margin: 0, color: "#e6e1d2", fontSize: 15, lineHeight: 1.7 }}>
            {T.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>

        {/* Draft forms */}
        <div style={{ marginTop: 24 }}>
          <h2 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: "#fff5d6" }}>{T.formsTitle}</h2>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "#a8a59a" }}>{T.formsNote}</p>
          {[T.form1, T.form2].map((title) => (
            <div key={title} style={{ background: "#1a2436", border: "1px dashed #8a8675", padding: 16, borderRadius: 8, marginBottom: 10 }}>
              <div style={{ display: "inline-block", background: "#3a2a00", color: "#e8a04a", padding: "2px 8px", borderRadius: 3, fontSize: 10, fontWeight: 800, letterSpacing: 1.5, marginBottom: 8 }}>
                DRAFT
              </div>
              <p style={{ margin: 0, fontSize: 15, color: "#fff5d6", fontWeight: 600 }}>{title}</p>
            </div>
          ))}
        </div>

        <Link to="/" search={{ lang: L } as never} style={{ display: "inline-block", marginTop: 28, color: "#e8a04a" }}>
          ← {T.back}
        </Link>
      </div></div>
    );
  }


  return (
    <div style={wrap}>
      <div style={container}>
        <LangSwitcher current={L} />
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, fontFamily: "Fraunces, serif" }}>{ui.title}</h1>
        <p style={{ color: "#a8a59a", marginBottom: 16 }}>{ui.sub}</p>
        <div style={{ background: "#3a2a00", border: "1px solid #e8a04a", padding: 14, borderRadius: 4, marginBottom: 16, fontSize: 14, lineHeight: 1.5, color: "#fff5d6" }}>
          <strong>⚠ {ui.upl}</strong>
        </div>
        <PrivilegeNotice lang={L as "en" | "es" | "ht"} />
        <AuthSaveBar lang={L} user={user} onAuthChange={setUser} />
        <form onSubmit={handleSubmit}>
          {sections.map((s) => {
            return (

            <section key={s.id} style={{ marginBottom: 32, background: "#1a2436", padding: 24, borderRadius: 6 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{s.title[L]}</h2>
              <p style={{ fontSize: 13, color: "#a8a59a", marginBottom: 20, fontStyle: "italic" }}>{s.intro[L]}</p>
              {s.id === "grounds" && (
                <>
                  <GroundsChecklist lang={L} answers={answers} setAnswers={setAnswers} />
                  <ReliefChecklist lang={L} answers={answers} setAnswers={setAnswers} />
                </>
              )}
              {s.fields.map((f) => {
                const isTextish = !f.type || f.type === "text" || f.type === "textarea";
                if (isTextish && !f.disabled) {
                  return (
                    <BilingualField
                      key={f.key}
                      fieldKey={f.key}
                      label={f.label[L]}
                      hint={f.hint?.[L]}
                      type={f.type === "textarea" ? "textarea" : "text"}
                      lang={L}
                      nativeValue={(answers[f.key] as string) || ""}
                      englishValue={englishAnswers[f.key] || ""}
                      approved={!!approvals[f.key]}
                      onChange={({ native, english, approved }) => {
                        setAnswers((a) => ({ ...a, [f.key]: native }));
                        setEnglishAnswers((a) => ({ ...a, [f.key]: english }));
                        setApprovals((a) => ({ ...a, [f.key]: approved }));
                      }}
                    />
                  );
                }
                return (
                  <div key={f.key} style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{f.label[L]}</label>
                    {f.hint && <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{f.hint[L]}</div>}
                    {f.type === "textarea" ? (
                      <textarea value={(answers[f.key] as string) || ""} onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))} rows={3} disabled={f.disabled} style={{ ...inputStyle, ...(f.disabled ? disabledStyle : null) }} />
                    ) : f.type === "yes_no" ? (
                      <>
                        <div style={{ display: "flex", gap: 18, marginTop: 6 }}>
                          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, cursor: f.disabled ? "default" : "pointer" }}>
                            <input type="radio" name={f.key} value="yes" checked={answers[f.key] === "yes"} onChange={(e) => { if (e.target.checked) setAnswers((a) => ({ ...a, [f.key]: "yes" })); }} disabled={f.disabled} style={{ accentColor: "#e8a04a" }} />
                            {L === "es" ? "Sí" : L === "ht" ? "Wi" : "Yes"}
                          </label>
                          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, cursor: f.disabled ? "default" : "pointer" }}>
                            <input type="radio" name={f.key} value="no" checked={answers[f.key] === "no"} onChange={(e) => { if (e.target.checked) setAnswers((a) => ({ ...a, [f.key]: "no" })); }} disabled={f.disabled} style={{ accentColor: "#e8a04a" }} />
                            {L === "es" ? "No" : L === "ht" ? "Non" : "No"}
                          </label>
                        </div>
                        {f.key === "serious_felony" && answers[f.key] === "yes" && (
                          <div style={{ marginTop: 10, padding: 12, background: "#3a1f1f", border: "1px solid #ff8080", borderRadius: 4, color: "#ffd6d6", fontSize: 13, lineHeight: 1.5 }}>
                            {L === "es"
                              ? "Advertencia: Las personas condenadas por delitos graves deben considerar contactar a un abogado independiente o contratar a un abogado especializado en defensa de detención compleja. Este paquete no está destinado a personas con condenas por delitos graves."
                              : L === "ht"
                              ? "Avètisman: Moun ki te kondane pou krim grav yo ta dwe konsidere kontakte yon avoka endepandan oswa angaje yon avoka ki espesyalize nan defans detansyon konplèks. Pakè sa a pa fèt pou moun ki gen kondanasyon pou krim grav."
                              : "Warning: Persons convicted of serious felonies should consider contacting independent legal counsel or contracting with an attorney that specializes in complex detention defense. This package is not intended for persons with serious felony convictions."}
                          </div>
                        )}
                      </>
                    ) : f.type === "checkbox" ? (
                      <input type="checkbox" checked={!!answers[f.key]} onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.checked }))} disabled={f.disabled} />
                    ) : (

                      <input type={f.type || "text"} required={f.key === "client_email" || f.key === "client_mobile"} value={(answers[f.key] as string) || ""} onChange={(e) => setAnswers((a) => ({ ...a, [f.key]: e.target.value }))} disabled={f.disabled} style={{ ...inputStyle, ...(f.disabled ? disabledStyle : null) }} />
                    )}
                  </div>
                );
              })}

            </section>
            );
          })}


          {/* Family preparedness forms — sent by separate email, not in the app */}
          <section style={{ marginBottom: 32, background: "#1a2436", padding: 24, borderRadius: 6, borderLeft: "4px solid #e8a04a" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
              {L === "es" ? "Formularios Familiares — Enviados por Correo" : L === "ht" ? "Fòm Fanmi — Voye pa Imèl" : "Family Forms — Sent by Email"}
            </h2>
            <p style={{ fontSize: 13, color: "#a8a59a", marginBottom: 0, lineHeight: 1.6 }}>
              {L === "es"
                ? "Le enviaremos un correo aparte, en su idioma, con un enlace para descargar los formularios en blanco: poder notarial, autorización escolar, autorización de vehículo, acceso bancario y custodia temporal. Debe imprimirlos, firmarlos ante un notario y dejarlos en un sobre sellado con un familiar de confianza, para abrir solo si es detenido. Estos formularios no se guardan en la app."
                : L === "ht"
                ? "N ap voye yon imèl separe, nan lang ou, ak yon lyen pou telechaje fòm vid yo: pouvwa avoka, otorizasyon lekòl, otorizasyon machin, aksè bank, ak gad tanporè. Ou dwe enprime yo, siyen yo devan yon notè, epi kite yo nan yon anvlòp sele ak yon fanmi ou fè konfyans, pou louvri sèlman si yo detni w. Fòm sa yo pa estoke nan app la."
                : "We will send you a separate email, in your language, with a link to download the blank forms: power of attorney, school pickup, vehicle release, bank access, and temporary custody. You print them, sign them in front of a notary, and leave them in a sealed envelope with a family member you trust — to be opened only if you are detained. These forms are not stored in the app."}
            </p>
          </section>




          
          <label style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: 14, marginBottom: 16, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={smsConsent}
              onChange={(e) => setSmsConsent(e.target.checked)}
              style={{ marginTop: 4, width: 18, height: 18, flexShrink: 0 }}
            />
            <span style={{ fontSize: 13, lineHeight: 1.5, color: "#e8eef7" }}>
              {L === "es" ? (
                <>Acepto recibir mensajes SMS de <strong>DetencionDefensa.com, Inc.</strong> al número de teléfono proporcionado, incluyendo un código de activación y notificaciones de emergencia del caso. Pueden aplicar tarifas de mensajes y datos. La frecuencia varía. Responda STOP para cancelar la suscripción, HELP para ayuda. Consulte la <a href="/privacy" target="_blank" style={{ color: "#e8a04a" }}>Política de Privacidad</a> y los <a href="/terms" target="_blank" style={{ color: "#e8a04a" }}>Términos</a>.</>
              ) : L === "ht" ? (
                <>Mwen dakò pou m resevwa mesaj SMS soti nan <strong>DetencionDefensa.com, Inc.</strong> nan nimewo telefòn mwen bay la, ki gen ladann yon kòd aktivasyon ak notifikasyon ka ijans. Tarif mesaj ak done ka aplike. Frekans mesaj la varye. Reponn STOP pou w dezabòne, HELP pou èd. Gade <a href="/privacy" target="_blank" style={{ color: "#e8a04a" }}>Règleman Konfidansyalite</a> ak <a href="/terms" target="_blank" style={{ color: "#e8a04a" }}>Kondisyon yo</a>.</>
              ) : (
                <>I agree to receive SMS messages from <strong>DetencionDefensa.com, Inc.</strong> at the phone number provided, including an activation code and emergency-case notifications. Message and data rates may apply. Message frequency varies. Reply STOP to unsubscribe, HELP for help. See our <a href="/privacy" target="_blank" style={{ color: "#e8a04a" }}>Privacy Policy</a> and <a href="/terms" target="_blank" style={{ color: "#e8a04a" }}>Terms</a>.</>
              )}
            </span>
          </label>

          <button type="submit" disabled={status === "submitting" || !smsConsent} style={{ background: smsConsent ? "#e8a04a" : "#6b6b6b", color: "#0b1220", padding: "16px 32px", fontSize: 16, fontWeight: 700, border: "none", borderRadius: 4, cursor: smsConsent ? "pointer" : "not-allowed", width: "100%" }}>
            {status === "submitting" ? ui.submitting : ui.submit}
          </button>
          {errMsg && status === "error" && <p style={{ color: "#ff8080", marginTop: 12 }}>{errMsg}</p>}
        </form>
      </div>
    </div>
  );
}

function LangSwitcher({ current }: { current: Lang }) {
  const labels: Record<Lang, string> = { es: "Español", en: "English", ht: "Kreyòl" };
  const langs: Lang[] = ["es", "en", "ht"];
  const btn = (active: boolean): React.CSSProperties => ({
    padding: "6px 12px",
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 4,
    border: "1px solid #3a4458",
    background: active ? "#e8a04a" : "transparent",
    color: active ? "#0b1220" : "#f6efe1",
    cursor: "pointer",
    textDecoration: "none",
  });
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16, justifyContent: "flex-end" }}>
      {langs.map((l) => (
        <Link key={l} to="/intake" search={{ lang: l }} style={btn(l === current)}>
          {l.toUpperCase()} · {labels[l]}
        </Link>
      ))}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 15,
  border: "1px solid #3a4458",
  borderRadius: 3,
  background: "#0b1220",
  color: "#f6efe1",
  fontFamily: "inherit",
};
const disabledStyle: React.CSSProperties = { background: "#222", color: "#666", cursor: "not-allowed" };

const GROUNDS_OPTIONS: { id: string; label: Record<Lang, string> }[] = [
  { id: "not_convicted", label: { en: "I am not convicted of a serious crime making me deportable.", es: "No he sido condenado de un delito grave que me haga deportable.", ht: "Mwen pa kondane pou yon krim grav ki ta fè m depòtab." } },
  { id: "parole_no_hearing", label: { en: "I was released on Parole and have not had a hearing to determine if detainable.", es: "Fui liberado bajo libertad condicional y no he tenido audiencia.", ht: "Yo te lage m sou Parole epi mwen poko gen yon odyans." } },
  { id: "not_danger", label: { en: "I am not a danger to the community.", es: "No soy un peligro para la comunidad.", ht: "Mwen pa yon danje pou kominote a." } },
  { id: "not_flight_risk", label: { en: "I am not a flight risk.", es: "No soy un riesgo de fuga.", ht: "Mwen pa yon risk pou kouri ale." } },
  { id: "due_process", label: { en: "My detention violates my due process rights.", es: "Mi detención viola mis derechos al debido proceso.", ht: "Detansyon mwen vyole dwa pwosedi legal mwen yo." } },
  { id: "country_not_accepting", label: { en: "I am not deportable to my country — they are not accepting deportees.", es: "No soy deportable a mi país.", ht: "Mwen pa kapab depòte nan peyi mwen." } },
  { id: "not_mandatory", label: { en: "I am not legally subject to mandatory detention.", es: "No estoy sujeto a detención obligatoria.", ht: "Mwen pa sijè a detansyon obligatwa." } },
];

function GroundsChecklist({ lang, answers, setAnswers }: { lang: Lang; answers: Record<string, string | boolean>; setAnswers: React.Dispatch<React.SetStateAction<Record<string, string | boolean>>> }) {
  const otherChecked = !!answers["ground_other_checked"];
  const otherText = (answers["ground_other_text"] as string) || "";

  const recompute = (next: Record<string, string | boolean>) => {
    const selected = GROUNDS_OPTIONS.filter((o) => next[`ground_${o.id}`]);
    const groundOne = selected.map((o) => o.label.en).join(" ");
    const groundTwo = next["ground_other_checked"] && next["ground_other_text"] ? `Other: ${next["ground_other_text"] as string}` : "";
    return { ...next, ground_one: groundOne, ground_two: groundTwo };
  };
  const toggle = (key: string, val: boolean) => setAnswers((a) => recompute({ ...a, [key]: val }));

  return (
    <div style={{ marginBottom: 16 }}>
      {GROUNDS_OPTIONS.map((o) => (
        <label key={o.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8, fontSize: 14, lineHeight: 1.5, cursor: "pointer" }}>
          <input type="checkbox" checked={!!answers[`ground_${o.id}`]} onChange={(e) => toggle(`ground_${o.id}`, e.target.checked)} style={{ marginTop: 3 }} />
          <span>{o.label[lang]}</span>
        </label>
      ))}
      <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8, fontSize: 14, cursor: "pointer" }}>
        <input type="checkbox" checked={otherChecked} onChange={(e) => toggle("ground_other_checked", e.target.checked)} style={{ marginTop: 3 }} />
        <span>{lang === "es" ? "Otro" : lang === "ht" ? "Lòt" : "Other"}</span>
      </label>
      {otherChecked && (
        <textarea value={otherText} onChange={(e) => setAnswers((a) => recompute({ ...a, ground_other_text: e.target.value }))} rows={2} style={{ ...inputStyle, marginBottom: 16 }} />
      )}
    </div>
  );
}

const RELIEF_OPTIONS: { id: string; label: Record<Lang, string> }[] = [
  { id: "release", label: { en: "Immediate release from custody.", es: "Liberación inmediata.", ht: "Lage imedyatman." } },
  { id: "bond_hearing", label: { en: "A bond hearing before an immigration judge.", es: "Audiencia de fianza.", ht: "Odyans kosyon." } },
  { id: "release_on_recognizance", label: { en: "Release on own recognizance or supervised release.", es: "Liberación bajo palabra.", ht: "Lage sou pwòp pawòl." } },
  { id: "declare_unlawful", label: { en: "That I not be transferred until the Court decides my Habeas Corpus.", es: "Declaración de que mi detención es ilegal.", ht: "Deklarasyon ke detansyon mwen ilegal." } },
  { id: "any_other_relief", label: { en: "Assignment of Appointed Attorney to handle this mater.", es: "Cualquier otra reparación.", ht: "Nenpòt lòt sekou." } },
];

function ReliefChecklist({ lang, answers, setAnswers }: { lang: Lang; answers: Record<string, string | boolean>; setAnswers: React.Dispatch<React.SetStateAction<Record<string, string | boolean>>> }) {
  const recompute = (next: Record<string, string | boolean>) => {
    const selected = RELIEF_OPTIONS.filter((o) => next[`relief_${o.id}`]);
    return { ...next, relief_requested: selected.map((o) => o.label.en).join(" ") };
  };
  const toggle = (key: string, val: boolean) => setAnswers((a) => recompute({ ...a, [key]: val }));
  const heading = lang === "es" ? "¿Qué reparación pide?" : lang === "ht" ? "Ki sekou w ap mande?" : "What relief are you asking for?";

  return (
    <div style={{ marginTop: 24, marginBottom: 8 }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{heading}</div>
      {RELIEF_OPTIONS.map((o) => (
        <label key={o.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8, fontSize: 14, lineHeight: 1.5, cursor: "pointer" }}>
          <input type="checkbox" checked={!!answers[`relief_${o.id}`]} onChange={(e) => toggle(`relief_${o.id}`, e.target.checked)} style={{ marginTop: 3 }} />
          <span>{o.label[lang]}</span>
        </label>
      ))}
    </div>
  );
}

