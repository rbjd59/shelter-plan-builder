import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import PinAccessGate from "@/components/PinAccessGate";
import { pinListAlerts, pinUpsertDetention } from "@/lib/pin-access.functions";

export const Route = createFileRoute("/company-board")({
  head: () => ({ meta: [{ title: "Company Board — DetencionDefensa" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <PinAccessGate storageKey="dd_pin_company" title="Company Admin Board">
      {(pin) => <CompanyBoard pin={pin} />}
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

function CompanyBoard({ pin }: { pin: string }) {
  const fn = useServerFn(pinListAlerts);
  const { data, isLoading, error } = useQuery({
    queryKey: ["pin-alerts"],
    queryFn: () => fn({ data: { pin } }),
    refetchInterval: 15000,
  });

  if (isLoading) return <div className="p-8 text-slate-500">Loading alert board…</div>;
  if (error) return <div className="p-8 text-red-600">{(error as Error).message}</div>;

  const alerts = (data?.alerts ?? []) as any[];
  const active = alerts.filter((a) => !a.cancelled_at);
  const resolved = alerts.filter((a) => a.cancelled_at);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Company Admin — SOS Alert Board</h1>
          <p className="mt-1 text-xs text-slate-500">Auto-refreshes every 15s. PIN-gated quick access.</p>
        </div>

        <Section title={`Active alerts (${active.length})`} accent="text-red-700">
          {active.length === 0 ? <p className="text-sm text-slate-500">No active alerts.</p> : active.map((a) => <AlertCard key={a.id} a={a} pin={pin} />)}
        </Section>

        <Section title={`Resolved / cancelled (${resolved.length})`} accent="text-slate-700">
          {resolved.length === 0 ? <p className="text-sm text-slate-500">None yet.</p> : resolved.slice(0, 50).map((a) => <AlertCard key={a.id} a={a} pin={pin} muted />)}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className={`mb-3 text-sm font-bold uppercase tracking-wide ${accent}`}>{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function AlertCard({ a, pin, muted }: { a: any; pin: string; muted?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${muted ? "border-slate-200 bg-white" : "border-red-300 bg-red-50"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-900">{a.client?.activation_code ?? "—"}</span>
            <span className="text-sm font-semibold text-slate-900">{a.client?.full_name ?? "Unknown"}</span>
            {a.cancelled_at
              ? <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">CANCELLED</span>
              : <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">ACTIVE</span>}
          </div>
          <div className="mt-1 text-xs text-slate-600">Triggered {new Date(a.triggered_at).toLocaleString()}</div>
          <div className="mt-1 text-xs text-slate-600">{a.client?.email ?? "—"} · {a.client?.phone ?? "—"}</div>
          {a.lat && a.lng && (
            <a href={`https://maps.google.com/?q=${a.lat},${a.lng}`} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-blue-700 underline">
              📍 {a.lat.toFixed?.(5) ?? a.lat}, {a.lng.toFixed?.(5) ?? a.lng}
            </a>
          )}
        </div>
        {a.documents?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {a.documents.map((d: any) => (
              <button key={d.id} onClick={() => downloadText(`${(d.title ?? "doc").replace(/[^a-z0-9]+/gi, "_")}.txt`, d.content ?? "")}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-100">⬇ {d.title ?? "Doc"}</button>
            ))}
          </div>
        )}
      </div>

      {a.client?.id && <LocateForm pin={pin} clientId={a.client.id} existing={a.detention_info} />}
    </div>
  );
}

function LocateForm({ pin, clientId, existing }: { pin: string; clientId: string; existing: any }) {
  const [open, setOpen] = useState(!existing);
  const [form, setForm] = useState({
    facility_name: existing?.facility_name ?? "",
    facility_address: existing?.facility_address ?? "",
    warden_name: existing?.warden_name ?? "",
    arrest_date: existing?.arrest_date ?? "",
    a_number: existing?.a_number ?? "",
    federal_id: existing?.federal_id ?? "",
    notes: existing?.notes ?? "",
  });
  const upsert = useServerFn(pinUpsertDetention);
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: () => upsert({ data: { pin, client_id: clientId, ...form } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pin-alerts"] }),
  });

  return (
    <div className="mt-3 border-t-2 border-amber-300 pt-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase text-amber-800">📍 Detention location {existing ? "(on file → attorney board)" : "— locate client"}</div>
        <button onClick={() => setOpen(!open)} className="text-xs text-slate-600 underline">{open ? "Hide" : existing ? "Edit" : "Locate now"}</button>
      </div>
      {existing && !open && (
        <div className="mt-2 text-xs text-slate-700">
          <span className="font-semibold">{existing.facility_name ?? "—"}</span>
          {existing.a_number && <span className="ml-2 font-mono">A# {existing.a_number}</span>}
          {existing.arrest_date && <span className="ml-2">arrested {existing.arrest_date}</span>}
        </div>
      )}
      {open && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <F label="Detention facility" v={form.facility_name} on={(v) => setForm({ ...form, facility_name: v })} />
          <F label="A-Number" v={form.a_number} on={(v) => setForm({ ...form, a_number: v })} mono />
          <F label="Facility address" v={form.facility_address} on={(v) => setForm({ ...form, facility_address: v })} full />
          <F label="Warden's name" v={form.warden_name} on={(v) => setForm({ ...form, warden_name: v })} />
          <F label="Federal / ICE ID" v={form.federal_id} on={(v) => setForm({ ...form, federal_id: v })} mono />
          <F label="Arrest date" v={form.arrest_date} on={(v) => setForm({ ...form, arrest_date: v })} type="date" />
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold uppercase text-slate-500">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button onClick={() => m.mutate()} disabled={m.isPending} className="rounded bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50">
              {m.isPending ? "Saving…" : existing ? "Update" : "Save & send to attorney"}
            </button>
            {m.isSuccess && <span className="text-xs text-emerald-700">✓ Saved · pushed to attorney board</span>}
            {m.error && <span className="text-xs text-red-700">{(m.error as Error).message}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, v, on, type = "text", mono, full }: { label: string; v: string; on: (s: string) => void; type?: string; mono?: boolean; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-[11px] font-semibold uppercase text-slate-500">{label}</label>
      <input type={type} value={v} onChange={(e) => on(e.target.value)} className={`mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm ${mono ? "font-mono" : ""}`} />
    </div>
  );
}
