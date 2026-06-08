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
        alignItems: "center",
        justifyContent: "center",
        background: "#0b0b0b",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "1rem",
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: "100%",
          maxWidth: 360,
          background: "#171717",
          border: "1px solid #2a2a2a",
          borderRadius: 12,
          padding: "2rem 1.5rem",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>
          Enter PIN
        </h1>
        <p style={{ margin: "0.5rem 0 1.25rem", color: "#a1a1a1", fontSize: "0.9rem" }}>
          This page is private. Enter the PIN to continue.
        </p>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(false);
          }}
          placeholder="PIN"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "0.75rem 0.9rem",
            fontSize: "1rem",
            background: "#0b0b0b",
            color: "#fff",
            border: `1px solid ${error ? "#dc2626" : "#333"}`,
            borderRadius: 8,
            outline: "none",
          }}
        />
        {error && (
          <p style={{ color: "#dc2626", margin: "0.5rem 0 0", fontSize: "0.85rem" }}>
            Incorrect PIN.
          </p>
        )}
        <button
          type="submit"
          style={{
            marginTop: "1rem",
            width: "100%",
            padding: "0.75rem",
            fontSize: "1rem",
            fontWeight: 600,
            background: "#fff",
            color: "#0b0b0b",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Unlock
        </button>
      </form>
    </div>
  );
}
