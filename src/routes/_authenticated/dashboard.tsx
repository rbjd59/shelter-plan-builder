import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Your account — DetencionDefensa.com" }] }),
  component: DashboardPage,
});

type Sub = {
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  price_id: string | null;
  language: string | null;
  stripe_session_id: string | null;
  email: string | null;
};

function DashboardPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [sub, setSub] = useState<Sub | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setEmail(data.user.email || "");
      const env = getStripeEnvironment();
      const { data: rows } = await supabase
        .from("subscriptions")
        .select("status,current_period_end,cancel_at_period_end,price_id,language,stripe_session_id,email")
        .eq("user_id", data.user.id)
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setSub((rows as Sub | null) ?? null);
      setLoading(false);
    });
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const wrap: React.CSSProperties = { minHeight: "100vh", background: "#0b1220", color: "#f6efe1", fontFamily: "Inter Tight, system-ui, sans-serif" };
  const container: React.CSSProperties = { maxWidth: 760, margin: "0 auto", padding: "32px 24px 96px" };

  return (
    <div style={wrap}>
      <div style={container}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Link to="/" search={{ lang: "es" } as never} style={{ color: "#e8a04a", fontSize: 14, textDecoration: "none" }}>← Home</Link>
          <button onClick={signOut} style={{ background: "transparent", border: "1px solid #3a4458", color: "#cfc8b8", padding: "6px 14px", borderRadius: 4, fontSize: 13, cursor: "pointer" }}>Sign out</button>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8, fontFamily: "Fraunces, serif" }}>Your account</h1>
        <p style={{ color: "#a8a59a", marginBottom: 32, fontSize: 14 }}>{email}</p>

        {loading ? (
          <p>Loading…</p>
        ) : sub ? (
          <div style={{ background: "#1a2436", padding: 24, borderRadius: 8 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Pre-Detention Defense Plan</h2>
            <Row label="Status" value={prettyStatus(sub.status, sub.cancel_at_period_end)} />
            <Row label="Next bill" value={sub.current_period_end ? `${new Date(sub.current_period_end).toLocaleDateString()} · $30.00` : "—"} />
            <Row label="Plan" value="$199 today + $30/mo from month 3" />
            <div style={{ marginTop: 24, fontSize: 13, color: "#cfc8b8", borderLeft: "3px solid #e8a04a", paddingLeft: 14 }}>
              To cancel the $30/month, email <a href="mailto:intake@detenciondefensa.com" style={{ color: "#e8a04a" }}>intake@detenciondefensa.com</a>.
            </div>
          </div>
        ) : (
          <div style={{ background: "#1a2436", padding: 24, borderRadius: 8 }}>
            <p style={{ marginBottom: 16 }}>You don't have a defense plan yet.</p>
            <Link to="/checkout" search={{ lang: "es" } as never} style={{ display: "inline-block", background: "#e8a04a", color: "#0b1220", padding: "10px 18px", borderRadius: 4, fontWeight: 700, textDecoration: "none" }}>
              Start — $199
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #2a3346", fontSize: 14 }}>
      <span style={{ color: "#a8a59a" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function prettyStatus(status: string, cancelAtPeriodEnd: boolean): string {
  if (cancelAtPeriodEnd) return "Canceling at end of period";
  switch (status) {
    case "active": return "Active";
    case "trialing": return "Active (free months 1-2)";
    case "past_due": return "Payment past due";
    case "canceled": return "Canceled";
    case "incomplete": return "Incomplete";
    default: return status;
  }
}
