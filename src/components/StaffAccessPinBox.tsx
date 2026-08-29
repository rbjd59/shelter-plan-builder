import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

const PIN = "5688";
// Must match SHARED_KEY in PinAccessGate so the boards don't ask again.
const SHARED_KEY = "dd_pin_ok";

/**
 * Renders a single tile-styled button that opens a modal containing the
 * role toggle, PIN entry, and help text. No floating overlay.
 */
export default function StaffAccessTile() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          background: "rgba(232,160,74,0.12)",
          border: "1px solid rgba(232,160,74,0.5)",
          borderRadius: 8,
          color: "#e8a04a",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 0.8,
          cursor: "pointer",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        🔒 Staff Access — Company / Attorney (PIN)
      </button>

      {open && <PinModal onClose={() => setOpen(false)} />}
    </>
  );
}

function PinModal({ onClose }: { onClose: () => void }) {
  const [role, setRole] = useState<"company" | "attorney">("company");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() !== PIN) {
      setError("Incorrect PIN.");
      setPin("");
      return;
    }
    try {
      sessionStorage.setItem(SHARED_KEY, PIN);
      localStorage.setItem(SHARED_KEY, PIN);
    } catch {
      /* ignore */
    }
    // Client-side navigation keeps us on the current origin. A full page load
    // can be bounced by the domain redirect to another host, where the
    // session unlock would be lost and the board would ask again.
    navigate({ to: role === "company" ? "/company-board" : "/attorney-board" });
    onClose();
  };

  const tabBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.5,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    background: active ? "#e8a04a" : "transparent",
    color: active ? "#0b0b0e" : "#e8a04a",
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="staff-pin-title"
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#fff",
          borderRadius: 14,
          padding: 26,
          boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
          position: "relative",
          color: "#1a1a1a",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: "none",
            background: "#f1efe9",
            cursor: "pointer",
            fontSize: 18,
            fontWeight: 700,
            color: "#5b5b66",
          }}
        >
          ×
        </button>

        <h2
          id="staff-pin-title"
          style={{
            margin: 0,
            fontFamily: "'Libre Baskerville', Georgia, serif",
            fontSize: 20,
            color: "#0f1b3d",
          }}
        >
          Staff Access
        </h2>
        <p style={{ marginTop: 6, marginBottom: 16, fontSize: 13, color: "#5b5b66" }}>
          Choose your role and enter the staff PIN.
        </p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              display: "flex",
              gap: 6,
              padding: 4,
              background: "#0f1b3d",
              borderRadius: 10,
            }}
          >
            <button
              type="button"
              style={tabBtn(role === "company")}
              onClick={() => setRole("company")}
            >
              🏢 Company
            </button>
            <button
              type="button"
              style={tabBtn(role === "attorney")}
              onClick={() => setRole("attorney")}
            >
              ⚖️ Attorney
            </button>
          </div>

          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            autoFocus
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              if (error) setError(null);
            }}
            placeholder="• • • •"
            maxLength={8}
            style={{
              padding: "12px 14px",
              borderRadius: 8,
              border: `1px solid ${error ? "#c0392b" : "#d9d6cd"}`,
              background: "#fafaf7",
              color: "#0f1b3d",
              fontSize: 20,
              fontFamily: "monospace",
              textAlign: "center",
              letterSpacing: 8,
              outline: "none",
            }}
          />

          {error && (
            <div style={{ color: "#c0392b", fontSize: 13, textAlign: "center" }}>{error}</div>
          )}

          <button
            type="submit"
            style={{
              padding: "12px",
              borderRadius: 8,
              border: "none",
              background: "#e8a04a",
              color: "#0b0b0e",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Enter →
          </button>

          <button
            type="button"
            onClick={() => setShowHelp((v) => !v)}
            style={{
              background: "transparent",
              border: "none",
              color: "#5b5b66",
              fontSize: 12,
              cursor: "pointer",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            {showHelp ? "Hide help" : "Where do I find or change the PIN?"}
          </button>

          {showHelp && (
            <div
              style={{
                padding: 14,
                background: "#fff8ec",
                border: "1px solid #f3e1bf",
                borderRadius: 10,
                fontSize: 12.5,
                color: "#5a4615",
                lineHeight: 1.55,
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Current default PIN: 5688</div>
              The same PIN works for both Company and Attorney roles. To change it, update the{" "}
              <code style={codeStyle}>PIN</code> constant in{" "}
              <code style={codeStyle}>src/components/StaffAccessPinBox.tsx</code> and in{" "}
              <code style={codeStyle}>src/lib/pin-access.functions.ts</code>, then redeploy. Lost
              the PIN? Contact the project owner — it is not recoverable from inside the app.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

const codeStyle: React.CSSProperties = {
  background: "#f1efe9",
  padding: "1px 6px",
  borderRadius: 4,
  fontSize: 11,
  fontFamily: "ui-monospace, monospace",
};
