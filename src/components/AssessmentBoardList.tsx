import type { ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { pinDownloadAssessmentDocument, pinListAssessmentBoard } from "@/lib/pin-access.functions";
import { downloadPdfFromBase64 } from "@/components/PdfPreviewDialog";

type AssessmentRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  language: string;
  answers: Record<string, unknown>;
  results: Record<string, unknown>;
  help_requested: string[];
  status: string;
  created_at: string;
  paralegal_call_at: string | null;
  home_appointment_at: string | null;
  business_appointment_at: string | null;
  property_estimate: { value?: number; rent?: number; status?: string; message?: string } | null;
};
type DocumentRow = { id: string; assessment_id: string; title: string; review_status: string };
const money = (v: unknown) => typeof v === "number" ? `$${Math.round(v).toLocaleString()}` : "—";
const text = (v: unknown) => typeof v === "string" ? v : Array.isArray(v) ? v.join(", ") : "—";

export default function AssessmentBoardList({ pin }: { pin: string }) {
  const listFn = useServerFn(pinListAssessmentBoard);
  const downloadFn = useServerFn(pinDownloadAssessmentDocument);
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["assessment-board"],
    queryFn: () => listFn({ data: { pin } }),
    refetchInterval: 30000,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading new questionnaires…</p>;
  if (error) return <p className="text-sm text-destructive">Could not load questionnaires: {(error as Error).message}</p>;
  const rows = (data?.assessments ?? []) as AssessmentRow[];
  const documents = (data?.documents ?? []) as DocumentRow[];

  return <section className="space-y-3 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div><h2 className="text-xl font-bold">New questionnaires</h2><p className="text-sm text-muted-foreground">{rows.length} saved. Family-form drafts stay marked for attorney review.</p></div>
      <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm" onClick={() => void refetch()} disabled={isFetching}>{isFetching ? "Refreshing…" : "Refresh"}</button>
    </div>
    {rows.length === 0 ? <p className="rounded-md border border-dashed border-border p-5 text-center text-sm text-muted-foreground">No questionnaires yet.</p> : <div className="space-y-2">{rows.map((row) => {
      const docs = documents.filter((d) => d.assessment_id === row.id);
      return <details key={row.id} className="rounded-md border border-border bg-background">
        <summary className="cursor-pointer list-none p-3">
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold">{row.full_name || "No name given"}</span><span className="text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString()}</span></div>
          <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
            <Badge>{text(row.results.stayBand) === "high" ? "Stay: over 15%" : "Stay: 0–15%"}</Badge>
            <Badge>{`Habeas: ${text(row.results.habeas)}`}</Badge>
            {text(row.results.home) !== "none" && <Badge>{`Home: ${text(row.results.home)}`}</Badge>}
            {row.results.business === true && <Badge>Save My Business</Badge>}
            {docs.length > 0 && <Badge>{docs.length} family packet{docs.length === 1 ? "" : "s"}</Badge>}
          </div>
        </summary>
        <div className="grid gap-4 border-t border-border p-3 text-sm md:grid-cols-2">
          <div><h3 className="font-semibold">Contact</h3><p>{row.phone || "No phone"}<br />{row.email || "No email"}<br />Language: {row.language}</p><p className="mt-2">Paralegal call: {row.paralegal_call_at ? new Date(row.paralegal_call_at).toLocaleString() : "—"}</p></div>
          <div><h3 className="font-semibold">Appointments</h3><p>Home: {row.home_appointment_at ? new Date(row.home_appointment_at).toLocaleString() : "Not scheduled"}<br />Business: {row.business_appointment_at ? new Date(row.business_appointment_at).toLocaleString() : "Not scheduled"}</p></div>
          <div><h3 className="font-semibold">Home and business</h3><p>Address: {text(row.answers.homeAddress)}<br />Goal: {text(row.answers.homePlan)}<br />Sale estimate: {money(row.property_estimate?.value)}<br />Rent estimate: {money(row.property_estimate?.rent)}</p><p className="mt-2">Business goal: {text(row.answers.businessGoal)}<br />Trade: {text(row.answers.trade)}<br />Monthly income: {text(row.answers.monthlyIncome)}</p></div>
          <div><h3 className="font-semibold">Family forms and help</h3><p>Children: {text(row.answers.childrenNames)}<br />Forms: {text(row.answers.formsNeeded)}<br />Help requested: {row.help_requested.length ? row.help_requested.join(", ") : "None"}</p></div>
          {docs.length > 0 && <div className="md:col-span-2"><h3 className="mb-2 font-semibold">Family-form drafts</h3><div className="flex flex-wrap gap-2">{docs.map((doc) => <button key={doc.id} type="button" className="rounded-md border border-border px-3 py-2 text-left text-xs hover:bg-accent" onClick={async () => { const file = await downloadFn({ data: { pin, documentId: doc.id } }); downloadPdfFromBase64(file.filename, file.pdfB64); }}>{doc.title}<br /><span className="text-muted-foreground">{doc.review_status} — download PDF</span></button>)}</div></div>}
        </div>
      </details>;
    })}</div>}
  </section>;
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-secondary px-2 py-1 font-medium text-secondary-foreground">{children}</span>;
}
