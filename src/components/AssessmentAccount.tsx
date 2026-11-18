import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { signupDetails } from "@/lib/intake-signup";
import type { Lang } from "@/context/LanguageContext";

export type AccountDetails = { fullName: string; email: string; phone: string; smsConsent: boolean };

const COPY = {
  en: {
    signupTitle: "Create your account", signinTitle: "Sign in to your account",
    intro: "Use your email and password to come back and finish later.",
    name: "Your name", email: "Your sign-in email", phone: "Your phone number", password: "Password (at least 8 characters)",
    signup: "Create my account", signin: "Sign in", toSignin: "Already have an account? Sign in", toSignup: "Need an account? Create one",
    working: "Please wait…", confirm: "Check your email and tap the confirmation link. Then come here to continue.",
    signedIn: "Signed in as", signout: "Sign out", questions: "Answer the questions →", later: "I’ll answer later",
    sms: "Yes, send me one text if I leave my questions unfinished. Message and data rates may apply. Reply STOP to stop.",
    reminder: "We will send one reminder if you leave your questions unfinished.", saving: "Saving…",
    forgot: "Forgot your password?", resetSent: "If this email has an account, we sent a link to set a new password. Check your inbox and spam folder.", needEmail: "Type your email first.", exists: "You already have an account with this email. Sign in below, or tap “Forgot your password?”", badLogin: "That email and password do not match. Try again or tap “Forgot your password?”",
  },
  es: {
    signupTitle: "Cree su cuenta", signinTitle: "Entre a su cuenta",
    intro: "Use su correo y contraseña para volver y terminar más tarde.",
    name: "Su nombre", email: "Su correo para entrar", phone: "Su número de teléfono", password: "Contraseña (al menos 8 caracteres)",
    signup: "Crear mi cuenta", signin: "Entrar", toSignin: "¿Ya tiene cuenta? Entre aquí", toSignup: "¿No tiene cuenta? Cree una",
    working: "Espere…", confirm: "Revise su correo y toque el enlace para confirmar. Luego vuelva aquí para continuar.",
    signedIn: "Entró como", signout: "Salir", questions: "Responder las preguntas →", later: "Responderé más tarde",
    sms: "Sí, envíenme un texto si dejo las preguntas sin terminar. Pueden aplicar cargos. Responda STOP para dejar de recibirlos.",
    reminder: "Enviaremos un recordatorio si deja las preguntas sin terminar.", saving: "Guardando…",
    forgot: "¿Olvidó su contraseña?", resetSent: "Si este correo tiene cuenta, le enviamos un enlace para crear una nueva contraseña. Revise su correo y la carpeta de spam.", needEmail: "Escriba su correo primero.", exists: "Ya tiene una cuenta con este correo. Entre abajo o toque “¿Olvidó su contraseña?”", badLogin: "El correo y la contraseña no coinciden. Intente otra vez o toque “¿Olvidó su contraseña?”",
  },
  ht: {
    signupTitle: "Kreye kont ou", signinTitle: "Konekte nan kont ou",
    intro: "Sèvi ak imèl ak modpas ou pou tounen fini pita.",
    name: "Non ou", email: "Imèl ou pral sèvi pou konekte", phone: "Nimewo telefòn ou", password: "Modpas (omwen 8 karaktè)",
    signup: "Kreye kont mwen", signin: "Konekte", toSignin: "Ou gen yon kont deja? Konekte", toSignup: "Ou pa gen kont? Kreye youn",
    working: "Tanpri ret tann…", confirm: "Tcheke imèl ou epi peze lyen konfimasyon an. Apre sa, tounen isit la pou kontinye.",
    signedIn: "Ou konekte kòm", signout: "Dekonekte", questions: "Reponn kesyon yo →", later: "M ap reponn pita",
    sms: "Wi, voye yon mesaj ba mwen si m pa fini kesyon yo. Operatè a ka pran frè. Reponn STOP pou sispann.",
    reminder: "N ap voye yon rapèl si ou pa fini kesyon yo.", saving: "K ap sove…",
    forgot: "Ou bliye modpas ou?", resetSent: "Si imèl sa a gen yon kont, nou voye yon lyen pou chwazi yon nouvo modpas. Tcheke imèl ou ak dosye spam.", needEmail: "Ekri imèl ou anvan.", exists: "Ou gen yon kont deja ak imèl sa a. Konekte anba a, oswa peze “Ou bliye modpas ou?”", badLogin: "Imèl la ak modpas la pa mache ansanm. Eseye ankò oswa peze “Ou bliye modpas ou?”",
  },
} as const;

