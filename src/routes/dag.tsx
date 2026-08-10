import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dag")({
  component: DagPage,
  head: () => ({
    meta: [
      { title: "DAG — Sentinel Readiness · Protect Your Family & Your Assets" },
      { name: "description", content: "Sentinel Readiness packet: 8 court-recognized documents translated side-by-side so your family is never unprepared. Included at no charge with the emergency app plan." },
      { property: "og:title", content: "DAG — Sentinel Readiness" },
      { property: "og:description", content: "Protect your family and your assets — 8 court-recognized documents, prepared in your language." },
    ],
  }),
});

const DOCS = [
  "Power of Attorney (POA) — UPOAA model",
  "Standby guardianship of your children",
  "HIPAA medical authorization",
  "School-pickup authorization",
  "Financial inventory (bank, debts, payments)",
  "Emergency contact tree",
  "Children's information sheet",
  "Important-document locator",
];

function DagPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        color: "#f4efe6",
        fontFamily: "'Inter', system-ui, sans-serif",
        padding: "3rem 1.25rem 5rem",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#c9a961",
            marginBottom: "0.6rem",
          }}
        >
          DAG · Various Plans Available
        </div>

        <h1
          style={{
            fontSize: "2.6rem",
            lineHeight: 1.05,
            fontWeight: 800,
            margin: "0 0 0.6rem",
            letterSpacing: "-0.01em",
          }}
        >
          Sentinel Readiness
        </h1>
        <p style={{ fontSize: "1.25rem", fontWeight: 500, margin: "0 0 1.4rem", color: "#e8dcc1" }}>
          Protect Your Family &amp; Your Assets
        </p>

        <div
          style={{
            display: "inline-block",
            background: "#c9a961",
            color: "#0f0f0f",
            padding: "0.6rem 1rem",
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.95rem",
            marginBottom: "1.8rem",
          }}
        >
          No charge · included with the emergency app plan
        </div>

        <p style={{ fontSize: "1.05rem", lineHeight: 1.6, margin: "0 0 1.5rem" }}>
          Do not leave your family unprepared. We gather the 8 court-recognized documents,
          translate them into English and your language side-by-side, YOU fill them out in
          your own words, we translate your words exactly. YOU print, sign, and notarize.
          Then: give the packet to your family now — OR load it into your
          encrypted vault and we only release it when you trigger NOTIFY FAMILY.
        </p>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "0 0 2rem",
            display: "grid",
            gap: "0.5rem",
          }}
        >
          {DOCS.map((d) => (
            <li
              key={d}
              style={{
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                padding: "0.8rem 1rem",
                fontSize: "0.98rem",
              }}
            >
              <span style={{ color: "#c9a961", marginRight: "0.6rem" }}>◆</span>
              {d}
            </li>
          ))}
        </ul>

        <Link
          to="/checkout"
          search={{ plan: "sentinel" } as never}
          style={{
            display: "inline-block",
            background: "#c9a961",
            color: "#0f0f0f",
            padding: "1rem 1.6rem",
            fontWeight: 800,
            textDecoration: "none",
            fontSize: "1.05rem",
            letterSpacing: "0.02em",
          }}
        >
          Add Sentinel Readiness — no charge →
        </Link>

        <p
          style={{
            fontSize: "0.78rem",
            color: "#9a9a9a",
            marginTop: "2rem",
            lineHeight: 1.5,
            borderTop: "1px solid #2a2a2a",
            paddingTop: "1rem",
          }}
        >
          Document preparation and translation only. NOT legal advice. Have an attorney in
          your state review POA and guardianship documents before signing.
        </p>

        <div style={{ marginTop: "2.5rem" }}>
          <Link to="/" style={{ color: "#c9a961", fontSize: "0.9rem" }}>
            ← Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
