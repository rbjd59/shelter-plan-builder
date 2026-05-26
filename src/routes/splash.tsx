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
      <AdminPinBox />
    </>
  );
}

function AdminPinBox() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === "0000") {
      window.location.href = "/login";
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <form
      onSubmit={submit}
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 1000,
        display: "flex",
        gap: 6,
        alignItems: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        border: `1px solid ${error ? "#ef4444" : "rgba(232,160,74,0.4)"}`,
        borderRadius: 10,
        padding: "8px 10px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <label style={{ color: "#e8a04a", fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>
        ADMIN PIN
      </label>
      <input
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="••••"
        maxLength={8}
        style={{
          width: 70,
          padding: "6px 8px",
          borderRadius: 6,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(0,0,0,0.4)",
          color: "#fff",
          fontSize: 14,
          fontFamily: "monospace",
          textAlign: "center",
          outline: "none",
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
    </form>
  );
}
