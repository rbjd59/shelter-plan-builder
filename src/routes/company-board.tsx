import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import PinAccessGate from "@/components/PinAccessGate";
import { pinListCompanyBoard } from "@/lib/pin-access.functions";

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
  lat: number | null;
  lng: number | null;
  battery_pct: number | null;
  maps_url: string | null;
}

interface Row {
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
                    <>
                    <tr
                      key={r.activation_code}
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
                      <tr key={`${r.activation_code}-locate`} className="bg-red-50">
                        <td colSpan={4} className="px-4 pb-4 pt-0">
                          <div className="rounded-md border border-red-300 bg-white p-3">
                            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-red-700">
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
                              <Field
                                label="Battery"
                                value={r.locate.battery_pct != null ? `${r.locate.battery_pct}%` : null}
                              />
                              <div>
                                <dt className="text-slate-500">Last known location</dt>
                                <dd className="font-medium text-slate-900">
                                  {r.locate.maps_url ? (
                                    <a
                                      href={r.locate.maps_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-red-700 underline"
                                    >
                                      {r.locate.lat}, {r.locate.lng}
                                    </a>
                                  ) : (
                                    "—"
                                  )}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </td>
                      </tr>
                    )}
                    </>
                  );
                })}

              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-slate-400">
          Client identity, emergency contacts and legal forms are visible only on the
          attorney board at /attorney-board.
        </p>
      </div>
    </div>
  );
}
