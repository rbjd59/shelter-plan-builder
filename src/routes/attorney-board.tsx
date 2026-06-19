import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import PinAccessGate from "@/components/PinAccessGate";
import { pinListDetained, pinGetDetained } from "@/lib/pin-access.functions";

export const Route = createFileRoute("/attorney-board")({
  head: () => ({ meta: [{ title: "Attorney Board — DetencionDefensa" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <PinAccessGate storageKey="dd_pin_attorney" title="Attorney Board — Detained Clients">
      {(pin) => <AttorneyBoard pin={pin} />}
    </PinAccessGate>
  ),
});

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function AttorneyBoard({ pin }: { pin: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const listFn = useServerFn(pinListDetained);
  const { data, isLoading, error } = useQuery({
    queryKey: ["pin-detained"],
    queryFn: () => listFn({ data: { pin } }),
    refetchInterval: 30000,
  });

  if (isLoading) return <div className="p-8 text-slate-500">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{(error as Error).message}</div>;

  const rows = data?.clients ?? [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#6B4F4F" }}>Attorney Board — Detained Clients</h1>
          <p className="mt-1 text-sm text-slate-600">{rows.length} client{rows.length === 1 ? "" : "s"} with an active alert or recorded detention.</p>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Client</th>
                <th className="px-4 py-2.5">A-Number</th>
                <th className="px-4 py-2.5">Facility</th>
                <th className="px-4 py-2.5">Arrest</th>
                <th className="px-4 py-2.5">Alert</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No detained clients yet.</td></tr>
              ) : rows.map((c: any) => {
                const d = c.detention; const a = c.latest_alert;
                return (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{c.full_name ?? "—"}</div>
                      <div className="text-xs font-mono text-slate-500">{c.activation_code}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">{d?.a_number ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{d?.facility_name ?? <span className="text-amber-700">Not located yet</span>}</td>
                    <td className="px-4 py-3 text-slate-700">{d?.arrest_date ?? "—"}</td>
                    <td className="px-4 py-3 text-xs">
                      {a ? (a.cancelled_at
                        ? <span className="text-slate-500">Cancelled</span>
                        : <span className="font-semibold text-red-700">ACTIVE</span>) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setOpenId(openId === c.id ? null : c.id)} className="text-xs font-semibold text-amber-700 hover:text-amber-900">
                        {openId === c.id ? "Close" : "Open →"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {openId && <ClientDetail pin={pin} clientId={openId} />}
      </div>
    </div>
  );
}

function ClientDetail({ pin, clientId }: { pin: string; clientId: string }) {
  const fn = useServerFn(pinGetDetained);
  const { data, isLoading, error } = useQuery({
    queryKey: ["pin-detained", clientId],
    queryFn: () => fn({ data: { pin, clientId } }),
    refetchInterval: 30000,
  });
  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (error) return <p className="text-sm text-red-700">{(error as Error).message}</p>;
  if (!data) return null;
  const c = data.client as any; const d = data.detention as any;

  return (
    <div className="space-y-5 rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold" style={{ color: "#6B4F4F" }}>{c.full_name}</h2>
      <div className="grid gap-5 lg:grid-cols-2">
        <section>
          <h3 className="text-xs font-bold uppercase text-slate-600">Client</h3>
          <dl className="mt-2 grid grid-cols-3 gap-y-1 text-sm">
            <dt className="text-slate-500">Email</dt><dd className="col-span-2">{c.email ?? "—"}</dd>
            <dt className="text-slate-500">Phone</dt><dd className="col-span-2">{c.phone_e164 ?? "—"}</dd>
            <dt className="text-slate-500">Country</dt><dd className="col-span-2">{c.country_of_origin ?? "—"}</dd>
            <dt className="text-slate-500">Language</dt><dd className="col-span-2 uppercase">{c.language ?? "—"}</dd>
          </dl>
        </section>
        <section>
          <h3 className="text-xs font-bold uppercase text-slate-600">Detention</h3>
          {d ? (
            <dl className="mt-2 grid grid-cols-3 gap-y-1 text-sm">
              <dt className="text-slate-500">A-Number</dt><dd className="col-span-2 font-mono">{d.a_number ?? "—"}</dd>
              <dt className="text-slate-500">Federal ID</dt><dd className="col-span-2 font-mono">{d.federal_id ?? "—"}</dd>
              <dt className="text-slate-500">Facility</dt><dd className="col-span-2">{d.facility_name ?? "—"}</dd>
              <dt className="text-slate-500">Address</dt><dd className="col-span-2 whitespace-pre-wrap">{d.facility_address ?? "—"}</dd>
              <dt className="text-slate-500">Warden</dt><dd className="col-span-2">{d.warden_name ?? "—"}</dd>
              <dt className="text-slate-500">Arrest date</dt><dd className="col-span-2">{d.arrest_date ?? "—"}</dd>
            </dl>
          ) : <p className="mt-2 text-sm text-amber-700">Client not yet located. Company will update once detention facility is confirmed.</p>}
        </section>
      </div>

      <section>
        <h3 className="text-xs font-bold uppercase text-slate-600">Legal Forms ({data.documents.length})</h3>
        {data.documents.length === 0 ? <p className="mt-2 text-sm text-slate-500">No documents.</p> : (
          <ul className="mt-2 divide-y divide-slate-100">
            {(data.documents as any[]).map((doc) => (
              <li key={doc.id} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium">{doc.title ?? "Untitled"}</div>
                  <div className="text-xs text-slate-500">{doc.document_type ?? "document"}</div>
                </div>
                <button onClick={() => downloadText(`${(doc.title ?? "doc").replace(/[^a-z0-9]+/gi, "_")}.txt`, doc.content ?? "")}
                  className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50">⬇ Download</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="text-xs font-bold uppercase text-slate-600">Emergency Contacts</h3>
        {data.contacts.length === 0 ? <p className="mt-2 text-sm text-slate-500">None.</p> : (
          <ul className="mt-2 space-y-1 text-sm">
            {(data.contacts as any[]).map((ct, i) => (
              <li key={i}>
                <span className="font-medium">{ct.name}</span>
                {ct.relationship && <span className="text-slate-500"> ({ct.relationship})</span>}
                {" — "}{ct.email ?? ""} {ct.phone_e164 ?? ""}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
