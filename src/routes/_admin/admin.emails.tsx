import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listFailedEmails, manualRetryDlq, resendIntakeEmails } from "@/lib/email-retry.functions";
import { listClients } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/admin/emails")({
  component: EmailsPage,
});

function EmailsPage() {
  const qc = useQueryClient();
  const fetchFailed = useServerFn(listFailedEmails);
  const fetchClients = useServerFn(listClients);
  const retryDlqFn = useServerFn(manualRetryDlq);
  const resendFn = useServerFn(resendIntakeEmails);

  const failed = useQuery({ queryKey: ["admin-failed-emails"], queryFn: () => fetchFailed(), refetchInterval: 30000 });
  const clients = useQuery({ queryKey: ["admin-clients-short"], queryFn: () => fetchClients() });

  const [resendId, setResendId] = useState("");
  const [scope, setScope] = useState<"all" | "internal" | "welcome">("all");
  const [msg, setMsg] = useState<string | null>(null);

  const retryDlq = useMutation({
    mutationFn: () => retryDlqFn(),
    onSuccess: (s) => {
      setMsg(`Re-sent ${s.requeued} · Gave up on ${s.dropped} · ${s.errors.length} still failing`);
      qc.invalidateQueries({ queryKey: ["admin-failed-emails"] });
    },
    onError: (e) => setMsg(`Retry failed: ${(e as Error).message}`),
  });

  const resend = useMutation({
    mutationFn: () => resendFn({ data: { submissionId: resendId, scope } }),
    onSuccess: (r) => {
      setMsg(`Resent ${scope} emails for session ${r.sessionId}`);
      qc.invalidateQueries({ queryKey: ["admin-failed-emails"] });
    },
    onError: (e) => setMsg(`Resend failed: ${(e as Error).message}`),
  });

  const rows = failed.data?.rows ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Failed / DLQ emails (last 30 days)</h2>
          <button
            onClick={() => retryDlq.mutate()}
            disabled={retryDlq.isPending}
            className="rounded bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
          >
            {retryDlq.isPending ? "Retrying…" : "Retry all failed now"}
          </button>
        </div>
        {msg && <p className="mt-2 text-xs text-slate-600">{msg}</p>}
        {failed.isLoading ? (
          <p className="mt-3 text-xs text-slate-500">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="mt-3 text-xs text-green-700">✓ No failed or DLQ emails.</p>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr><th className="py-2">When</th><th>Template</th><th>Recipient</th><th>Status</th><th>Error</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="py-2 text-xs">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="text-xs font-medium">{r.template_name}</td>
                  <td className="text-xs">{r.recipient_email}</td>
                  <td className="text-xs">
                    <span className={r.status === "dlq" ? "text-red-700 font-semibold" : "text-amber-700"}>{r.status}</span>
                  </td>
                  <td className="text-xs text-slate-500 max-w-md truncate" title={r.error_message ?? ""}>{r.error_message ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">Manually resend intake emails</h2>
        <p className="mt-1 text-xs text-slate-500">Re-runs welcome and/or internal notification emails for one intake submission.</p>
        <div className="mt-3 grid gap-2 md:grid-cols-[2fr_1fr_auto]">
          <select
            value={resendId}
            onChange={(e) => setResendId(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="">Select client…</option>
            {(clients.data?.clients ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.email ?? "(no email)"} — {new Date(c.created_at).toLocaleDateString()}</option>
            ))}
          </select>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as typeof scope)}
            className="rounded border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="all">All (internal + welcome)</option>
            <option value="internal">Internal notifications only</option>
            <option value="welcome">Family welcome only</option>
          </select>
          <button
            onClick={() => resend.mutate()}
            disabled={!resendId || resend.isPending}
            className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {resend.isPending ? "Sending…" : "Resend"}
          </button>
        </div>
      </div>
    </div>
  );
}
