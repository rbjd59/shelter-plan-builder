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
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["attorney-board"],
    queryFn: () => listFn({ data: { pin } }),
    refetchInterval: 30000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    placeholderData: (prev) => prev,
  });

  if (isLoading) return <div className="p-8 text-slate-500">Loading…</div>;
  if (error && !data)
    return (
      <div className="p-8 space-y-3">
        <div className="text-red-600">
          Could not load the board: {(error as Error).message}
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm"
        >
          {isFetching ? "Retrying…" : "Retry"}
        </button>
      </div>
    );

  const all = data?.clients ?? [];
  const statusOf = (r: any) => {
    const active = !!r.latest_alert && !r.latest_alert.cancelled_at;
    if (active) return "active";
    if (r.forms_ready) return "ready";
    if (r.latest_alert?.cancelled_at) return "cancelled";
    return "quiet";
  };
  const order = { active: 0, ready: 1, cancelled: 2, quiet: 3 } as Record<string, number>;
  const rows = [...all].sort((a, b) => order[statusOf(a)]! - order[statusOf(b)]!);
  const counts = {
    active: all.filter((r: any) => statusOf(r) === "active").length,
    ready: all.filter((r: any) => statusOf(r) === "ready").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <header>
          <h1 className="text-2xl font-bold" style={{ color: "#6B4F4F" }}>
            Attorney Board — Client Files
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {rows.length} client file{rows.length === 1 ? "" : "s"}. Sorted so live
            detentions come first, then files whose forms are complete and waiting
            on your review.
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-white">
              {counts.active} live detention{counts.active === 1 ? "" : "s"}
            </span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-800">
              {counts.ready} ready for review
            </span>
          </div>
        </header>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Activation #</th>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Located at</th>
                <th className="px-4 py-2.5">Forms</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => {
                const isOpen = openId === r.id;
                const status = statusOf(r);
                const triggered = status === "active";
                const det = (r as any).detention;
                return (
                  <React.Fragment key={r.id}>
                    <tr className={triggered ? "animate-pulse bg-red-50/80 ring-2 ring-inset ring-red-500" : ""}>
                      <td className="px-4 py-2 font-mono font-bold">{r.activation_code}</td>
                      <td className="px-4 py-2">
                        {r.full_name ?? <span className="text-slate-400">—</span>}
                        <div className="text-[11px] text-slate-500">
                          {r.email ?? "no email"}
                          {r.phone ? ` · ${r.phone}` : ""}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {status === "active" && (
                          <span className="rounded bg-red-600 px-2 py-1 font-bold text-white">
                            🔴 DETAINED — {new Date(r.latest_alert!.triggered_at).toLocaleString()}
                          </span>
                        )}
                        {status === "ready" && (
                          <span className="rounded bg-emerald-100 px-2 py-1 font-semibold text-emerald-800">
                            Forms completed — ready for review
                          </span>
                        )}
                        {status === "cancelled" && (
                          <span className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                            Cancelled — all clear
                          </span>
                        )}
                        {status === "quiet" && (
                          <span className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                            Registered — no trigger
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-700">
                        {det?.facility_name ? (
                          <>
                            <div className="font-semibold">{det.facility_name}</div>
                            <div className="text-slate-500">{det.facility_address ?? "address pending"}</div>
                          </>
                        ) : (
                          <span className="text-slate-400">Not located yet</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        <span className="text-slate-700">{r.draft_forms.length} legal form{r.draft_forms.length === 1 ? "" : "s"}</span>
                        {r.app_uploads.length > 0 && (
                          <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 font-semibold text-emerald-800">
                            + {r.app_uploads.length} from app
                          </span>
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

  const { client, draft_forms, app_uploads, alerts, contacts, detention, forms_ready } = data as any;
  const contactsUpdatedAt = contacts.reduce((max: string | null, c: any) => {
    const t = c.updated_at ?? c.created_at ?? null;
    return t && (!max || t > max) ? t : max;
  }, null as string | null);

  return (
    <div className="space-y-5">
      <div
        className={`rounded border p-3 text-sm ${
          forms_ready
            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
            : "border-amber-300 bg-amber-50 text-amber-900"
        }`}
      >
        <div className="font-bold">
          {forms_ready
            ? "Forms completed — ready for review and mailing"
            : "Forms incomplete — waiting on the locate desk"}
        </div>
        <div className="mt-2 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
          <div><span className="font-semibold">Facility:</span> {detention?.facility_name ?? "—"}</div>
          <div><span className="font-semibold">Mailing address:</span> {detention?.facility_address ?? "—"}</div>
          <div><span className="font-semibold">Warden / officer in charge:</span> {detention?.warden_name ?? "—"}</div>
          <div><span className="font-semibold">Date of arrest:</span> {detention?.arrest_date ?? "—"}</div>
          <div><span className="font-semibold">A-number:</span> {detention?.a_number ?? client.a_number ?? "—"}</div>
          <div><span className="font-semibold">Booking / federal ID:</span> {detention?.federal_id ?? "—"}</div>
          {detention?.notes && (
            <div className="sm:col-span-2"><span className="font-semibold">Notes:</span> {detention.notes}</div>
          )}
          {detention?.located_at && (
            <div className="sm:col-span-2 text-[11px] opacity-80">
              Located {new Date(detention.located_at).toLocaleString()}
              {detention.located_by ? ` by ${detention.located_by}` : ""} — every form below was rebuilt with these values.
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 text-xs">

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
        </div>

        <div className="rounded border border-slate-200 bg-white p-3">
          <div className="font-bold uppercase tracking-wide text-slate-500 mb-1">
            Emergency contacts ({contacts.length})
          </div>
          {contactsUpdatedAt && (
            <div className="mb-1 text-slate-500">
              Last updated: {new Date(contactsUpdatedAt).toLocaleString()}
            </div>
          )}
          {contacts.length === 0 && <div className="text-slate-500">None.</div>}
          <ul className="space-y-1">
            {contacts.map((c: any) => (
              <li key={c.id}>
                <span className="font-semibold">{c.name}</span>
                {c.relationship ? ` · ${c.relationship}` : ""}
                <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 font-semibold uppercase text-slate-600">
                  {c.role ?? "family"}
                </span>
                <div className="text-slate-600">{c.phone_e164 ?? "—"} · {c.email ?? "—"}</div>
              </li>
            ))}
          </ul>
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
