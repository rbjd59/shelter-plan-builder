import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import PinAccessGate from "@/components/PinAccessGate";
import {
  pinListAttorneyBoard,
  pinGetAttorneyClient,
  pinDownloadDocument,
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

function pdfBlobFromBase64(b64: string): Blob {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: "application/pdf" });
}

function downloadPdfFromBase64(filename: string, b64: string) {
  const blob = pdfBlobFromBase64(b64);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function previewPdfFromBase64(b64: string) {
  const blob = pdfBlobFromBase64(b64);
  const url = URL.createObjectURL(blob);
  // Open in a new tab; give the browser time to load before revoking.
  window.open(url, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
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
                const triggered = !!r.latest_alert && !r.latest_alert.cancelled_at;
                return (
                  <React.Fragment key={r.id}>
                    <tr className={triggered ? "animate-pulse bg-red-50/80 ring-2 ring-inset ring-red-500" : ""}>
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
                          <span className={triggered ? "rounded bg-red-600 px-2 py-1 font-bold text-white" : "text-red-700"}>
                            {triggered ? "🔴 ACTIVE — " : ""}
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
  const downloadFn = useServerFn(pinDownloadDocument);
  const { data, isLoading, error } = useQuery({
    queryKey: ["attorney-client", clientId],
    queryFn: () => fn({ data: { pin, clientId } }),
  });

  const [busy, setBusy] = React.useState<string | null>(null);

  const runDoc = async (
    docId: string,
    mode: "preview" | "download",
    fallbackTitle: string,
    fallbackContent: string,
  ) => {
    setBusy(`${docId}:${mode}`);
    try {
      const res = await downloadFn({ data: { pin, documentId: docId } });
      if (mode === "preview") previewPdfFromBase64(res.pdfB64);
      else downloadPdfFromBase64(res.filename, res.pdfB64);
    } catch (e) {
      console.error("PDF action failed, falling back to text", e);
      downloadText(
        `${fallbackTitle.replace(/[^a-z0-9]+/gi, "_")}.txt`,
        fallbackContent,
      );
    } finally {
      setBusy(null);
    }
  };

  if (isLoading) return <div className="text-sm text-slate-500">Loading file…</div>;
  if (error) return <div className="text-sm text-red-600">{(error as Error).message}</div>;
  if (!data) return null;

  const { client, draft_forms, app_uploads, alerts, contacts, pet_rescue } = data as any;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3 text-xs">
        <div className="rounded border border-slate-200 bg-white p-3">
          <div className="font-bold uppercase tracking-wide text-slate-500 mb-1">Client</div>
          <div>{client.full_name ?? "—"}</div>
          <div className="font-mono text-slate-700">A# {client.a_number ?? "—"}</div>
          <div className="text-slate-600">DOB: {client.date_of_birth ?? "—"}</div>
          <div className="text-slate-600">{client.email ?? "no email"}</div>
          <div className="text-slate-600">{client.phone_e164 ?? "no phone"}</div>
          <div className="mt-1 text-slate-500">
            Birth place: {client.place_of_birth ?? "—"} · {client.country_of_origin ?? "—"}
          </div>
          <div className="mt-1 flex gap-1 flex-wrap">
            {client.has_asset_protection && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-800">Asset protection</span>
            )}
            {client.has_pet_rescue && (
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-semibold text-emerald-800">Pet rescue</span>
            )}
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-3">
          <div className="font-bold uppercase tracking-wide text-slate-500 mb-1">
            Emergency contacts ({contacts.length})
          </div>
          {contacts.length === 0 && <div className="text-slate-500">None.</div>}
          <ul className="space-y-1">
            {contacts.map((c: any) => (
              <li key={c.id}>
                <span className="font-semibold">{c.name}</span>
                {c.relationship ? ` · ${c.relationship}` : ""}
                <div className="text-slate-600">{c.phone_e164 ?? "—"} · {c.email ?? "—"}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded border border-slate-200 bg-white p-3">
          <div className="font-bold uppercase tracking-wide text-slate-500 mb-1">Pet rescue</div>
          {pet_rescue ? (
            <div className="space-y-0.5">
              <div><span className="font-semibold">{pet_rescue.pet_name ?? "—"}</span> {pet_rescue.pet_type ? `(${pet_rescue.pet_type})` : ""}</div>
              <div className="text-slate-600">Location: {pet_rescue.pet_location ?? "—"}</div>
              <div className="text-slate-600">Access: {pet_rescue.access_instructions ?? "—"}</div>
              <div className="text-slate-600">Notify: {pet_rescue.who_to_notify ?? "—"}</div>
              {pet_rescue.no_kill_shelter_preferred && (
                <div className="text-slate-600">No-kill shelter: {pet_rescue.no_kill_shelter_address ?? "preferred"}</div>
              )}
            </div>
          ) : (
            <div className="text-slate-500">No pet rescue on file.</div>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-700">
            Draft forms ({draft_forms.length})
          </h3>
          <ul className="space-y-1.5">
            {draft_forms.map((d: any) => {
              const isMemo =
                d.document_type === "memorandum_of_law" ||
                d.document_type === "memorandum" ||
                /memorandum/i.test(d.title ?? "");
              return (
                <li
                  key={d.id}
                  className={isMemo ? "rounded border border-amber-300 bg-amber-50 px-2 py-1.5" : ""}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`text-sm ${isMemo ? "font-semibold text-amber-900" : "text-slate-800"}`}>
                      {isMemo && <span className="mr-1">📜</span>}
                      {d.title ?? "Document"}
                      {isMemo && (
                        <span className="ml-2 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
                          Memo of Law
                        </span>
                      )}
                    </span>
                    <span className="flex gap-2 text-xs">
                      <button
                        onClick={() => runDoc(d.id, "preview", d.title ?? "doc", d.content ?? "")}
                        disabled={busy === `${d.id}:preview`}
                        className="rounded border border-slate-300 bg-white px-2 py-0.5 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                      >
                        {busy === `${d.id}:preview` ? "…" : "👁 Preview"}
                      </button>
                      <button
                        onClick={() => runDoc(d.id, "download", d.title ?? "doc", d.content ?? "")}
                        disabled={busy === `${d.id}:download`}
                        className="rounded border border-blue-300 bg-blue-50 px-2 py-0.5 text-blue-700 hover:bg-blue-100 disabled:opacity-60"
                      >
                        {busy === `${d.id}:download` ? "…" : "⬇ Download"}
                      </button>
                    </span>
                  </div>
                </li>
              );
            })}
            {draft_forms.length === 0 && (
              <li className="text-sm text-slate-500">None.</li>
            )}
          </ul>
        </div>


        <div>
          <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-800">
            From client's file ({app_uploads.length})
          </h3>
          <p className="mb-2 text-[11px] text-slate-500">
            Captured at signup, live-updated by the app. Does not depend on the phone surviving the arrest.
          </p>
          <ul className="space-y-1">
            {app_uploads.map((d: any) => (
              <li key={d.id}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm text-emerald-800">
                    {d.title ?? "Document"}
                    <span className="ml-2 text-xs text-slate-500">
                      {new Date(d.loaded_at).toLocaleString()}
                    </span>
                  </span>
                  <span className="flex gap-2 text-xs">
                    <button
                      onClick={() => runDoc(d.id, "preview", d.title ?? "doc", d.content ?? "")}
                      className="rounded border border-slate-300 bg-white px-2 py-0.5 text-slate-700 hover:bg-slate-50"
                    >
                      👁 Preview
                    </button>
                    <button
                      onClick={() => runDoc(d.id, "download", d.title ?? "doc", d.content ?? "")}
                      className="rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-emerald-700 hover:bg-emerald-100"
                    >
                      ⬇ Download
                    </button>
                  </span>
                </div>
              </li>
            ))}
            {app_uploads.length === 0 && (
              <li className="text-sm text-slate-500">
                Nothing in the client's file yet.
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
    </div>
  );
}
