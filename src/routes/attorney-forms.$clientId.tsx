import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import PinAccessGate from "@/components/PinAccessGate";
import {
  pinGetFormAnswers,
  pinSaveFormAnswers,
  pinGenerateForms,
  pinDownloadDocument,
} from "@/lib/pin-access.functions";
import { FORM_FIELD_GROUPS } from "@/lib/form-fields";

export const Route = createFileRoute("/attorney-forms/$clientId")({
  head: () => ({
    meta: [
      { title: "Edit Case Forms — DetencionDefensa" },
      { name: "robots", content: "noindex" },
      {
        name: "description",
        content: "Attorney-only editor for the information used in a detained client's filings.",
      },
    ],
  }),
  component: () => {
    const { clientId } = Route.useParams();
    return (
      <PinAccessGate storageKey="dd_pin_attorney" title="Attorney Board — Edit Case Forms">
        {(pin) => <FormEditor pin={pin} clientId={clientId} />}
      </PinAccessGate>
    );
  },
});

import { usePdfPreview } from "@/components/PdfPreviewDialog";

function FormEditor({ pin, clientId }: { pin: string; clientId: string }) {
  const getFn = useServerFn(pinGetFormAnswers);
  const saveFn = useServerFn(pinSaveFormAnswers);
  const buildFn = useServerFn(pinGenerateForms);
  const downloadFn = useServerFn(pinDownloadDocument);
  const preview = usePdfPreview();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["attorney-form-answers", clientId],
    queryFn: () => getFn({ data: { pin, clientId } }),
  });

  const [draft, setDraft] = React.useState<Record<string, string> | null>(null);
  // What the server sent us. Anything the attorney did not touch is NOT saved
  // as an override, so later locate-desk corrections still reach the forms.
  const baseline = React.useRef<Record<string, string>>({});
  const [status, setStatus] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (data?.answers) {
      baseline.current = { ...(data.answers as Record<string, string>) };
      setDraft({ ...(data.answers as Record<string, string>) });
    }
  }, [data]);

  if (error)
    return (
      <div className="space-y-3 p-8">
        <p className="text-red-600">{(error as Error).message}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm font-semibold"
        >
          Try again
        </button>
      </div>
    );
  if (isLoading || !draft) return <div className="p-8 text-slate-500">Loading case file…</div>;
  if (!data) return null;

  /** Only the fields the attorney actually changed become stored overrides. */
  const changedOnly = (d: Record<string, string>) => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(d)) {
      if ((v ?? "").trim() !== (baseline.current[k] ?? "").trim()) out[k] = v;
    }
    return out;
  };

  const client = data.client as { invite_token: string; full_name: string | null };
  const documents = (data.documents ?? []) as Array<{
    id: string;
    title: string | null;
    review_status: string | null;
  }>;

  const missing = Object.keys(draft).length
    ? FORM_FIELD_GROUPS.flatMap((g) => g.fields)
        .filter((f) => f.required && !(draft[f.key] ?? "").trim())
        .map((f) => f.label)
    : [];

  const set = (key: string, value: string) => setDraft((d) => ({ ...(d ?? {}), [key]: value }));

  const save = async () => {
    setBusy(true);
    setStatus(null);
    try {
      await saveFn({ data: { pin, clientId, answers: changedOnly(draft) } });
      setStatus("Saved.");
      await refetch();
    } catch (e) {
      setStatus(`Could not save: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const build = async () => {
    setBusy(true);
    setStatus(null);
    try {
      await saveFn({ data: { pin, clientId, answers: changedOnly(draft) } });
      const res = await buildFn({ data: { pin, clientId } });
      setStatus(
        res.failed.length
          ? `Built ${res.regenerated.length} form(s); ${res.failed.length} failed.`
          : `Built ${res.regenerated.length} form(s) from the information above.`,
      );
      await refetch();
    } catch (e) {
      setStatus(`Could not build the forms: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const openPdf = async (documentId: string) => {
    const res = await downloadFn({ data: { pin, documentId } });
    preview.open(res.pdfB64, res.filename);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {preview.viewer}
      <div className="mx-auto max-w-4xl space-y-5">
        <header>
          <Link to="/attorney-board" className="text-xs font-semibold underline text-slate-600">
            ← Back to the board
          </Link>
          <h1 className="mt-2 text-2xl font-bold" style={{ color: "#6B4F4F" }}>
            {client.full_name ?? "Client"}{" "}
            <span className="font-mono text-base text-slate-500">{client.invite_token}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Everything below feeds the filings. Correct anything, save, then build the packet.
            Your corrections are kept and always win over the intake answers.
          </p>
        </header>

        {missing.length > 0 && (
          <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <span className="font-bold">Still missing:</span> {missing.join(", ")}
          </div>
        )}

        {FORM_FIELD_GROUPS.map((group) => (
          <section key={group.title} className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
              {group.title}
            </h2>
            {group.note && <p className="mt-0.5 text-xs text-slate-500">{group.note}</p>}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {group.fields.map((f) => (
                <label
                  key={f.key}
                  className={`block text-xs ${f.multiline ? "sm:col-span-2" : ""}`}
                >
                  <span className="font-semibold text-slate-600">
                    {f.label}
                    {f.required && <span className="ml-1 text-red-600">*</span>}
                  </span>
                  {f.multiline ? (
                    <textarea
                      value={draft[f.key] ?? ""}
                      onChange={(e) => set(f.key, e.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />
                  ) : (
                    <input
                      type={f.type === "date" ? "date" : "text"}
                      value={draft[f.key] ?? ""}
                      onChange={(e) => set(f.key, e.target.value)}
                      className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                    />
                  )}
                </label>
              ))}
            </div>
          </section>
        ))}

        <div className="sticky bottom-0 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow">
          <button
            type="button"
            onClick={() => void save()}
            disabled={busy}
            className="rounded border border-slate-300 px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
          >
            {busy ? "Working…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => void build()}
            disabled={busy}
            className="rounded bg-emerald-700 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            Save and build the packet
          </button>
          {status && <span className="text-sm text-slate-700">{status}</span>}
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
            Packet ({documents.length})
          </h2>
          {documents.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              No forms built yet. Fill in the required fields and press “Save and build the packet”.
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5 text-sm">
              {documents.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-slate-800">
                    {d.title ?? "Document"}
                    <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                      {(d.review_status ?? "draft").replace(/_/g, " ")}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => void openPdf(d.id)}
                    className="rounded border border-slate-300 px-2 py-0.5 text-xs"
                  >
                    Preview
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
