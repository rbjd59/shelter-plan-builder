import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SPLASH_HTML } from "@/lib/markup";
import { useLang, type Lang } from "@/context/LanguageContext";

export const Route = createFileRoute("/splash")({
  head: () => ({
    meta: [
      { title: "DetencionDefensa.com — Bienvenidos · Welcome · Byenvini" },
      {
        name: "description",
        content:
          "A pre-detention defense plan for immigrant working families. $199 + $10/mo from month 3. NOT a law firm.",
      },
    ],
  }),
  component: SplashPage,
});

const PIN = "5689";
const STORAGE_KEYS = {
  company: "pin:company-board",
  attorney: "pin:attorney-board",
} as const;

function SplashPage() {
  const ref = useRef<HTMLDivElement>(null);
  const { setLang } = useLang();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("splash-active");
    return () => document.body.classList.remove("splash-active");
  }, []);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      const tile = (e.target as HTMLElement).closest<HTMLAnchorElement>(".lang-tile");
      if (!tile) return;
      e.preventDefault();
      const lang = (tile.getAttribute("data-lang") as Lang) || "es";
      setLang(lang);
      navigate({ to: "/", search: { lang } as never });
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [navigate, setLang]);

  return (
    <>
      <div id="splash-view" ref={ref} dangerouslySetInnerHTML={{ __html: SPLASH_HTML }} />
      <AccessPinBox />
    </>
  );
}

function AccessPinBox() {
  const [role, setRole] = useState<"company" | "attorney">("company");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() !== PIN) {
      setError("Incorrect PIN.");
      setPin("");
      return;
    }
    try {
      sessionStorage.setItem(STORAGE_KEYS[role], PIN);
    } catch {
      /* ignore */
    }
    window.location.href = role === "company" ? "/company-board" : "/attorney-board";
  };

  const tabBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "6px 10px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    background: active ? "#e8a04a" : "transparent",
    color: active ? "#0b0b0e" : "#e8a04a",
  });

  return (
    <>
      <form
        onSubmit={submit}
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 1000,
          width: 260,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)",
          border: `1px solid ${error ? "#ef4444" : "rgba(232,160,74,0.4)"}`,
          borderRadius: 10,
          padding: 10,
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#e8a04a", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
            STAFF ACCESS
          </span>
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            aria-label="PIN help"
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: "1px solid rgba(232,160,74,0.6)",
              background: "transparent",
              color: "#e8a04a",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ?
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 4,
            padding: 3,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(232,160,74,0.25)",
            borderRadius: 8,
          }}
        >
          <button type="button" style={tabBtn(role === "company")} onClick={() => setRole("company")}>
            🏢 Company
          </button>
          <button type="button" style={tabBtn(role === "attorney")} onClick={() => setRole("attorney")}>
            ⚖️ Attorney
          </button>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              if (error) setError(null);
            }}
            placeholder="PIN"
            maxLength={8}
            style={{
              flex: 1,
              padding: "6px 8px",
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(0,0,0,0.4)",
              color: "#fff",
              fontSize: 14,
              fontFamily: "monospace",
              textAlign: "center",
              outline: "none",
              letterSpacing: 4,
            }}
          />
          <button
            type="submit"
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              background: "#e8a04a",
              color: "#0b0b0e",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Enter
          </button>
        </div>

        {error && (
          <div style={{ color: "#ef4444", fontSize: 11, textAlign: "center" }}>{error}</div>
        )}
      </form>

      {showHelp && <PinHelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
}

function PinHelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
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
        aria-labelledby="pin-help-title"
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#fff",
          borderRadius: 14,
          padding: 28,
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
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
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "none",
            background: "#f1efe9",
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 700,
            color: "#5b5b66",
          }}
        >
          ×
        </button>

        <h2
          id="pin-help-title"
          style={{
            margin: 0,
            fontFamily: "'Libre Baskerville', Georgia, serif",
            fontSize: 20,
            color: "#0f1b3d",
          }}
        >
          Where do I find the access PIN?
        </h2>

        <p style={{ marginTop: 10, fontSize: 14, lineHeight: 1.55, color: "#3a3a44" }}>
          The PIN gates the two internal staff dashboards. Pick the role that matches your job,
          enter the 4-digit PIN, and you'll be taken to the right board.
        </p>

        <div
          style={{
            marginTop: 14,
            border: "1px solid #e5e2db",
            borderRadius: 10,
            overflow: "hidden",
            fontSize: 13,
          }}
        >
          <div style={{ padding: "10px 14px", background: "#faf8f3", borderBottom: "1px solid #e5e2db" }}>
            <strong style={{ color: "#0f1b3d" }}>🏢 Company Admin Board</strong>
            <div style={{ color: "#5b5b66", marginTop: 2 }}>
              Live SOS alerts, activations, and client locate intake.
            </div>
          </div>
          <div style={{ padding: "10px 14px" }}>
            <strong style={{ color: "#0f1b3d" }}>⚖️ Attorney Board</strong>
            <div style={{ color: "#5b5b66", marginTop: 2 }}>
              Detained-client queue with location, warden info, and legal forms.
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            padding: 14,
            background: "#fff8ec",
            border: "1px solid #f3e1bf",
            borderRadius: 10,
            fontSize: 13,
            color: "#5a4615",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Current default PIN: 5689</div>
          The same PIN works for both roles during the launch phase.
        </div>

        <h3 style={{ marginTop: 18, marginBottom: 6, fontSize: 14, color: "#0f1b3d" }}>
          How to change the PIN
        </h3>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6, color: "#3a3a44" }}>
          <li>
            Open <code style={codeStyle}>src/lib/pin-access.functions.ts</code> and update the{" "}
            <code style={codeStyle}>PIN</code> constant.
          </li>
          <li>
            Also update the same constant in{" "}
            <code style={codeStyle}>src/routes/splash.tsx</code> (top of the file).
          </li>
          <li>Redeploy. All existing browser sessions will be asked for the new PIN.</li>
        </ol>

        <p style={{ marginTop: 14, fontSize: 12, color: "#7a7a84" }}>
          Lost the PIN? Contact the project owner — it is not recoverable from inside the app.
        </p>

        <button
          onClick={onClose}
          style={{
            marginTop: 18,
            width: "100%",
            padding: "10px 14px",
            background: "#0f1b3d",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

const codeStyle: React.CSSProperties = {
  background: "#f1efe9",
  padding: "1px 6px",
  borderRadius: 4,
  fontSize: 12,
  fontFamily: "ui-monospace, monospace",
};
