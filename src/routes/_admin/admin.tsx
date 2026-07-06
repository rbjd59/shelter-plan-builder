import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getDashboardStats } from "@/lib/admin.functions";
import { fireTestDemoClient } from "@/lib/admin-demo.functions";

export const Route = createFileRoute("/_admin/admin")({
  component: Dashboard,
});

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-3xl font-bold ${accent ?? "text-slate-900"}`}>{value}</div>
    </div>
  );
}

function Dashboard() {
  const fetchStats = useServerFn(getDashboardStats);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => fetchStats(),
    refetchInterval: 30000,
  });

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (error) return <p className="text-sm text-red-600">Error: {(error as Error).message}</p>;
  if (!data) return null;

  const max = Math.max(1, ...data.dailyViews.map((d) => d.count));

  return (
    <div className="space-y-6">
      <FireTestClientCard />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Views (30d)" value={data.totals.viewsLast30} />
        <Stat label="Signups today" value={data.totals.signupsToday} />
        <Stat label="Triggered today" value={data.totals.triggeredToday} accent="text-amber-600" />
        <Stat label="Packages mailed today" value={data.totals.mailedToday} accent="text-green-600" />
        <Stat label="Pending actions" value={data.totals.pending} accent={data.totals.pending > 0 ? "text-red-600" : "text-slate-900"} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Daily views (last 30 days)</h2>
          <div className="flex h-40 items-end gap-1">
            {data.dailyViews.length === 0 ? (
              <p className="text-xs text-slate-500">No views recorded yet. Tracking starts now.</p>
            ) : (
              data.dailyViews.map((d) => (
                <div key={d.date} className="group relative flex-1" title={`${d.date}: ${d.count}`}>
                  <div className="w-full bg-amber-500" style={{ height: `${(d.count / max) * 100}%` }} />
                </div>
              ))
            )}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-slate-400">
            <span>{data.dailyViews[0]?.date}</span>
            <span>{data.dailyViews[data.dailyViews.length - 1]?.date}</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Top referrers</h2>
          {data.referrers.length === 0 ? (
            <p className="text-xs text-slate-500">No referrer data yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {data.referrers.map((r) => (
                <li key={r.source} className="flex justify-between border-b border-slate-100 py-1">
                  <span className="text-slate-700">{r.source}</span>
                  <span className="font-mono text-slate-900">{r.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Pending action queue ({data.pendingQueue.length})
        </h2>
        {data.pendingQueue.length === 0 ? (
          <p className="text-xs text-green-700">✓ All triggered clients are fully processed.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr><th className="py-2">Client</th><th>Triggered</th><th>Progress</th><th>Missing</th><th></th></tr>
            </thead>
            <tbody>
              {data.pendingQueue.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="py-2 font-medium">{p.name}</td>
                  <td className="text-xs text-slate-600">{new Date(p.fired_at).toLocaleString()}</td>
                  <td>{p.completed}/{p.total}</td>
                  <td className="text-xs text-red-600">{p.missing.join(", ")}</td>
                  <td className="text-right">
                    <Link to="/admin/clients" className="text-amber-600 hover:underline text-xs">Open →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
