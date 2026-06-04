import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getCaseForReview, recordAttorneyAction } from "@/lib/firm.functions";

export const Route = createFileRoute("/_firm/firm/review/$id")({
  head: () => ({ meta: [{ title: "Case Review — Sorrentino Law Firm" }, { name: "robots", content: "noindex" }] }),
  component: FirmReviewPage,
  errorComponent: ({ error }) => (
    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      {error.message}
    </div>
  ),
});

const ACTION_LABEL: Record<string, string> = {
  viewed_draft: "Viewed draft",
  reviewed_draft: "Reviewed draft",
  approved_for_storage: "Approved for storage",
  finalized_ao242: "Finalized AO 242",
  mailed: "Mailed via legal mail",
  note: "Note added",
};

function FirmReviewPage() {
  const { id } = Route.useParams();
  const fetchCase = useServerFn(getCaseForReview);
  const recordAction = useServerFn(recordAttorneyAction);
  const qc = useQueryClient();
  const [notes, setNotes] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["firm", "case", id],
    queryFn: () => fetchCase({ data: { intakeSessionId: id } }),
  });

  const mutation = useMutation({
    mutationFn: (action: "viewed_draft" | "reviewed_draft" | "approved_for_storage" | "note") =>
      recordAction({ data: { caseId: id, action, notes: notes.trim() || undefined } }),
    onSuccess: () => {
      setNotes("");
      qc.invalidateQueries({ queryKey: ["firm", "case", id] });
      qc.invalidateQueries({ queryKey: ["firm", "queue"] });
    },
  });

  if (isLoading) return <div className="text-sm text-slate-500">Loading case…</div>;
  if (error) return <div className="text-sm text-red-700">{(error as Error).message}</div>;
  if (!data?.case) {
    return (
      <div className="space-y-3">
        <Link to="/firm/queue" className="text-xs text-amber-700 hover:text-amber-900">← Back to queue</Link>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Case not found.
        </div>
      </div>
    );
  }

  const c = data.case as Record<string, unknown>;
  const retainer = data.retainer;
  const actions = data.actions;
  const intake = data.intake;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/firm/queue" className="text-xs text-amber-700 hover:text-amber-900">
          ← Back to queue
        </Link>
        <h1 className="mt-2 text-2xl font-bold" style={{ color: "#6B4F4F" }}>
          Case Review
        </h1>
        <p className="mt-1 text-xs font-mono text-slate-500">{id}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Case Details</h2>
          <dl className="mt-3 grid grid-cols-3 gap-y-2 text-sm">
            <dt className="text-slate-500">Contact</dt>
            <dd className="col-span-2 text-slate-900">{String(c.contact_name ?? "—")}</dd>
            <dt className="text-slate-500">Email</dt>
            <dd className="col-span-2 text-slate-900">{String(c.contact_email ?? "—")}</dd>
            <dt className="text-slate-500">Phone</dt>
            <dd className="col-span-2 text-slate-900">{String(c.contact_phone ?? "—")}</dd>
            <dt className="text-slate-500">Detainee</dt>
            <dd className="col-span-2 text-slate-900">{String(c.inmate_name ?? "—")}</dd>
            <dt className="text-slate-500">Language</dt>
            <dd className="col-span-2 text-slate-900 uppercase">{String(c.language ?? "—")}</dd>
            <dt className="text-slate-500">Received</dt>
            <dd className="col-span-2 text-slate-900">
              {new Date(String(c.step1_received_at)).toLocaleString()}
            </dd>
          </dl>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Limited-Scope Retainer</h2>
          {retainer ? (
            <dl className="mt-3 grid grid-cols-3 gap-y-2 text-sm">
              <dt className="text-slate-500">Signed by</dt>
              <dd className="col-span-2 text-slate-900">{retainer.signed_name}</dd>
              <dt className="text-slate-500">Signed at</dt>
              <dd className="col-span-2 text-slate-900">
                {new Date(retainer.signed_at).toLocaleString()}
              </dd>
              <dt className="text-slate-500">Version</dt>
              <dd className="col-span-2 font-mono text-xs text-slate-700">{retainer.version}</dd>
              <dt className="text-slate-500">Language</dt>
              <dd className="col-span-2 uppercase text-slate-700">{retainer.language}</dd>
              <dt className="text-slate-500">IP</dt>
              <dd className="col-span-2 font-mono text-xs text-slate-700">{retainer.ip ?? "—"}</dd>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-amber-700">
              No retainer on file for this case. Do not proceed with legal review until the
              limited-scope engagement letter is signed.
            </p>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Intake Answers</h2>
        {intake?.answers ? (
          <pre className="mt-3 max-h-96 overflow-auto rounded bg-slate-50 p-3 text-xs text-slate-800">
            {JSON.stringify(intake.answers, null, 2)}
          </pre>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No intake answers recorded yet.</p>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Record Action</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes (5000 chars max)"
          rows={3}
          className="mt-3 w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            disabled={mutation.isPending}
            onClick={() => mutation.mutate("viewed_draft")}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Mark Viewed
          </button>
          <button
            disabled={mutation.isPending}
            onClick={() => mutation.mutate("reviewed_draft")}
            className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Mark Reviewed
          </button>
          <button
            disabled={mutation.isPending || !retainer}
            onClick={() => mutation.mutate("approved_for_storage")}
            className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            title={!retainer ? "Retainer must be signed first" : ""}
          >
            Approve for Storage
          </button>
          <button
            disabled={mutation.isPending || !notes.trim()}
            onClick={() => mutation.mutate("note")}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Add Note Only
          </button>
        </div>
        {mutation.error ? (
          <p className="mt-2 text-xs text-red-700">{(mutation.error as Error).message}</p>
        ) : null}
        {mutation.isSuccess ? (
          <p className="mt-2 text-xs text-emerald-700">✓ Action recorded.</p>
        ) : null}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Action History</h2>
        {actions.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No actions recorded yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {actions.map((a) => (
              <li key={a.id} className="py-2.5 text-sm">
                <div className="flex items-baseline justify-between">
                  <span className="font-medium text-slate-900">
                    {ACTION_LABEL[a.action] ?? a.action}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(a.created_at).toLocaleString()}
                  </span>
                </div>
                {a.notes ? (
                  <p className="mt-1 whitespace-pre-wrap text-xs text-slate-600">{a.notes}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
