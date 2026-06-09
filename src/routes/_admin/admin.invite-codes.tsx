import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listInviteCodeStatus } from "@/lib/intake-webhook.functions";

export const Route = createFileRoute("/_admin/admin/invite-codes")({
  component: InviteCodesPage,
});

function Badge({
  tone,
  children,
}: {
  tone: "green" | "red" | "amber" | "slate" | "blue";
  children: React.ReactNode;
}) {
  const colors: Record<string, string> = {
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    amber: "bg-amber-100 text-amber-800",
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-100 text-blue-800",
  };
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${colors[tone]}`}
    >
      {children}
    </span>
  );
}

function InviteCodesPage() {
  const fetchStatus = useServerFn(listInviteCodeStatus);
  const [filter, setFilter] = useState<"all" | "missing" | "present">("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["invite-code-status"],
    queryFn: () => fetchStatus({ data: { limit: 200 } }),
    refetchInterval: 30000,
  });

  const rows = useMemo(() => {
    const all = data?.rows ?? [];
    const q = search.trim().toLowerCase();
    return all.filter((r) => {
      if (filter === "missing" && r.invite_code) return false;
      if (filter === "present" && !r.invite_code) return false;
      if (q) {
        const hay = `${r.recipient_email} ${r.session_id} ${r.invite_code ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [data, filter, search]);

  const stats = useMemo(() => {
    const all = data?.rows ?? [];
    const present = all.filter((r) => r.invite_code).length;
    const missing = all.length - present;
    return { total: all.length, present, missing };
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Invite-code status per recipient</h1>
          <p className="text-xs text-slate-500">
            Latest webhook response per intake session, joined with each welcome-email recipient.
            Activation block reflects what <code>sendWelcomeEmail</code> renders.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, session, code…"
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          >
            <option value="all">All</option>
            <option value="missing">Missing invite_code</option>
            <option value="present">Has invite_code</option>
          </select>
          <button
            onClick={() => refetch()}
            className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded border border-slate-200 bg-white p-3">
          <div className="text-xs uppercase text-slate-500">Recipients</div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="rounded border border-slate-200 bg-white p-3">
          <div className="text-xs uppercase text-slate-500">With invite_code</div>
          <div className="text-2xl font-bold text-green-700">{stats.present}</div>
        </div>
        <div className="rounded border border-slate-200 bg-white p-3">
          <div className="text-xs uppercase text-slate-500">Missing invite_code</div>
          <div
            className={`text-2xl font-bold ${stats.missing > 0 ? "text-red-700" : "text-slate-900"}`}
          >
            {stats.missing}
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-600">Error: {(error as Error).message}</p>
      ) : rows.length === 0 ? (
        <p className="rounded border border-slate-200 bg-white p-6 text-sm text-slate-500">
          No matching rows.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Webhook at</th>
                <th className="px-3 py-2">Recipient</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">invite_code</th>
                <th className="px-3 py-2">Activation block</th>
                <th className="px-3 py-2">Webhook</th>
                <th className="px-3 py-2">Session</th>
                <th className="px-3 py-2">Intake updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr
                  key={`${r.session_id}-${r.recipient_email}-${idx}`}
                  className="border-t border-slate-100 align-top"
                >
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600">
                    {new Date(r.webhook_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-900">{r.recipient_email}</td>
                  <td className="px-3 py-2 text-xs">
                    <Badge tone="slate">{r.recipient_role}</Badge>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {r.invite_code ? (
                      <span className="font-bold text-slate-900">{r.invite_code}</span>
                    ) : (
                      <Badge tone="red">MISSING</Badge>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {r.activation_block === "defensasiempre_deeplink" ? (
                      <Badge tone="green">defensasiempre://</Badge>
                    ) : r.activation_block === "pwa_install_fallback" ? (
                      <Badge tone="amber">PWA fallback</Badge>
                    ) : (
                      <Badge tone="slate">none</Badge>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {r.webhook_ok ? (
                      <Badge tone="green">{r.webhook_status ?? 200} ok</Badge>
                    ) : (
                      <Badge tone="red">
                        {r.webhook_status ?? "—"} {r.webhook_error_kind ?? "err"}
                      </Badge>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-slate-600">
                    {r.session_id}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-500">
                    {r.intake_updated_at
                      ? new Date(r.intake_updated_at).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
