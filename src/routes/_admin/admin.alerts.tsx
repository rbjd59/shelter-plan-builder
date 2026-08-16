import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listSosAlertsBoard, upsertDetentionInfo } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/admin/alerts")({
  component: AlertsBoardPage,
});

type AlertRow = {
  id: string;
  triggered_at: string;
  cancelled_at: string | null;
  lat: number | null;
  lng: number | null;
  battery_pct: number | null;
  payload: unknown;
  client: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    activation_code: string | null;
    language: string | null;
    a_number: string | null;
    date_of_birth: string | null;
    place_of_birth: string | null;
    country_of_origin: string | null;
    has_asset_protection: boolean | null;
    has_pet_rescue: boolean | null;
  } | null;
  documents: Array<{ id: string; title: string | null; content: string | null; document_type: string | null }>;
  contacts_notified: Array<{ name: string | null; email: string | null; phone_e164: string | null; relationship: string | null }>;
  detention_info: {
    facility_name: string | null;
    facility_address: string | null;
    warden_name: string | null;
    arrest_date: string | null;
    a_number: string | null;
    federal_id: string | null;
    notes: string | null;
    located_at: string | null;
    located_by: string | null;
  } | null;
};

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

function downloadAlertPacket(a: AlertRow) {
  const lines: string[] = [];
  lines.push(`EMERGENCY ALERT PACKET`);
  lines.push(`========================`);
  lines.push(`Triggered: ${new Date(a.triggered_at).toLocaleString()}`);
  if (a.cancelled_at) lines.push(`CANCELLED: ${new Date(a.cancelled_at).toLocaleString()}`);
  lines.push(``);
  lines.push(`Client: ${a.client?.full_name ?? "—"}`);
  lines.push(`Activation code: ${a.client?.activation_code ?? "—"}`);
  lines.push(`Email: ${a.client?.email ?? "—"}`);
  lines.push(`Phone: ${a.client?.phone ?? "—"}`);
  lines.push(`Language: ${a.client?.language ?? "—"}`);
  lines.push(``);
  if (a.lat && a.lng) lines.push(`Location: ${a.lat}, ${a.lng}  (https://maps.google.com/?q=${a.lat},${a.lng})`);
  if (a.battery_pct != null) lines.push(`Battery: ${a.battery_pct}%`);
  lines.push(``);
  lines.push(`---- Contacts notified ----`);
  for (const c of a.contacts_notified) {
    lines.push(`• ${c.name ?? "—"} (${c.relationship ?? "—"}) — ${c.email ?? ""} ${c.phone_e164 ?? ""}`);
  }
  lines.push(``);
  for (const d of a.documents) {
    lines.push(``);
    lines.push(`================ ${d.title ?? "Document"} ================`);
    lines.push(d.content ?? "");
  }
  const safeName = (a.client?.full_name ?? "client").replace(/[^a-z0-9]+/gi, "_");
  downloadText(`alert_${safeName}_${a.id.slice(0, 8)}.txt`, lines.join("\n"));
}

function AlertsBoardPage() {
  const fetchFn = useServerFn(listSosAlertsBoard);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-sos-alerts"],
    queryFn: () => fetchFn(),
    refetchInterval: 15000,
  });

  if (isLoading) return <p className="text-sm text-slate-500">Loading alert board…</p>;
  if (error) return <p className="text-sm text-red-600">{(error as Error).message}</p>;

  const alerts = (data?.alerts ?? []) as AlertRow[];
  const active = alerts.filter((a) => !a.cancelled_at);
  const resolved = alerts.filter((a) => a.cancelled_at);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-xs text-slate-500">
          A copy of every SOS alert is also emailed to{" "}
          <span className="font-mono text-slate-700">legal@detenciondefensa.com</span>. Board auto-refreshes every 15s.
        </p>
      </div>

      <Section title={`Active alerts (${active.length})`} accent="text-red-700">
        {active.length === 0 ? (
          <p className="text-sm text-slate-500">No active alerts.</p>
        ) : (
          active.map((a) => <AlertCard key={a.id} a={a} />)
        )}
      </Section>

      <Section title={`Resolved / cancelled (${resolved.length})`} accent="text-slate-700">
        {resolved.length === 0 ? (
          <p className="text-sm text-slate-500">No resolved alerts yet.</p>
        ) : (
          resolved.slice(0, 50).map((a) => <AlertCard key={a.id} a={a} muted />)
        )}
      </Section>
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

