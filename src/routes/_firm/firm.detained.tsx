import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listDetainedClients } from "@/lib/firm.functions";

export const Route = createFileRoute("/_firm/firm/detained")({
  head: () => ({ meta: [{ title: "Detained Clients — Sorrentino Law Firm" }, { name: "robots", content: "noindex" }] }),
  component: DetainedClientsPage,
});

function DetainedClientsPage() {
  const fn = useServerFn(listDetainedClients);
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["firm", "detained"],
    queryFn: () => fn(),
    refetchInterval: 30000,
  });

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (error) return <p className="text-sm text-red-700">{(error as Error).message}</p>;

  const rows = data?.clients ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#6B4F4F" }}>Detained Clients</h1>
          <p className="mt-1 text-sm text-slate-600">
            {rows.length} client{rows.length === 1 ? "" : "s"} with an active alert or recorded detention location.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2.5">Client</th>
              <th className="px-4 py-2.5">A-Number</th>
              <th className="px-4 py-2.5">Detention facility</th>
              <th className="px-4 py-2.5">Arrest date</th>
              <th className="px-4 py-2.5">Alert</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No detained clients yet.</td></tr>
            ) : rows.map((c) => {
              const d = c.detention as any;
              const a = c.latest_alert as any;
              return (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{c.full_name ?? "—"}</div>
                    <div className="text-xs font-mono text-slate-500">{c.activation_code}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700">{d?.a_number ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-700">{d?.facility_name ?? <span className="text-amber-700">Not located yet</span>}</td>
                  <td className="px-4 py-3 text-slate-700">{d?.arrest_date ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">
                    {a ? (
                      a.cancelled_at ? (
                        <span className="text-slate-500">Cancelled {new Date(a.cancelled_at).toLocaleDateString()}</span>
                      ) : (
                        <span className="font-semibold text-red-700">ACTIVE · {new Date(a.triggered_at).toLocaleString()}</span>
                      )
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to="/firm/detained/$id"
                      params={{ id: c.id }}
                      className="text-xs font-semibold text-amber-700 hover:text-amber-900"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
