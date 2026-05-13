import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Signing in… — DetencionDefensa.com" }] }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    // Supabase auto-handles the URL hash via detectSessionInUrl.
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate({ to: "/dashboard" });
    });
    // Fallback: if there's already a session, redirect now.
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setErrMsg(error.message);
      if (data.session) navigate({ to: "/dashboard" });
    });
    return () => {
      sub.data.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#f6efe1", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter Tight, system-ui, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <p>Signing you in…</p>
        {errMsg && <p style={{ color: "#ff8080", fontSize: 13, marginTop: 12 }}>{errMsg}</p>}
      </div>
    </div>
  );
}
