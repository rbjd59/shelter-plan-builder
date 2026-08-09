import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listIntakeDeliveryLog } from "@/lib/delivery-log.functions";

export const Route = createFileRoute("/_admin/admin/deliveries")({
  component: DeliveryLogPage,
});

const STEP_LABELS: Record<string, string> = {
  board_registration: "Board registration",
  contacts_synced: "Emergency contacts",
  documents_generated: "Legal documents",
  staff_notification_email: "Staff notification email",
  activation_email: "Activation email",
  activation_sms: "Activation SMS",
  partner_webhook: "Partner webhook",
  mobile_delivery: "Mobile delivery",
};

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "success"
      ? "bg-green-100 text-green-800"
      : status === "failed"
        ? "bg-red-100 text-red-800"
        : "bg-amber-100 text-amber-800";
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{status}</span>
  );
}

function fmt(ts: string) {
  return new Date(ts).toLocaleString();
}

function DeliveryLogPage() {
  const fetchLog = useServerFn(listIntakeDeliveryLog);
  const [onlyFailures, setOnlyFailures] = useState(false);
  const [step, setStep] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["intake-delivery-log", { onlyFailures, step, search }],
    queryFn: () => fetchLog({ data: { onlyFailures, step, search, limit: 500 } }),
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Intake delivery log</h1>
          <p className="text-xs text-slate-500">
            Every step of the handoff after a client completes intake — board registration,
            documents, emails, texts and phone activation — with timestamps and failure reasons.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
        <label className="flex items-center gap-2 text-xs text-slate-700">
          <input
            type="checkbox"
            checked={onlyFailures}
            onChange={(e) => setOnlyFailures(e.target.checked)}
          />
          Only failures
        </label>
        <select
          value={step}
          onChange={(e) => setStep(e.target.value)}
          className="rounded border border-slate-300 px-2 py-1 text-xs"
        >
          <option value="">All steps</option>
          {Object.entries(STEP_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search code, session, email or phone"
          className="min-w-[16rem] flex-1 rounded border border-slate-300 px-2 py-1 text-xs"
        />
        {data && (
          <div className="ml-auto flex gap-3 text-xs text-slate-600">
            <span>{data.totals.cases} cases</span>
            <span>{data.totals.events} events</span>
            <span className="text-red-600">{data.totals.failed} failed</span>
            <span className="text-amber-600">{data.totals.skipped} skipped</span>
          </div>
        )}
      </div>

      {isLoading && <p className="text-sm text-slate-500">Loading…</p>}
      {error && <p className="text-sm text-red-600">Error: {(error as Error).message}</p>}

      {data && data.cases.length === 0 && (
        <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
          No delivery activity recorded for this filter yet.
        </p>
      )}

      <div className="space-y-3">
        {data?.cases.map((c) => {
          const isOpen = open === c.key;
          return (
            <div key={c.key} className="rounded-lg border border-slate-200 bg-white">
              <button
                onClick={() => setOpen(isOpen ? null : c.key)}
                className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left"
              >
                <span className="font-medium text-slate-900">
                  {c.clientName ?? "Unknown client"}
                </span>
                {c.activationCode && (
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                    {c.activationCode}
                  </span>
                )}
                <span className="text-xs text-slate-500">{fmt(c.lastSeen)}</span>
                {c.failures > 0 ? (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                    {c.failures} failed
                  </span>
                ) : (
                  <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    all steps ok
                  </span>
                )}
                {c.missingSteps.length > 0 && (
                  <span className="text-xs text-amber-700">
                    never ran: {c.missingSteps.map((s) => STEP_LABELS[s] ?? s).join(", ")}
                  </span>
                )}
                <span className="ml-auto text-xs text-slate-400">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 px-4 py-3">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs uppercase text-slate-500">
                      <tr>
                        <th className="py-1">Step</th>
                        <th>Status</th>
                        <th>Sent to</th>
                        <th>When</th>
                        <th>Took</th>
                        <th>Failure reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {c.rows.map((r) => (
                        <tr key={r.id} className="border-t border-slate-100 align-top">
                          <td className="py-1 pr-2">{STEP_LABELS[r.step] ?? r.step}</td>
                          <td className="pr-2">
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="pr-2 text-xs text-slate-600">{r.target ?? "—"}</td>
                          <td className="pr-2 text-xs text-slate-600">{fmt(r.created_at)}</td>
                          <td className="pr-2 text-xs text-slate-500">
                            {r.duration_ms != null ? `${r.duration_ms} ms` : "—"}
                          </td>
                          <td className="text-xs text-red-700">{r.error_message ?? ""}</td>
                        </tr>
                      ))}
                      <tr className="border-t border-slate-100">
                        <td className="py-1 pr-2">{STEP_LABELS.mobile_delivery}</td>
                        <td className="pr-2">
                          <StatusBadge status={c.activatedAt ? "success" : "skipped"} />
                        </td>
                        <td className="pr-2 text-xs text-slate-600">phone app</td>
                        <td className="pr-2 text-xs text-slate-600">
                          {c.activatedAt ? fmt(c.activatedAt) : "—"}
                        </td>
                        <td className="pr-2 text-xs text-slate-500">—</td>
                        <td className="text-xs text-amber-700">
                          {c.activatedAt ? "" : "Client has not activated the app yet"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {c.rows.some((r) => r.metadata) && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-xs text-slate-500">Details</summary>
                      <pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-2 text-[11px] text-slate-700">
                        {c.rows
                          .filter((r) => r.metadata)
                          .map((r) => `${r.step}: ${r.metadata}`)
                          .join("\n")}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
