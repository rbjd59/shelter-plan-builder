import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useLang, type Lang } from "@/context/LanguageContext";
import { FIRM, COMPANY } from "@/lib/firm-info";
import { LegalDisclaimerFooter } from "@/components/LegalDisclaimerFooter";

export const Route = createFileRoute("/attorney")({
  validateSearch: (search: Record<string, unknown>): { lang?: string } => ({
    lang: typeof search.lang === "string" ? search.lang : undefined,
  }),
  head: () => ({
    meta: [
      {
        title: `Attorney Review / Revisión de Abogado / Revizyon Avoka | ${FIRM.attorney} | DetencionDefensa.com`,
      },
      {
        name: "description",
        content: `Every habeas-corpus packet is reviewed by ${FIRM.attorney} of ${FIRM.legalName}, an independent Florida-licensed attorney, before it reaches your account. / Revisión de abogado en español y kreyòl haitiano.`,
      },
      {
        property: "og:title",
        content: `Attorney-Reviewed by ${FIRM.attorney} / Revisado por ${FIRM.attorney}`,
      },
      {
        property: "og:description",
        content:
          "Independent Florida attorney review on every packet. Limited-scope pro bono engagement at no cost to the family, AI-drafted and human-verified.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://detenciondefensa.com/attorney" }],
  }),
  component: AttorneyPage,
});

const NAVY = "#0f1830";
const ACCENT = "#e07a4d";
const CARD = "#ffffff";
const PAGE = "#f6f5f1";
const MUTED = "#5b6478";
const BORDER = "#e6e3dc";

// Single public company callback number, the same one used across the site.
const SITE_PHONE_DISPLAY = "+13057737713";
const SITE_PHONE_TEL = "+13057737713";
const LANGUAGES_SERVED = "EN · ES · HT · IT";

const LANGS: { id: Lang; label: string }[] = [
  { id: "es", label: "ES" },
  { id: "en", label: "EN" },
  { id: "ht", label: "HT" },
];

const stat = (label: string, value: string) => ({ label, value });

