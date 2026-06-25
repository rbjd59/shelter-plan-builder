import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/configurar")({
  head: () => ({
    meta: [
      { title: "Configura Mi App — DetencionDefensa.com" },
      { name: "description", content: "Configura tu app de emergencia antes de instalarla. Agrega contactos, mascotas, documentos y tu PIN — todo se carga automáticamente en la app." },
      { property: "og:title", content: "Configura Mi App — DetencionDefensa.com" },
      { property: "og:description", content: "Configura todo en la web antes de instalar la app de emergencia. Más fácil para familias hispanohablantes." },
      { property: "og:url", content: "https://detenciondefensa.com/configurar" },
    ],
    links: [{ rel: "canonical", href: "https://detenciondefensa.com/configurar" }],
  }),
  component: ConfigurarPage,
});

function ConfigurarPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/mi-app" });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrMsg("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=mi-app`,
        shouldCreateUser: true,
      },
    });
    if (error) {
      setErrMsg(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#f6efe1", fontFamily: "Inter Tight, system-ui, sans-serif" }}>
      <header style={{ padding: "16px 24px", borderBottom: "1px solid #1a2436" }}>
        <Link to="/" style={{ color: "#e8a04a", textDecoration: "none", fontSize: 14 }}>← DetencionDefensa.com</Link>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, fontFamily: "Fraunces, serif", marginBottom: 12 }}>
          Configura Mi App
        </h1>
        <p style={{ fontSize: 18, color: "#cfc8b8", marginBottom: 8 }}>
          <strong>Set up your emergency app from any computer or phone — before you install it.</strong>
        </p>
        <p style={{ fontSize: 15, color: "#a8a59a", lineHeight: 1.6, marginBottom: 32 }}>
          Llene aquí toda su información (contactos, mascotas, documentos legales, PIN de cancelación).
          Cuando instale la app y entre su código de activación, todo aparecerá listo. No tiene que escribir nada en el teléfono.
        </p>

        <div style={{ background: "#1a2436", borderRadius: 12, padding: 24, marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16, fontFamily: "Fraunces, serif" }}>
            Lo que va a configurar
          </h2>
          <ol style={{ paddingLeft: 20, color: "#cfc8b8", fontSize: 15, lineHeight: 1.9 }}>
            <li><strong>Sus datos</strong> — nombre, A-number, fecha de nacimiento</li>
            <li><strong>Contactos de emergencia</strong> — quiénes reciben aviso si activa la alarma</li>
            <li><strong>Documentos legales</strong> — Writ of Habeas Corpus, Poder, Plan de Mascotas</li>
            <li><strong>Plan de rescate de mascotas</strong> — quién cuida sus animales</li>
            <li><strong>PIN de 4 dígitos</strong> — para cancelar una alerta si se activó por accidente</li>
          </ol>
        </div>

        <form onSubmit={onSubmit} style={{ background: "#1a2436", borderRadius: 12, padding: 24 }}>
          <label htmlFor="email" style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
            Su correo electrónico / Your email
          </label>
          <p style={{ fontSize: 13, color: "#a8a59a", marginBottom: 12 }}>
            Le enviamos un enlace para entrar. No necesita contraseña. We send you a sign-in link — no password needed.
          </p>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            style={{
              width: "100%", padding: "12px 14px", fontSize: 16, borderRadius: 8,
              border: "1px solid #2a3650", background: "#0b1220", color: "#f6efe1",
              marginBottom: 16, boxSizing: "border-box",
            }}
          />
          <button
            type="submit"
            disabled={status === "sending" || status === "sent"}
            style={{
              width: "100%", padding: "14px", fontSize: 16, fontWeight: 600, borderRadius: 8,
              border: "none", background: status === "sent" ? "#059669" : "#e8a04a",
              color: "#0b1220", cursor: status === "sending" ? "wait" : "pointer",
            }}
          >
            {status === "sending" ? "Enviando…" :
              status === "sent" ? "✓ Revise su correo / Check your email" :
              "Enviar enlace de acceso / Send sign-in link"}
          </button>
          {errMsg && (
            <p style={{ color: "#ff8080", fontSize: 13, marginTop: 12 }}>{errMsg}</p>
          )}
          {status === "sent" && (
            <p style={{ color: "#cfc8b8", fontSize: 13, marginTop: 12, lineHeight: 1.5 }}>
              Le enviamos un enlace a <strong>{email}</strong>. Haga clic en el enlace del correo para entrar y configurar su app.
            </p>
          )}
        </form>
      </main>
    </div>
  );
}
