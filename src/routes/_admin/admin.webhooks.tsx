import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listWebhookSendLog } from "@/lib/intake-webhook.functions";

export const Route = createFileRoute("/_admin/admin/webhooks")({
  component: WebhookLogsPage,
});

function StatusBadge({ ok, code, kind }: { ok: boolean; code: number | null; kind: string | null }) {
  if (ok) {
    return (
      <span className="inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
        {code ?? "200"} ok
      </span>
    );
  }
  const color =
    kind === "signature_rejected"
      ? "bg-red-100 text-red-800"
      : kind === "network"
        ? "bg-orange-100 text-orange-800"
        : "bg-amber-100 text-amber-800";
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${color}`}>
      {code ?? "—"} {kind ?? "error"}
    </span>
  );
}

function WebhookLogsPage() {
  const fetchLogs = useServerFn(listWebhookSendLog);
  const [onlyFailures, setOnlyFailures] = useState(true);
  const [errorKind, setErrorKind] = useState<string>("");

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["webhook-send-log", { onlyFailures, errorKind }],
    queryFn: () => fetchLogs({ data: { onlyFailures, errorKind, limit: 200 } }),
    refetchInterval: 30000,
  });

  const ERROR_KINDS = [
    { value: "", label: "All error kinds" },
    { value: "signature_rejected", label: "signature_rejected (401)" },
    { value: "network", label: "network (unreachable)" },
    { value: "server_error", label: "server_error (5xx)" },
    { value: "http_error", label: "http_error (4xx)" },
    { value: "invalid_response_json", label: "invalid_response_json" },
    { value: "invalid_response_shape", label: "invalid_response_shape" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Intake webhook delivery log</h1>
          <p className="text-xs text-slate-500">
            Outbound calls to the partner intake webhook. Signature rejections appear as
            <span className="ml-1 rounded bg-red-100 px-1 text-red-800">401 signature_rejected</span>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-700">
            <input
              type="checkbox"
              checked={onlyFailures}
              onChange={(e) => setOnlyFailures(e.target.checked)}
            />
            Only failures
          </label>
          <select
            value={errorKind}
            onChange={(e) => setErrorKind(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          >
            {ERROR_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => refetch()}
            className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-600">Error: {(error as Error).message}</p>
      ) : !data || data.rows.length === 0 ? (
        <p className="rounded border border-slate-200 bg-white p-6 text-sm text-slate-500">
          {onlyFailures ? "No failed webhook attempts recorded." : "No webhook activity yet."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">When</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Session</th>
                <th className="px-3 py-2">Req ts</th>
                <th className="px-3 py-2">Took</th>
                <th className="px-3 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 align-top">
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-600">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge ok={r.ok} code={r.status_code} kind={r.error_kind} />
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-700">
                    {r.intake_session_id ?? "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-slate-500">
                    {r.request_timestamp ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-600">
                    {r.duration_ms != null ? `${r.duration_ms}ms` : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-700">
                    {r.error_message && (
                      <div className="text-red-700">{r.error_message}</div>
                    )}
                    {r.response_snippet && (
                      <pre className="mt-1 max-w-md whitespace-pre-wrap break-words rounded bg-slate-50 p-2 font-mono text-[11px] text-slate-600">
                        {r.response_snippet}
                      </pre>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
