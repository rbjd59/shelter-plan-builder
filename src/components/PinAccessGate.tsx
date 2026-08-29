import { useEffect, useState, type ReactNode } from "react";

const PIN = "5688";
// Single shared unlock key: one PIN entry unlocks both staff boards for the session.
const SHARED_KEY = "dd_pin_ok";

export default function PinAccessGate({
  storageKey: _storageKey,
  title,
  children,
  onPin,
}: {
  storageKey?: string;
  title: string;
  children: (pin: string) => ReactNode;
  onPin?: (pin: string) => void;
}) {
  const [pin, setPin] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      // 1) PIN passed in the URL (?pin=5688) — survives cross-domain hops.
      const fromUrl = new URL(window.location.href).searchParams.get("pin");
      if (fromUrl && fromUrl.trim() === PIN) {
        try {
          sessionStorage.setItem(SHARED_KEY, PIN);
          localStorage.setItem(SHARED_KEY, PIN);
        } catch { /* ignore */ }
        setPin(PIN);
        onPin?.(PIN);
        // Do not leave the staff PIN visible in the address bar/history after
        // it has been safely persisted on the destination domain.
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete("pin");
        window.history.replaceState(window.history.state, "", `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
        return;
      }
      // 2) Previously unlocked in this session / on this device.
      const saved = sessionStorage.getItem(SHARED_KEY) ?? localStorage.getItem(SHARED_KEY);
      if (saved === PIN) {
        setPin(saved);
        onPin?.(saved);
      }
    } catch { /* ignore */ }
  }, [onPin]);

  if (pin) return <>{children(pin)}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() === PIN) {
      try {
        sessionStorage.setItem(SHARED_KEY, PIN);
        localStorage.setItem(SHARED_KEY, PIN);
      } catch { /* ignore */ }
      setPin(PIN);
      onPin?.(PIN);
    } else {
      setError(true);
      setValue("");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f7f6f3", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "Inter, system-ui, sans-serif" }}>
      <form onSubmit={submit} style={{ width: "100%", maxWidth: 420, background: "#fff", border: "1px solid #e5e2db", borderRadius: 14, padding: 32, boxShadow: "0 8px 28px rgba(15,27,61,0.08)" }}>
        <h1 style={{ margin: 0, fontFamily: "'Libre Baskerville', Georgia, serif", fontSize: 22, color: "#0f1b3d" }}>{title}</h1>
        <p style={{ marginTop: 8, marginBottom: 20, fontSize: 13, color: "#5b5b66" }}>Enter your access PIN to continue.</p>
        <input
          type="password" inputMode="numeric" autoFocus
          value={value} onChange={(e) => { setValue(e.target.value); if (error) setError(false); }}
          placeholder="• • • •" maxLength={8}
          style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", fontSize: 18, letterSpacing: 6, textAlign: "center", border: `1px solid ${error ? "#c0392b" : "#d9d6cd"}`, borderRadius: 8, background: "#fafaf7", outline: "none" }}
        />
        {error && <p style={{ color: "#c0392b", margin: "8px 0 0", fontSize: 13 }}>Incorrect PIN.</p>}
        <button type="submit" style={{ marginTop: 16, width: "100%", padding: "12px", fontSize: 15, fontWeight: 700, background: "#0f1b3d", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
          Continue →
        </button>
      </form>
    </div>
  );
}
