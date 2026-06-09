export default function HeroIntro() {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
        color: "#fff",
        padding: "5rem 1rem 4rem",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            margin: "0 0 1rem",
            letterSpacing: -0.5,
          }}
        >
          Stop overpaying for legal help
        </h1>
        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            lineHeight: 1.55,
            maxWidth: 760,
            margin: "0 auto",
            opacity: 0.95,
          }}
        >
          Draft attorney-grade documents with AI and get expert legal guidance
          — all in one simple platform.
        </p>

      </div>
    </section>
  );
}
