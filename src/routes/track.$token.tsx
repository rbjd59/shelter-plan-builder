import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getPublicCaseStatus } from "@/lib/case-tracking.functions";

export const Route = createFileRoute("/track/$token")({
  head: () => ({ meta: [{ title: "Case Status — DetencionDefensa.com" }] }),
  component: TrackPage,
});

function TrackPage() {
  const { token } = Route.useParams();
  const fetchStatus = useServerFn(getPublicCaseStatus);
  const { data, isLoading } = useQuery({
    queryKey: ["case-status", token],
    queryFn: () => fetchStatus({ data: { token } }),
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#f6efe1", fontFamily: "Inter Tight, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontSize: 28, fontFamily: "Fraunces, serif", marginBottom: 24 }}>Case status</h1>
        {isLoading && <p>Loading…</p>}
        {data && !data.found && <p>No case found for this link.</p>}
        {data && data.found && (
          <div style={{ background: "#1a2436", padding: 24, borderRadius: 8 }}>
            {data.contactName && <p>Contact: <strong>{data.contactName}</strong></p>}
            {data.inmateName && <p>Petitioner: <strong>{data.inmateName}</strong></p>}
            <ol style={{ marginTop: 24, lineHeight: 2 }}>
              <li style={{ color: data.step1At ? "#7fdba0" : "#888" }}>
                {data.step1At ? "✓" : "○"} Step 1 — Information received
              </li>
              <li style={{ color: data.step2At ? "#7fdba0" : "#888" }}>
                {data.step2At ? "✓" : "○"} Step 2 — Forms mailed to detainee
              </li>
              <li style={{ color: data.step3At ? "#7fdba0" : "#888" }}>
                {data.step3At ? "✓" : "○"} Step 3 — Family package sent
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
