import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/coming-soon")({
  component: ComingSoonPage,
  head: () => ({
    meta: [
      { title: "Sentinel Trust Property Management Group — Coming Spring 2027" },
      {
        name: "description",
        content:
          "Sentinel Trust Property Management Group — licensed property management, rental, and sale services for foreign-owned U.S. real estate. Launching Spring 2027.",
      },
      { property: "og:title", content: "Sentinel Trust Property Management Group" },
      { property: "og:description", content: "Coming Spring 2027." },
    ],
  }),
});

function ComingSoonPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0e1a2b",
        color: "#f4efe6",
        fontFamily: "Inter Tight, system-ui, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ maxWidth: 640, textAlign: "center" }}>
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 11,
            letterSpacing: "0.2em",
            color: "#c9a961",
            marginBottom: 16,
          }}
        >
          SENTINEL TRUST — PROPERTY DIVISION
        </div>
        <h1
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 56,
            fontWeight: 500,
            margin: "0 0 16px",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          Defender Mi Casa
        </h1>
        <p
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 22,
            fontStyle: "italic",
            color: "#c9a961",
            margin: "0 0 28px",
          }}
        >
          Property management, rental, and sale services for foreign-owned U.S. real estate.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: "#e6e0d2", margin: "0 0 32px" }}>
          A licensed Arizona law firm partnership designed to manage, rent, and sell property
          on behalf of non-citizen owners — under attorney supervision, across borders.
        </p>
        <div
          style={{
            display: "inline-block",
            background: "#c9a961",
            color: "#0e1a2b",
            padding: "14px 28px",
            fontWeight: 700,
            borderRadius: 4,
            letterSpacing: "0.05em",
            fontSize: 14,
          }}
        >
          LAUNCHING SPRING 2027
        </div>
        <p style={{ marginTop: 40, fontSize: 13, color: "#8a9bb0" }}>
          For inquiries:{" "}
          <a href="mailto:intake@detenciondefensa.com" style={{ color: "#c9a961" }}>
            intake@detenciondefensa.com
          </a>
        </p>
      </div>
    </div>
  );
}
