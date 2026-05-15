import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listRecentActivations, checkOfficeAccess } from "@/lib/case-console.functions";

export const Route = createFileRoute("/_authenticated/cases")({
  head: () => ({ meta: [{ title: "Active cases — Office" }, { name: "robots", content: "noindex" }] }),
  component: CasesIndex,
});

function statusOf(row: { cancelled_at: string | null; family_notified_at: string | null; act_after: string }): {
  label: string;
  color: string;
} {
  if (row.cancelled_at) return { label: "CANCELLED", color: "#94a3b8" };
  if (row.family_notified_at) return { label: "FAMILY NOTIFIED", color: "#0d7a5f" };
  const due = new Date(row.act_after).getTime();
  if (Date.now() >= due) return { label: "ACT NOW", color: "#dc2626" };
  return { label: "PENDING", color: "#e8a04a" };
}

function CasesIndex() {
  const checkAccess = useServerFn(checkOfficeAccess);
  const fetchList = useServerFn(listRecentActivations);

  const access = useQuery({ queryKey: ["office-access"], queryFn: () => checkAccess() });
  const list = useQuery({
    queryKey: ["cases-list"],
    queryFn: () => fetchList(),
    enabled: access.data?.isOffice === true,
    refetchInterval: 30_000,
  });

  if (access.isLoading) return <Wrap><p>Loading…</p></Wrap>;
  if (!access.data?.isOffice) {
    return (
      <Wrap>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Office staff only</h1>
        <p style={{ color: "#cfc8b8", fontSize: 14 }}>
          Your account ({access.data?.email}) is not on the office allowlist. Ask an admin to add it to{" "}
          <code>OFFICE_STAFF_EMAILS</code>.
        </p>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Active cases</h1>
        <span style={{ fontSize: 12, color: "#a8a59a" }}>auto-refreshes every 30s</span>
      </div>

      {list.isLoading && <p>Loading cases…</p>}
      {list.error && <p style={{ color: "#fca5a5" }}>{(list.error as Error).message}</p>}
      {list.data && list.data.length === 0 && (
        <p style={{ color: "#a8a59a" }}>No emergency activations yet.</p>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {list.data?.map((row) => {
          const s = statusOf(row);
          return (
            <Link
              key={row.id}
              to="/case/$id"
              params={{ id: row.id }}
              style={{
                display: "block",
                padding: "14px 16px",
                background: "#1a2436",
                borderRadius: 8,
                borderLeft: `4px solid ${s.color}`,
                textDecoration: "none",
                color: "#f6efe1",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{row.full_name || "(unknown)"}</div>
                  <div style={{ fontSize: 12, color: "#a8a59a", marginTop: 2 }}>
                    {row.role.toUpperCase()} · fired {new Date(row.fired_at).toLocaleString()}
                    {row.facility_name && <> · {row.facility_name}</>}
                  </div>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 800, letterSpacing: 1, color: s.color,
                  padding: "4px 10px", border: `1px solid ${s.color}`, borderRadius: 4,
                }}>{s.label}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </Wrap>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#f6efe1", fontFamily: "Inter Tight, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 24px 96px" }}>
        <Link to="/dashboard" style={{ color: "#e8a04a", fontSize: 13, textDecoration: "none" }}>← Account</Link>
        <div style={{ marginTop: 18 }}>{children}</div>
      </div>
    </div>
  );
}
