import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useCallback, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { usePlaidLink } from "react-plaid-link";
import {
  assessQualification,
  attachQualifyIdentity,
  finalizeQualifySubmission,
} from "@/lib/qualify.functions";
import {
  createIdentityVerification,
  getIdentityVerification,
  createQualifyUploadUrl,
  saveQualifyDocumentPath,
  type QualifyDocKind,
} from "@/lib/qualify-identity.functions";
import { createPlaidLinkToken, exchangePlaidPublicToken } from "@/lib/plaid.functions";
import { supabase } from "@/integrations/supabase/client";
import { useLang, type Lang } from "@/context/LanguageContext";


export const Route = createFileRoute("/qualify")({
  head: () => ({
    meta: [
      { title: "See if you qualify — DetencionDefensa.com" },
      {
        name: "description",
        content:
          "Check if you qualify for our no-cost or low-cost pre-detention defense program. A quick income and household questionnaire.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QualifyPage,
});

type Step = 1 | 2 | 3 | 4;

const emptyIntake = {
  firstName: "",
  state: "",
  householdSize: 1,
  dependentsCount: 0,
  childrenAges: "",
  usCitizenChildren: false,
  primaryEarner: false,
  yearsInUsSelf: 0,
  yearsInUsChildren: 0,
  yearsWorking: 0,
  jobType: "",
  payFrequency: "monthly" as "daily" | "weekly" | "biweekly" | "monthly",
  payAmountUsd: 0,
  rent: 0,
  food: 0,
  medicine: 0,
  daycare: 0,
  schoolSupplies: 0,
  transportation: 0,
  restaurants: 0,
  childrenEntertainment: 0,
  otherExpenses: 0,
};

const COPY = {
  en: {
    errFirstName: "Please enter your first name.",
    errState: "Please enter your state.",
    errAssess: "Could not process your answers. Please try again.",
    errFullNameVerif: "Please enter your full legal name before starting ID verification.",
    errStartVerif: "Could not start ID verification.",
    errUpload: "Upload failed. Please try again.",
    errFullName: "Please enter your full legal name.",
    errNotVerified: "Please complete the ID + selfie verification on your phone before continuing.",
    errSupportLetter: "Please upload your church / community support letter.",
    errIncomeDoc: "Please upload one income document (pay stub, tax return, or benefits letter).",
    errSaveInfo: "Could not save your info.",
    errPlaidStart: "Failed to start bank verification.",
    errPlaidSave: "Bank verification failed to save.",
    errAttestation: "Please type your full name and check the attestation box.",
    errFinalize: "Failed to finalize.",
    declinedTitle: "You don't qualify for reduced-cost pricing — but you still need protection.",
    declinedBody: "Based on your answers, your household income is above the threshold for our no-cost or reduced-cost program.",
    emergencyAppTitle: "$10/month Emergency App",
    emergencyAppBody1: "Think of it like car insurance or medical insurance — you need",
    emergencyAppBody2: "ICE / Amiga insurance",
    emergencyAppBody3: ". If you or a family member is detained, the app activates a pre-built emergency defense packet that gets you out of detention",
    emergencyAppBody4: "much",
    emergencyAppBody5: "faster.",
    liDocs: "Pre-signed emergency legal documents ready to file",
    liFamily: "Family + attorney notified the moment SOS is triggered",
    liBond: "Bond package prepared in advance",
    liBilingual: "Bilingual case tracking for your family",
    subscribeBtn: "{t.subscribeBtn}",
    recheck: "{t.recheck}",
    backHome: "{t.backHome}",
    pageTitle: "See if you qualify",
    pageSubtitle: "A quick questionnaire to see if you qualify for our no-cost or low-cost pre-detention defense program. Your information is confidential.",
    step1Heading: "Step 1 · Household & finances",
    step1Sub: "We only need your first name for now. Answer as accurately as you can — this determines whether you qualify for no-cost or low-cost help.",
    sectionAboutYou: "About you",
    fFirstName: "First name",
    fState: "State (US)",
    fYearsUs: "Years you've lived in the U.S.",
    fYearsWorking: "Years you've been working",
    fJobType: "Kind of work (e.g. construction, cleaning)",
    sectionHousehold: "Household",
    fHouseholdSize: "Household size",
    fDependents: "Number of dependents",
    fYearsUsChildren: "Years children have lived in U.S.",
    fChildrenAges: "Ages of children (comma-separated)",
    childrenAgesPlaceholder: "e.g. 3, 7, 12",
    citizenChildren: "I have U.S.-citizen children (or children in the U.S.)",
    primaryEarner: "I am the primary income earner in my household",
    sectionIncome: "Income",
    fPayFrequency: "How often are you paid?",
    payDaily: "Daily",
    payWeekly: "Weekly",
    payBiweekly: "Every 2 weeks",
    payMonthly: "Monthly",
    fPayAmount: "Amount per pay period (USD)",
    sectionExpenses: "Monthly expenses (USD)",
    expensesHint: "Best estimates are fine. Enter 0 if it doesn't apply.",
    expRent: "Rent / mortgage",
    expFood: "Food (groceries)",
    expMedicine: "Medicine",
    expDaycare: "Daycare",
    expSchool: "School supplies",
    expTransportation: "Transportation",
    expRestaurants: "Restaurants",
    expChildrenEntertainment: "Children entertainment",
    expOther: "Other",
    checking: "Checking eligibility…",
    checkQualify: "Check if I qualify →",
    qualifyNoCost: "You qualify for our NO-COST program.",
    qualifyDiscount: "You qualify for a {pct}% discount",
    qualifyDiscountSuffix: "off the standard package.",
    step2Heading: "Step 2 · Identity & documents",
    fFullLegalName: "Full legal name",
    fEmail: "Email (optional)",
    fPhone: "Phone (optional)",
    verifyIdentityTitle: "Verify your identity (phone: license + selfie)",
    verifyIdentityBody: "We use Stripe Identity to scan your driver's license (or passport / consular ID) and match it to a live selfie. This usually takes 2 minutes on your phone. If you're already on your phone, it opens right here.",
    identityVerified: "{t.identityVerified}",
    opening: "Opening…",
    startIdVerif: "Start ID verification →",
    reopenVerif: "Reopen verification link",
    statusLabel: "Status:",
    statusUpdateNote: "This box updates automatically once you finish the flow on your phone.",
    supportLetterTitle: "Church / community support letter",
    supportLetterBody: "A short signed letter from your pastor, community leader, or a nonprofit that knows you. PDF or photo is fine.",
    uploaded: "✓ Uploaded",
    uploading: "Uploading…",
    incomeDocTitle: "Income document",
    incomeDocBodyPrefix: "Upload",
    incomeDocBodyOne: "one",
    incomeDocBodySuffix: "of the following as proof of income.",
    payStub: "Pay stub",
    taxReturn: "Tax return",
    benefitsLetter: "Benefits letter (SNAP / Medicaid / WIC)",
    uploadedKind: "✓ Uploaded ({kind})",
    uploadsPrivacyNote: "All uploads are stored privately. Only you, our qualification team, and your assigned attorney can view them.",
    back: "← Back",
    saving: "Saving…",
    continueArrow: "Continue →",
    step3Heading: "Step 3 · Bank verification",
    step3Body: "We use Plaid to confirm your income securely. We never see or store your bank password. Required to lock in no-cost pricing.",
    bankLinked: "✓ Bank successfully linked.",
    openingPlaid: "Opening Plaid…",
    linkBank: "Link my bank securely",
    skipEligibility: "Skip (may reduce eligibility)",
    step4Heading: "Step 4 · Sworn attestation",
    attestationText: "Under penalty of perjury, I declare that the information I have provided — household size, income, dependents, expenses, and immigration situation — is true and correct to the best of my knowledge. I understand that providing false information to obtain reduced-cost legal services may be a federal offense and will result in immediate cancellation of services without refund.",
    attestationAgree: "I have read and agree to the sworn attestation above.",
    fSignature: "Type your full legal name as your signature",
    submitting: "Submitting…",
    submitContinue: "Submit & continue to checkout",
    preliminaryTier: "Preliminary tier:",
  },
  es: {
    errFirstName: "Por favor ingrese su nombre.",
    errState: "Por favor ingrese su estado.",
    errAssess: "No pudimos procesar sus respuestas. Por favor intente de nuevo.",
    errFullNameVerif: "Por favor ingrese su nombre legal completo antes de iniciar la verificación de identidad.",
    errStartVerif: "No pudimos iniciar la verificación de identidad.",
    errUpload: "La carga falló. Por favor intente de nuevo.",
    errFullName: "Por favor ingrese su nombre legal completo.",
    errNotVerified: "Por favor complete la verificación de identidad + selfie en su teléfono antes de continuar.",
    errSupportLetter: "Por favor suba su carta de apoyo de su iglesia o comunidad.",
    errIncomeDoc: "Por favor suba un documento de ingresos (talón de pago, declaración de impuestos o carta de beneficios).",
    errSaveInfo: "No pudimos guardar su información.",
    errPlaidStart: "No se pudo iniciar la verificación bancaria.",
    errPlaidSave: "La verificación bancaria no se pudo guardar.",
    errAttestation: "Por favor escriba su nombre completo y marque la casilla de declaración.",
    errFinalize: "No se pudo finalizar el proceso.",
    declinedTitle: "No califica para precios de costo reducido — pero aún necesita protección.",
    declinedBody: "Según sus respuestas, el ingreso de su hogar está por encima del límite para nuestro programa sin costo o de costo reducido.",
    emergencyAppTitle: "App de Emergencia — $10/mes",
    emergencyAppBody1: "Piénselo como un seguro de auto o médico — usted necesita",
    emergencyAppBody2: "seguro contra ICE / Amiga",
    emergencyAppBody3: ". Si usted o un familiar es detenido, la app activa un paquete de defensa de emergencia ya preparado que le ayuda a salir de detención",
    emergencyAppBody4: "mucho",
    emergencyAppBody5: "más rápido.",
    liDocs: "Documentos legales de emergencia pre-firmados listos para presentar",
    liFamily: "Familia y abogado notificados en el momento en que se active el SOS",
    liBond: "Paquete de fianza preparado con anticipación",
    liBilingual: "Seguimiento bilingüe del caso para su familia",
    subscribeBtn: "Suscribirse — $10/mes →",
    recheck: "← Revisar mis respuestas de nuevo",
    backHome: "← Volver al inicio",
    pageTitle: "Vea si usted califica",
    pageSubtitle: "Un cuestionario rápido para ver si califica para nuestro programa de defensa pre-detención sin costo o de bajo costo. Su información es confidencial.",
    step1Heading: "Paso 1 · Hogar y finanzas",
    step1Sub: "Por ahora solo necesitamos su nombre. Responda con la mayor precisión posible — esto determina si califica para ayuda sin costo o de bajo costo.",
    sectionAboutYou: "Sobre usted",
    fFirstName: "Nombre",
    fState: "Estado (EE.UU.)",
    fYearsUs: "Años que ha vivido en EE.UU.",
    fYearsWorking: "Años que ha estado trabajando",
    fJobType: "Tipo de trabajo (por ejemplo, construcción, limpieza)",
    sectionHousehold: "Hogar",
    fHouseholdSize: "Tamaño del hogar",
    fDependents: "Número de dependientes",
    fYearsUsChildren: "Años que los niños han vivido en EE.UU.",
    fChildrenAges: "Edades de los niños (separadas por comas)",
    childrenAgesPlaceholder: "ej. 3, 7, 12",
    citizenChildren: "Tengo hijos ciudadanos de EE.UU. (o hijos en EE.UU.)",
    primaryEarner: "Soy el principal proveedor de ingresos en mi hogar",
    sectionIncome: "Ingresos",
    fPayFrequency: "¿Con qué frecuencia le pagan?",
    payDaily: "Diario",
    payWeekly: "Semanal",
    payBiweekly: "Cada 2 semanas",
    payMonthly: "Mensual",
    fPayAmount: "Monto por período de pago (USD)",
    sectionExpenses: "Gastos mensuales (USD)",
    expensesHint: "Estimaciones aproximadas están bien. Ingrese 0 si no aplica.",
    expRent: "Renta / hipoteca",
    expFood: "Comida (mercado)",
    expMedicine: "Medicinas",
    expDaycare: "Guardería",
    expSchool: "Útiles escolares",
    expTransportation: "Transporte",
    expRestaurants: "Restaurantes",
    expChildrenEntertainment: "Entretenimiento para niños",
    expOther: "Otro",
    checking: "Verificando elegibilidad…",
    checkQualify: "Verificar si califico →",
    qualifyNoCost: "Usted califica para nuestro programa SIN COSTO.",
    qualifyDiscount: "Usted califica para un descuento del {pct}%",
    qualifyDiscountSuffix: "sobre el paquete estándar.",
    step2Heading: "Paso 2 · Identidad y documentos",
    fFullLegalName: "Nombre legal completo",
    fEmail: "Correo electrónico (opcional)",
    fPhone: "Teléfono (opcional)",
    verifyIdentityTitle: "Verifique su identidad (teléfono: licencia + selfie)",
    verifyIdentityBody: "Usamos Stripe Identity para escanear su licencia de conducir (o pasaporte / identificación consular) y compararla con una selfie en vivo. Esto usualmente toma 2 minutos en su teléfono. Si ya está en su teléfono, se abre aquí mismo.",
    identityVerified: "✓ Identidad verificada",
    opening: "Abriendo…",
    startIdVerif: "Iniciar verificación de identidad →",
    reopenVerif: "Reabrir enlace de verificación",
    statusLabel: "Estado:",
    statusUpdateNote: "Esta sección se actualiza automáticamente cuando termine el proceso en su teléfono.",
    supportLetterTitle: "Carta de apoyo de iglesia / comunidad",
    supportLetterBody: "Una carta breve firmada por su pastor, líder comunitario o una organización sin fines de lucro que lo conozca. PDF o foto está bien.",
    uploaded: "✓ Subido",
    uploading: "Subiendo…",
    incomeDocTitle: "Documento de ingresos",
    incomeDocBodyPrefix: "Suba",
    incomeDocBodyOne: "uno",
    incomeDocBodySuffix: "de los siguientes como comprobante de ingresos.",
    payStub: "Talón de pago",
    taxReturn: "Declaración de impuestos",
    benefitsLetter: "Carta de beneficios (SNAP / Medicaid / WIC)",
    uploadedKind: "✓ Subido ({kind})",
    uploadsPrivacyNote: "Todos los documentos se almacenan de forma privada. Solo usted, nuestro equipo de calificación y su abogado asignado pueden verlos.",
    back: "← Atrás",
    saving: "Guardando…",
    continueArrow: "Continuar →",
    step3Heading: "Paso 3 · Verificación bancaria",
    step3Body: "Usamos Plaid para confirmar sus ingresos de forma segura. Nunca vemos ni almacenamos su contraseña bancaria. Requerido para asegurar precios sin costo.",
    bankLinked: "✓ Banco vinculado exitosamente.",
    openingPlaid: "Abriendo Plaid…",
    linkBank: "Vincular mi banco de forma segura",
    skipEligibility: "Omitir (puede reducir su elegibilidad)",
    step4Heading: "Paso 4 · Declaración jurada",
    attestationText: "Bajo pena de perjurio, declaro que la información que he proporcionado — tamaño del hogar, ingresos, dependientes, gastos y situación migratoria — es verdadera y correcta a mi mejor entender. Entiendo que proporcionar información falsa para obtener servicios legales de costo reducido puede ser un delito federal y resultará en la cancelación inmediata de los servicios sin reembolso.",
    attestationAgree: "He leído y estoy de acuerdo con la declaración jurada anterior.",
    fSignature: "Escriba su nombre legal completo como firma",
    submitting: "Enviando…",
    submitContinue: "Enviar y continuar al pago",
    preliminaryTier: "Nivel preliminar:",
  },
  ht: {
    errFirstName: "Tanpri antre premye non ou.",
    errState: "Tanpri antre eta ou.",
    errAssess: "Nou pa t kapab trete repons ou yo. Tanpri eseye ankò.",
    errFullNameVerif: "Tanpri antre non legal konplè ou anvan ou kòmanse verifikasyon idantite.",
    errStartVerif: "Nou pa t kapab kòmanse verifikasyon idantite a.",
    errUpload: "Anvwa a echwe. Tanpri eseye ankò.",
    errFullName: "Tanpri antre non legal konplè ou.",
    errNotVerified: "Tanpri konplete verifikasyon ID + selfi sou telefòn ou anvan ou kontinye.",
    errSupportLetter: "Tanpri telechaje lèt sipò legliz / kominote ou.",
    errIncomeDoc: "Tanpri telechaje yon dokiman revni (fich pewòl, deklarasyon taks, oswa lèt benefis).",
    errSaveInfo: "Nou pa t kapab sove enfòmasyon ou yo.",
    errPlaidStart: "Verifikasyon bankè a echwe pou kòmanse.",
    errPlaidSave: "Verifikasyon bankè a pa t kapab sove.",
    errAttestation: "Tanpri ekri non konplè ou epi koche kaz deklarasyon an.",
    errFinalize: "Nou pa t kapab finalize.",
    declinedTitle: "Ou pa kalifye pou pri redwi — men ou toujou bezwen pwoteksyon.",
    declinedBody: "Dapre repons ou yo, revni fwaye ou pi wo pase limit pou pwogram nou an ki gratis oswa ki gen pri redwi.",
    emergencyAppTitle: "App Ijans — $10/mwa",
    emergencyAppBody1: "Panse a li tankou asirans machin oswa asirans medikal — ou bezwen",
    emergencyAppBody2: "asirans ICE / Amiga",
    emergencyAppBody3: ". Si ou menm oswa yon manm fanmi ou detni, app la aktive yon pakè defans ijans ki deja prepare pou ede ou soti nan detansyon",
    emergencyAppBody4: "pi",
    emergencyAppBody5: "vit.",
    liDocs: "Dokiman legal ijans deja siyen, pare pou depoze",
    liFamily: "Fanmi + avoka avize touswit lè SOS deklanche",
    liBond: "Pakè kosyon prepare davans",
    liBilingual: "Swiv ka a an de lang pou fanmi ou",
    subscribeBtn: "Abòne — $10/mwa →",
    recheck: "← Revize repons mwen yo",
    backHome: "← Retounen lakay",
    pageTitle: "Gade si ou kalifye",
    pageSubtitle: "Yon ti kesyonè rapid pou wè si ou kalifye pou pwogram defans pre-detansyon nou an ki gratis oswa ki gen pri ba. Enfòmasyon ou konfidansyèl.",
    step1Heading: "Etap 1 · Fwaye ak finans",
    step1Sub: "Pou kounye a nou sèlman bezwen premye non ou. Reponn kòrèkteman jan ou kapab — sa a detèmine si ou kalifye pou èd gratis oswa pri ba.",
    sectionAboutYou: "Konsènan ou",
    fFirstName: "Premye non",
    fState: "Eta (US)",
    fYearsUs: "Kantite ane ou viv Ozetazini",
    fYearsWorking: "Kantite ane w ap travay",
    fJobType: "Kalite travay (pa egzanp, konstriksyon, netwayaj)",
    sectionHousehold: "Fwaye",
    fHouseholdSize: "Gwosè fwaye a",
    fDependents: "Kantite depandan",
    fYearsUsChildren: "Kantite ane pitit yo viv Ozetazini",
    fChildrenAges: "Laj pitit yo (separe ak vigil)",
    childrenAgesPlaceholder: "pa egzanp 3, 7, 12",
    citizenChildren: "Mwen gen pitit ki sitwayen Ameriken (oswa pitit Ozetazini)",
    primaryEarner: "Se mwen ki prensipal moun k ap fè lajan nan fwaye a",
    sectionIncome: "Revni",
    fPayFrequency: "Kilè yo peye ou?",
    payDaily: "Chak jou",
    payWeekly: "Chak semèn",
    payBiweekly: "Chak 2 semèn",
    payMonthly: "Chak mwa",
    fPayAmount: "Kantite lajan pou chak peryòd peman (USD)",
    sectionExpenses: "Depans chak mwa (USD)",
    expensesHint: "Estimasyon apwoksimatif ok. Mete 0 si sa pa aplike.",
    expRent: "Lwaye / ipotèk",
    expFood: "Manje (makèt)",
    expMedicine: "Medikaman",
    expDaycare: "Gadri",
    expSchool: "Founiti lekòl",
    expTransportation: "Transpò",
    expRestaurants: "Restoran",
    expChildrenEntertainment: "Divètisman pou timoun",
    expOther: "Lòt",
    checking: "N ap verifye eligibilite…",
    checkQualify: "Verifye si mwen kalifye →",
    qualifyNoCost: "Ou kalifye pou pwogram GRATIS nou an.",
    qualifyDiscount: "Ou kalifye pou yon rabè {pct}%",
    qualifyDiscountSuffix: "sou pake estanda a.",
    step2Heading: "Etap 2 · Idantite ak dokiman",
    fFullLegalName: "Non legal konplè",
    fEmail: "Imèl (opsyonèl)",
    fPhone: "Telefòn (opsyonèl)",
    verifyIdentityTitle: "Verifye idantite ou (telefòn: lisans + selfi)",
    verifyIdentityBody: "Nou itilize Stripe Identity pou eskane lisans kondwi ou (oswa paspò / kat idantite konsila) epi konpare li ak yon selfi an dirèk. Sa nòmalman pran 2 minit sou telefòn ou. Si ou deja sou telefòn ou, li louvri dirèkteman la a.",
    identityVerified: "✓ Idantite verifye",
    opening: "L ap ouvri…",
    startIdVerif: "Kòmanse verifikasyon ID →",
    reopenVerif: "Louvri lyen verifikasyon an ankò",
    statusLabel: "Estati:",
    statusUpdateNote: "Bwat sa a mete ajou otomatikman lè ou fin fè pwosesis la sou telefòn ou.",
    supportLetterTitle: "Lèt sipò legliz / kominote",
    supportLetterBody: "Yon ti lèt siyen pa pastè ou, yon lidè kominotè, oswa yon òganizasyon san bi likratif ki konnen ou. PDF oswa foto ok.",
    uploaded: "✓ Telechaje",
    uploading: "L ap telechaje…",
    incomeDocTitle: "Dokiman revni",
    incomeDocBodyPrefix: "Telechaje",
    incomeDocBodyOne: "youn",
    incomeDocBodySuffix: "nan sa yo kòm prèv revni.",
    payStub: "Fich pewòl",
    taxReturn: "Deklarasyon taks",
    benefitsLetter: "Lèt benefis (SNAP / Medicaid / WIC)",
    uploadedKind: "✓ Telechaje ({kind})",
    uploadsPrivacyNote: "Tout dokiman yo estoke an prive. Se sèlman ou menm, ekip kalifikasyon nou an, ak avoka ki asiyen pou ou ki kapab wè yo.",
    back: "← Retounen",
    saving: "L ap sove…",
    continueArrow: "Kontinye →",
    step3Heading: "Etap 3 · Verifikasyon bankè",
    step3Body: "Nou itilize Plaid pou konfime revni ou an sekirite. Nou pa janm wè oswa estoke modpas bank ou. Sa obligatwa pou garanti pri gratis la.",
    bankLinked: "✓ Bank lye avèk siksè.",
    openingPlaid: "L ap ouvri Plaid…",
    linkBank: "Lye bank mwen an sekirite",
    skipEligibility: "Sote (kapab redwi eligibilite ou)",
    step4Heading: "Etap 4 · Deklarasyon sou sèman",
    attestationText: "Anba penn pou fo temwayaj, mwen deklare enfòmasyon mwen bay yo — gwosè fwaye, revni, depandan, depans, ak sitiyasyon imigrasyon — vre e kòrèk otan mwen konnen. Mwen konprann bay fo enfòmasyon pou jwenn sèvis legal a pri redwi ka yon ofans federal e ap lakòz anilasyon imedya sèvis yo san ranbousman.",
    attestationAgree: "Mwen li e mwen dakò ak deklarasyon sou sèman anwo a.",
    fSignature: "Ekri non legal konplè ou kòm siyati ou",
    submitting: "L ap voye…",
    submitContinue: "Soumèt e kontinye nan peman",
    preliminaryTier: "Nivo preliminè:",
  },
} as const;

function QualifyPage() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const t = COPY[lang];
  const assess = useServerFn(assessQualification);
  const attachIdentity = useServerFn(attachQualifyIdentity);
  const finalize = useServerFn(finalizeQualifySubmission);
  const createToken = useServerFn(createPlaidLinkToken);
  const exchange = useServerFn(exchangePlaidPublicToken);

  const [step, setStep] = useState<Step>(1);
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const [intake, setIntake] = useState(emptyIntake);
  const [submissionId, setSubmissionId] = useState("");
  const [tier, setTier] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [assessmentReasoning, setAssessmentReasoning] = useState("");
  const [declined, setDeclined] = useState(false);

  // Step 2 identity + docs
  const [identity, setIdentity] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [verifStatus, setVerifStatus] = useState<string>("not_started");
  const [verifBusy, setVerifBusy] = useState(false);
  const [incomeDocKind, setIncomeDocKind] = useState<QualifyDocKind>("pay_stub");
  const [supportLetterPath, setSupportLetterPath] = useState("");
  const [incomeDocPath, setIncomeDocPath] = useState("");
  const [uploadingKind, setUploadingKind] = useState<QualifyDocKind | "">("");
  const verifPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const createVerif = useServerFn(createIdentityVerification);
  const getVerif = useServerFn(getIdentityVerification);
  const createUploadUrl = useServerFn(createQualifyUploadUrl);
  const saveDocPath = useServerFn(saveQualifyDocumentPath);

  // Step 3 plaid
  const [linkToken, setLinkToken] = useState("");
  const [plaidLinked, setPlaidLinked] = useState(false);

  // Step 4 attestation
  const [signature, setSignature] = useState("");
  const [attestChecked, setAttestChecked] = useState(false);

  /* --------------- step 1 --------------- */
  const submitIntake = async () => {
    setError("");
    if (!intake.firstName.trim()) {
      setError(t.errFirstName);
      return;
    }
    if (!intake.state.trim()) {
      setError(t.errState);
      return;
    }
    setBusy(true);
    try {
      const res = await assess({ data: intake });
      setSubmissionId(res.submissionId);
      setTier(res.tier);
      setDiscountPct(res.discountPct ?? 0);
      setAssessmentReasoning(res.reasoning);
      if (!res.qualifies) {
        setDeclined(true);
      } else {
        setStep(2);
      }
    } catch (e: any) {
      setError(e?.message || t.errAssess);
    } finally {
      setBusy(false);
    }
  };

  /* --------------- step 2 --------------- */
  const startVerification = async () => {
    setError("");
    if (identity.fullName.trim().length < 2) {
      setError(t.errFullNameVerif);
      return;
    }
    setVerifBusy(true);
    try {
      const res = await createVerif({
        data: {
          submissionId,
          returnUrl: typeof window !== "undefined"
            ? `${window.location.origin}/qualify?verified=1`
            : undefined,
        },
      });
      if (!res.ok) throw new Error(res.error);
      setVerifStatus(res.status || "processing");
      if (res.url) window.open(res.url, "_blank", "noopener,noreferrer");
      // Start polling every 4s until verified/failed.
      if (verifPollRef.current) clearInterval(verifPollRef.current);
      verifPollRef.current = setInterval(async () => {
        try {
          const s = await getVerif({ data: { submissionId } });
          if (s.ok && s.status) {
            setVerifStatus(s.status);
            if (s.status === "verified" || s.status === "canceled") {
              if (verifPollRef.current) clearInterval(verifPollRef.current);
              verifPollRef.current = null;
            }
          }
        } catch {}
      }, 4000);
    } catch (e: any) {
      setError(e?.message || t.errStartVerif);
    } finally {
      setVerifBusy(false);
    }
  };

  useEffect(() => {
    return () => {
      if (verifPollRef.current) clearInterval(verifPollRef.current);
    };
  }, []);

  const uploadDoc = async (
    kind: QualifyDocKind,
    file: File,
  ): Promise<string | null> => {
    setError("");
    setUploadingKind(kind);
    try {
      const sig = await createUploadUrl({
        data: { submissionId, kind, filename: file.name },
      });
      if (!sig.ok) throw new Error(sig.error);
      const { error: upErr } = await supabase.storage
        .from("qualify-docs")
        .uploadToSignedUrl(sig.path, sig.token, file);
      if (upErr) throw upErr;
      const saved = await saveDocPath({
        data: { submissionId, kind, path: sig.path },
      });
      if (!saved.ok) throw new Error(saved.error);
      return sig.path;
    } catch (e: any) {
      setError(e?.message || t.errUpload);
      return null;
    } finally {
      setUploadingKind("");
    }
  };

  const submitIdentity = async () => {
    setError("");
    if (identity.fullName.trim().length < 2) {
      setError(t.errFullName);
      return;
    }
    if (verifStatus !== "verified") {
      setError(t.errNotVerified);
      return;
    }
    if (!supportLetterPath) {
      setError(t.errSupportLetter);
      return;
    }
    if (!incomeDocPath) {
      setError(t.errIncomeDoc);
      return;
    }
    setBusy(true);
    try {
      await attachIdentity({ data: { submissionId, ...identity } });
      setStep(3);
    } catch (e: any) {
      setError(e?.message || t.errSaveInfo);
    } finally {
      setBusy(false);
    }
  };

  /* --------------- step 3 (plaid) --------------- */
  const startPlaid = async () => {
    setError("");
    setBusy(true);
    try {
      const res = await createToken({
        data: { submissionId, legalName: identity.fullName || intake.firstName },
      });
      setLinkToken(res.linkToken);
    } catch (e: any) {
      setError(e?.message || t.errPlaidStart);
    } finally {
      setBusy(false);
    }
  };

  const onPlaidSuccess = useCallback(
    async (publicToken: string) => {
      setBusy(true);
      try {
        await exchange({ data: { submissionId, publicToken } });
        setPlaidLinked(true);
      } catch (e: any) {
        setError(e?.message || t.errPlaidSave);
      } finally {
        setBusy(false);
      }
    },
    [exchange, submissionId],
  );

  const { open: openPlaid, ready: plaidReady } = usePlaidLink({
    token: linkToken || null,
    onSuccess: (public_token) => void onPlaidSuccess(public_token),
  });

  useEffect(() => {
    if (linkToken && plaidReady) openPlaid();
  }, [linkToken, plaidReady, openPlaid]);

  /* --------------- step 4 --------------- */
  const submitAttestation = async () => {
    setError("");
    if (!attestChecked || signature.trim().length < 2) {
      setError(t.errAttestation);
      return;
    }
    setBusy(true);
    try {
      await finalize({
        data: { submissionId, attestationSignature: signature.trim() },
      });
      // Carry the reduced-cost discount + submission id through to checkout.
      navigate({
        to: "/checkout",
        search: {
          lang,
          discountPct: discountPct || undefined,
          submissionId: submissionId || undefined,
        },
      });
    } catch (e: any) {
      setError(e?.message || t.errFinalize);
    } finally {
      setBusy(false);
    }
  };

  /* --------------- declined view --------------- */
  if (declined) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-lg bg-white shadow p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {t.declinedTitle}
            </h1>
            <p className="text-gray-700 mb-4">
              {t.declinedBody}
            </p>
            <div className="rounded bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600 mb-6">
              {assessmentReasoning}
            </div>

            <div className="rounded-lg border-2 border-red-700 bg-red-50 p-6 mb-6">
              <h2 className="text-xl font-bold text-red-900 mb-2">
                {t.emergencyAppTitle}
              </h2>
              <p className="text-gray-800 mb-3">
                {t.emergencyAppBody1}{" "}
                <strong>{t.emergencyAppBody2}</strong>{t.emergencyAppBody3}{" "}
                <em>{t.emergencyAppBody4}</em> {t.emergencyAppBody5}
              </p>
              <ul className="text-sm text-gray-700 space-y-1 mb-4 list-disc list-inside">
                <li>{t.liDocs}</li>
                <li>{t.liFamily}</li>
                <li>{t.liBond}</li>
                <li>{t.liBilingual}</li>
              </ul>
              <Link
                to="/checkout"
                search={{ lang }}
                className="inline-block bg-red-700 hover:bg-red-800 text-white font-bold px-6 py-3 rounded"
              >
                Subscribe — $10/month →
              </Link>
            </div>

            <button
              onClick={() => {
                setDeclined(false);
                setStep(1);
              }}
              className="text-sm text-gray-600 underline"
            >
              ← Re-check my answers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6">
          <Link to="/" className="text-sm text-red-700 hover:underline">
            ← Back to home
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.pageTitle}</h1>
        <p className="text-gray-600 mb-8">
          {t.pageSubtitle}
        </p>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex-1 flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= (n as Step)
                    ? "bg-red-700 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {n}
              </div>
              {n < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > (n as Step) ? "bg-red-700" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-red-800">
            {error}
          </div>
        )}

        <div className="rounded-lg bg-white shadow p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  {t.step1Heading}
                </h2>
                <p className="text-sm text-gray-600">
                  {t.step1Sub}
                </p>
              </div>

              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                  {t.sectionAboutYou}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label={t.fFirstName}>
                    <input
                      className="input"
                      value={intake.firstName}
                      onChange={(e) =>
                        setIntake({ ...intake, firstName: e.target.value })
                      }
                    />
                  </Field>
                  <Field label={t.fState}>
                    <input
                      className="input"
                      maxLength={2}
                      placeholder="FL"
                      value={intake.state}
                      onChange={(e) =>
                        setIntake({ ...intake, state: e.target.value.toUpperCase() })
                      }
                    />
                  </Field>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <Field label={t.fYearsUs}>
                    <input
                      type="number"
                      min={0}
                      className="input"
                      value={intake.yearsInUsSelf}
                      onChange={(e) =>
                        setIntake({
                          ...intake,
                          yearsInUsSelf: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label={t.fYearsWorking}>
                    <input
                      type="number"
                      min={0}
                      className="input"
                      value={intake.yearsWorking}
                      onChange={(e) =>
                        setIntake({
                          ...intake,
                          yearsWorking: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label={t.fJobType}>
                    <input
                      className="input"
                      value={intake.jobType}
                      onChange={(e) => setIntake({ ...intake, jobType: e.target.value })}
                    />
                  </Field>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                  {t.sectionHousehold}
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <Field label={t.fHouseholdSize}>
                    <input
                      type="number"
                      min={1}
                      className="input"
                      value={intake.householdSize}
                      onChange={(e) =>
                        setIntake({
                          ...intake,
                          householdSize: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label={t.fDependents}>
                    <input
                      type="number"
                      min={0}
                      className="input"
                      value={intake.dependentsCount}
                      onChange={(e) =>
                        setIntake({
                          ...intake,
                          dependentsCount: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                  <Field label={t.fYearsUsChildren}>
                    <input
                      type="number"
                      min={0}
                      className="input"
                      value={intake.yearsInUsChildren}
                      onChange={(e) =>
                        setIntake({
                          ...intake,
                          yearsInUsChildren: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                </div>
                <Field label={t.fChildrenAges}>
                  <input
                    className="input"
                    placeholder={t.childrenAgesPlaceholder}
                    value={intake.childrenAges}
                    onChange={(e) =>
                      setIntake({ ...intake, childrenAges: e.target.value })
                    }
                  />
                </Field>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={intake.usCitizenChildren}
                    onChange={(e) =>
                      setIntake({ ...intake, usCitizenChildren: e.target.checked })
                    }
                  />
                  <span>{t.citizenChildren}</span>
                </label>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={intake.primaryEarner}
                    onChange={(e) =>
                      setIntake({ ...intake, primaryEarner: e.target.checked })
                    }
                  />
                  <span>{t.primaryEarner}</span>
                </label>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                  {t.sectionIncome}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label={t.fPayFrequency}>
                    <select
                      className="input"
                      value={intake.payFrequency}
                      onChange={(e) =>
                        setIntake({
                          ...intake,
                          payFrequency: e.target.value as typeof intake.payFrequency,
                        })
                      }
                    >
                      <option value="daily">{t.payDaily}</option>
                      <option value="weekly">{t.payWeekly}</option>
                      <option value="biweekly">{t.payBiweekly}</option>
                      <option value="monthly">{t.payMonthly}</option>
                    </select>
                  </Field>
                  <Field label={t.fPayAmount}>
                    <input
                      type="number"
                      min={0}
                      className="input"
                      value={intake.payAmountUsd}
                      onChange={(e) =>
                        setIntake({
                          ...intake,
                          payAmountUsd: Number(e.target.value),
                        })
                      }
                    />
                  </Field>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                  {t.sectionExpenses}
                </h3>
                <p className="text-xs text-gray-500 -mt-2">
                  {t.expensesHint}
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <ExpenseField
                    label={t.expRent}
                    value={intake.rent}
                    onChange={(v) => setIntake({ ...intake, rent: v })}
                  />
                  <ExpenseField
                    label={t.expFood}
                    value={intake.food}
                    onChange={(v) => setIntake({ ...intake, food: v })}
                  />
                  <ExpenseField
                    label={t.expMedicine}
                    value={intake.medicine}
                    onChange={(v) => setIntake({ ...intake, medicine: v })}
                  />
                  <ExpenseField
                    label={t.expDaycare}
                    value={intake.daycare}
                    onChange={(v) => setIntake({ ...intake, daycare: v })}
                  />
                  <ExpenseField
                    label={t.expSchool}
                    value={intake.schoolSupplies}
                    onChange={(v) => setIntake({ ...intake, schoolSupplies: v })}
                  />
                  <ExpenseField
                    label={t.expTransportation}
                    value={intake.transportation}
                    onChange={(v) => setIntake({ ...intake, transportation: v })}
                  />
                  <ExpenseField
                    label={t.expRestaurants}
                    value={intake.restaurants}
                    onChange={(v) => setIntake({ ...intake, restaurants: v })}
                  />
                  <ExpenseField
                    label={t.expChildrenEntertainment}
                    value={intake.childrenEntertainment}
                    onChange={(v) => setIntake({ ...intake, childrenEntertainment: v })}
                  />
                  <ExpenseField
                    label={t.expOther}
                    value={intake.otherExpenses}
                    onChange={(v) => setIntake({ ...intake, otherExpenses: v })}
                  />
                </div>
              </section>

              <button
                className="btn-primary w-full md:w-auto"
                disabled={busy}
                onClick={submitIntake}
              >
                {busy ? t.checking : t.checkQualify}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className={`rounded border p-4 text-sm ${tier === "nocost" ? "bg-green-50 border-green-300 text-green-900" : "bg-amber-50 border-amber-300 text-amber-900"}`}>
                {tier === "nocost" ? (
                  <>✓ <strong>{t.qualifyNoCost}</strong> {assessmentReasoning}</>
                ) : (
                  <>✓ <strong>{t.qualifyDiscount.replace("{pct}", String(discountPct))}</strong> {t.qualifyDiscountSuffix} {assessmentReasoning}</>
                )}
              </div>
              <h2 className="text-xl font-semibold">{t.step2Heading}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label={t.fFullLegalName}>
                  <input
                    className="input"
                    value={identity.fullName}
                    onChange={(e) =>
                      setIdentity({ ...identity, fullName: e.target.value })
                    }
                  />
                </Field>
                <Field label={t.fEmail}>
                  <input
                    type="email"
                    className="input"
                    value={identity.email}
                    onChange={(e) =>
                      setIdentity({ ...identity, email: e.target.value })
                    }
                  />
                </Field>
              </div>
              <Field label={t.fPhone}>
                <input
                  className="input"
                  value={identity.phone}
                  onChange={(e) => setIdentity({ ...identity, phone: e.target.value })}
                />
              </Field>
              {/* --- Stripe Identity: phone-based license + selfie liveness --- */}
              <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {t.verifyIdentityTitle}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {t.verifyIdentityBody}
                </p>
                {verifStatus === "verified" ? (
                  <div className="rounded bg-green-50 border border-green-300 px-3 py-2 text-green-800 text-sm">
                    ✓ Identity verified
                  </div>
                ) : (
                  <>
                    <button
                      className="btn-primary"
                      disabled={verifBusy}
                      onClick={startVerification}
                    >
                      {verifBusy
                        ? t.opening
                        : verifStatus === "not_started"
                          ? t.startIdVerif
                          : t.reopenVerif}
                    </button>
                    {verifStatus !== "not_started" && (
                      <p className="text-xs text-gray-500 mt-2">
                        {t.statusLabel} <strong>{verifStatus}</strong>. {t.statusUpdateNote}
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* --- Church / community support letter (required) --- */}
              <div className="rounded-lg border border-gray-300 bg-white p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {t.supportLetterTitle} <span className="text-red-700">*</span>
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {t.supportLetterBody}
                </p>
                {supportLetterPath ? (
                  <div className="rounded bg-green-50 border border-green-300 px-3 py-2 text-green-800 text-sm">
                    {t.uploaded}
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    disabled={uploadingKind === "support_letter"}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const p = await uploadDoc("support_letter", f);
                      if (p) setSupportLetterPath(p);
                    }}
                  />
                )}
                {uploadingKind === "support_letter" && (
                  <p className="text-xs text-gray-500 mt-2">{t.uploading}</p>
                )}
              </div>

              {/* --- Income document (one of three) --- */}
              <div className="rounded-lg border border-gray-300 bg-white p-4">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {t.incomeDocTitle} <span className="text-red-700">*</span>
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {t.incomeDocBodyPrefix} <strong>{t.incomeDocBodyOne}</strong> {t.incomeDocBodySuffix}
                </p>
                <div className="flex flex-wrap gap-4 text-sm mb-3">
                  {(
                    [
                      { k: "pay_stub", label: t.payStub },
                      { k: "tax_return", label: t.taxReturn },
                      { k: "benefits_letter", label: t.benefitsLetter },
                    ] as { k: QualifyDocKind; label: string }[]
                  ).map((opt) => (
                    <label key={opt.k} className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="incomeDocKind"
                        checked={incomeDocKind === opt.k}
                        onChange={() => setIncomeDocKind(opt.k)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
                {incomeDocPath ? (
                  <div className="rounded bg-green-50 border border-green-300 px-3 py-2 text-green-800 text-sm">
                    {t.uploadedKind.replace("{kind}", incomeDocKind.replace("_", " "))}
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    disabled={uploadingKind === incomeDocKind}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const p = await uploadDoc(incomeDocKind, f);
                      if (p) setIncomeDocPath(p);
                    }}
                  />
                )}
                {uploadingKind && uploadingKind !== "support_letter" && (
                  <p className="text-xs text-gray-500 mt-2">{t.uploading}</p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {t.uploadsPrivacyNote}
              </p>
              <div className="flex gap-3">
                <button className="btn-secondary" onClick={() => setStep(1)}>
                  {t.back}
                </button>
                <button className="btn-primary" disabled={busy} onClick={submitIdentity}>
                  {busy ? t.saving : t.continueArrow}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{t.step3Heading}</h2>
              <p className="text-sm text-gray-600">
                {t.step3Body}
              </p>
              {plaidLinked ? (
                <div className="rounded bg-green-50 border border-green-300 px-4 py-3 text-green-800">
                  {t.bankLinked}
                </div>
              ) : (
                <button
                  className="btn-primary"
                  disabled={busy}
                  onClick={startPlaid}
                >
                  {busy ? t.openingPlaid : t.linkBank}
                </button>
              )}
              <div className="flex gap-3 pt-4">
                <button className="btn-secondary" onClick={() => setStep(2)}>
                  {t.back}
                </button>
                <button
                  className="btn-primary"
                  disabled={!plaidLinked}
                  onClick={() => setStep(4)}
                >
                  {t.continueArrow}
                </button>
                <button
                  className="text-sm text-gray-500 underline"
                  onClick={() => setStep(4)}
                >
                  {t.skipEligibility}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{t.step4Heading}</h2>
              <div className="rounded bg-yellow-50 border border-yellow-300 p-4 text-sm text-yellow-900">
                {t.attestationText}
              </div>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={attestChecked}
                  onChange={(e) => setAttestChecked(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm">
                  {t.attestationAgree}
                </span>
              </label>
              <Field label={t.fSignature}>
                <input
                  className="input"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                />
              </Field>
              <div className="flex gap-3">
                <button className="btn-secondary" onClick={() => setStep(3)}>
                  {t.back}
                </button>
                <button
                  className="btn-primary"
                  disabled={busy}
                  onClick={submitAttestation}
                >
                  {busy ? t.submitting : t.submitContinue}
                </button>
              </div>
              {tier && (
                <p className="text-sm text-gray-600 pt-2">
                  {t.preliminaryTier}{" "}
                  <strong className="text-red-700">{tier.toUpperCase()}</strong>
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          font-size: 0.95rem;
          background: white;
        }
        .input:focus { outline: 2px solid #b91c1c; outline-offset: -1px; border-color: #b91c1c; }
        .btn-primary {
          background: #b91c1c; color: white; font-weight: 600;
          padding: 0.6rem 1.25rem; border-radius: 0.375rem;
          transition: background 0.15s;
        }
        .btn-primary:hover:not(:disabled) { background: #991b1b; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-secondary {
          background: #e5e7eb; color: #111827; font-weight: 600;
          padding: 0.6rem 1.25rem; border-radius: 0.375rem;
        }
        .btn-secondary:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );
}

function ExpenseField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
          $
        </span>
        <input
          type="number"
          min={0}
          className="input pl-6"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </Field>
  );
}
