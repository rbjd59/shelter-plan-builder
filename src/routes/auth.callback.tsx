import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyAdminStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Signing in… — DetencionDefensa.com" }] }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    const routeAfterAuth = async () => {
      try {
        const status = await getMyAdminStatus();
        navigate({ to: status.isAdmin ? "/admin" : "/dashboard" });
      } catch {
        navigate({ to: "/dashboard" });
      }
    };
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) routeAfterAuth();
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setErrMsg(error.message);
      if (data.session) routeAfterAuth();
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
