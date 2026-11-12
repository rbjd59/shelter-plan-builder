import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { signupDetails, type IntakeSignupAnswers } from "@/lib/intake-signup";
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
    guestNotice: "Sign in to save your answers to your account.",
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
    guestNotice: "Inicie sesión para guardar sus respuestas en su cuenta.",
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
    guestNotice: "Konekte pou sove repons ou yo nan kont ou.",
    err: "Yon bagay pa mache. Tcheke imèl ak modpas ou.",
  },
};

export function AuthSaveBar({ lang, user, onAuthChange, answers, onChange, beforeSignOut }: {
  lang: Lang; user: User | null; onAuthChange: (user: User | null) => void;
  answers: IntakeSignupAnswers; onChange: (key: string, value: string) => void;
  beforeSignOut: () => Promise<void>;
}) {
  const t = T[lang];
  const [mode, setMode] = useState<Mode>("signup");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const text = (en: string, es: string, ht: string) => lang === "es" ? es : lang === "ht" ? ht : en;
  const fields = [
    { key: "full_name", label: text("Your full name", "Su nombre completo", "Non konplè ou"), type: "text", auto: "name" },
    { key: "client_email", label: t.email, type: "email", auto: "email" },
    { key: "client_mobile", label: text("Your phone number", "Su número de teléfono", "Nimewo telefòn ou"), type: "tel", auto: "tel" },
  ];
  const authenticate = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setErr(null); setNotice("");
    const email = String(answers.client_email || "").trim();
    try {
      if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthChange(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password, options: {
          emailRedirectTo: window.location.href,
          data: { intake_signup: signupDetails(answers) },
        } });
        if (error) throw error;
        if (data.session) onAuthChange(data.user);
        else setNotice(text("Check your email to confirm your account, then sign in to continue.", "Confirme su cuenta por correo y luego inicie sesión para continuar.", "Konfime kont ou nan imèl ou, epi konekte pou kontinye."));
      }
      setPassword("");
    } catch (error) { setErr((error as Error).message || t.err); }
    finally { setBusy(false); }
  };
  return <section className="intake-stage-band">
    <h2 className="mb-3 text-xl font-bold">{t.savePrompt}</h2>
    <p className="mb-5 text-sm">{t.saveBody}</p>
    <form onSubmit={authenticate} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(f => <label key={f.key} className="block text-sm font-semibold">{f.label}
          <input className="intake-stage-input mt-2" type={f.type} autoComplete={f.auto} required value={String(answers[f.key] || "")} onChange={e => onChange(f.key, e.target.value)} />
        </label>)}
        {!user && <label className="block text-sm font-semibold">{t.password}
          <input className="intake-stage-input mt-2" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={mode === "signup" ? 8 : 1} value={password} onChange={e => setPassword(e.target.value)} />
        </label>}
      </div>
      {err && <p role="alert">{err}</p>}
      {notice && <p role="status">{notice}</p>}
      {user ? <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">{t.signedInAs}: {user.email}</p>
        <Button type="button" variant="outline" disabled={busy} onClick={async () => {
          setBusy(true); setErr(null);
          try { await beforeSignOut(); const { error } = await supabase.auth.signOut(); if (error) throw error; onAuthChange(null); }
          catch (error) { setErr((error as Error).message); } finally { setBusy(false); }
        }}>{t.signOut}</Button>
      </div> : <div className="flex flex-wrap gap-3">
        <Button className="intake-stage-primary" type="submit" disabled={busy || answers.intake_terms_accepted !== true}>{busy ? t.saving : mode === "signin" ? t.signIn : t.signUp}</Button>
        <Button variant="ghost" type="button" onClick={() => { setErr(null); setMode(mode === "signin" ? "signup" : "signin"); }}>{mode === "signin" ? t.switchToSignUp : t.switchToSignIn}</Button>
      </div>}
      <p className="text-xs">{user ? text("Your work is saved to your account when you continue.", "Su trabajo se guarda en su cuenta al continuar.", "Travay ou sove nan kont ou lè ou kontinye.") : t.guestNotice}</p>
    </form>
  </section>;
}
