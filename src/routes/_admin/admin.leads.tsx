import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listLeads, updateLead } from "@/lib/leads.functions";

export const Route = createFileRoute("/_admin/admin/leads")({
  component: LeadsPage,
});

const STATUSES = ["new", "routed", "contacted", "accepted", "declined", "closed"] as const;

function LeadsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["leads"], queryFn: () => listLeads() });
  const mut = useMutation({
    mutationFn: (v: { id: string; status: (typeof STATUSES)[number] }) => updateLead({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Lead intake</h2>
        <p className="mt-1 text-sm text-slate-600">
          Inquiries captured from the website. Every lead is emailed to the company inbox and to
          Sorrentino Law Firm PLLC for review. A lead is not a client — no attorney-client
          relationship exists until the Firm accepts the matter in writing.
        </p>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && <p className="text-sm text-red-600">{(error as Error).message}</p>}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Received</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Contact</th>
              <th className="px-4 py-2">Lang</th>
              <th className="px-4 py-2">Needs</th>
              <th className="px-4 py-2">Source</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(data?.leads ?? []).map((l) => (
              <tr key={l.id}>
                <td className="whitespace-nowrap px-4 py-2 text-slate-600">
                  {new Date(l.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2 font-medium text-slate-900">{l.full_name}</td>
                <td className="px-4 py-2 text-slate-600">
                  {l.email ?? "—"}
                  <br />
                  {l.phone ?? "—"}
                </td>
                <td className="px-4 py-2 uppercase text-slate-600">{l.language}</td>
                <td className="max-w-xs px-4 py-2 text-slate-600">
                  {l.need ?? "—"}
                  {l.message ? <div className="mt-1 text-xs text-slate-500">{l.message}</div> : null}
                </td>
                <td className="px-4 py-2 text-slate-600">{l.source}</td>
                <td className="px-4 py-2">
                  <select
                    value={l.status}
                    onChange={(e) =>
                      mut.mutate({ id: l.id, status: e.target.value as (typeof STATUSES)[number] })
                    }
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && data.leads.length === 0 && (
          <p className="px-4 py-6 text-sm text-slate-500">No leads yet.</p>
        )}
      </div>
    </div>
  );
}
