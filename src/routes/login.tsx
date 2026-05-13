import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — DetencionDefensa.com" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

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

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#f6efe1", fontFamily: "Inter Tight, system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 420, width: "100%", background: "#1a2436", padding: 32, borderRadius: 8 }}>
        <Link to="/" search={{ lang: "es" } as never} style={{ color: "#e8a04a", fontSize: 13, textDecoration: "none" }}>← Home</Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 16, marginBottom: 8, fontFamily: "Fraunces, serif" }}>Sign in</h1>
        <p style={{ fontSize: 14, color: "#a8a59a", marginBottom: 24 }}>
          Enter your email and we'll send a one-time sign-in link.
        </p>

        {status === "sent" ? (
          <div style={{ background: "#0d2417", borderLeft: "3px solid #2d6a4f", padding: 14, borderRadius: 4, fontSize: 14 }}>
            ✓ Check <strong>{email}</strong> for your sign-in link.
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: "100%", padding: "12px 14px", fontSize: 15, border: "1px solid #3a4458", borderRadius: 4, background: "#0b1220", color: "#f6efe1", marginBottom: 16, fontFamily: "inherit" }}
            />
            <button type="submit" disabled={status === "sending"} style={{ width: "100%", background: "#e8a04a", color: "#0b1220", border: "none", padding: "12px 16px", fontSize: 15, fontWeight: 700, borderRadius: 4, cursor: "pointer" }}>
              {status === "sending" ? "Sending…" : "Send sign-in link"}
            </button>
            {errMsg && <p style={{ color: "#ff8080", fontSize: 13, marginTop: 12 }}>{errMsg}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
