import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "Checkout — DetencionDefensa.com" }],
  }),
  component: Checkout,
});

function Checkout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--paper, #f4efe6)",
        color: "var(--ink, #0e1a2b)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1.5rem",
        fontFamily: "'Inter Tight', sans-serif",
      }}
    >
      <div style={{ maxWidth: 520, textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.22em",
            fontSize: "0.78rem",
            textTransform: "uppercase",
            color: "var(--accent-deep, #8a3c11)",
            marginBottom: "1.2rem",
          }}
        >
          Checkout · Coming soon
        </div>
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 400,
            fontSize: "clamp(2rem, 5vw, 3.4rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: "1.5rem",
          }}
        >
          Plan de Defensa — <em style={{ fontStyle: "italic", color: "var(--accent-deep, #8a3c11)" }}>$199</em>{" "}
          + $10/mo
        </h1>
        <p
          style={{
            color: "var(--ink-soft, #1a2940)",
            lineHeight: 1.6,
            marginBottom: "2rem",
          }}
        >
          Payment is not yet wired up. This is a stub for the upcoming Stripe checkout.
        </p>
        <Link
          to="/"
          style={{
            display: "inline-block",
            background: "var(--ink, #0e1a2b)",
            color: "var(--paper, #f4efe6)",
            padding: "1rem 2rem",
            textDecoration: "none",
            fontSize: "0.9rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          ← Back to site
        </Link>
      </div>
    </div>
  );
}
