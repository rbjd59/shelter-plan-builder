import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getClientDetail, recordCaseAction } from "@/lib/admin.functions";

export const Route = createFileRoute("/_admin/admin/clients/$id")({
  component: ClientDetail,
});

type ActionStep = "forms_sent" | "client_located" | "package_mailed" | "package_received";

function ClientDetail() {
  const { id } = Route.useParams();
  const fetchDetail = useServerFn(getClientDetail);
  const addAction = useServerFn(recordCaseAction);
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-client", id],
    queryFn: () => fetchDetail({ data: { id } }),
  });
  const [busy, setBusy] = useState<string | null>(null);
  const [facility, setFacility] = useState("");
  const [pkg, setPkg] = useState({ name: "", institution: "", inmate_number: "", tracking_number: "" });
  const [received, setReceived] = useState({ received_on: new Date().toISOString().slice(0, 10) });

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (error) return <p className="text-sm text-red-600">{(error as Error).message}</p>;
  if (!data) return null;

  const answers = (data.submission.answers as Record<string, unknown>) ?? {};
  const t = data.trigger;
  const sessionId = data.submission.stripe_session_id as string;
  const actionsByStep = new Map<string, { created_at: string; completed_by: string | null; metadata: Record<string, unknown> }>();
  for (const a of data.actions) actionsByStep.set(a.step, a);

  const recordStep = async (step: ActionStep, metadata?: Record<string, unknown>) => {
    setBusy(step);
    try {
      await addAction({ data: { intake_session_id: sessionId, step, metadata } });
      await qc.invalidateQueries({ queryKey: ["admin-client", id] });
    } finally {
      setBusy(null);
    }
  };

  const StepRow = ({
    n, label, step, done, children,
  }: { n: number; label: string; step?: ActionStep; done?: { at: string; by: string | null; meta?: Record<string, unknown> }; children?: React.ReactNode }) => (
    <div className={`rounded border p-3 ${done ? "border-green-200 bg-green-50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase text-slate-500">Step {n}</div>
          <div className="font-medium">{label}</div>
          {done && (
            <div className="mt-1 text-xs text-green-700">
              ✓ {new Date(done.at).toLocaleString()} {done.by ? `· ${done.by}` : ""}
              {done.meta && Object.keys(done.meta).length > 0 && (
                <pre className="mt-1 whitespace-pre-wrap text-[11px] text-slate-600">{JSON.stringify(done.meta, null, 1)}</pre>
              )}
            </div>
          )}
        </div>
        {!done && step && children}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/clients" className="text-xs text-slate-500 hover:underline">← All clients</Link>
          <h1 className="mt-1 text-xl font-bold">
            {(answers.mail_inmate_name as string) ||
              (answers.full_name as string) ||
              (answers.contact_name as string) ||
              "Client"}
          </h1>
          <p className="text-xs text-slate-500">Session: {sessionId}</p>
        </div>
        <a
          href={`/admin/clients/${id}/print`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => { e.preventDefault(); window.print(); }}
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
        >🖨 Print status form</a>
      </div>

      {/* Client info */}
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2 text-sm">
        <div><span className="text-slate-500">Email:</span> {data.submission.email ?? "—"}</div>
        <div><span className="text-slate-500">Language:</span> {data.submission.language}</div>
        <div><span className="text-slate-500">A-Number:</span> {(answers.a_number as string) ?? "—"}</div>
        <div><span className="text-slate-500">Contact phone:</span> {(answers.contact_phone as string) ?? "—"}</div>
        <div className="md:col-span-2"><span className="text-slate-500">Facility on file:</span> {(answers.mail_facility_address as string) ?? "—"}</div>
      </div>

      <h2 className="text-sm font-semibold text-slate-900">Action checklist</h2>
      <div className="space-y-2">
        <StepRow n={1} label="Triggered alert at"
          done={t ? { at: t.fired_at, by: "system" } : undefined} />

        <div className={`rounded border p-3 ${t?.cancelled_at ? "border-slate-300 bg-slate-50" : t ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"}`}>
          <div className="text-xs uppercase text-slate-500">Step 2</div>
          <div className="font-medium">Cancellation window</div>
          {t ? (
            t.cancelled_at ? (
              <div className="mt-1 text-xs text-slate-600">✗ CANCELLED by client at {new Date(t.cancelled_at).toLocaleString()}</div>
            ) : new Date(t.act_after) < new Date() ? (
              <div className="mt-1 text-xs text-amber-800">✓ Passed deadline {new Date(t.act_after).toLocaleString()} — acting</div>
            ) : (
              <div className="mt-1 text-xs text-slate-600">⏳ Acts after {new Date(t.act_after).toLocaleString()}</div>
            )
          ) : (
            <div className="mt-1 text-xs text-slate-500">Not yet triggered.</div>
          )}
        </div>

        <StepRow n={3} label="Forms sent to legal@detenciondefensa.com for printing"
          step="forms_sent"
          done={actionsByStep.has("forms_sent") ? { at: actionsByStep.get("forms_sent")!.created_at, by: actionsByStep.get("forms_sent")!.completed_by } : undefined}>
          <button disabled={busy === "forms_sent"} onClick={() => recordStep("forms_sent")}
            className="rounded bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50">
            {busy === "forms_sent" ? "Saving…" : "Mark sent"}
          </button>
        </StepRow>

        <StepRow n={4} label="Located client at"
          step="client_located"
          done={actionsByStep.has("client_located") ? { at: actionsByStep.get("client_located")!.created_at, by: actionsByStep.get("client_located")!.completed_by, meta: actionsByStep.get("client_located")!.metadata } : undefined}>
          <div className="flex gap-2">
            <input value={facility} onChange={(e) => setFacility(e.target.value)} placeholder="Facility name & address"
              className="rounded border border-slate-300 px-2 py-1 text-xs w-64" />
            <button disabled={!facility || busy === "client_located"} onClick={() => recordStep("client_located", { facility })}
              className="rounded bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50">Save</button>
          </div>
        </StepRow>

        <StepRow n={5} label="Mailed client package"
          step="package_mailed"
          done={actionsByStep.has("package_mailed") ? { at: actionsByStep.get("package_mailed")!.created_at, by: actionsByStep.get("package_mailed")!.completed_by, meta: actionsByStep.get("package_mailed")!.metadata } : undefined}>
          <div className="grid w-80 gap-1">
            <input value={pkg.name} onChange={(e) => setPkg({ ...pkg, name: e.target.value })} placeholder="Name" className="rounded border border-slate-300 px-2 py-1 text-xs" />
            <input value={pkg.institution} onChange={(e) => setPkg({ ...pkg, institution: e.target.value })} placeholder="Institution + address" className="rounded border border-slate-300 px-2 py-1 text-xs" />
            <input value={pkg.inmate_number} onChange={(e) => setPkg({ ...pkg, inmate_number: e.target.value })} placeholder="Inmate number" className="rounded border border-slate-300 px-2 py-1 text-xs" />
            <input value={pkg.tracking_number} onChange={(e) => setPkg({ ...pkg, tracking_number: e.target.value })} placeholder="USPS tracking #" className="rounded border border-slate-300 px-2 py-1 text-xs" />
            <button disabled={!pkg.name || !pkg.tracking_number || busy === "package_mailed"}
              onClick={() => recordStep("package_mailed", pkg)}
              className="rounded bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50">
              Save mailed
            </button>
          </div>
        </StepRow>

        <StepRow n={6} label="Package received on"
          step="package_received"
          done={actionsByStep.has("package_received") ? { at: actionsByStep.get("package_received")!.created_at, by: actionsByStep.get("package_received")!.completed_by, meta: actionsByStep.get("package_received")!.metadata } : undefined}>
          <div className="flex gap-2">
            <input type="date" value={received.received_on} onChange={(e) => setReceived({ received_on: e.target.value })}
              className="rounded border border-slate-300 px-2 py-1 text-xs" />
            <button disabled={busy === "package_received"} onClick={() => recordStep("package_received", received)}
              className="rounded bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50">Save</button>
          </div>
        </StepRow>
      </div>

      <style>{`@media print { header, nav, button, a, input, select { display: none !important; } body { background: white; } }`}</style>
    </div>
  );
}
