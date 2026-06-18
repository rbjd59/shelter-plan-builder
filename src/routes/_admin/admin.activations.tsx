import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listAppActivations } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/admin/activations")({
  component: ActivationsPage,
});

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  activated: "bg-blue-100 text-blue-800",
  triggered: "bg-red-100 text-red-800 font-semibold",
  cancelled: "bg-amber-100 text-amber-900",
};

function ActivationsPage() {
  const fetchFn = useServerFn(listAppActivations);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-activations"],
    queryFn: () => fetchFn(),
    refetchInterval: 30000,
  });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (error) return <p className="text-sm text-red-600">{(error as Error).message}</p>;

  const rows = (data?.activations ?? []).filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (r.full_name ?? "").toLowerCase().includes(q) ||
        (r.email ?? "").toLowerCase().includes(q) ||
        (r.activation_code ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    total: data?.activations.length ?? 0,
    pending: data?.activations.filter((a) => a.status === "pending").length ?? 0,
    activated: data?.activations.filter((a) => a.status === "activated").length ?? 0,
    triggered: data?.activations.filter((a) => a.status === "triggered").length ?? 0,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total clients" value={counts.total} />
        <Stat label="Code issued, not yet opened" value={counts.pending} />
        <Stat label="App activated" value={counts.activated} accent="text-blue-700" />
        <Stat label="Currently triggered" value={counts.triggered} accent="text-red-700" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search name, email, activation code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[240px] rounded border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="pending">Pending (code issued)</option>
          <option value="activated">Activated</option>
          <option value="triggered">Triggered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Activation code</th>
              <th className="px-3 py-2">Client</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Lang</th>
              <th className="px-3 py-2">Code issued</th>
              <th className="px-3 py-2">App activated</th>
              <th className="px-3 py-2">Last trigger</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-xs text-slate-500">
                  No activations match.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono font-bold text-slate-900">{r.activation_code ?? "—"}</td>
                  <td className="px-3 py-2">{r.full_name ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-600">{r.email ?? "—"}</td>
                  <td className="px-3 py-2 text-xs uppercase text-slate-500">{r.language ?? "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500">
                    {r.activated_at ? new Date(r.activated_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500">
                    {r.last_triggered_at ? new Date(r.last_triggered_at).toLocaleString() : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-2 py-0.5 text-xs ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-3xl font-bold ${accent ?? "text-slate-900"}`}>{value}</div>
    </div>
  );
}
