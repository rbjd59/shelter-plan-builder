export function BetaBanner() {
  return (
    <div
      style={{
        width: "100%",
        background: "#facc15",
        color: "#1a1a1a",
        padding: "8px 16px",
        textAlign: "center",
        fontSize: 13,
        fontFamily: "Inter Tight, system-ui, sans-serif",
        fontWeight: 500,
        lineHeight: 1.4,
        borderBottom: "1px solid rgba(0,0,0,0.15)",
      }}
    >
      <strong>Beta testing</strong> — check back for official launch. Use test card{" "}
      <code style={{ background: "rgba(0,0,0,0.1)", padding: "1px 6px", borderRadius: 3 }}>
        4242 4242 4242 4242
      </code>
      , any future expiry, any CVC. No real charges so we can test online.
    </div>
  );
}