const COPY = {
  en: {
    navHome: "Home",
    navRetainer: "Retainer",
    navBar: "FL Bar Profile ↗",
    navStart: "Get started",
    badge: "Attorney Review",
    h1a: "Human attorneys on every",
    h1b: "habeas-corpus packet.",
    hero: `AI drafts the documents. ${FIRM.attorney}, a licensed Florida attorney, reviews and signs them. You pay one flat fee — no billable surprises.`,
    cta1: "Start my packet — no cost",
    cta2: "Read the engagement letter",
    stats: [
      stat("Licensed FL Bar", "1049132"),
      stat("Limited-scope engagement", "Rule 4-1.2(c)"),
      stat("Attorney fee per case", "$0 — pro bono"),
      stat("Languages served", LANGUAGES_SERVED),
    ],
    pillars: [
      {
        h: "Licensed Florida attorney",
        p: `${FIRM.attorney} is a Member in Good Standing of The Florida Bar, admitted ${FIRM.admittedDate}, practicing from ${FIRM.city}.`,
      },
      {
        h: "Human expertise, not just AI",
        p: "AI drafts the narrative; a human attorney verifies every citation, signs the limited-scope retainer, and stands behind the work.",
      },
      {
        h: "No fee, no surprises",
        p: "The attorney has agreed to take these limited-scope matters pro bono for a limited period, so there is no attorney fee at all — not to the family and not billed hourly. The emergency app, translation, and document preparation are also provided free during the community crisis. No credit card is required.",
      },
    ],
    stepsTitle: "How attorney review works",
    stepsSub:
      "Three focused steps — from intake to a sealed envelope inside the detention facility.",
    steps: [
      {
        n: "1",
        title: "You complete the bilingual intake.",
        body: "Guided questions in English, Spanish, or Haitian Creole capture the facts the attorney needs — no legalese, no guesswork.",
      },
      {
        n: "2",
        title: "We build the draft packet.",
        body: "Habeas corpus, IFP, AO 242, and supporting motions are generated from your answers using verified, citation-checked templates.",
      },
      {
        n: "3",
        title: `${FIRM.attorney} reviews and signs.`,
        body: "An independent Florida attorney reviews every packet, finalizes the AO 242 with respondent and facility, and mails it via U.S. legal mail.",
      },
    ],
    meetLabel: "Meet your reviewing attorney",
    callLabel: "Call or text",
    bio1: `Rosario was born and raised in New York and studied at Stony Brook University as an undergraduate and graduate fellow, completing part of his studies in Italy in collaborations with U.S. and EU professionals.`,
    bio2: `After ${FIRM.lawSchool}, he joined Cole, Scott & Kissane — one of Florida's largest defense firms — on the complex litigation team, then expanded into maritime law, litigating in federal court against major international corporations. He now serves clients in English, Spanish, Italian, and Haitian Kreyòl.`,
    admissions: "Admissions & Affiliations",
    extraAdmissions: [
      "Catholic Bar Association",
      "Italy-America Chamber of Commerce Southeast",
      "World Intellectual Property Organization (ADR Young)",
    ],
    verifyBar: "Verify on FL Bar ↗",
    firmSite: "Firm website ↗",
    scopeTitle: "Scope of services & fee",
    scope1: `The firm provides legal services under a written limited-scope engagement letter (Florida Bar Rule 4-1.2(c)) on a **pro bono basis** — there is no attorney fee, and neither the family nor ${COMPANY.legalName} pays the firm for this work. The emergency app, professional translation, typing, and secure storage are also provided at no charge during the community crisis, so customers pay nothing and no card is required. This pro bono commitment is for a limited period; if a fee is ever introduced, customers will be notified in advance and nothing will be charged without a new signed fee agreement.`,
    scope2:
      "Locating the detained person and mailing the completed packet by U.S. legal mail are part of the same pro bono limited-scope engagement, at no additional charge.",
    ctaTitle: "Ready for an attorney-reviewed packet?",
    ctaSub:
      "Start the intake in your language. The retainer is signed before any legal work begins.",
    ctaBtn: "Begin my intake →",
  },
  es: {
    navHome: "Inicio",
    navRetainer: "Contrato",
    navBar: "Perfil del Colegio de FL ↗",
    navStart: "Comenzar",
    badge: "Revisión de abogado",
    h1a: "Abogados de verdad en cada",
    h1b: "paquete de hábeas corpus.",
    hero: `La IA redacta los documentos. ${FIRM.attorney}, abogado con licencia en Florida, los revisa y los firma. Usted paga una tarifa fija — sin sorpresas de cobros.`,
    cta1: "Comenzar mi paquete — sin costo",
    cta2: "Lea la carta de contratación",
    stats: [
      stat("Licencia del Colegio de FL", "1049132"),
      stat("Contrato de alcance limitado", "Regla 4-1.2(c)"),
      stat("Honorario del abogado por caso", "$0 — pro bono"),
      stat("Idiomas que atendemos", LANGUAGES_SERVED),
    ],
    pillars: [
      {
        h: "Abogado con licencia en Florida",
        p: `${FIRM.attorney} es Miembro en Buen Pie del Colegio de Abogados de Florida, admitido el ${FIRM.admittedDate}, con oficina en ${FIRM.city}.`,
      },
      {
        h: "Experiencia humana, no solo IA",
        p: "La IA redacta el relato; un abogado humano verifica cada cita, firma el contrato de alcance limitado y responde por el trabajo.",
      },
      {
        h: "Sin costo, sin sorpresas",
        p: "El abogado aceptó tomar estos casos de alcance limitado pro bono por un tiempo limitado, así que no hay honorario alguno — ni a la familia ni por hora. La aplicación de emergencia, la traducción y la preparación de documentos también son gratis durante la crisis de la comunidad. No se necesita tarjeta de crédito.",
      },
    ],
    stepsTitle: "Cómo funciona la revisión del abogado",
    stepsSub:
      "Tres pasos claros — desde la entrevista hasta un sobre sellado dentro del centro de detención.",
    steps: [
      {
        n: "1",
        title: "Usted completa la entrevista en su idioma.",
        body: "Preguntas guiadas en inglés, español o kreòl haitiano recogen los hechos que el abogado necesita — sin lenguaje legal, sin adivinar.",
      },
      {
        n: "2",
        title: "Armamos el borrador del paquete.",
        body: "El hábeas corpus, la solicitud para no pagar los gastos de la corte (IFP), el formulario AO 242 y las mociones de apoyo se generan a partir de sus respuestas, con plantillas verificadas y citas revisadas.",
      },
      {
        n: "3",
        title: `${FIRM.attorney} revisa y firma.`,
        body: "Un abogado independiente de Florida revisa cada paquete, completa el AO 242 con el demandado y el centro, y lo envía por correo legal de EE. UU.",
      },
    ],
    meetLabel: "Conozca al abogado que revisa su caso",
    callLabel: "Llame o envíe un texto",
    bio1: `Rosario nació y creció en Nueva York y estudió en Stony Brook University como estudiante de pregrado y becario de posgrado, y completó parte de sus estudios en Italia junto a profesionales de EE. UU. y la Unión Europea.`,
    bio2: `Después de ${FIRM.lawSchool}, se unió a Cole, Scott & Kissane — una de las firmas de defensa más grandes de Florida — en el equipo de litigios complejos, y luego se expandió al derecho marítimo, litigando en corte federal contra grandes corporaciones internacionales. Hoy atiende a clientes en inglés, español, italiano y kreòl haitiano.`,
    admissions: "Admisiones y afiliaciones",
    extraAdmissions: [
      "Catholic Bar Association",
      "Italy-America Chamber of Commerce Southeast",
      "World Intellectual Property Organization (ADR Young)",
    ],
    verifyBar: "Verificar en el Colegio de FL ↗",
    firmSite: "Sitio del bufete ↗",
    scopeTitle: "Alcance de los servicios y tarifa",
    scope1: `El bufete presta servicios legales bajo una carta de contratación escrita de alcance limitado (Regla 4-1.2(c) del Colegio de Abogados de Florida) sobre una base **pro bono** — no hay honorario de abogado, y ni la familia ni ${COMPANY.legalName} le paga al bufete por este trabajo. La aplicación de emergencia, la traducción profesional, el tipeo y el almacenamiento seguro también se ofrecen sin cargo durante la crisis de la comunidad, así que los clientes no pagan nada y no se necesita tarjeta. Este compromiso pro bono es por un tiempo limitado; si alguna vez se introduce un cargo, se avisará con anticipación y no se cobrará nada sin un nuevo acuerdo de honorarios firmado.`,
    scope2:
      "Localizar a la persona detenida y enviar el paquete terminado por correo legal de EE. UU. forman parte del mismo contrato pro bono de alcance limitado, sin cargo adicional.",
    ctaTitle: "¿Listo para un paquete revisado por un abogado?",
    ctaSub:
      "Comience la entrevista en su idioma. El contrato se firma antes de que comience cualquier trabajo legal.",
    ctaBtn: "Comenzar mi entrevista →",
  },
  ht: {
    navHome: "Akèy",
    navRetainer: "Kontra",
    navBar: "Pofil sou Ba Florid la ↗",
    navStart: "Kòmanse",
    badge: "Revizyon Avoka",
    h1a: "Avoka moun reyèl sou chak",
    h1b: "pakè hábeas corpus.",
    hero: `IA a redije dokiman yo. ${FIRM.attorney}, yon avoka ki gen lisans an Florid, revize epi siyen yo. Ou peye yon sèl frè fikse — pa gen sipriz nan cobrans.`,
    cta1: "Kòmanse pakè m — gratis",
    cta2: "Li lèt angajman an",
    stats: [
      stat("Lisans Ba Florid", "1049132"),
      stat("Angajman portè limite", "Règ 4-1.2(c)"),
      stat("Frè avoka pou chak ka", "$0 — pro bono"),
      stat("Lang nou sèvi", LANGUAGES_SERVED),
    ],
    pillars: [
      {
        h: "Avoka ki gen lisans an Florid",
        p: `${FIRM.attorney} se yon Manm an Bon Eta nan Ba Florid la, admèt ${FIRM.admittedDate}, k ap pratike soti ${FIRM.city}.`,
      },
      {
        h: "Ekspètiz moun, pa sèlman IA",
        p: "IA a redije istwa a; yon avoka moun verifye chak sitasyon, siyen kontra portè limite a, epi li dèyè travay la.",
      },
      {
        h: "Pa gen frè, pa gen sipriz",
        p: "Avoka a aksepte pran ka portè limite sa yo pro bono pou yon ti peryòd, konsa pa gen okenn frè avoka ditou — ni pou fanmi an ni pou faktè chak èdtan. Aplikasyon dijans lan, tradiksyon an ak preparasyon dokiman yo gratis tou pandan kriz kominote a. Pa bezwen kat kredi.",
      },
    ],
    stepsTitle: "Kijan revizyon avoka a mache",
    stepsSub:
      "Twa etap klè — soti nan entèvyou a rive nan yon anvlòp fèmen anndan sant detansyon an.",
    steps: [
      {
        n: "1",
        title: "Ou ranpli entèvyou a nan lang ou.",
        body: "Kesyon gide an anglè, panyòl oswa kreyòl ayisyen ranmase enfòmasyon avoka a bezwen — san langaj legal, san devine.",
      },
      {
        n: "2",
        title: "Nou prepare bawon pakè a.",
        body: "Hábeas corpus, demann pou pa peye frè tribinal (IFP), fòmilè AO 242 ak masyon sipò yo soti nan repons ou yo, lè l sèvi avèk modèl nou verifye ak sitasyon nou tcheke.",
      },
      {
        n: "3",
        title: `${FIRM.attorney} revize epi siyen.`,
        body: "Yon avoka endepandan an Florid revize chak pakè, finalize AO 242 a ak moun k ap reponn lan ak sant lan, epi l voye l pa lapòs legal Etazini.",
      },
    ],
    meetLabel: "Rankontre avoka k ap revize ka w la",
    callLabel: "Rele oswa voye tèks",
    bio1: `Rosario fèt epi li grandi nan New York. Li te etidye nan Stony Brook University kòm etidyan pregrad ak kòm enkonkri posgrad, epi li te fini pati nan etid li yo an Italya ansanm ak pwofesyonèl Etazini ak Inyon Ewopeyen.`,
    bio2: `Apre ${FIRM.lawSchool}, li te antre nan Cole, Scott & Kissane — youn nan pi gwo kabinè defans an Florid — nan ekip pwosesis konplèks yo, epi apre sa li te elaji nan lwa maritim, k ap plide nan tribinal federal kont gwo konpayi entènasyonal. Kounye a li sèvi kliyan an anglè, panyòl, Italian ak kreyòl ayisyen.`,
    admissions: "Admisyon ak Afilyasyon",
    extraAdmissions: [
      "Catholic Bar Association",
      "Italy-America Chamber of Commerce Southeast",
      "World Intellectual Property Organization (ADR Young)",
    ],
    verifyBar: "Verifye sou Ba Florid ↗",
    firmSite: "Sit wèb kabinè an ↗",
    scopeTitle: "Portè sèvis ak frè",
    scope1: `Kabinè an bay sèvis legal anba yon lèt angajman ekri ak portè limite (Règ 4-1.2(c) nan Ba Florid) sou baz **pro bono** — pa gen frè avoka, epi ni fanmi an ni ${COMPANY.legalName} pa peye kabinè an pou travay sa a. Aplikasyon dijans lan, tradiksyon pwofesyonèl, tape dokiman ak depo sekirize gratis tou pandan kriz kominote a, konsa kliyan yo pa peye anyen epi pa bezwen kat. Angajman pro bono sa a pou yon ti peryòd; si yon frè antre nan eqasyon an jamè, n ap avize kliyan yo davans epi n p ap chaje anyen san yon nouvo akò frè siyen.`,
    scope2:
      "Jwenn moun ki deteni an epi poste pakè a fini pa lapòs legal Etazini se menm angajman pro bono portè limite a, san frè anplis.",
    ctaTitle: "Ou pare pou yon pakè avoka revize?",
    ctaSub:
      "Kòmanse entèvyou a nan lang ou. Kontra a siyen anvan okenn travay legal kòmanse.",
    ctaBtn: "Kòmanse entèvyou m →",
  },
};

