import { Link } from "@tanstack/react-router";
import { FIRM } from "@/lib/firm-info";

/**
 * Trust signal badge — "Every document reviewed by an independent licensed
 * attorney." Place on landing hero, checkout, intake completion screens.
 */
export function AttorneyReviewBadge({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Link
        to="/attorney"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 12px",
          borderRadius: 999,
          background: "rgba(107,79,79,0.12)",
          border: `1px solid ${FIRM.accentColor}`,
          color: FIRM.accentColor,
          fontSize: 12,
          fontWeight: 600,
          textDecoration: "none",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <span aria-hidden>⚖</span>
        Attorney-Reviewed by {FIRM.attorney}
      </Link>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "center",
        padding: "16px 18px",
        borderRadius: 12,
        background: "rgba(107,79,79,0.08)",
        border: `1px solid ${FIRM.accentColor}`,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 999,
          background: FIRM.accentColor,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          flexShrink: 0,
        }}
        aria-hidden
      >
        ⚖
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: FIRM.accentColor, fontWeight: 700, fontSize: 14 }}>
          Every document is reviewed by an independent licensed attorney
        </div>
        <div style={{ color: "#52525b", fontSize: 12, marginTop: 2 }}>
          Legal services provided by {FIRM.legalName} · {FIRM.attorney} ·{" "}
          <Link to="/attorney" style={{ color: FIRM.accentColor }}>
            Learn more
          </Link>
        </div>
      </div>
    </div>
  );
}
