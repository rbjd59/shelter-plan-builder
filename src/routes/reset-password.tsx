import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/context/LanguageContext";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — DetencionDefensa.com" },
      { name: "description", content: "Choose a new password for your DetencionDefensa.com account." },
      { property: "og:title", content: "Set a new password — DetencionDefensa.com" },
      { property: "og:description", content: "Choose a new password for your DetencionDefensa.com account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

const COPY = {
  en: { title: "Set a new password", label: "New password (at least 8 characters)", again: "Type it again", save: "Save new password", wait: "Please wait…", mismatch: "The two passwords do not match.", done: "Your password is changed. You are signed in.", cont: "Continue →", noLink: "Open this page from the link in your email. If the link expired, go back and tap “Forgot your password?” again.", back: "← Back" },
  es: { title: "Cree una nueva contraseña", label: "Nueva contraseña (al menos 8 caracteres)", again: "Escríbala otra vez", save: "Guardar nueva contraseña", wait: "Espere…", mismatch: "Las dos contraseñas no coinciden.", done: "Su contraseña fue cambiada. Ya entró a su cuenta.", cont: "Continuar →", noLink: "Abra esta página desde el enlace de su correo. Si el enlace venció, regrese y toque “¿Olvidó su contraseña?” otra vez.", back: "← Volver" },
  ht: { title: "Chwazi yon nouvo modpas", label: "Nouvo modpas (omwen 8 karaktè)", again: "Ekri l ankò", save: "Sove nouvo modpas la", wait: "Tanpri ret tann…", mismatch: "De modpas yo pa menm.", done: "Modpas ou chanje. Ou konekte.", cont: "Kontinye →", noLink: "Louvri paj sa a nan lyen ki nan imèl ou. Si lyen an fini, tounen epi peze “Ou bliye modpas ou?” ankò.", back: "← Retounen" },
} as const;

function ResetPasswordPage() {
  const { lang } = useLang();
  const t = COPY[lang];
  const [ready, setReady] = useState(false);
  const [checked, setChecked] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data: s }) => { if (s.session) setReady(true); setTimeout(() => setChecked(true), 1500); });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pw !== pw2) { setError(t.mismatch); return; }
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (err) setError(err.message); else setDone(true);
  };

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <Link to="/" search={{ lang } as never} className="text-sm text-muted-foreground">{t.back}</Link>
      <h1 className="mt-4 mb-6 text-2xl font-semibold">{t.title}</h1>
      {done ? (
        <div className="space-y-4">
          <p role="status">{t.done}</p>
          <Link to="/" search={{ lang } as never} hash="assessment" className="inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground">{t.cont}</Link>
        </div>
      ) : !ready ? (
        checked ? <p>{t.noLink}</p> : <p>{t.wait}</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm">{t.label}
            <input type="password" autoComplete="new-password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" />
          </label>
          <label className="block text-sm">{t.again}
            <input type="password" autoComplete="new-password" required minLength={8} value={pw2} onChange={(e) => setPw2(e.target.value)} className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2" />
          </label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <button disabled={busy} className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground">{busy ? t.wait : t.save}</button>
        </form>
      )}
    </main>
  );
}
