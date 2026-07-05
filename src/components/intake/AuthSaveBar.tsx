import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type Lang = "en" | "es" | "ht";
type Mode = "signin" | "signup";

const T: Record<Lang, Record<string, string>> = {
  en: {
    savePrompt: "Save your progress",
    saveBody: "Create an account or sign in with your email. You can come back anytime to finish these questions.",
    signedInAs: "Signed in as",
    signOut: "Sign out",
    email: "Email",
    password: "Password (min 8 characters)",
    signIn: "Sign in",
    signUp: "Create account",
    switchToSignIn: "Already have an account? Sign in",
    switchToSignUp: "No account yet? Create one",
    saving: "Working…",
    savedNotice: "Your answers save automatically to your account.",
    guestNotice: "Answers are only saved on this device until you sign in.",
    err: "Something went wrong. Check your email and password.",
  },
  es: {
    savePrompt: "Guarde su progreso",
    saveBody: "Cree una cuenta o inicie sesión con su correo. Puede volver en cualquier momento para terminar estas preguntas.",
    signedInAs: "Conectado como",
    signOut: "Cerrar sesión",
    email: "Correo electrónico",
    password: "Contraseña (mínimo 8 caracteres)",
    signIn: "Iniciar sesión",
    signUp: "Crear cuenta",
    switchToSignIn: "¿Ya tiene cuenta? Inicie sesión",
    switchToSignUp: "¿No tiene cuenta? Cree una",
    saving: "Procesando…",
    savedNotice: "Sus respuestas se guardan automáticamente en su cuenta.",
    guestNotice: "Sus respuestas solo se guardan en este dispositivo hasta que inicie sesión.",
    err: "Algo salió mal. Verifique su correo y contraseña.",
  },
  ht: {
    savePrompt: "Sove pwogrè ou",
    saveBody: "Kreye yon kont oswa konekte ak imèl ou. Ou ka tounen nenpòt lè pou fini kesyon sa yo.",
    signedInAs: "Konekte kòm",
    signOut: "Dekonekte",
    email: "Imèl",
    password: "Modpas (minimòm 8 karaktè)",
    signIn: "Konekte",
    signUp: "Kreye kont",
    switchToSignIn: "Ou gen deja yon kont? Konekte",
    switchToSignUp: "Ou pa gen kont? Kreye youn",
    saving: "K ap trete…",
    savedNotice: "Repons ou yo sove otomatikman nan kont ou.",
    guestNotice: "Repons yo sèlman sove sou aparèy sa a jiskaske ou konekte.",
    err: "Yon bagay pa mache. Tcheke imèl ak modpas ou.",
  },
};

export function AuthSaveBar({
  lang,
  user,
  onAuthChange,
}: {
  lang: Lang;
  user: User | null;
  onAuthChange: (user: User | null) => void;
}) {
  const t = T[lang];
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleSignIn = async () => {
    setBusy(true);
    setErr(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      onAuthChange(data.user);
      setPassword("");
      setExpanded(false);
    } catch (e) {
      setErr((e as Error).message || t.err);
    } finally {
      setBusy(false);
    }
  };

  const handleSignUp = async () => {
    setBusy(true);
    setErr(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: typeof window !== "undefined" ? window.location.href : undefined },
      });
      if (error) throw error;
      // If email confirmation is on, user may be null; sign them in immediately.
      if (!data.session) {
        const { data: s, error: e2 } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (e2) throw e2;
        onAuthChange(s.user);
      } else {
        onAuthChange(data.user);
      }
      setPassword("");
      setExpanded(false);
    } catch (e) {
      setErr((e as Error).message || t.err);
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onAuthChange(null);
  };

  const boxStyle: React.CSSProperties = {
    background: "#0f1a2b",
    border: "1px solid #2d6a4f",
    borderRadius: 6,
    padding: 16,
    marginBottom: 20,
  };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    fontSize: 15,
    border: "1px solid #3a4458",
    borderRadius: 3,
    background: "#0b1220",
    color: "#f6efe1",
    marginBottom: 8,
  };
  const btnPrimary: React.CSSProperties = {
    background: "#e8a04a",
    color: "#0b1220",
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 700,
    border: "none",
    borderRadius: 4,
    cursor: busy ? "not-allowed" : "pointer",
    opacity: busy ? 0.7 : 1,
  };
  const btnGhost: React.CSSProperties = {
    background: "transparent",
    color: "#a8a59a",
    border: "1px solid #3a4458",
    padding: "8px 14px",
    fontSize: 13,
    borderRadius: 4,
    cursor: "pointer",
  };

  if (user) {
    return (
      <div style={boxStyle}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 14, color: "#7fd9a8" }}>
            ✓ {t.savedNotice}
            <div style={{ color: "#a8a59a", fontSize: 12, marginTop: 4 }}>
              {t.signedInAs} <strong style={{ color: "#fff5d6" }}>{user.email}</strong>
            </div>
          </div>
          <button type="button" onClick={handleSignOut} style={btnGhost}>
            {t.signOut}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={boxStyle}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 320px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff5d6", marginBottom: 4 }}>💾 {t.savePrompt}</div>
          <div style={{ fontSize: 13, color: "#cfc8b8" }}>{t.saveBody}</div>
        </div>
        {!expanded && (
          <button type="button" onClick={() => setExpanded(true)} style={btnPrimary}>
            {t.signIn} / {t.signUp}
          </button>
        )}
      </div>

      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #2d3548" }}>
          <input
            type="email"
            autoComplete="email"
            placeholder={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          {err && <div style={{ color: "#ff8080", fontSize: 13, marginBottom: 8 }}>{err}</div>}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              onClick={mode === "signin" ? handleSignIn : handleSignUp}
              disabled={busy || !email || password.length < 8}
              style={btnPrimary}
            >
              {busy ? t.saving : mode === "signin" ? t.signIn : t.signUp}
            </button>
            <button
              type="button"
              onClick={() => {
                setErr(null);
                setMode(mode === "signin" ? "signup" : "signin");
              }}
              style={{ background: "transparent", border: 0, color: "#e8a04a", fontSize: 13, cursor: "pointer" }}
            >
              {mode === "signin" ? t.switchToSignUp : t.switchToSignIn}
            </button>
          </div>
          <div style={{ fontSize: 12, color: "#a8a59a", marginTop: 10 }}>{t.guestNotice}</div>
        </div>
      )}
    </div>
  );
}
