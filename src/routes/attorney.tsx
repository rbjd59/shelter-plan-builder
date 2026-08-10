import { createFileRoute, Link } from "@tanstack/react-router";
import { FIRM, COMPANY } from "@/lib/firm-info";
import { LegalDisclaimerFooter } from "@/components/LegalDisclaimerFooter";

export const Route = createFileRoute("/attorney")({
  head: () => ({
    meta: [
      { title: `Attorney Review by ${FIRM.attorney} | DetencionDefensa.com` },
      {
        name: "description",
        content: `Every habeas-corpus packet is reviewed by ${FIRM.attorney} of ${FIRM.legalName}, an independent Florida-licensed attorney, before it reaches your account.`,
      },
      { property: "og:title", content: `Attorney-Reviewed by ${FIRM.attorney}` },
      {
        property: "og:description",
        content: "Independent Florida attorney review on every packet. Limited-scope pro bono engagement at no cost to the family, AI-drafted and human-verified.",
      },
    ],
  }),
  component: AttorneyPage,
});

const NAVY = "#0f1830";
const ACCENT = "#e07a4d";
const CARD = "#ffffff";
const PAGE = "#f6f5f1";
const MUTED = "#5b6478";
const BORDER = "#e6e3dc";

const stat = (label: string, value: string) => ({ label, value });

const STATS = [
  stat("Licensed FL Bar", "1049132"),
  stat("Limited-scope engagement", "Rule 4-1.2(c)"),
  stat("Attorney fee per case", "$0 — pro bono"),
  stat("Languages served", "EN · ES · IT"),
];

const STEPS = [
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
];

const PILLARS = [
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
];

function AttorneyPage() {
  return (
    <div style={{ background: PAGE, color: NAVY, minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>
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
            border: `1px solid ${BORDER}`,
            boxShadow: "0 1px 2px rgba(15,24,48,0.04)",
          }}
        >
          <Link to="/" style={{ color: NAVY, fontWeight: 800, letterSpacing: 0.2, textDecoration: "none", fontSize: 18 }}>
            DetencionDefensa<span style={{ color: ACCENT }}>.com</span>
          </Link>
          <nav style={{ display: "flex", gap: 22, alignItems: "center", fontSize: 14 }}>
            <Link to="/" style={{ color: NAVY, textDecoration: "none" }}>Home</Link>
            <Link to="/retainer" style={{ color: NAVY, textDecoration: "none" }}>Retainer</Link>
            <a
              href={FIRM.barProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: NAVY, textDecoration: "none" }}
            >
              FL Bar Profile ↗
            </a>
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
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section style={{ maxWidth: 980, margin: "0 auto", padding: "72px 20px 40px", textAlign: "center" }}>
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
          Attorney Review
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
          Human attorneys on every<br />
          <span style={{ color: ACCENT }}>habeas-corpus packet.</span>
        </h1>
        <p style={{ fontSize: 18, color: MUTED, maxWidth: 640, margin: "0 auto", lineHeight: 1.55 }}>
          AI drafts the documents. {FIRM.attorney}, a licensed Florida
          attorney, reviews and signs them. You pay one flat fee —
          no billable surprises.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
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
            Start my packet — no cost
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
            Read the engagement letter
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
          {STATS.map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4, letterSpacing: 0.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PILLARS */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "72px 20px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {PILLARS.map((p) => (
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
          How attorney review works
        </h2>
        <p style={{ textAlign: "center", color: MUTED, maxWidth: 640, margin: "0 auto 40px" }}>
          Three focused steps — from intake to a sealed envelope inside the
          detention facility.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {STEPS.map((s) => (
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
            <div style={{ marginTop: 16, fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
              <strong style={{ color: NAVY }}>{FIRM.legalName}</strong><br />
              {FIRM.address}<br />
              {FIRM.phone}<br />
              <a href={`mailto:${FIRM.email}`} style={{ color: ACCENT }}>{FIRM.email}</a>
            </div>
          </div>

          <div>
            <span style={{ color: ACCENT, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
              Meet your reviewing attorney
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

            <p style={{ marginTop: 18, fontSize: 15.5, lineHeight: 1.7 }}>
              Rosario was born and raised in New York and studied at Stony
              Brook University as an undergraduate and graduate fellow,
              completing part of his studies in Italy in collaborations
              with U.S. and EU professionals.
            </p>
            <p style={{ fontSize: 15.5, lineHeight: 1.7 }}>
              After {FIRM.lawSchool}, he joined Cole, Scott &amp; Kissane —
              one of Florida's largest defense firms — on the complex
              litigation team, then expanded into maritime law, litigating
              in federal court against major international corporations.
              He now serves clients in English, Spanish, and Italian.
            </p>

            <div style={{ marginTop: 18 }}>
              <h4 style={{ fontSize: 13, letterSpacing: 1, textTransform: "uppercase", color: MUTED, margin: "0 0 8px" }}>
                Admissions &amp; Affiliations
              </h4>
              <ul style={{ paddingLeft: 18, margin: 0, lineHeight: 1.7, fontSize: 14.5 }}>
                {FIRM.admissions.map((a) => <li key={a}>{a}</li>)}
                <li>Catholic Bar Association</li>
                <li>Italy-America Chamber of Commerce Southeast</li>
                <li>World Intellectual Property Organization (ADR Young)</li>
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
                Verify on FL Bar ↗
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
                Firm website ↗
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
          <h2 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 26, margin: "0 0 12px" }}>
            Scope of services &amp; fee
          </h2>
          <p style={{ fontSize: 15.5, lineHeight: 1.7, color: NAVY }}>
            The firm provides legal services under a written limited-scope
            engagement letter (Florida Bar Rule 4-1.2(c)) on a{" "}
            <strong>pro bono basis</strong> — there is no attorney fee, and
            neither the family nor {COMPANY.legalName} pays the firm for this
            work. The emergency app, professional translation, typing, and
            secure storage are also provided at no charge during the community
            crisis, so customers pay nothing and no card is required. This pro
            bono commitment is for a limited period; if a fee is ever
            introduced, customers will be notified in advance and nothing will
            be charged without a new signed fee agreement.
          </p>
          <p style={{ fontSize: 15.5, lineHeight: 1.7, color: NAVY, margin: 0 }}>
            Locating the detained person and mailing the completed packet by
            U.S. legal mail are part of the same pro bono limited-scope
            engagement, at no additional charge.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 980, margin: "0 auto", padding: "20px 20px 80px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 32, margin: "0 0 12px" }}>
          Ready for an attorney-reviewed packet?
        </h2>
        <p style={{ color: MUTED, marginBottom: 20 }}>
          Start the intake in your language. The retainer is signed before any legal work begins.
        </p>
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
          Begin my intake →
        </Link>
      </section>

      <LegalDisclaimerFooter />
    </div>
  );
}
