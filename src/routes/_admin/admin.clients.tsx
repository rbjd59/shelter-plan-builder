import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listClients } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/admin/clients")({
  component: ClientsPage,
});

const STATUS_COLORS: Record<string, string> = {
  unpaid: "bg-slate-100 text-slate-700",
  signed_up: "bg-blue-100 text-blue-800",
  triggered: "bg-amber-100 text-amber-900",
  cancelled: "bg-slate-200 text-slate-600",
};

function ClientsPage() {
  const fetchClients = useServerFn(listClients);
  const { data, isLoading } = useQuery({ queryKey: ["admin-clients"], queryFn: () => fetchClients() });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const rows = (data?.clients ?? []).filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.a_number ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search name, email, A-number…"
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
          <option value="signed_up">Signed up</option>
          <option value="triggered">Triggered</option>
          <option value="cancelled">Cancelled</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        {isLoading ? (
          <p className="p-4 text-sm text-slate-500">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No clients match.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">A-Number</th>
                <th className="px-3 py-2">Signed up</th>
                <th className="px-3 py-2">Triggered</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium">{c.name}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-2 py-0.5 text-xs ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{c.email ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-600">{c.a_number ?? "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{c.triggered_at ? new Date(c.triggered_at).toLocaleString() : "—"}</td>
                  <td className="px-3 py-2">
                    <Link to="/admin/clients/$id" params={{ id: c.id }} className="text-amber-600 hover:underline text-xs">
                      Open →
                    </Link>
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
