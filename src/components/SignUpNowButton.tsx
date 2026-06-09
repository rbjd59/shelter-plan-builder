import { Link, useRouterState } from "@tanstack/react-router";
import { useLang } from "@/context/LanguageContext";

const LABELS = { es: "Regístrese ahora", en: "Sign Up Now", ht: "Enskri Kounye a" };

const HIDDEN_PREFIXES = [
  "/admin",
  "/_admin",
  "/firm",
  "/api/",
  "/lovable/",
  "/email/",
  "/auth",
  "/login",
  "/terms",
  "/intake",
  "/checkout",
  "/app",
  "/coming-soon",
];

/**
 * Global floating "Sign Up Now" button — appears on every public-facing page
 * and routes to /terms (where the user must scroll + check, then continue to
 * the AO 242 questions at /intake).
 */
export default function SignUpNowButton() {
  const { lang } = useLang();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname === p.replace(/\/$/, ""))) {
    return null;
  }

  return (
    <Link
      to="/terms"
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 60,
        background: "#e8a04a",
        color: "#0f1830",
        textDecoration: "none",
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "10px 18px",
        borderRadius: 999,
        boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
        fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif",
      }}
    >
      {LABELS[lang]} →
    </Link>
  );
}