export default function AssessmentAccount({ lang, user, onUser, details, onDetails, onContinue, beforeSignOut, busy, error, notice, hasDraft }: {
  lang: Lang;
  user: User | null;
  onUser: (user: User | null) => void;
  details: AccountDetails;
  onDetails: (details: AccountDetails) => void;
  onContinue: (next: "questions" | "later") => Promise<void>;
  beforeSignOut: () => Promise<void>;
  busy: boolean;
  error: string;
  notice: string;
  hasDraft: boolean;
}) {
  const t = COPY[lang];
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const set = (key: keyof AccountDetails, value: string | boolean) => onDetails({ ...details, [key]: value });

  const authenticate = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthBusy(true); setAuthError(""); setAuthNotice("");
    try {
      if (mode === "signin") {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: details.email.trim(), password });
        if (signInError) { if (/invalid login/i.test(signInError.message)) { setAuthError(t.badLogin); return; } throw signInError; }
        onUser(data.user);
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: details.email.trim(), password,
          options: {
            emailRedirectTo: `${window.location.origin}/?lang=${lang}#assessment`,
            data: { intake_signup: signupDetails({
              full_name: details.fullName,
              client_email: details.email.trim(),
              client_mobile: details.phone,
              assessment_sms_consent: details.smsConsent,
            }) },
          },
        });
        if (signUpError) {
          if (/already registered|already exists/i.test(signUpError.message)) { setMode("signin"); setAuthError(t.exists); return; }
          throw signUpError;
        }
        if (data.session) onUser(data.user);
        else setAuthNotice(t.confirm);
      }
      setPassword("");
    } catch (cause) {
      setAuthError(cause instanceof Error ? cause.message : "Please check your information and try again.");
    } finally { setAuthBusy(false); }
  };

  const forgot = async () => {
    setAuthError(""); setAuthNotice("");
    const email = details.email.trim();
    if (!email) { setAuthError(t.needEmail); return; }
    setAuthBusy(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password?lang=${lang}` });
    setAuthBusy(false);
    if (resetError) setAuthError(resetError.message); else setAuthNotice(t.resetSent);
  };

  if (!user) return <>
    <h3 className="asmt-title">{mode === "signup" ? t.signupTitle : t.signinTitle}</h3>
    <p>{t.intro}</p>
    <form onSubmit={authenticate}>
      {mode === "signup" && <label className="asmt-contact-field">{t.name}<input autoComplete="name" required minLength={2} maxLength={120} value={details.fullName} onChange={(e) => set("fullName", e.target.value)} /></label>}
      <label className="asmt-contact-field">{t.email}<input type="email" autoComplete="email" required maxLength={200} value={details.email} onChange={(e) => set("email", e.target.value)} /></label>
      {mode === "signup" && <label className="asmt-contact-field">{t.phone}<input type="tel" autoComplete="tel" required minLength={5} maxLength={40} value={details.phone} onChange={(e) => set("phone", e.target.value)} /></label>}
      <label className="asmt-contact-field">{t.password}<input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={mode === "signup" ? 8 : 1} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      {mode === "signup" && <label className="asmt-agree"><input type="checkbox" checked={details.smsConsent} onChange={(e) => set("smsConsent", e.target.checked)} /><span>{t.sms}</span></label>}
      {mode === "signup" && <p>{t.reminder}</p>}
      {authError && <p className="asmt-err" role="alert">{authError}</p>}
      {authNotice && <p className="asmt-saved" role="status">{authNotice}</p>}
      <div className="asmt-entry-actions">
        <button className="asmt-go" disabled={authBusy}>{authBusy ? t.working : mode === "signup" ? t.signup : t.signin}</button>
        <button type="button" className="asmt-skip" onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setAuthError(""); setAuthNotice(""); }}>{mode === "signup" ? t.toSignin : t.toSignup}</button>
        {mode === "signin" && <button type="button" className="asmt-skip" disabled={authBusy} onClick={forgot}>{t.forgot}</button>}
      </div>
    </form>
  </>;

  return <>
    <h3 className="asmt-title">{hasDraft ? t.signinTitle : t.questions.replace(" →", "")}</h3>
    <p>{t.signedIn}: <b>{user.email}</b></p>
    <form onSubmit={(event) => {
      event.preventDefault();
      const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
      void onContinue(submitter?.value === "later" ? "later" : "questions");
    }}>
      <label className="asmt-contact-field">{t.name}<input autoComplete="name" required minLength={2} maxLength={120} value={details.fullName} onChange={(e) => set("fullName", e.target.value)} /></label>
      <label className="asmt-contact-field">{t.email}<input type="email" readOnly value={details.email || user.email || ""} onChange={(e) => set("email", e.target.value)} /></label>
      <label className="asmt-contact-field">{t.phone}<input type="tel" autoComplete="tel" required minLength={5} maxLength={40} value={details.phone} onChange={(e) => set("phone", e.target.value)} /></label>
      <label className="asmt-agree"><input type="checkbox" checked={details.smsConsent} onChange={(e) => set("smsConsent", e.target.checked)} /><span>{t.sms}</span></label>
      <p>{t.reminder}</p>
      {error && <p className="asmt-err" role="alert">{error}</p>}
      {notice && <p className="asmt-saved" role="status">{notice}</p>}
      <div className="asmt-entry-actions">
        <button className="asmt-go" value="questions" disabled={busy}>{busy ? t.saving : t.questions}</button>
        <button className="asmt-skip" value="later" disabled={busy}>{t.later}</button>
      </div>
    </form>
    <button type="button" className="asmt-signout" disabled={busy} onClick={async () => {
      setAuthError("");
      try { await beforeSignOut(); const { error: signOutError } = await supabase.auth.signOut(); if (signOutError) throw signOutError; onUser(null); }
      catch (cause) { setAuthError(cause instanceof Error ? cause.message : "Could not sign out."); }
    }}>{t.signout}</button>
    {authError && <p className="asmt-err" role="alert">{authError}</p>}
  </>;
}