export function AttorneyPage() {
  const { lang: stored, setLang: setStored } = useLang();
  const navigate = useNavigate();
  const search = useRouterState({ select: (s) => s.location.search as Record<string, unknown> });
  const urlLang = search.lang;
  const fromUrl = urlLang === "en" || urlLang === "es" || urlLang === "ht" ? urlLang : undefined;
  const lang = fromUrl ?? stored;
  const t = COPY[lang] ?? COPY.en;

  useEffect(() => {
    if (fromUrl && fromUrl !== stored) setStored(fromUrl);
  }, [fromUrl, stored, setStored]);

  const choose = (next: Lang) => {
    setStored(next);
    void navigate({
      to: ".",
      search: (prev: Record<string, unknown>) => ({ ...prev, lang: next }),
      replace: true,
      resetScroll: false,
    } as never);
  };

  const bold = (text: string) =>
    text.split("**").map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>,
    );

  return (
    <div
      style={{
        background: PAGE,
        color: NAVY,
        minHeight: "100vh",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* NAV */}
      <header style={{ padding: "20px 20px 0" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            background: CARD,
            borderRadius: 999,
            padding: "12px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            border: `1px solid ${BORDER}`,
            boxShadow: "0 1px 2px rgba(15,24,48,0.04)",
          }}
        >
          <Link
            to="/"
            style={{
              color: NAVY,
              fontWeight: 800,
              letterSpacing: 0.2,
              textDecoration: "none",
              fontSize: 18,
            }}
          >
            DetencionDefensa<span style={{ color: ACCENT }}>.com</span>
          </Link>
          <nav
            style={{
              display: "flex",
              gap: 22,
              alignItems: "center",
              fontSize: 14,
              flexWrap: "wrap",
            }}
          >
            <Link to="/" style={{ color: NAVY, textDecoration: "none" }}>
              {t.navHome}
            </Link>
            <Link to="/retainer" style={{ color: NAVY, textDecoration: "none" }}>
              {t.navRetainer}
            </Link>
            <a
              href={FIRM.barProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: NAVY, textDecoration: "none" }}
            >
              {t.navBar}
            </a>
            <span
              style={{
                display: "inline-flex",
                gap: 4,
                border: `1px solid ${BORDER}`,
                borderRadius: 999,
                padding: 3,
              }}
            >
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => choose(l.id)}
                  aria-pressed={lang === l.id}
                  style={{
                    border: 0,
                    cursor: "pointer",
                    borderRadius: 999,
                    padding: "5px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    background: lang === l.id ? NAVY : "transparent",
                    color: lang === l.id ? "#fff" : NAVY,
                  }}
                >
                  {l.label}
                </button>
              ))}
            </span>
            <Link
              to="/intake"
              style={{
                background: NAVY,
                color: "#fff",
                padding: "9px 18px",
                borderRadius: 999,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              {t.navStart}
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section
        style={{ maxWidth: 980, margin: "0 auto", padding: "72px 20px 40px", textAlign: "center" }}
      >
        <span
          style={{
            display: "inline-block",
            background: "rgba(224,122,77,0.12)",
            color: ACCENT,
            padding: "6px 14px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          {t.badge}
        </span>
        <h1
          style={{
            fontFamily: "'Libre Baskerville', Georgia, serif",
            fontSize: "clamp(40px, 6vw, 64px)",
            margin: "18px 0 14px",
            lineHeight: 1.05,
            letterSpacing: -0.5,
          }}
        >
          {t.h1a}
          <br />
          <span style={{ color: ACCENT }}>{t.h1b}</span>
        </h1>
        <p
          style={{
            fontSize: 18,
            color: MUTED,
            maxWidth: 640,
            margin: "0 auto",
            lineHeight: 1.55,
          }}
        >
          {t.hero}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginTop: 28,
            flexWrap: "wrap",
          }}
        >
          <Link
            to="/intake"
            style={{
              background: NAVY,
              color: "#fff",
              padding: "14px 26px",
              borderRadius: 999,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            {t.cta1}
          </Link>
          <Link
            to="/retainer"
            style={{
              background: "#fff",
              color: NAVY,
              padding: "14px 26px",
              borderRadius: 999,
              textDecoration: "none",
              fontWeight: 600,
              border: `1px solid ${BORDER}`,
            }}
          >
            {t.cta2}
          </Link>
        </div>
      </section>

      {/* STATS STRIP */}
      <section style={{ background: NAVY, color: "#fff", padding: "26px 20px" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            textAlign: "center",
          }}
        >
          {t.stats.map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.7,
                  marginTop: 4,
                  letterSpacing: 0.4,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PILLARS */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 20px 40px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {t.pillars.map((p) => (
            <div
              key={p.h}
              style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: 24,
              }}
            >
              <h3 style={{ color: ACCENT, fontSize: 18, margin: "0 0 10px" }}>{p.h}</h3>
              <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{p.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px" }}>
        <h2
          style={{
            fontFamily: "'Libre Baskerville', Georgia, serif",
            fontSize: 38,
            textAlign: "center",
            margin: "0 0 12px",
          }}
        >
          {t.stepsTitle}
        </h2>
        <p
          style={{
            textAlign: "center",
            color: MUTED,
            maxWidth: 640,
            margin: "0 auto 40px",
          }}
        >
          {t.stepsSub}
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {t.steps.map((s) => (
            <div
              key={s.n}
              style={{
                background: CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: 16,
                padding: 24,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: NAVY,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  marginBottom: 14,
                }}
              >
                {s.n}
              </div>
              <h3 style={{ fontSize: 18, margin: "0 0 8px", lineHeight: 1.3 }}>{s.title}</h3>
              <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ATTORNEY CARD */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px 20px" }}>
        <div
          style={{
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderRadius: 20,
            padding: 36,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.6fr)",
            gap: 36,
            alignItems: "start",
          }}
        >
          <div>
            <img
              src="/__l5e/assets-v1/39468bab-2418-455f-af3b-71fc939b832e/rosario-sorrentino.png"
              alt={FIRM.attorney}
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                objectFit: "cover",
                borderRadius: 16,
                display: "block",
                border: `1px solid ${BORDER}`,
              }}
              loading="lazy"
            />
            <div
              style={{
                marginTop: 16,
                fontSize: 13,
                color: MUTED,
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: NAVY }}>{FIRM.legalName}</strong>
              <br />
              {FIRM.address}
              <br />
              <span style={{ color: NAVY, fontWeight: 600 }}>{t.callLabel}:</span>{" "}
              <a href={`tel:${SITE_PHONE_TEL}`} style={{ color: ACCENT }}>
                {SITE_PHONE_DISPLAY}
              </a>
              <br />
              <a href={`mailto:${FIRM.email}`} style={{ color: ACCENT }}>
                {FIRM.email}
              </a>
            </div>
          </div>

          <div>
            <span
              style={{
                color: ACCENT,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {t.meetLabel}
            </span>
            <h2
              style={{
                fontFamily: "'Libre Baskerville', Georgia, serif",
                fontSize: 36,
                margin: "8px 0 4px",
                lineHeight: 1.1,
              }}
            >
              {FIRM.attorney}
            </h2>
            <p style={{ color: MUTED, fontSize: 14, margin: 0 }}>
              {FIRM.firmPosition} · {FIRM.flBarNumber}
            </p>

            <p style={{ marginTop: 18, fontSize: 15.5, lineHeight: 1.7 }}>{t.bio1}</p>
            <p style={{ fontSize: 15.5, lineHeight: 1.7 }}>{t.bio2}</p>

            <div style={{ marginTop: 18 }}>
              <h4
                style={{
                  fontSize: 13,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: MUTED,
                  margin: "0 0 8px",
                }}
              >
                {t.admissions}
              </h4>
              <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.7, fontSize: 14.5 }}>
                {FIRM.admissions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
                {t.extraAdmissions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href={FIRM.barProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: NAVY,
                  color: "#fff",
                  padding: "10px 18px",
                  borderRadius: 999,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {t.verifyBar}
              </a>
              <a
                href={FIRM.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "#fff",
                  color: NAVY,
                  padding: "10px 18px",
                  borderRadius: 999,
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: 14,
                  border: `1px solid ${BORDER}`,
                }}
              >
                {t.firmSite}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SCOPE & FEE */}
      <section style={{ maxWidth: 980, margin: "0 auto", padding: "40px 20px" }}>
        <div
          style={{
            background: CARD,
            border: `1px solid ${BORDER}`,
            borderLeft: `4px solid ${ACCENT}`,
            borderRadius: 12,
            padding: 28,
          }}
        >
          <h2
            style={{
              fontFamily: "'Libre Baskerville', Georgia, serif",
              fontSize: 26,
              margin: "0 0 12px",
            }}
          >
            {t.scopeTitle}
          </h2>
          <p style={{ fontSize: 15.5, lineHeight: 1.7, color: NAVY }}>{bold(t.scope1)}</p>
          <p style={{ fontSize: 15.5, lineHeight: 1.7, color: NAVY, margin: 0 }}>{t.scope2}</p>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: "20px 20px 80px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "'Libre Baskerville', Georgia, serif",
            fontSize: 32,
            margin: "0 0 12px",
          }}
        >
          {t.ctaTitle}
        </h2>
        <p style={{ color: MUTED, marginBottom: 20 }}>{t.ctaSub}</p>
        <Link
          to="/intake"
          style={{
            background: ACCENT,
            color: "#fff",
            padding: "14px 28px",
            borderRadius: 999,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 16,
            display: "inline-block",
          }}
        >
          {t.ctaBtn}
        </Link>
      </section>

      <LegalDisclaimerFooter />
    </div>
  );
}
