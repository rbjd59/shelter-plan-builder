import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/context/LanguageContext";

type LoginSearch = { reason?: string; email?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): LoginSearch => ({
    reason: typeof s.reason === "string" ? s.reason : undefined,
    email: typeof s.email === "string" ? s.email : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — DetencionDefensa.com" },
      { name: "description", content: "Sign in to your DetencionDefensa.com account to manage your defense plan." },
      { property: "og:title", content: "Sign in — DetencionDefensa.com" },
      { property: "og:description", content: "Sign in to manage your DetencionDefensa.com defense plan." },
      { property: "og:url", content: "https://detenciondefensa.com/login" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://detenciondefensa.com/login" }],
  }),
  component: LoginPage,
});

const COPY = {
  en: {
    home: "← Home",
    adminTitle: "Admin access only",
    signInTitle: "Sign in",
    signedInAsPre: "You're signed in as",
    signedInAsPost: ", but that email is not on the admin whitelist.",
    yourAccount: "your account",
    adminVisibleTo: "The admin dashboard (traffic, signups, triggers) is only visible to:",
    signOutBtn: "Sign out and sign in as an admin",
    enterEmail: "Enter your email and we'll send a one-time sign-in link.",
    checkPre: "✓ Check",
    checkPost: "for your sign-in link.",
    emailLabel: "Email",
    placeholder: "you@example.com",
    sending: "Sending…",
    sendBtn: "Send sign-in link",
  },
  es: {
    home: "← Inicio",
    adminTitle: "Acceso solo para administradores",
    signInTitle: "Iniciar sesión",
    signedInAsPre: "Ha iniciado sesión como",
    signedInAsPost: ", pero ese correo no está en la lista de administradores.",
    yourAccount: "su cuenta",
    adminVisibleTo: "El panel de administrador (tráfico, registros, activaciones) solo es visible para:",
    signOutBtn: "Cerrar sesión e iniciar como administrador",
    enterEmail: "Ingrese su correo y le enviaremos un enlace de inicio de sesión único.",
    checkPre: "✓ Revise",
    checkPost: "para su enlace de inicio de sesión.",
    emailLabel: "Correo electrónico",
    placeholder: "usted@ejemplo.com",
    sending: "Enviando…",
    sendBtn: "Enviar enlace de inicio de sesión",
  },
  ht: {
    home: "← Akèy",
    adminTitle: "Aksè administratè sèlman",
    signInTitle: "Konekte",
    signedInAsPre: "Ou konekte kòm",
    signedInAsPost: ", men imèl sa a pa nan lis administratè yo.",
    yourAccount: "kont ou",
    adminVisibleTo: "Tablo administratè a (trafik, enskripsyon, deklanchman) sèlman vizib pou:",
    signOutBtn: "Dekonekte epi konekte kòm administratè",
    enterEmail: "Antre imèl ou epi n ap voye yon lyen koneksyon inik.",
    checkPre: "✓ Tcheke",
    checkPost: "pou lyen koneksyon ou.",
    emailLabel: "Imèl",
    placeholder: "ou@egzanp.com",
    sending: "N ap voye…",
    sendBtn: "Voye lyen koneksyon",
  },
} as const;

function LoginPage() {
  const navigate = useNavigate();
  const { reason, email: blockedEmail } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const { lang } = useLang();
  const t = COPY[lang];

  useEffect(() => {
    if (reason === "not-admin") return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate, reason]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrMsg("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setErrMsg(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  };

  const signOutAndRetry = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login", search: {} });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#f6efe1", fontFamily: "Inter Tight, system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 460, width: "100%", background: "#1a2436", padding: 32, borderRadius: 8 }}>
        <Link to="/" search={{ lang: "es" } as never} style={{ color: "#e8a04a", fontSize: 13, textDecoration: "none" }}>{t.home}</Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 16, marginBottom: 8, fontFamily: "Fraunces, serif" }}>
          {reason === "not-admin" ? t.adminTitle : t.signInTitle}
        </h1>

        {reason === "not-admin" ? (
          <div>
            <p style={{ fontSize: 14, color: "#a8a59a", marginBottom: 16 }}>
              {t.signedInAsPre} <strong style={{ color: "#f6efe1" }}>{blockedEmail || t.yourAccount}</strong>{t.signedInAsPost}
            </p>
            <p style={{ fontSize: 14, color: "#a8a59a", marginBottom: 20, lineHeight: 1.5 }}>
              {t.adminVisibleTo}
              <br />njbittelman@gmail.com
              <br />nowmaxis@gmail.com
              <br />benievasquez@gmail.com
              <br />rbjd59@gmail.com
            </p>
            <button onClick={signOutAndRetry} style={{ width: "100%", background: "#e8a04a", color: "#0b1220", border: "none", padding: "12px 16px", fontSize: 15, fontWeight: 700, borderRadius: 4, cursor: "pointer" }}>
              {t.signOutBtn}
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 14, color: "#a8a59a", marginBottom: 24 }}>
              {t.enterEmail}
            </p>
            {status === "sent" ? (
              <div style={{ background: "#0d2417", borderLeft: "3px solid #2d6a4f", padding: 14, borderRadius: 4, fontSize: 14 }}>
                {t.checkPre} <strong>{email}</strong> {t.checkPost}
              </div>
            ) : (
              <form onSubmit={onSubmit}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t.emailLabel}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.placeholder}
                  style={{ width: "100%", padding: "12px 14px", fontSize: 15, border: "1px solid #3a4458", borderRadius: 4, background: "#0b1220", color: "#f6efe1", marginBottom: 16, fontFamily: "inherit" }}
                />
                <button type="submit" disabled={status === "sending"} style={{ width: "100%", background: "#e8a04a", color: "#0b1220", border: "none", padding: "12px 16px", fontSize: 15, fontWeight: 700, borderRadius: 4, cursor: "pointer" }}>
                  {status === "sending" ? t.sending : t.sendBtn}
                </button>
                {errMsg && <p style={{ color: "#ff8080", fontSize: 13, marginTop: 12 }}>{errMsg}</p>}
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
