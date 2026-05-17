import { useEffect, useState } from "react";

const PIN = "0000";
const COOKIE = "dd_dev_access";
const MAX_AGE = 60 * 60 * 24 * 90; // 90 days

function setUnlockedCookie() {
  try {
    const host = window.location.hostname;
    // Strip leading "www." so cookie is shared across www and apex
    const domain = host.startsWith("www.") ? host.slice(4) : host;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    const domainAttr = host === "localhost" ? "" : `; Domain=.${domain}`;
    document.cookie = `${COOKIE}=1; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}${domainAttr}`;
    localStorage.setItem(COOKIE, "1"); // belt-and-suspenders
  } catch {
    /* ignore */
  }
}

function hasUnlockedCookie(): boolean {
  try {
    if (document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE}=1`))) return true;
    return localStorage.getItem(COOKIE) === "1";
  } catch {
    return false;
  }
}

export function ComingSoonGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("dev") === PIN) {
        localStorage.setItem(STORAGE_KEY, "1");
        setUnlocked(true);
        return;
      }
      setUnlocked(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setUnlocked(false);
    }
  }, []);

  if (unlocked === null) return null;
  if (unlocked) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === PIN) {
      localStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
    } else {
      setError(true);
      setPin("");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a0a1a 0%, #141432 100%)",
        color: "#f5f0e0",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 14, letterSpacing: 3, color: "#c9a84c", marginBottom: 16 }}>
          DETENCIONDEFENSA.COM
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: "0 0 12px", lineHeight: 1.15 }}>
          Coming Soon
        </h1>
        <p style={{ fontSize: 15, opacity: 0.75, margin: "0 0 32px" }}>
          We're putting the final touches on our pre-detention defense plan.
          Check back soon.
        </p>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(false); }}
            placeholder="Access PIN"
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: `1px solid ${error ? "#e85d3a" : "rgba(255,255,255,0.15)"}`,
              background: "rgba(255,255,255,0.05)",
              color: "#f5f0e0",
              fontSize: 16,
              textAlign: "center",
              letterSpacing: 4,
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              border: "none",
              background: "#c9a84c",
              color: "#0a0a1a",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Enter
          </button>
          {error && (
            <div style={{ fontSize: 13, color: "#e85d3a" }}>Incorrect PIN</div>
          )}
        </form>
      </div>
    </div>
  );
}
