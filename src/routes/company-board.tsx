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

function CompanyBoard({ pin }: { pin: string }) {
  const fn = useServerFn(pinListCompanyBoard);
  const { data, isLoading, error } = useQuery({
    queryKey: ["company-board"],
    queryFn: () => fn({ data: { pin } }),
    refetchInterval: 15000,
  });

  if (isLoading) return <div className="p-8 text-slate-500">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{(error as Error).message}</div>;

  const registered = data?.registered ?? [];
  const triggered = data?.triggered ?? [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">
            Company Admin — SOS Alert Board
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Activation code is the only on-file identifier until the client triggers
            the app. After trigger, the app sends name, A-Number, date and place of
            birth, and the timestamp — and only those — to this board. Auto-refreshes
            every 15s.
          </p>
        </header>

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-red-700">
            Triggered ({triggered.length})
          </h2>
          {triggered.length === 0 ? (
            <p className="rounded border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
              No triggers yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-red-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-red-50 text-left text-xs uppercase tracking-wide text-red-800">
                  <tr>
                    <th className="px-3 py-2">Activation</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">A-Number</th>
                    <th className="px-3 py-2">DOB</th>
                    <th className="px-3 py-2">Place of birth</th>
                    <th className="px-3 py-2">Triggered</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {triggered.map((t) => (
                    <tr key={t.alert_id} className={t.cancelled_at ? "bg-slate-50" : ""}>
                      <td className="px-3 py-2 font-mono font-bold">{t.activation_code}</td>
                      <td className="px-3 py-2">{t.name ?? <span className="text-slate-400">—</span>}</td>
                      <td className="px-3 py-2 font-mono">{t.a_number ?? <span className="text-slate-400">—</span>}</td>
                      <td className="px-3 py-2">{t.date_of_birth ?? <span className="text-slate-400">—</span>}</td>
                      <td className="px-3 py-2">{t.place_of_birth ?? <span className="text-slate-400">—</span>}</td>
                      <td className="px-3 py-2 text-xs text-slate-600">
                        {new Date(t.triggered_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">
                        {t.cancelled_at ? (
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                            CANCELLED
                          </span>
                        ) : (
                          <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                            ACTIVE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
            Registered, no trigger ({registered.length})
          </h2>
          {registered.length === 0 ? (
            <p className="rounded border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
              No registered clients yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Activation</th>
                    <th className="px-3 py-2">Registered</th>
                    <th className="px-3 py-2">App activated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registered.map((r) => (
                    <tr key={r.activation_code}>
                      <td className="px-3 py-2 font-mono font-bold">{r.activation_code}</td>
                      <td className="px-3 py-2 text-xs text-slate-600">
                        {new Date(r.registered_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {r.activated_at ? (
                          <span className="text-emerald-700">
                            ✓ {new Date(r.activated_at).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
