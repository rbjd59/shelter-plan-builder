import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listTriggers } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/admin/triggers")({
  component: TriggersPage,
});

function TriggersPage() {
  const fetchTriggers = useServerFn(listTriggers);
  const { data, isLoading } = useQuery({ queryKey: ["admin-triggers"], queryFn: () => fetchTriggers() });
  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;
  const rows = data?.triggers ?? [];
  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2">Fired</th>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Role</th>
            <th className="px-3 py-2">Acts after</th>
            <th className="px-3 py-2">Cancelled</th>
            <th className="px-3 py-2">GPS</th>
            <th className="px-3 py-2">IP</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={7} className="p-4 text-center text-xs text-slate-500">No triggers yet.</td></tr>
          ) : rows.map((r) => (
            <tr key={r.id} className="border-t border-slate-100">
              <td className="px-3 py-2 text-xs">{new Date(r.fired_at).toLocaleString()}</td>
              <td className="px-3 py-2 font-medium">{r.full_name ?? "—"}</td>
              <td className="px-3 py-2 text-xs">{r.role}</td>
              <td className="px-3 py-2 text-xs">{new Date(r.act_after).toLocaleString()}</td>
              <td className="px-3 py-2 text-xs">{r.cancelled_at ? new Date(r.cancelled_at).toLocaleString() : <span className="text-amber-700 font-semibold">— active</span>}</td>
              <td className="px-3 py-2 text-xs">{r.gps_lat && r.gps_lng ? `${r.gps_lat}, ${r.gps_lng}` : "—"}</td>
              <td className="px-3 py-2 text-xs text-slate-500">{r.ip ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
