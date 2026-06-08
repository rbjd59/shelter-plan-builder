import { useEffect, useState, type ReactNode } from "react";

const PIN = "0000";
const STORAGE_KEY = "dd_pin_ok";

export default function PinGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  if (!ready) return null;
  if (unlocked) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === PIN) {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      setUnlocked(true);
    } else {
      setError(true);
      setValue("");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f7f6f3",
        color: "#0b0b0e",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Top brand bar */}
      <header
        style={{
          borderBottom: "1px solid #e5e2db",
          background: "#fff",
          padding: "14px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            aria-hidden
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: "#0f1b3d",
              color: "#e8a04a",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              fontFamily: "'Libre Baskerville', Georgia, serif",
              fontSize: 16,
            }}
          >
            D
          </div>
          <span
            style={{
              fontFamily: "'Libre Baskerville', Georgia, serif",
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: 0.2,
              color: "#0f1b3d",
            }}
          >
            DetencionDefensa<span style={{ color: "#e8a04a" }}>.com</span>
          </span>
        </div>
      </header>

      {/* Card */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        <form
          onSubmit={submit}
          style={{
            width: "100%",
            maxWidth: 440,
            background: "#fff",
            border: "1px solid #e5e2db",
            borderRadius: 14,
            padding: "36px 32px 32px",
            boxShadow: "0 8px 28px rgba(15,27,61,0.08)",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 10px",
              borderRadius: 999,
              background: "#fdf3e3",
              color: "#a06a1d",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 18,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "#e8a04a",
              }}
            />
            Secure Access
          </div>

          <h1
            style={{
              margin: 0,
              fontFamily: "'Libre Baskerville', Georgia, serif",
              fontSize: 26,
              lineHeight: 1.2,
              fontWeight: 700,
              color: "#0f1b3d",
              letterSpacing: -0.2,
            }}
          >
            Private Preview
          </h1>
          <p
            style={{
              margin: "10px 0 24px",
              color: "#5b5b66",
              fontSize: 14.5,
              lineHeight: 1.55,
            }}
          >
            This page is restricted to invited reviewers. Enter your access
            PIN to continue.
          </p>

          <label
            htmlFor="pin"
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "#0f1b3d",
              letterSpacing: 0.4,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Access PIN
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(false);
            }}
            placeholder="• • • •"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "12px 14px",
              fontSize: 16,
              letterSpacing: 4,
              background: "#fafaf7",
              color: "#0b0b0e",
              border: `1px solid ${error ? "#c0392b" : "#d9d6cd"}`,
              borderRadius: 8,
              outline: "none",
              transition: "border-color .15s, box-shadow .15s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = error ? "#c0392b" : "#e8a04a";
              e.currentTarget.style.boxShadow = `0 0 0 3px ${
                error ? "rgba(192,57,43,.12)" : "rgba(232,160,74,.18)"
              }`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = error ? "#c0392b" : "#d9d6cd";
            }}
          />
          {error && (
            <p
              style={{
                color: "#c0392b",
                margin: "8px 0 0",
                fontSize: 13,
              }}
            >
              That PIN doesn’t match our records. Please try again.
            </p>
          )}

          <button
            type="submit"
            style={{
              marginTop: 20,
              width: "100%",
              padding: "13px 16px",
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 0.3,
              background: "#0f1b3d",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              transition: "background .15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#1a2a55")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#0f1b3d")}
          >
            Continue →
          </button>

          <div
            style={{
              marginTop: 22,
              paddingTop: 18,
              borderTop: "1px solid #eeece5",
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#71717a",
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#e8a04a"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Your session is encrypted. Access is logged for security purposes.
          </div>
        </form>
      </main>

      <footer
        style={{
          padding: "18px 20px 28px",
          textAlign: "center",
          color: "#8a8a93",
          fontSize: 11.5,
          lineHeight: 1.6,
        }}
      >
        © {new Date().getFullYear()} DetencionDefensa.com · This site is not a
        law firm and does not provide legal advice.
      </footer>
    </div>
  );
}
