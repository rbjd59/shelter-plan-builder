import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/alerta/$token")({
  head: ({ params }) => ({
    meta: [
      { title: `Alerta de emergencia — ${params.token}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AlertViewer,
});

type Bundle = {
  client_name: string | null;
  language: string;
  latest_alert: { id: string; triggered_at: string; cancelled_at: string | null } | null;
  documents: { id: string; title: string; content: string; document_type: string }[];
};

function AlertViewer() {
  const { token } = Route.useParams();
  const [data, setData] = useState<Bundle | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("get_alert_viewer_bundle", { _token: token });
      if (error) { setErr(error.message); return; }
      setData(data as unknown as Bundle);
    })();
  }, [token]);

  if (err) return <Center><h1>Código no válido</h1><p>{err}</p></Center>;
  if (!data) return <Center><p>Cargando…</p></Center>;

  const alert = data.latest_alert;
  const isActive = alert && !alert.cancelled_at;

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "Arial, sans-serif", color: "#111" }}>
      <header style={{ background: isActive ? "#b91c1c" : "#059669", color: "white", padding: "20px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>
            {isActive ? "🚨 Alerta de emergencia activa" : "✓ Sin alerta activa"}
          </h1>
          <p style={{ margin: "6px 0 0 0", fontSize: 16 }}>
            {data.client_name || "Su contacto"}
          </p>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
        {alert && (
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, marginBottom: 24 }}>
            <p style={{ margin: "4px 0" }}><strong>Hora:</strong> {new Date(alert.triggered_at).toLocaleString()}</p>
            {alert.cancelled_at && (
              <p style={{ margin: "4px 0", color: "#059669" }}><strong>Cancelada:</strong> {new Date(alert.cancelled_at).toLocaleString()}</p>
            )}
            <p style={{ margin: "4px 0", color: "#666", fontSize: 13 }}>
              Esta aplicación no rastrea su ubicación. No se registra ni se comparte ningún dato de GPS.
            </p>
          </div>
        )}

        <h2 style={{ fontSize: 20, marginBottom: 12 }}>Documentos legales</h2>
        {data.documents.length === 0 && (
          <p style={{ color: "#666" }}>No hay documentos marcados para compartir.</p>
        )}
        {data.documents.length > 0 && (
          <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 20, marginBottom: 16 }}>
            <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
              {data.documents.map((doc) => (
                <li key={doc.id}>{doc.title}</li>
              ))}
            </ol>
            <p style={{ color: "#666", fontSize: 13, marginBottom: 0, marginTop: 12 }}>
              El equipo legal abre estos documentos desde el panel del abogado o de la compañía.
            </p>
          </div>
        )}
        <p style={{ marginTop: 24 }}>
          <a href={`/attorney-board?code=${token}`} style={{ display: "inline-block", background: "#b91c1c", color: "#fff", padding: "10px 20px", borderRadius: 6, textDecoration: "none", fontWeight: 700, marginRight: 8 }}>
            Panel del abogado
          </a>
          <a href={`/company-board?code=${token}`} style={{ display: "inline-block", background: "#0f172a", color: "#fff", padding: "10px 20px", borderRadius: 6, textDecoration: "none", fontWeight: 700 }}>
            Panel de la compañía
          </a>
        </p>

        <p style={{ color: "#666", fontSize: 12, marginTop: 32, textAlign: "center" }}>
          DetencionDefensa.com — protección legal para familias inmigrantes
        </p>
      </main>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", fontFamily: "Arial, sans-serif", textAlign: "center", padding: 24 }}>
      <div>{children}</div>
    </div>
  );
}
