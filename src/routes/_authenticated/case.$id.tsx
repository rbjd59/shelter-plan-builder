import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getCaseDetail,
  updateCaseFields,
  generateMailingLabel,
  checkOfficeAccess,
} from "@/lib/case-console.functions";

export const Route = createFileRoute("/_authenticated/case/$id")({
  head: () => ({ meta: [{ title: "Case console" }, { name: "robots", content: "noindex" }] }),
  component: CaseConsole,
});

function CaseConsole() {
  const { id } = Route.useParams();
  const checkAccess = useServerFn(checkOfficeAccess);
  const fetchDetail = useServerFn(getCaseDetail);
  const updateFields = useServerFn(updateCaseFields);
  const genLabel = useServerFn(generateMailingLabel);
  const qc = useQueryClient();

  const access = useQuery({ queryKey: ["office-access"], queryFn: () => checkAccess() });
  const detail = useQuery({
    queryKey: ["case", id],
    queryFn: () => fetchDetail({ data: { activation_id: id } }),
    enabled: access.data?.isOffice === true,
  });

  const [form, setForm] = useState({
    warden_name: "",
    facility_name: "",
    facility_address: "",
    date_of_arrest: "",
    a_number: "",
    office_notes: "",
  });
  const [labelUrl, setLabelUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    const a = detail.data?.activation;
    if (!a) return;
    setForm({
      warden_name: a.warden_name ?? "",
      facility_name: a.facility_name ?? "",
      facility_address: a.facility_address ?? "",
      date_of_arrest: a.date_of_arrest ?? "",
      a_number: a.a_number ?? (detail.data?.intake?.answers?.["a_number"] as string | undefined) ?? "",
      office_notes: a.office_notes ?? "",
    });
  }, [detail.data]);

  const save = useMutation({
    mutationFn: () =>
      updateFields({
        data: {
          activation_id: id,
          warden_name: form.warden_name || null,
          facility_name: form.facility_name || null,
          facility_address: form.facility_address || null,
          date_of_arrest: form.date_of_arrest || null,
          a_number: form.a_number || null,
          office_notes: form.office_notes || null,
        },
      }),
    onSuccess: () => {
      setSaved(new Date().toLocaleTimeString());
      qc.invalidateQueries({ queryKey: ["case", id] });
    },
  });

  const makeLabel = useMutation({
    mutationFn: async () => {
      await save.mutateAsync();
      return genLabel({ data: { activation_id: id } });
    },
    onSuccess: (res) => setLabelUrl(res.url),
  });

  if (access.isLoading || detail.isLoading) return <Wrap><p>Loading…</p></Wrap>;
  if (!access.data?.isOffice) return <Wrap><p>Forbidden — office staff only.</p></Wrap>;
  if (detail.error) return <Wrap><p style={{ color: "#fca5a5" }}>{(detail.error as Error).message}</p></Wrap>;
  if (!detail.data) return <Wrap><p>Not found.</p></Wrap>;

  const a = detail.data.activation;
  const c = detail.data.contacts;
  const ans = detail.data.intake?.answers ?? {};
  const dueMs = new Date(a.act_after).getTime() - Date.now();
  const status = a.cancelled_at
    ? { label: "CANCELLED", color: "#94a3b8" }
    : a.family_notified_at
    ? { label: "FAMILY NOTIFIED", color: "#0d7a5f" }
    : dueMs <= 0
    ? { label: "ACT NOW", color: "#dc2626" }
    : { label: `${Math.ceil(dueMs / 60000)} min until act`, color: "#e8a04a" };

  return (
    <Wrap>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>{a.full_name || "(no name)"}</h1>
          <p style={{ color: "#a8a59a", fontSize: 13, marginTop: 4 }}>
            {a.role.toUpperCase()} · fired {new Date(a.fired_at).toLocaleString()} · case {a.intake_session_id.slice(0, 12)}
          </p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 800, letterSpacing: 1, color: status.color,
          padding: "6px 12px", border: `1px solid ${status.color}`, borderRadius: 4,
        }}>{status.label}</span>
      </div>

      <Section title="Family contact (call now)">
        <Row label="Name" value={c?.contact_name} />
        <Row label="Phone" value={c?.contact_phone}
          link={c?.contact_phone ? `tel:${c.contact_phone}` : undefined} />
        <Row label="Email" value={c?.contact_email}
          link={c?.contact_email ? `mailto:${c.contact_email}` : undefined} />
      </Section>

      <Section title="Triggering phone">
        <Row label="GPS" value={a.gps_raw}
          link={a.gps_lat != null && a.gps_lng != null ? `https://maps.google.com/?q=${a.gps_lat},${a.gps_lng}` : undefined} />
        <Row label="Court district" value={ans.court_district as string} />
        <Row label="Country of citizenship" value={ans.country_of_citizenship as string} />
        <Row label="Date of birth" value={ans.dob as string} />
      </Section>

      <Section title="Federal forms (pre-filled)">
        {detail.data.pdfs.habeasUrl ? (
          <a href={detail.data.pdfs.habeasUrl} target="_blank" rel="noreferrer"
             style={{ display: "block", color: "#e8a04a", padding: "8px 0" }}>
            ↓ AO 242 — Petition for Writ of Habeas Corpus (28 U.S.C. § 2241)
          </a>
        ) : <p style={{ color: "#fca5a5" }}>AO 242 not available</p>}
        {detail.data.pdfs.ifpUrl ? (
          <a href={detail.data.pdfs.ifpUrl} target="_blank" rel="noreferrer"
             style={{ display: "block", color: "#e8a04a", padding: "8px 0" }}>
            ↓ AO 240 — Application to Proceed In Forma Pauperis
          </a>
        ) : <p style={{ color: "#fca5a5" }}>AO 240 not available</p>}
      </Section>

      <Section title="Fill in after locating in ICE inmate locator">
        <Field label="Warden / Custodian name" value={form.warden_name}
          onChange={(v) => setForm({ ...form, warden_name: v })} />
        <Field label="Facility name" value={form.facility_name}
          onChange={(v) => setForm({ ...form, facility_name: v })} />
        <Field label="Facility full address" value={form.facility_address}
          onChange={(v) => setForm({ ...form, facility_address: v })} multiline />
        <Field label="A-number" value={form.a_number}
          onChange={(v) => setForm({ ...form, a_number: v })} />
        <Field label="Date of arrest" type="date" value={form.date_of_arrest}
          onChange={(v) => setForm({ ...form, date_of_arrest: v })} />
        <Field label="Office notes (internal)" value={form.office_notes}
          onChange={(v) => setForm({ ...form, office_notes: v })} multiline />

        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <button onClick={() => save.mutate()} disabled={save.isPending}
            style={btnSecondary}>
            {save.isPending ? "Saving…" : "Save fields"}
          </button>
          <button onClick={() => makeLabel.mutate()} disabled={makeLabel.isPending || !form.facility_name}
            style={btnPrimary}>
            {makeLabel.isPending ? "Generating…" : "Save + generate mailing label"}
          </button>
          {saved && <span style={{ alignSelf: "center", fontSize: 12, color: "#0d7a5f" }}>Saved {saved}</span>}
        </div>

        {labelUrl && (
          <p style={{ marginTop: 14 }}>
            <a href={labelUrl} target="_blank" rel="noreferrer" style={{ color: "#e8a04a" }}>
              ↓ Open mailing label PDF (4×6)
            </a>
          </p>
        )}
        {a.mailing_label_generated_at && !labelUrl && (
          <p style={{ marginTop: 10, fontSize: 12, color: "#a8a59a" }}>
            Last label generated {new Date(a.mailing_label_generated_at).toLocaleString()}.
          </p>
        )}
      </Section>
    </Wrap>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#1a2436", padding: 20, borderRadius: 8, marginBottom: 16 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#e8a04a", margin: "0 0 14px" }}>{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value, link }: { label: string; value?: string | null; link?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #2a3346", fontSize: 14 }}>
      <span style={{ color: "#a8a59a" }}>{label}</span>
      {link ? (
        <a href={link} style={{ color: "#e8a04a", textDecoration: "none" }}>{value || "—"}</a>
      ) : (
        <span>{value || "—"}</span>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", multiline = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; multiline?: boolean;
}) {
  const baseStyle: React.CSSProperties = {
    width: "100%", marginTop: 4, padding: "8px 10px", background: "#0b1220",
    border: "1px solid #3a4458", borderRadius: 4, color: "#f6efe1", fontSize: 14, fontFamily: "inherit",
  };
  return (
    <label style={{ display: "block", marginBottom: 12, fontSize: 12, color: "#cfc8b8" }}>
      {label}
      {multiline ? (
        <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} style={baseStyle} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={baseStyle} />
      )}
    </label>
  );
}

const btnPrimary: React.CSSProperties = {
  background: "#e8a04a", color: "#0b1220", border: "none", padding: "10px 18px",
  borderRadius: 4, fontWeight: 700, fontSize: 14, cursor: "pointer",
};
const btnSecondary: React.CSSProperties = {
  background: "transparent", color: "#cfc8b8", border: "1px solid #3a4458",
  padding: "10px 18px", borderRadius: 4, fontWeight: 600, fontSize: 14, cursor: "pointer",
};

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", color: "#f6efe1", fontFamily: "Inter Tight, system-ui, sans-serif" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 22px 96px" }}>
        <Link to="/cases" style={{ color: "#e8a04a", fontSize: 13, textDecoration: "none" }}>← All cases</Link>
        <div style={{ marginTop: 18 }}>{children}</div>
      </div>
    </div>
  );
}