function AlertCard({ a, muted }: { a: AlertRow; muted?: boolean }) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        muted ? "border-slate-200 bg-slate-50" : "border-red-300 bg-red-50"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-900">{a.client?.activation_code ?? "—"}</span>
            <span className="text-sm font-semibold text-slate-900">{a.client?.full_name ?? "Unknown client"}</span>
            {a.cancelled_at ? (
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">CANCELLED</span>
            ) : (
              <span className="animate-pulse rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white ring-2 ring-red-300">🔴 ACTIVE</span>
            )}
          </div>
          <div className="mt-1 text-xs text-slate-600">
            Triggered {new Date(a.triggered_at).toLocaleString()}
            {a.cancelled_at && ` · Cancelled ${new Date(a.cancelled_at).toLocaleString()}`}
          </div>
          <div className="mt-1 text-xs text-slate-600">
            {a.client?.email ?? "—"} · {a.client?.phone ?? "—"}
          </div>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-700">
            <span className="font-mono">A# {a.client?.a_number ?? "—"}</span>
            <span>DOB {a.client?.date_of_birth ?? "—"}</span>
            <span>Birthplace {a.client?.place_of_birth ?? "—"}</span>
            {a.client?.has_asset_protection && <span className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-900">Asset protection</span>}
            {a.client?.has_pet_rescue && <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-semibold text-emerald-900">Pet protection</span>}
          </div>
          {a.lat && a.lng && (
            <div className="mt-1 text-xs">
              <a
                href={`https://maps.google.com/?q=${a.lat},${a.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-700 underline"
              >
                📍 {a.lat.toFixed(5)}, {a.lng.toFixed(5)}
              </a>
              {a.battery_pct != null && <span className="ml-2 text-slate-500">· Battery {a.battery_pct}%</span>}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => downloadAlertPacket(a)}
            className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700"
          >
            ⬇ Download full packet
          </button>
          {a.documents.length > 0 && (
            <span className="text-center text-[10px] text-slate-500">{a.documents.length} document(s)</span>
          )}
        </div>
      </div>

      {a.documents.length > 0 && (
        <div className="mt-3 border-t border-slate-200 pt-3">
          <div className="text-xs font-semibold uppercase text-slate-500 mb-2">Documents sent to contacts</div>
          <div className="flex flex-wrap gap-2">
            {a.documents.map((d) => (
              <button
                key={d.id}
                onClick={() =>
                  downloadText(
                    `${(d.title ?? "document").replace(/[^a-z0-9]+/gi, "_")}.txt`,
                    d.content ?? "",
                  )
                }
                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-100"
              >
                ⬇ {d.title ?? "Untitled"}
              </button>
            ))}
          </div>
        </div>
      )}

      {a.contacts_notified.length > 0 && (
        <div className="mt-3 border-t border-slate-200 pt-3">
          <div className="text-xs font-semibold uppercase text-slate-500 mb-1">Contacts notified by email</div>
          <ul className="text-xs text-slate-700 space-y-0.5">
            {a.contacts_notified.map((c, i) => (
              <li key={i}>
                {c.name ?? "—"} ({c.relationship ?? "—"}) — {c.email ?? "no email"}
              </li>
            ))}
          </ul>
        </div>
      )}

      {a.client?.id && <LocateForm clientId={a.client.id} existing={a.detention_info} />}
    </div>
  );
}

function LocateForm({
  clientId,
  existing,
}: {
  clientId: string;
  existing: AlertRow["detention_info"];
}) {
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
  const upsertFn = useServerFn(upsertDetentionInfo);
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => upsertFn({ data: { client_id: clientId, ...form } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-sos-alerts"] });
      qc.invalidateQueries({ queryKey: ["firm", "detained"] });
    },
  });

  return (
    <div className="mt-3 border-t-2 border-amber-300 pt-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase text-amber-800">
          📍 Detention location {existing ? "(on file — sent to attorney)" : "— locate client"}
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-xs text-slate-600 hover:text-slate-900 underline"
        >
          {open ? "Hide" : existing ? "Edit" : "Locate now"}
        </button>
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
          <Field label="Detention facility" value={form.facility_name} onChange={(v) => setForm({ ...form, facility_name: v })} />
          <Field label="A-Number (alien #)" value={form.a_number} onChange={(v) => setForm({ ...form, a_number: v })} mono />
          <Field label="Facility address" value={form.facility_address} onChange={(v) => setForm({ ...form, facility_address: v })} full />
          <Field label="Warden's name" value={form.warden_name} onChange={(v) => setForm({ ...form, warden_name: v })} />
          <Field label="Federal / ICE ID" value={form.federal_id} onChange={(v) => setForm({ ...form, federal_id: v })} mono />
          <Field label="Arrest date" value={form.arrest_date} onChange={(v) => setForm({ ...form, arrest_date: v })} type="date" />
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold uppercase text-slate-500">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="rounded bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {mutation.isPending ? "Saving…" : existing ? "Update detention info" : "Save & send to attorney"}
            </button>
            {mutation.isSuccess && <span className="text-xs text-emerald-700">✓ Saved · pushed to attorney board</span>}
            {mutation.error && <span className="text-xs text-red-700">{(mutation.error as Error).message}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", mono, full,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  mono?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-[11px] font-semibold uppercase text-slate-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
}
