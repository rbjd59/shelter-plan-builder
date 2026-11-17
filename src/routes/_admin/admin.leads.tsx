import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { assignLead, listLeads, updateLead } from "@/lib/leads.functions";

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
  const [notice, setNotice] = useState<string | null>(null);
  const assign = useMutation({
    mutationFn: (v: { id: string; assigneeId: string }) => assignLead({ data: v }),
    onSuccess: (r) => {
      setNotice(
        r.notified ? `Assigned to ${r.assignee} and emailed them.` : `Assigned to ${r.assignee}.`,
      );
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (e) => setNotice((e as Error).message),
  });
  const [filter, setFilter] = useState<"all" | "business" | "mine" | "unassigned">("business");
  const canAssign = (data?.roles ?? []).some((r) => r === "admin" || r === "firm");
  const staffEmail = (id: string | null) => data?.staff.find((s) => s.userId === id)?.email;
  const leads = (data?.leads ?? []).filter((l) =>
    filter === "business"
      ? l.source === "business-call-intake"
      : filter === "mine"
        ? l.routed_to === data?.me
        : filter === "unassigned"
          ? !l.routed_to
          : true,
  );
  const FILTERS = [
    ["business", "Business calls"],
    ["mine", "Assigned to me"],
    ["unassigned", "Unassigned"],
    ["all", "All leads"],
  ] as const;

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

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`rounded-full border px-3 py-1 text-xs ${filter === k ? "border-amber-500 bg-amber-50 font-semibold text-amber-700" : "border-slate-300 text-slate-600"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {notice && (
        <p role="status" className="text-sm text-slate-700">
          {notice}
        </p>
      )}
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
              <th className="px-4 py-2">Assigned to</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((l) => (
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
                  {l.message ? (
                    <div className="mt-1 text-xs text-slate-500">{l.message}</div>
                  ) : null}
                </td>
                <td className="px-4 py-2 text-slate-600">{l.source}</td>
                <td className="px-4 py-2 text-slate-600">
                  {canAssign ? (
                    <select
                      aria-label={`Assign ${l.full_name}`}
                      value={l.routed_to ?? ""}
                      disabled={assign.isPending}
                      onChange={(e) =>
                        e.target.value && assign.mutate({ id: l.id, assigneeId: e.target.value })
                      }
                      className="rounded border border-slate-300 px-2 py-1 text-xs"
                    >
                      <option value="">Unassigned</option>
                      {data?.staff.map((m) => (
                        <option key={m.userId} value={m.userId}>
                          {m.email}
                        </option>
                      ))}
                    </select>
                  ) : (
                    (staffEmail(l.routed_to) ?? "Unassigned")
                  )}
                </td>
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
        {data && leads.length === 0 && (
          <p className="px-4 py-6 text-sm text-slate-500">No leads yet.</p>
        )}
      </div>
    </div>
  );
}
