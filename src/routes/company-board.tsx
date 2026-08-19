import { Fragment, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import PinAccessGate from "@/components/PinAccessGate";
import {
  pinListCompanyBoard,
  pinCompanyLocateFile,
  pinSaveLocateInfo,
} from "@/lib/pin-access.functions";

export const Route = createFileRoute("/company-board")({
  head: () => ({
    meta: [
      { title: "Company Board — DetencionDefensa" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <PinAccessGate storageKey="dd_pin_company" title="Company Admin Board">
      {(pin) => <CompanyBoard pin={pin} />}
    </PinAccessGate>
  ),
});

interface Locate {
  full_name: string | null;
  a_number: string | null;
  date_of_birth: string | null;
  place_of_birth: string | null;
  country_of_origin: string | null;
  language: string | null;
  phone: string | null;
}

interface Row {
  client_id: string | null;
  activation_code: string;
  registered_at: string;
  activated_at: string | null;
  latest_alert: { id: string; triggered_at: string; cancelled_at: string | null } | null;
  locate: Locate | null;
}

function CompanyBoard({ pin }: { pin: string }) {
  const fn = useServerFn(pinListCompanyBoard);
  const { data, isLoading, error } = useQuery({
    queryKey: ["company-board"],
    queryFn: () => fn({ data: { pin } }),
    refetchInterval: 15000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    placeholderData: (prev) => prev,
  });

  if (isLoading) return <div className="p-8 text-slate-500">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{(error as Error).message}</div>;

  const rows = (data?.registered ?? []) as Row[];
  const triggeredCount = rows.filter((r) => r.latest_alert && !r.latest_alert.cancelled_at).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">Company Board — Activations</h1>
          <p className="mt-1 text-xs text-slate-500">
            Privacy by design: while a client is quiet, this board holds only the
            activation code and dates. The moment a client triggers, their locate
            details are released here so the team can start finding them; they are
            withheld again once the alert is cancelled. Auto-refreshes every 15s.
          </p>
        </header>

        <div className="flex gap-3 text-sm">
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">Activations</div>
            <div className="text-2xl font-bold text-slate-900">{rows.length}</div>
          </div>
          <div className="rounded-lg border border-red-200 bg-white px-4 py-3">
            <div className="text-xs uppercase tracking-wide text-red-700">Active triggers</div>
            <div className="text-2xl font-bold text-red-700">{triggeredCount}</div>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="rounded border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            No activations yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2">Activation code</th>
                  <th className="px-4 py-2">Activated on</th>
                  <th className="px-4 py-2">App installed</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => {
                  const alert = r.latest_alert;
                  const isActive = !!alert && !alert.cancelled_at;
                  return (
                    <Fragment key={r.activation_code}>
                    <tr
                      className={isActive ? "bg-red-50 ring-2 ring-inset ring-red-400" : ""}
                    >
                      <td className="px-4 py-2 font-mono text-base font-bold text-slate-900">
                        {r.activation_code}
                      </td>
                      <td className="px-4 py-2 text-xs text-slate-600">
                        {new Date(r.registered_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {r.activated_at ? (
                          <span className="text-emerald-700">
                            ✓ {new Date(r.activated_at).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">not yet</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {alert ? (
                          <span
                            className={
                              isActive
                                ? "rounded bg-red-600 px-2 py-1 font-bold text-white"
                                : "rounded bg-amber-100 px-2 py-1 font-semibold text-amber-900"
                            }
                          >
                            {isActive ? "🔴 TRIGGERED — " : "CANCELLED — "}
                            {new Date(alert.triggered_at).toLocaleString()}
                          </span>
                        ) : (
                          <span className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                            Quiet
                          </span>
                        )}
                      </td>
                    </tr>
                    {isActive && r.locate && (
                      <tr className="bg-red-50">
                        <td colSpan={4} className="px-4 pb-4 pt-0">
                          <div className="space-y-3 rounded-md border border-red-300 bg-white p-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-red-700">
                              Locate packet — released because this alert is active
                            </p>
                            <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-3">
                              <Field label="Name" value={r.locate.full_name} />
                              <Field label="A-number" value={r.locate.a_number} />
                              <Field label="Date of birth" value={r.locate.date_of_birth} />
                              <Field label="Place of birth" value={r.locate.place_of_birth} />
                              <Field label="Country of origin" value={r.locate.country_of_origin} />
                              <Field label="Language" value={r.locate.language} />
                              <Field label="Phone" value={r.locate.phone} />
                            </dl>
                            {r.client_id && <LocateFile pin={pin} clientId={r.client_id} />}
                            <p className="text-[11px] text-slate-500">
                              No location data is collected by the app. Location below is
                              entered by the locate desk after they find the person.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  );
                })}

              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-slate-400">
          Client identity, emergency contacts and legal forms are released here only
          while an alert is live. The full permanent file lives on /attorney-board.
        </p>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value || "—"}</dd>
    </div>
  );
}

/** Full attorney-equivalent file + the location entry form for the locate desk. */
function LocateFile({ pin, clientId }: { pin: string; clientId: string }) {
  const fileFn = useServerFn(pinCompanyLocateFile);
  const saveFn = useServerFn(pinSaveLocateInfo);
  const { data, refetch } = useQuery({
    queryKey: ["company-locate-file", clientId],
    queryFn: () => fileFn({ data: { pin, clientId } }),
    retry: 2,
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  if (!data) return <p className="text-xs text-slate-500">Loading case file…</p>;

  const client = data.client as Record<string, string | null>;
  const det = (data.detention ?? {}) as Record<string, string | null>;
  const contacts = data.contacts as Array<Record<string, string | null>>;
  const documents = data.documents as Array<Record<string, string | null | boolean>>;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    setStatus(null);
    try {
      const res = await saveFn({
        data: {
          pin,
          clientId,
          facility_name: String(fd.get("facility_name") ?? ""),
          facility_address: String(fd.get("facility_address") ?? ""),
          warden_name: String(fd.get("warden_name") ?? ""),
          arrest_date: String(fd.get("arrest_date") ?? ""),
          a_number: String(fd.get("a_number") ?? ""),
          federal_id: String(fd.get("federal_id") ?? ""),
          notes: String(fd.get("notes") ?? ""),
          located_by: String(fd.get("located_by") ?? ""),
        },
      });
      setStatus(`Saved and sent to ${res.sent_to}`);
      void refetch();
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3 border-t border-slate-200 pt-3">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-600">
          Emergency contacts
        </p>
        {contacts.length === 0 ? (
          <p className="text-xs text-slate-500">None on file.</p>
        ) : (
          <ul className="text-xs text-slate-800">
            {contacts.map((c) => (
              <li key={String(c["id"])}>
                <strong>{c["name"]}</strong>
                {c["relationship"] ? ` (${c["relationship"]})` : ""} — {c["phone_e164"] || "no phone"} ·{" "}
                {c["email"] || "no email"}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-600">
          Forms on file ({documents.length})
        </p>
        <ul className="text-xs text-slate-700">
          {documents.map((d) => (
            <li key={String(d["id"])}>
              {String(d["title"])}
              {d["from_app"] ? " — from app" : ""}
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={onSubmit} className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
          Present location — fill in once found, then send to the attorney
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <Input name="facility_name" label="Facility name" defaultValue={det["facility_name"]} />
          <Input name="warden_name" label="Warden / officer in charge" defaultValue={det["warden_name"]} />
          <Input
            name="facility_address"
            label="Facility mailing address"
            defaultValue={det["facility_address"]}
            className="sm:col-span-2"
          />
          <Input name="arrest_date" label="Date of arrest" type="date" defaultValue={det["arrest_date"]} />
          <Input
            name="a_number"
            label="A-number"
            defaultValue={det["a_number"] ?? client["a_number"]}
          />
          <Input name="federal_id" label="Federal / booking ID" defaultValue={det["federal_id"]} />
          <Input name="located_by" label="Located by" defaultValue={det["located_by"]} />
          <Input name="notes" label="Notes" defaultValue={det["notes"]} className="sm:col-span-2" />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-red-700 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
          >
            {saving ? "Sending…" : "Save & send to attorney"}
          </button>
          {det["located_at"] && (
            <span className="text-[11px] text-slate-500">
              Last updated {new Date(String(det["located_at"])).toLocaleString()}
            </span>
          )}
          {status && <span className="text-[11px] font-medium text-emerald-700">{status}</span>}
        </div>
      </form>
    </div>
  );
}

function Input({
  name,
  label,
  defaultValue,
  type = "text",
  className = "",
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  type?: string;
  className?: string;
}) {
  return (
    <label className={`block text-xs ${className}`}>
      <span className="text-slate-500">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        className="mt-0.5 w-full rounded border border-slate-300 px-2 py-1 text-sm"
      />
    </label>
  );
}
