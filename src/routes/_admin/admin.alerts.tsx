import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listSosAlertsBoard } from "@/lib/admin.functions";

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
  } | null;
  documents: Array<{ id: string; title: string | null; content: string | null; document_type: string | null }>;
  contacts_notified: Array<{ name: string | null; email: string | null; phone_e164: string | null; relationship: string | null }>;
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
          <span className="font-mono text-slate-700">alerts@detenciondefensa.com</span>. Board auto-refreshes every 15s.
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
              <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">ACTIVE</span>
            )}
          </div>
          <div className="mt-1 text-xs text-slate-600">
            Triggered {new Date(a.triggered_at).toLocaleString()}
            {a.cancelled_at && ` · Cancelled ${new Date(a.cancelled_at).toLocaleString()}`}
          </div>
          <div className="mt-1 text-xs text-slate-600">
            {a.client?.email ?? "—"} · {a.client?.phone ?? "—"}
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
    </div>
  );
}
