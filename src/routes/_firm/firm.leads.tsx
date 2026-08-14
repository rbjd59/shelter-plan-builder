import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listLeads, updateLead } from "@/lib/leads.functions";

export const Route = createFileRoute("/_firm/firm/leads")({
  component: FirmLeadsPage,
});

const STATUSES = ["new", "routed", "contacted", "accepted", "declined", "closed"] as const;

function FirmLeadsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["firm-leads"],
    queryFn: () => listLeads(),
  });
  const mut = useMutation({
    mutationFn: (v: { id: string; status: (typeof STATUSES)[number] }) => updateLead({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["firm-leads"] }),
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold" style={{ color: "#3f2f2f" }}>
          Incoming leads
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Inquiries routed to the Firm for review. No attorney-client relationship is formed until
          the Firm accepts the matter in writing and the limited-scope engagement letter is signed.
        </p>
      </div>

      {isLoading && <p className="text-sm text-stone-500">Loading…</p>}
      {error && <p className="text-sm text-red-700">{(error as Error).message}</p>}

      <div className="overflow-x-auto rounded-lg border bg-white" style={{ borderColor: "#e3d9cf" }}>
        <table className="min-w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-stone-500" style={{ background: "#f3ece5" }}>
            <tr>
              <th className="px-4 py-2">Received</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Contact</th>
              <th className="px-4 py-2">Lang</th>
              <th className="px-4 py-2">Needs</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "#efe7df" }}>
            {(data?.leads ?? []).map((l) => (
              <tr key={l.id}>
                <td className="whitespace-nowrap px-4 py-2 text-stone-600">
                  {new Date(l.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2 font-medium text-stone-900">{l.full_name}</td>
                <td className="px-4 py-2 text-stone-600">
                  {l.email ?? "—"}
                  <br />
                  {l.phone ?? "—"}
                </td>
                <td className="px-4 py-2 uppercase text-stone-600">{l.language}</td>
                <td className="max-w-xs px-4 py-2 text-stone-600">
                  {l.need ?? "—"}
                  {l.message ? <div className="mt-1 text-xs text-stone-500">{l.message}</div> : null}
                </td>
                <td className="px-4 py-2">
                  <select
                    value={l.status}
                    onChange={(e) =>
                      mut.mutate({ id: l.id, status: e.target.value as (typeof STATUSES)[number] })
                    }
                    className="rounded border px-2 py-1 text-xs"
                    style={{ borderColor: "#d9cec3" }}
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
          <p className="px-4 py-6 text-sm text-stone-500">No leads yet.</p>
        )}
      </div>
    </div>
  );
}
