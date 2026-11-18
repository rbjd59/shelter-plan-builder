import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { getCompanyVehicleEnrollments } from "@/lib/vehicle-enrollment.functions";
import { downloadServiceVehiclePacket } from "@/lib/service-file.functions";
import { downloadPdfFromBase64 } from "./PdfPreviewDialog";
import { Button } from "./ui/button";

export default function VehicleCompanyBoard() {
  const list = useServerFn(getCompanyVehicleEnrollments);
  const download = useServerFn(downloadServiceVehiclePacket);
  const { data, error } = useQuery({ queryKey: ["company-vehicle-enrollments"], queryFn: () => list(), retry: false });
  if (error) return <p className="rounded border border-destructive/30 bg-card p-4 text-sm text-destructive">Vehicle enrollments require an approved staff sign-in.</p>;
  return <section className="space-y-3 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-sm"><div><h2 className="text-xl font-bold">Vehicle rescue enrollments</h2><p className="text-sm text-muted-foreground">Private client vehicle packets beside the home and business service files.</p></div>
    {data?.length === 0 && <p className="text-sm text-muted-foreground">No vehicle enrollments yet.</p>}
    <div className="space-y-2">{data?.map((row) => {
      const vehicle = row.vehicle_data as { year?: string; make?: string; model?: string; vin?: string };
      const documentId = row.approved_document_id ?? row.draft_document_id;
      return <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded border border-border p-3 text-sm"><div><strong>{row.owner_name}</strong> · {vehicle.year} {vehicle.make} {vehicle.model}<br /><span className="text-xs text-muted-foreground">VIN {vehicle.vin} · {row.review_status}</span></div>{documentId && <Button variant="outline" onClick={async () => { const file = await download({ data: { id: row.app_client_id!, source: "app", documentId } }); downloadPdfFromBase64(file.filename, file.pdfB64); }}><Download />Download packet</Button>}</div>;
    })}</div>
  </section>;
}
