import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import PinAccessGate from "@/components/PinAccessGate";
import {
  pinListAttorneyBoard,
  pinGetAttorneyClient,
} from "@/lib/pin-access.functions";

export const Route = createFileRoute("/attorney-board")({
  head: () => ({
    meta: [
      { title: "Attorney Board — DetencionDefensa" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <PinAccessGate storageKey="dd_pin_attorney" title="Attorney Board — Client Files">
      {(pin) => <AttorneyBoard pin={pin} />}
    </PinAccessGate>
  ),
});

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function AttorneyBoard({ pin }: { pin: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const listFn = useServerFn(pinListAttorneyBoard);
  const { data, isLoading, error } = useQuery({
    queryKey: ["attorney-board"],
    queryFn: () => listFn({ data: { pin } }),
    refetchInterval: 30000,
  });

  if (isLoading) return <div className="p-8 text-slate-500">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{(error as Error).message}</div>;

  const rows = data?.clients ?? [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <header>
          <h1 className="text-2xl font-bold" style={{ color: "#6B4F4F" }}>
            Attorney Board — Client Files
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {rows.length} client file{rows.length === 1 ? "" : "s"} on record. Each
            row is keyed by the activation code. Trigger column shows when (and if)
            the client activated the SOS.
          </p>
        </header>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Activation #</th>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Contact</th>
                <th className="px-4 py-2.5">Forms</th>
                <th className="px-4 py-2.5">Trigger</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => {
                const isOpen = openId === r.id;
                const triggered = !!r.latest_alert;
                return (
                  <React.Fragment key={r.id}>
                    <tr className={triggered ? "bg-red-50/40" : ""}>
                      <td className="px-4 py-2 font-mono font-bold">{r.activation_code}</td>
                      <td className="px-4 py-2">{r.full_name ?? <span className="text-slate-400">—</span>}</td>
                      <td className="px-4 py-2 text-xs text-slate-600">
                        {r.email ?? "—"}
                        {r.phone ? ` · ${r.phone}` : ""}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        <span className="text-slate-700">{r.draft_forms.length} draft</span>
                        {r.app_uploads.length > 0 && (
                          <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 font-semibold text-emerald-800">
                            + {r.app_uploads.length} from app
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {r.latest_alert ? (
                          <span className="text-red-700">
                            {new Date(r.latest_alert.triggered_at).toLocaleString()}
                            {r.latest_alert.cancelled_at ? " (cancelled)" : ""}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          className="text-xs font-semibold underline"
                          style={{ color: "#6B4F4F" }}
                          onClick={() => setOpenId(isOpen ? null : r.id)}
                        >
                          {isOpen ? "Close" : "Open file"}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={6} className="bg-slate-50 px-4 py-4">
                          <ClientDetail pin={pin} clientId={r.id} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm text-slate-500">
                    No clients on file yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ClientDetail({ pin, clientId }: { pin: string; clientId: string }) {
  const fn = useServerFn(pinGetAttorneyClient);
  const { data, isLoading, error } = useQuery({
    queryKey: ["attorney-client", clientId],
    queryFn: () => fn({ data: { pin, clientId } }),
  });

  if (isLoading) return <div className="text-sm text-slate-500">Loading file…</div>;
  if (error) return <div className="text-sm text-red-600">{(error as Error).message}</div>;
  if (!data) return null;

  const { draft_forms, app_uploads, alerts } = data;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-700">
          Draft forms ({draft_forms.length})
        </h3>
        <ul className="space-y-1">
          {draft_forms.map((d: any) => (
            <li key={d.id}>
              <button
                onClick={() =>
                  downloadText(
                    `${(d.title ?? "doc").replace(/[^a-z0-9]+/gi, "_")}.txt`,
                    d.content ?? "",
                  )
                }
                className="text-left text-sm text-blue-700 underline"
              >
                ⬇ {d.title ?? "Document"}
              </button>
            </li>
          ))}
          {draft_forms.length === 0 && (
            <li className="text-sm text-slate-500">None.</li>
          )}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-800">
          From client's phone ({app_uploads.length})
        </h3>
        <ul className="space-y-1">
          {app_uploads.map((d: any) => (
            <li key={d.id}>
              <button
                onClick={() =>
                  downloadText(
                    `${(d.title ?? "doc").replace(/[^a-z0-9]+/gi, "_")}.txt`,
                    d.content ?? "",
                  )
                }
                className="text-left text-sm text-emerald-700 underline"
              >
                ⬇ {d.title ?? "Document"}
                <span className="ml-2 text-xs text-slate-500">
                  {new Date(d.loaded_at).toLocaleString()}
                </span>
              </button>
            </li>
          ))}
          {app_uploads.length === 0 && (
            <li className="text-sm text-slate-500">
              Nothing uploaded from the app yet.
            </li>
          )}
        </ul>

        {alerts.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-red-800">
              Triggers
            </h3>
            <ul className="space-y-1 text-xs">
              {alerts.map((a: any) => (
                <li key={a.id}>
                  {new Date(a.triggered_at).toLocaleString()}
                  {a.cancelled_at ? " — cancelled" : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
