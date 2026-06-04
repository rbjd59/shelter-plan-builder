import { createFileRoute, Link } from "@tanstack/react-router";
import { FIRM, COMPANY, PRICE } from "@/lib/firm-info";
import { LegalDisclaimerFooter } from "@/components/LegalDisclaimerFooter";

export const Route = createFileRoute("/attorney")({
  head: () => ({
    meta: [
      { title: `Independent Attorney — ${FIRM.attorney} | DetencionDefensa.com` },
      {
        name: "description",
        content: `${FIRM.attorney} of ${FIRM.legalName} provides independent attorney review of every habeas-corpus packet for DetencionDefensa.com customers. Florida-licensed. Limited-scope engagement.`,
      },
      { property: "og:title", content: `Attorney-Reviewed by ${FIRM.attorney}` },
      {
        property: "og:description",
        content: `Every habeas-corpus packet is reviewed by ${FIRM.attorney}, an independent Florida attorney, before it reaches your DetencionDefensa.com account.`,
      },
    ],
  }),
  component: AttorneyPage,
});

function AttorneyPage() {
  return (
    <div style={{ background: "#0b0b0e", color: "#e4e4e7", minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif" }}>
      <header style={{ borderBottom: `3px solid ${FIRM.accentColor}`, padding: "24px 20px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <Link to="/" style={{ color: "#e8a04a", fontWeight: 700, letterSpacing: 1, textDecoration: "none" }}>
            ← DetencionDefensa.com
          </Link>
          <span style={{ color: FIRM.accentColor, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
            Independent Legal Services
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px" }}>
        <p style={{ color: FIRM.accentColor, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>
          About the Reviewing Attorney
        </p>
        <h1 style={{ fontFamily: "Libre Baskerville, Georgia, serif", fontSize: 40, color: "#fff", margin: "8px 0 4px", lineHeight: 1.1 }}>
          {FIRM.attorney}
        </h1>
        <p style={{ color: "#a1a1aa", fontSize: 14, margin: 0 }}>
          {FIRM.legalName} · Florida Bar {FIRM.flBarNumber}
        </p>

        <section style={{
          marginTop: 32,
          padding: 20,
          background: "rgba(107,79,79,0.08)",
          border: `1px solid ${FIRM.accentColor}`,
          borderRadius: 12,
        }}>
          <h2 style={{ color: FIRM.accentColor, fontSize: 14, fontWeight: 700, letterSpacing: 1.5, margin: 0, textTransform: "uppercase" }}>
            Why this matters
          </h2>
          <p style={{ marginTop: 8, fontSize: 15, lineHeight: 1.65 }}>
            Every habeas-corpus packet generated from your intake answers is
            reviewed by {FIRM.attorney}, an independent Florida-licensed
            attorney, BEFORE it lands in your DetencionDefensa.com account.
            When NOTIFY FAMILY is triggered and the detained person is located,
            the attorney completes the AO 242 with the respondent, facility,
            federal detention number, and date of arrest, then mails the
            packet by U.S. legal mail to the person inside the facility.
          </p>
        </section>

        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontFamily: "Libre Baskerville, Georgia, serif", fontSize: 24, color: "#fff" }}>
            About the firm
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "#d4d4d8" }}>
            {FIRM.attorney} was born and raised in New York and studied at
            Stony Brook University as an undergraduate and graduate fellow,
            completing part of his studies in Italy in collaborations with
            professionals from the U.S. and the EU.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "#d4d4d8" }}>
            After law school he joined Cole, Scott &amp; Kissane — one of
            Florida's largest defense firms — working on the complex
            litigation team. He later expanded into maritime law, litigating
            in federal court against major international corporations. He
            handles cases at the intersection of commercial agreements,
            insurance contracts, and local, state, federal, and international
            regulation.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "#d4d4d8" }}>
            {FIRM.legalName} is a multilingual practice serving in English,
            Italian, and Spanish.
          </p>
        </section>

        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontFamily: "Libre Baskerville, Georgia, serif", fontSize: 24, color: "#fff" }}>
            Admissions &amp; Affiliations
          </h2>
          <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#d4d4d8" }}>
            {FIRM.admissions.map((a) => <li key={a}>{a}</li>)}
            <li>Catholic Bar Association</li>
            <li>Italy-America Chamber of Commerce Southeast</li>
            <li>World Intellectual Property Organization (ADR Young)</li>
          </ul>
        </section>

        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontFamily: "Libre Baskerville, Georgia, serif", fontSize: 24, color: "#fff" }}>
            Scope of services for DetencionDefensa customers
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "#d4d4d8" }}>
            The firm provides legal services to DetencionDefensa customers
            under a written limited-scope engagement letter (Florida Bar
            Rule 4-1.2(c)), at a flat attorney fee of <strong>{PRICE.firmUsd}</strong>{" "}
            per customer. The remaining <strong>{PRICE.companyUsd}</strong>{" "}
            paid to {COMPANY.legalName} covers software, translation, typing,
            and secure storage — those funds are not legal fees and are not
            paid to the firm.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "#d4d4d8" }}>
            The attorney fee is earned in full when the attorney completes
            review of the draft documents. Location of the detained person
            and final mailing of the completed packet are included at no
            additional charge.
          </p>
        </section>

        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontFamily: "Libre Baskerville, Georgia, serif", fontSize: 24, color: "#fff" }}>
            Contact the firm directly
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "#d4d4d8" }}>
            {FIRM.legalName}<br />
            {FIRM.address}<br />
            {FIRM.phone}<br />
            {FIRM.email}
          </p>
        </section>
      </main>

      <LegalDisclaimerFooter />
    </div>
  );
}
