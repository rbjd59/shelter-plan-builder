import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Download, FileCheck2 } from "lucide-react";
import { getMyVehiclePackets, downloadVehiclePacket } from "@/lib/vehicle-enrollment.functions";
import { downloadPdfFromBase64 } from "./PdfPreviewDialog";
import { Button } from "./ui/button";

export default function VehiclePacketDownloads() {
  const list = useServerFn(getMyVehiclePackets);
  const download = useServerFn(downloadVehiclePacket);
  const { data } = useQuery({ queryKey: ["my-vehicle-packets"], queryFn: () => list(), retry: false });
  if (!data?.length) return null;
  return <section style={{ background: "#1a2436", padding: 24, borderRadius: 8, marginBottom: 24 }}>
    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Your vehicle packets</h2>
    <div style={{ display: "grid", gap: 12 }}>{data.map((packet) => <div key={packet.enrollmentId} style={{ border: "1px solid #3a4458", borderRadius: 6, padding: 16 }}>
      <p style={{ margin: 0, fontWeight: 700 }}><FileCheck2 style={{ display: "inline", marginRight: 8 }} />{packet.title}</p>
      <p style={{ color: packet.approved ? "#7fd9a8" : "#e8a04a", fontSize: 13 }}>{packet.approved ? "Attorney approved" : "DRAFT — PENDING ATTORNEY APPROVAL — DO NOT SIGN"}</p>
      <Button type="button" variant="outline" disabled={!packet.pdfB64} onClick={async () => {
        const file = await download({ data: { enrollmentId: packet.enrollmentId } });
        downloadPdfFromBase64(file.filename, file.pdfB64);
      }}><Download />Download {packet.approved ? "approved" : "draft"} PDF</Button>
    </div>)}</div>
  </section>;
}
