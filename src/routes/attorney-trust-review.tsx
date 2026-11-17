import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Download, Eye, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  approveBusinessTrustPacket,
  getBusinessTrustReviewDocument,
  getBusinessTrustReviewQueue,
  saveBusinessTrustReview,
} from "@/lib/business-trust-review.functions";
import {
  emptyBusinessTrustAttorneyTerms,
  type BusinessTrustAttorneyTerms,
} from "@/lib/business-trust";
import { downloadPdfFromBase64, usePdfPreview } from "@/components/PdfPreviewDialog";

export const Route = createFileRoute("/attorney-trust-review")({
  head: () => ({
    meta: [
      { title: "Business Trust Attorney Approvals — DetencionDefensa" },
      {
        name: "description",
        content: "Private law-firm review and approval of client-specific business trust packets.",
      },
      { property: "og:title", content: "Business Trust Attorney Approvals" },
      {
        property: "og:description",
        content: "Private law-firm review of business trust drafts and approved execution copies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AttorneyTrustReviewPage,
});

function AttorneyTrustReviewPage() {
  const queueFn = useServerFn(getBusinessTrustReviewQueue);
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<{ id: string; source: "assessment" | "app" } | null>(
    null,
  );
  const queue = useQuery({
    queryKey: ["business-trust-review-queue"],
    queryFn: () => queueFn(),
    retry: false,
  });

  useEffect(() => {
    if (!selected && queue.data?.length) {
      const first = queue.data.find((row) => !row.approvedDocumentId) ?? queue.data[0];
      setSelected({ id: first.id, source: first.source });
    }
  }, [queue.data, selected]);

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 text-foreground sm:px-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link to="/attorney-board" className="text-sm text-primary underline">
              ← Attorney board
            </Link>
            <h1 className="mt-2 text-2xl font-bold">Business trust approvals</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Review the exact client draft, enter final legal terms, request changes, or issue an
              approved execution copy. Earlier drafts are never overwritten.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/">Home</Link>
          </Button>
        </header>

        {queue.error && (
          <div className="rounded-lg border border-destructive/30 bg-card p-5">
            <p className="text-sm text-destructive">{queue.error.message}</p>
            <Button asChild className="mt-3">
              <Link to="/login">Sign in with a law-firm account</Link>
            </Button>
          </div>
        )}
        {queue.isLoading && <p className="text-sm text-muted-foreground">Loading review queue…</p>}
        {queue.data && queue.data.length === 0 && (
          <p className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
            No business trust drafts have been prepared yet.
          </p>
        )}

        {queue.data && queue.data.length > 0 && (
          <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-2 rounded-lg border border-border bg-card p-3">
              <h2 className="px-2 pb-2 text-sm font-semibold">
                Client drafts ({queue.data.length})
              </h2>
              {queue.data.map((row) => {
                const active = selected?.id === row.id;
                return (
                  <button
                    type="button"
                    key={row.id}
                    onClick={() => setSelected({ id: row.id, source: row.source })}
                    className={`w-full rounded-md border p-3 text-left text-sm ${
                      active ? "border-primary bg-accent" : "border-border bg-background"
                    }`}
                  >
                    <span className="block font-semibold">{row.clientName}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {row.title} · {new Date(row.createdAt).toLocaleDateString()}
                    </span>
                    <span className="mt-2 inline-block rounded-full bg-muted px-2 py-1 text-[11px] font-semibold">
                      {row.approvedDocumentId
                        ? "Approved packet issued"
                        : row.reviewStatus.replaceAll("_", " ")}
                    </span>
                  </button>
                );
              })}
            </aside>
            {selected && (
              <ReviewEditor
                key={selected.id}
                reference={selected}
                onChanged={async () => {
                  await queryClient.invalidateQueries({
                    queryKey: ["business-trust-review-queue"],
                  });
                }}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

const TERM_FIELDS: Array<{
  key: keyof BusinessTrustAttorneyTerms;
  label: string;
  multiline?: boolean;
}> = [
  { key: "reviewerName", label: "Reviewing attorney name" },
  { key: "reviewerBarNumber", label: "Bar number and jurisdiction" },
  { key: "governingLaw", label: "Governing state and law" },
  { key: "effectiveDate", label: "Effective date" },
  { key: "amendmentAndRevocation", label: "Amendment and revocation terms", multiline: true },
  { key: "distributions", label: "Beneficiary distribution terms", multiline: true },
  { key: "trusteePowers", label: "Trustee powers and limits", multiline: true },
  { key: "compensationAndExpenses", label: "Trustee compensation and expenses", multiline: true },
  {
    key: "incapacityAndSuccession",
    label: "Incapacity, resignation and successor terms",
    multiline: true,
  },
  {
    key: "executionRequirements",
    label: "Required signatures, witnesses and notary",
    multiline: true,
  },
  { key: "transferTerms", label: "Approved business-interest transfer terms", multiline: true },
];

function ReviewEditor({
  reference,
  onChanged,
}: {
  reference: { id: string; source: "assessment" | "app" };
  onChanged: () => Promise<void>;
}) {
  const getDocument = useServerFn(getBusinessTrustReviewDocument);
  const saveReview = useServerFn(saveBusinessTrustReview);
  const approve = useServerFn(approveBusinessTrustPacket);
  const preview = usePdfPreview();
  const [terms, setTerms] = useState<BusinessTrustAttorneyTerms>(emptyBusinessTrustAttorneyTerms);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["business-trust-review-document", reference.source, reference.id],
    queryFn: () => getDocument({ data: reference }),
    retry: false,
  });

  useEffect(() => {
    if (!data) return;
    setTerms({
      ...emptyBusinessTrustAttorneyTerms,
      ...data.document.terms,
      reviewerName: data.document.terms.reviewerName || "Rosario Kyle Sorrentino, Esq.",
      reviewerBarNumber: data.document.terms.reviewerBarNumber || "Florida Bar No. 1049132",
    });
    setNotes(data.document.reviewNotes);
  }, [data]);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setStatus("");
    try {
      await action();
      await Promise.all([refetch(), onChanged()]);
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : "Could not complete the review action.");
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Opening client draft…</p>;
  if (error) return <p className="text-sm text-destructive">{error.message}</p>;
  if (!data) return null;
  const approved = data.approvedDocument;

  return (
    <section className="space-y-5 rounded-lg border border-border bg-card p-4 sm:p-5">
      {preview.viewer}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{data.client.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{data.document.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Source: {reference.source} client file · Status:{" "}
            {data.document.reviewStatus.replaceAll("_", " ")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => preview.open(data.document.pdfB64, data.document.title)}
          >
            <Eye /> Preview draft
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              downloadPdfFromBase64(`${data.document.title}.pdf`, data.document.pdfB64)
            }
          >
            <Download /> Download draft
          </Button>
        </div>
      </header>

      {!data.document.hasFactSnapshot && !approved && (
        <p className="rounded-md border border-border bg-muted p-3 text-sm">
          This older draft has no saved client-fact snapshot. Prepare a fresh draft from the client
          file before approval.
        </p>
      )}

      {approved ? (
        <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-4">
          <h3 className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="text-primary" /> Approved packet issued
          </h3>
          <p className="text-sm text-muted-foreground">
            Approved{" "}
            {approved.approvedAt ? new Date(approved.approvedAt).toLocaleString() : "on file"}. The
            original draft remains preserved. The approved packet now appears in the client file for
            the existing Email trust PDF action.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => preview.open(approved.pdfB64, approved.title)}>
              <Eye /> Preview approved packet
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadPdfFromBase64(`${approved.title}.pdf`, approved.pdfB64)}
            >
              <Download /> Download approved packet
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {TERM_FIELDS.map((field) => (
              <label
                key={field.key}
                className={`text-sm font-medium ${field.multiline ? "sm:col-span-2" : ""}`}
              >
                {field.label}
                {field.key === "effectiveDate" ? (
                  <input
                    type="date"
                    value={terms.effectiveDate}
                    onChange={(event) => setTerms({ ...terms, effectiveDate: event.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background p-2"
                  />
                ) : field.multiline ? (
                  <textarea
                    rows={3}
                    value={terms[field.key]}
                    onChange={(event) => setTerms({ ...terms, [field.key]: event.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background p-2 font-normal"
                  />
                ) : (
                  <input
                    value={terms[field.key]}
                    onChange={(event) => setTerms({ ...terms, [field.key]: event.target.value })}
                    className="mt-1 w-full rounded-md border border-input bg-background p-2 font-normal"
                  />
                )}
              </label>
            ))}
            <label className="text-sm font-medium sm:col-span-2">
              Attorney review notes / changes requested
              <textarea
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background p-2 font-normal"
              />
            </label>
          </div>
          <p className="text-sm text-muted-foreground">
            Approval requires every final-terms field. It creates a separate immutable execution
            copy from the saved client-fact snapshot; it does not activate fees, form a corporation,
            or transfer an asset by itself.
          </p>
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await saveReview({
                    data: { ...reference, terms, reviewNotes: notes, decision: "save" },
                  });
                  setStatus("Attorney review saved.");
                })
              }
            >
              Save review
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  if (!notes.trim())
                    throw new Error("Explain the changes the paralegal must make.");
                  await saveReview({
                    data: { ...reference, terms, reviewNotes: notes, decision: "request_changes" },
                  });
                  setStatus("Changes requested and returned to the client file.");
                })
              }
            >
              Request changes
            </Button>
            <Button
              disabled={busy || !data.document.hasFactSnapshot}
              onClick={() =>
                void run(async () => {
                  if (
                    !window.confirm(
                      "Issue an attorney-approved execution copy from this saved draft?",
                    )
                  )
                    return;
                  const result = await approve({
                    data: { ...reference, terms, reviewNotes: notes },
                  });
                  preview.open(result.pdfB64, result.filename);
                  setStatus("Approved packet issued and saved in the client file.");
                })
              }
            >
              <FileCheck2 /> Approve and issue packet
            </Button>
          </div>
        </>
      )}
      {status && (
        <p role="status" className="text-sm font-semibold">
          {status}
        </p>
      )}
    </section>
  );
}
