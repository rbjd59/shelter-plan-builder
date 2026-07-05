import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  approveAndReleasePacket,
  emailPacketToMe,
  getPacketManifest,
  getPacketReviewStatus,
  previewPacketDoc,
  regenerateAiNarrative,
} from "@/lib/firm-packet.functions";


export const Route = createFileRoute("/_firm/firm/packet/$id")({
  head: () => ({
    meta: [
      { title: "Document Packet — Sorrentino Law Firm" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FirmPacketPage,
  errorComponent: ({ error }) => (
    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      {error.message}
    </div>
  ),
});

function downloadFromBase64(base64: string, filename: string, openInline: boolean) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  if (openInline) {
    window.open(url, "_blank", "noopener");
  } else {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function FirmPacketPage() {
  const { id } = Route.useParams();
  const fetchManifest = useServerFn(getPacketManifest);
  const fetchReviewStatus = useServerFn(getPacketReviewStatus);
  const preview = useServerFn(previewPacketDoc);
  const emailMe = useServerFn(emailPacketToMe);
  const regenerate = useServerFn(regenerateAiNarrative);
  const approve = useServerFn(approveAndReleasePacket);

  const qc = useQueryClient();
  const [busyDoc, setBusyDoc] = useState<string | null>(null);
  const [overrideEmail, setOverrideEmail] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["firm", "packet", id],
    queryFn: () => fetchManifest({ data: { intakeSessionId: id } }),
  });
  const reviewStatus = useQuery({
    queryKey: ["firm", "packet-review", id],
    queryFn: () => fetchReviewStatus({ data: { intakeSessionId: id } }),
  });

  const emailMutation = useMutation({
    mutationFn: () =>
      emailMe({ data: { intakeSessionId: id, toEmail: overrideEmail.trim() || undefined } }),
  });
  const regenerateMutation = useMutation({
    mutationFn: () => regenerate({ data: { intakeSessionId: id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["firm", "packet-review", id] }),
  });
  const approveMutation = useMutation({
    mutationFn: () => approve({ data: { intakeSessionId: id, notes: reviewNotes.trim() || undefined } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["firm", "packet-review", id] }),
  });


  if (isLoading) return <div className="text-sm text-slate-500">Loading packet…</div>;
  if (error) return <div className="text-sm text-red-700">{(error as Error).message}</div>;

  const c = (data?.case ?? null) as Record<string, unknown> | null;
  const docs = data?.docs ?? [];

  const handle = async (docKey: string, mode: "preview" | "download") => {
    setBusyDoc(`${docKey}:${mode}`);
    try {
      const res = await preview({
        data: { intakeSessionId: id, docKey: docKey as never },
      });
      downloadFromBase64(res.base64, res.filename, mode === "preview");
    } finally {
      setBusyDoc(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to="/firm/queue" className="text-xs text-amber-700 hover:text-amber-900">
          ← Back to queue
        </Link>
        <h1 className="mt-2 text-2xl font-bold" style={{ color: "#6B4F4F" }}>
          Document Packet
        </h1>
        <p className="mt-1 text-xs font-mono text-slate-500">{id}</p>
      </div>

      {c ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Case</h2>
          <dl className="mt-3 grid grid-cols-3 gap-y-2 text-sm">
            <dt className="text-slate-500">Detainee</dt>
            <dd className="col-span-2 text-slate-900">{String(c.inmate_name ?? "—")}</dd>
            <dt className="text-slate-500">Contact</dt>
            <dd className="col-span-2 text-slate-900">
              {String(c.contact_name ?? "—")}
              {c.contact_email ? ` · ${String(c.contact_email)}` : ""}
            </dd>
            <dt className="text-slate-500">Language</dt>
            <dd className="col-span-2 uppercase text-slate-900">{String(c.language ?? "—")}</dd>
          </dl>
          <div className="mt-4">
            <Link
              to="/firm/review/$id"
              params={{ id }}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900"
            >
              Open full case review →
            </Link>
          </div>
        </section>
      ) : (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No case_tracking row found. Seed the demo case from the queue page first.
        </div>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Documents</h2>
        <ul className="mt-3 divide-y divide-slate-100">
          {docs.map((d) => (
            <li key={d.key} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">{d.label}</div>
                <div className="text-xs text-slate-500">{d.description}</div>
                <div className="mt-0.5 font-mono text-[11px] text-slate-400">{d.filename}</div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  disabled={busyDoc !== null}
                  onClick={() => handle(d.key, "preview")}
                  className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {busyDoc === `${d.key}:preview` ? "Building…" : "Preview"}
                </button>
                <button
                  disabled={busyDoc !== null}
                  onClick={() => handle(d.key, "download")}
                  className="rounded bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {busyDoc === `${d.key}:download` ? "Building…" : "Download"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wide text-emerald-800">
          Email entire packet
        </h2>
        <p className="mt-2 text-sm text-emerald-900">
          Sends signed download links for every document above to the address below. Default is the
          email on your firm account.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="email"
            value={overrideEmail}
            onChange={(e) => setOverrideEmail(e.target.value)}
            placeholder="(optional) override recipient email"
            className="min-w-[280px] flex-1 rounded border border-emerald-300 bg-white px-3 py-1.5 text-sm focus:border-emerald-600 focus:outline-none"
          />
          <button
            disabled={emailMutation.isPending}
            onClick={() => emailMutation.mutate()}
            className="rounded bg-emerald-700 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {emailMutation.isPending ? "Sending…" : "Email packet to me"}
          </button>
        </div>
        {emailMutation.error ? (
          <p className="mt-2 text-xs text-red-700">{(emailMutation.error as Error).message}</p>
        ) : null}
        {emailMutation.data ? (
          <p className="mt-2 text-xs text-emerald-800">
            ✓ Queued to {emailMutation.data.to} ({emailMutation.data.sent}/{docs.length} documents).
          </p>
        ) : null}
      </section>

      <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Send via LetterStream — coming next
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Once you confirm the documents look right above, the next phase wires LetterStream so you
          can dispatch the packet as certified legal mail to the detention facility directly from
          this page.
        </p>
        <button
          disabled
          className="mt-3 cursor-not-allowed rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-400"
        >
          Send via LetterStream (disabled)
        </button>
      </section>
    </div>
  );
}
