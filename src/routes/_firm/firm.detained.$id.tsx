import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDetainedClient } from "@/lib/firm.functions";

export const Route = createFileRoute("/_firm/firm/detained/$id")({
  head: () => ({ meta: [{ title: "Detained Client — Sorrentino Law Firm" }, { name: "robots", content: "noindex" }] }),
  component: DetainedClientDetail,
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

function DetainedClientDetail() {
  const { id } = Route.useParams();
  const fn = useServerFn(getDetainedClient);
  const { data, isLoading, error } = useQuery({
    queryKey: ["firm", "detained", id],
    queryFn: () => fn({ data: { clientId: id } }),
    refetchInterval: 30000,
  });

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (error) return <p className="text-sm text-red-700">{(error as Error).message}</p>;
  if (!data) return null;

  const c = data.client as any;
  const d = data.detention as any;
  const activeAlert = (data.alerts as any[]).find((a) => !a.cancelled_at);

  return (
    <div className="space-y-6">
      <div>
        <Link to="/firm/detained" className="text-xs text-amber-700 hover:text-amber-900">← Back to detained clients</Link>
        <h1 className="mt-2 text-2xl font-bold" style={{ color: "#6B4F4F" }}>{c.full_name ?? "Unknown client"}</h1>
        <p className="mt-1 text-xs font-mono text-slate-500">Activation code: {c.invite_token}</p>
      </div>

      {activeAlert && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4">
          <div className="text-sm font-bold text-red-800">
            🚨 ACTIVE EMERGENCY ALERT · triggered {new Date(activeAlert.triggered_at).toLocaleString()}
          </div>
          {activeAlert.lat && activeAlert.lng && (
            <a
              href={`https://maps.google.com/?q=${activeAlert.lat},${activeAlert.lng}`}
              target="_blank" rel="noreferrer"
              className="mt-1 inline-block text-xs text-blue-700 underline"
            >
              📍 GPS at trigger: {activeAlert.lat}, {activeAlert.lng}
            </a>
          )}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Client Information</h2>
          <dl className="mt-3 grid grid-cols-3 gap-y-2 text-sm">
            <dt className="text-slate-500">Full name</dt>
            <dd className="col-span-2 text-slate-900">{c.full_name ?? "—"}</dd>
            <dt className="text-slate-500">Email</dt>
            <dd className="col-span-2 text-slate-900">{c.email ?? "—"}</dd>
            <dt className="text-slate-500">Phone</dt>
            <dd className="col-span-2 text-slate-900">{c.phone_e164 ?? "—"}</dd>
            <dt className="text-slate-500">Country of origin</dt>
            <dd className="col-span-2 text-slate-900">{c.country_of_origin ?? "—"}</dd>
            <dt className="text-slate-500">Place of birth</dt>
            <dd className="col-span-2 text-slate-900">{c.place_of_birth ?? "—"}</dd>
            <dt className="text-slate-500">Language</dt>
            <dd className="col-span-2 uppercase text-slate-700">{c.language ?? "—"}</dd>
          </dl>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Detention Location</h2>
          {d ? (
            <>
              <dl className="mt-3 grid grid-cols-3 gap-y-2 text-sm">
                <dt className="text-slate-500">A-Number</dt>
                <dd className="col-span-2 font-mono text-slate-900">{d.a_number ?? "—"}</dd>
                <dt className="text-slate-500">Federal/ICE ID</dt>
                <dd className="col-span-2 font-mono text-slate-900">{d.federal_id ?? "—"}</dd>
                <dt className="text-slate-500">Facility</dt>
                <dd className="col-span-2 text-slate-900">{d.facility_name ?? "—"}</dd>
                <dt className="text-slate-500">Address</dt>
                <dd className="col-span-2 whitespace-pre-wrap text-slate-900">{d.facility_address ?? "—"}</dd>
                <dt className="text-slate-500">Warden</dt>
                <dd className="col-span-2 text-slate-900">{d.warden_name ?? "—"}</dd>
                <dt className="text-slate-500">Arrest date</dt>
                <dd className="col-span-2 text-slate-900">{d.arrest_date ?? "—"}</dd>
                <dt className="text-slate-500">Located</dt>
                <dd className="col-span-2 text-xs text-slate-500">
                  {d.located_at ? `${new Date(d.located_at).toLocaleString()} by ${d.located_by ?? "—"}` : "—"}
                </dd>
              </dl>
              {d.notes && (
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <div className="text-xs font-semibold uppercase text-slate-500">Notes</div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{d.notes}</p>
                </div>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-amber-700">
              Client not yet located. DetencionDefensa.com operations team will update this once
              detention facility is confirmed.
            </p>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">
          Legal Forms on File ({data.documents.length})
        </h2>
        {data.documents.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No documents stored for this client.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {(data.documents as any[]).map((doc) => (
              <li key={doc.id} className="flex items-center justify-between py-2.5">
                <div>
                  <div className="text-sm font-medium text-slate-900">{doc.title ?? "Untitled"}</div>
                  <div className="text-xs text-slate-500">
                    {doc.document_type ?? "document"} · loaded {new Date(doc.loaded_at).toLocaleDateString()}
                    {doc.send_on_alert && <span className="ml-2 text-emerald-700">· auto-sent on alert</span>}
                  </div>
                </div>
                <button
                  onClick={() =>
                    downloadText(
                      `${(doc.title ?? "document").replace(/[^a-z0-9]+/gi, "_")}.txt`,
                      doc.content ?? "",
                    )
                  }
                  className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  ⬇ Download
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Emergency Contacts</h2>
        {data.contacts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No emergency contacts listed.</p>
        ) : (
          <ul className="mt-3 space-y-1.5 text-sm">
            {(data.contacts as any[]).map((ct, i) => (
              <li key={i} className="text-slate-700">
                <span className="font-medium">{ct.name}</span>
                {ct.relationship && <span className="text-slate-500"> ({ct.relationship})</span>}
                {" — "}
                {ct.email && <span>{ct.email} </span>}
                {ct.phone_e164 && <span className="font-mono">{ct.phone_e164}</span>}
                {ct.notify_on_sos && <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-800">notified</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
