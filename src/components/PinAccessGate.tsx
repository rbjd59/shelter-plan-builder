import { useEffect, useState, type ReactNode } from "react";
import { STAFF_PIN as PIN, rememberStaffPin, readStaffPin } from "@/lib/staff-pin";

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
      // 1) Already unlocked on this device (session, local, or cookie).
      const saved = readStaffPin();
      if (saved === PIN) {
        setPin(saved);
        onPin?.(saved);
        return;
      }
      // 2) PIN passed in the URL (?pin=5688) — survives cross-domain hops.
      const fromUrl = new URL(window.location.href).searchParams.get("pin");
      const normalizedUrlPin = fromUrl?.trim().replace(/^"|"$/g, "");
      if (normalizedUrlPin === PIN) {
        const persisted = rememberStaffPin(PIN);
        setPin(PIN);
        onPin?.(PIN);
        // Only scrub the PIN from the address bar once it is safely stored
        // somewhere. If nothing could be stored, keeping it in the URL is what
        // stops the next page from asking again.
        if (persisted) {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete("pin");
          window.history.replaceState(window.history.state, "", `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`);
        }
      }
    } catch { /* ignore */ }
  }, [onPin]);

  if (pin) return <>{children(pin)}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() === PIN) {
      rememberStaffPin(PIN);
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
