import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { getPacketByToken, uploadSignedPacketFile } from "@/lib/readiness.functions";

const search = z.object({ token: z.string().min(8) });

export const Route = createFileRoute("/readiness/sign")({
  validateSearch: search,
  component: SignPage,
  head: () => ({ meta: [{ title: "Sentinel Readiness — Sign & Upload" }] }),
});

type Doc = { name: string; url: string };

function SignPage() {
  const { token } = Route.useSearch();
  const getFn = useServerFn(getPacketByToken);
  const uploadFn = useServerFn(uploadSignedPacketFile);

  const [status, setStatus] = useState<"loading" | "ready" | "expired" | "uploading" | "done">("loading");
  const [docs, setDocs] = useState<Doc[]>([]);
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFn({ data: { token } }).then((res) => {
      if (!res.ok) { setStatus("expired"); setError(res.error); return; }
      setDocs(res.packet.documents);
      setRecipientName(res.packet.recipientName);
      setStatus("ready");
    }).catch(() => setStatus("expired"));
  }, [token, getFn]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("Max 10 MB"); return; }
    setStatus("uploading");
    const buf = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
    try {
      await uploadFn({ data: { token, filename: file.name.replace(/[^a-zA-Z0-9._-]/g, "_"), base64 } });
      setStatus("done");
    } catch (err) {
      setError((err as Error).message);
      setStatus("ready");
    }
  };

  const wrap: React.CSSProperties = { minHeight: "100vh", background: "#f4efe6", color: "#0e1a2b", fontFamily: "Inter Tight, system-ui, sans-serif", padding: "32px 20px" };
  const container: React.CSSProperties = { maxWidth: 720, margin: "0 auto" };

  if (status === "loading") return <div style={wrap}><div style={container}>Loading…</div></div>;
  if (status === "expired") return <div style={wrap}><div style={container}><h1>Link expired or invalid</h1><p>{error}</p><p>Email intake@detenciondefensa.com to get a new link.</p></div></div>;

  return (
    <div style={wrap}><div style={container}>
      <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: "0.12em", color: "#8a3c11", marginBottom: 6 }}>SENTINEL READINESS — SIGN & VAULT</div>
      <h1 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 30, fontWeight: 600, margin: "0 0 6px" }}>Your documents are ready</h1>
      <p style={{ color: "#1a2940", marginBottom: 22, fontSize: 15, lineHeight: 1.6 }}>
        Download each document, print it, sign it where indicated, and have it notarized at any UPS Store, bank, or notary public ($5–$15 each). Then upload the scanned signed copies back here. They'll be sealed in your vault and released to {recipientName ?? "your designated recipient"} <strong>only</strong> when HELP NOW is triggered.
      </p>

      <div style={{ background: "#fff", border: "1px solid rgba(14,26,43,0.15)", borderRadius: 6, padding: 22, marginBottom: 22 }}>
        <h2 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 18, fontWeight: 600, marginTop: 0, marginBottom: 14 }}>Step 1 — Download</h2>
        {docs.length === 0 ? <p>No documents staged yet.</p> : (
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {docs.map((d) => (
              <li key={d.url} style={{ marginBottom: 8 }}>
                <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ color: "#b8551f", fontWeight: 600 }}>{d.name}</a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ background: "#fff", border: "1px solid rgba(14,26,43,0.15)", borderRadius: 6, padding: 22 }}>
        <h2 style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 18, fontWeight: 600, marginTop: 0, marginBottom: 14 }}>Step 2 — Upload signed + notarized scans</h2>
        {status === "done" ? (
          <p style={{ color: "#2d5a3d", fontWeight: 600 }}>✓ Sealed in vault. You can upload more files anytime via this link.</p>
        ) : (
          <input type="file" accept="application/pdf,image/*" onChange={handleUpload} disabled={status === "uploading"} />
        )}
        {error && <p style={{ color: "#8b3a1f", fontSize: 13, marginTop: 10 }}>{error}</p>}
      </div>
    </div></div>
  );
}
