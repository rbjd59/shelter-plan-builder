import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveVehiclePacket, getVehicleReviewDocument, getVehicleReviewQueue, saveVehicleReview } from "@/lib/vehicle-rescue-review.functions";
import { downloadPdfFromBase64, usePdfPreview } from "@/components/PdfPreviewDialog";

export const Route = createFileRoute("/attorney-vehicle-review")({
  head: () => ({ meta: [
    { title: "Vehicle Packet Attorney Approvals — DetencionDefensa" },
    { name: "description", content: "Private law-firm review and approval of client-specific Vehicle Rescue Packets." },
    { property: "og:title", content: "Vehicle Packet Attorney Approvals" },
    { property: "og:description", content: "Private review of vehicle drafts and approved execution copies." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" },
  ] }),
  component: VehicleReviewPage,
});

function VehicleReviewPage() {
  const queueFn = useServerFn(getVehicleReviewQueue);
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const queue = useQuery({ queryKey: ["vehicle-review-queue"], queryFn: () => queueFn(), retry: false });
  useEffect(() => { if (!selected && queue.data?.length) setSelected((queue.data.find((row) => !row.approvedDocumentId) ?? queue.data[0]).id); }, [queue.data, selected]);
  return <main className="min-h-screen bg-muted/30 px-4 py-6 text-foreground sm:px-6"><div className="mx-auto max-w-7xl space-y-5">
    <header><Link to="/attorney-board" className="text-sm text-primary underline">← Attorney board</Link><h1 className="mt-2 text-2xl font-bold">Vehicle Rescue Packet approvals</h1><p className="mt-1 text-sm text-muted-foreground">Review the saved client facts. Approval creates a separate unwatermarked packet and preserves the original draft.</p></header>
    {queue.error && <div className="rounded-lg border border-destructive/30 bg-card p-5"><p className="text-sm text-destructive">{queue.error.message}</p><Button asChild className="mt-3"><Link to="/login">Sign in with a law-firm account</Link></Button></div>}
    {queue.isLoading && <p>Loading vehicle review queue…</p>}
    {queue.data?.length === 0 && <p className="rounded-lg border bg-card p-5 text-sm">No vehicle packets have been prepared yet.</p>}
    {queue.data && queue.data.length > 0 && <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]"><aside className="space-y-2 rounded-lg border bg-card p-3"><h2 className="px-2 pb-2 text-sm font-semibold">Client vehicle drafts ({queue.data.length})</h2>{queue.data.map((row) => <button type="button" key={row.id} onClick={() => setSelected(row.id)} className={`w-full rounded-md border p-3 text-left text-sm ${selected === row.id ? "border-primary bg-accent" : "bg-background"}`}><span className="block font-semibold">{row.clientName}</span><span className="mt-1 block text-xs text-muted-foreground">{row.title} · {new Date(row.createdAt).toLocaleDateString()}</span><span className="mt-2 inline-block rounded-full bg-muted px-2 py-1 text-[11px]">{row.approvedDocumentId ? "Approved packet issued" : row.reviewStatus.replaceAll("_", " ")}</span></button>)}</aside>{selected && <ReviewEditor key={selected} id={selected} onChanged={() => queryClient.invalidateQueries({ queryKey: ["vehicle-review-queue"] })} />}</div>}
  </div></main>;
}

function ReviewEditor({ id, onChanged }: { id: string; onChanged: () => Promise<void> }) {
  const getDocument = useServerFn(getVehicleReviewDocument);
  const save = useServerFn(saveVehicleReview);
  const approve = useServerFn(approveVehiclePacket);
  const preview = usePdfPreview();
  const [reviewerName, setReviewerName] = useState("Rosario Kyle Sorrentino, Esq.");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const { data, error, isLoading, refetch } = useQuery({ queryKey: ["vehicle-review-document", id], queryFn: () => getDocument({ data: { id } }), retry: false });
  useEffect(() => { setNotes(data?.document.reviewNotes ?? ""); }, [data]);
  const run = async (action: () => Promise<void>) => { setBusy(true); setStatus(""); try { await action(); await Promise.all([refetch(), onChanged()]); } catch (cause) { setStatus(cause instanceof Error ? cause.message : "Could not complete review."); } finally { setBusy(false); } };
  if (isLoading) return <p>Opening vehicle draft…</p>;
  if (error) return <p className="text-sm text-destructive">{error.message}</p>;
  if (!data) return null;
  const approved = data.approvedDocument;
  return <section className="space-y-5 rounded-lg border bg-card p-4 sm:p-5">{preview.viewer}
    <header className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold">{data.document.title}</h2><p className="text-sm text-muted-foreground">Status: {data.document.reviewStatus.replaceAll("_", " ")}</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => preview.open(data.document.pdfB64, data.document.title)}><Eye />Preview draft</Button><Button variant="outline" onClick={() => downloadPdfFromBase64(`${data.document.title}.pdf`, data.document.pdfB64)}><Download />Download draft</Button></div></header>
    {approved ? <div className="space-y-3 rounded-lg border bg-muted/40 p-4"><h3 className="flex items-center gap-2 font-semibold"><CheckCircle2 className="text-primary" />Approved packet issued</h3><p className="text-sm text-muted-foreground">The original draft remains preserved. Only this approved copy has no DRAFT watermark.</p><div className="flex gap-2"><Button onClick={() => preview.open(approved.pdfB64, approved.title)}><Eye />Preview approved packet</Button><Button variant="outline" onClick={() => downloadPdfFromBase64(`${approved.title}.pdf`, approved.pdfB64)}><Download />Download approved packet</Button></div></div> : <>
      {!data.document.hasFactSnapshot && <p className="rounded border bg-muted p-3 text-sm">This older draft has no saved client-fact snapshot and cannot be approved.</p>}
      <label className="block text-sm font-medium">Reviewing attorney<input value={reviewerName} onChange={(event) => setReviewerName(event.target.value)} className="mt-1 w-full rounded border bg-background p-2" /></label>
      <label className="block text-sm font-medium">Attorney review notes / changes requested<textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 w-full rounded border bg-background p-2" /></label>
      <div className="flex flex-wrap gap-2 border-t pt-4"><Button variant="outline" disabled={busy} onClick={() => void run(async () => { await save({ data: { id, reviewerName, reviewNotes: notes, decision: "save" } }); setStatus("Review saved."); })}>Save review</Button><Button variant="outline" disabled={busy} onClick={() => void run(async () => { if (!notes.trim()) throw new Error("Explain the changes requested."); await save({ data: { id, reviewerName, reviewNotes: notes, decision: "request_changes" } }); setStatus("Changes requested."); })}>Request changes</Button><Button disabled={busy || !data.document.hasFactSnapshot} onClick={() => void run(async () => { if (!window.confirm("Issue a separate attorney-approved packet without the DRAFT watermark?")) return; const result = await approve({ data: { id, reviewerName, reviewNotes: notes } }); downloadPdfFromBase64(result.filename, result.pdfB64); setStatus("Approved packet issued."); })}>Approve packet</Button></div>
    </>}
    {status && <p role="status" className="text-sm font-semibold">{status}</p>}
  </section>;
}
