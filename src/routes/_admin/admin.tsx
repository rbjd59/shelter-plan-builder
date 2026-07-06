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

function FireTestClientCard() {
  const fire = useServerFn(fireTestDemoClient);
  const [label, setLabel] = useState("Test 02 ES");
  const [language, setLanguage] = useState<"es" | "en" | "ht">("es");
  const [status, setStatus] = useState<"idle" | "working" | "done" | "error">("idle");
  const [result, setResult] = useState<
    { sessionId: string; activationCode: string | null; label: string } | null
  >(null);
  const [err, setErr] = useState("");

  const onFire = async () => {
    setStatus("working");
    setErr("");
    setResult(null);
    try {
      const res = await fire({ data: { label, language } });
      setResult({
        sessionId: res.sessionId,
        activationCode: res.activationCode,
        label: res.label,
      });
      setStatus("done");
    } catch (e) {
      setErr((e as Error).message);
      setStatus("error");
    }
  };

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-sm font-semibold text-amber-900">Fire fake test client</h2>
          <p className="text-xs text-amber-800 mt-1">
            Submits a complete /intake with all forms (Habeas, Memorandum of Law, Motion Referral,
            JS-44, Brochure). Appears on the company + attorney boards for review.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            className="rounded border border-amber-300 bg-white px-2 py-1 text-sm"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Test 02 ES"
          />
          <select
            className="rounded border border-amber-300 bg-white px-2 py-1 text-sm"
            value={language}
            onChange={(e) => setLanguage(e.target.value as "es" | "en" | "ht")}
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
            <option value="ht">HT</option>
          </select>
          <button
            onClick={onFire}
            disabled={status === "working"}
            className="rounded bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {status === "working" ? "Firing…" : "Fire client"}
          </button>
        </div>
      </div>
      {status === "done" && result && (
        <div className="mt-3 rounded border border-green-300 bg-green-50 p-3 text-sm">
          <p className="font-semibold text-green-900">✓ Fired {result.label}</p>
          <p className="text-xs text-green-800 mt-1">
            Session ID: <code className="font-mono">{result.sessionId}</code>
          </p>
          {result.activationCode && (
            <p className="text-xs text-green-800 mt-1">
              Activation code: <code className="font-mono font-bold">{result.activationCode}</code>
            </p>
          )}
          <div className="mt-2 flex gap-3 text-xs">
            <Link to="/company-board" className="text-amber-700 underline">
              Company board →
            </Link>
            <Link to="/attorney-board" className="text-amber-700 underline">
              Attorney board →
            </Link>
          </div>
        </div>
      )}
      {status === "error" && (
        <p className="mt-3 text-sm text-red-700">Error: {err}</p>
      )}
    </div>
  );
}

