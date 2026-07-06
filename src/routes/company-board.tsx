import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import PinAccessGate from "@/components/PinAccessGate";
import { pinListCompanyBoard, pinDownloadDocument } from "@/lib/pin-access.functions";
import { usePinFromStorage } from "@/components/PinAccessGate";

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

  const [openId, setOpenId] = useState<string | null>(null);

  if (isLoading) return <div className="p-8 text-slate-500">Loading…</div>;
  if (error) return <div className="p-8 text-red-600">{(error as Error).message}</div>;

  const registered = data?.registered ?? [];
  const triggered = data?.triggered ?? [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-900">
            Company Admin — SOS Alert Board
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            When a client triggers the app, their full file (name, contacts, pet
            rescue, forms) opens here for the company team. Auto-refreshes every 15s.
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
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {triggered.map((t: any) => {
                    const isActive = !t.cancelled_at;
                    const isOpen = openId === t.alert_id;
                    return (
                      <React.Fragment key={t.alert_id}>
                        <tr
                          className={
                            isActive
                              ? "bg-red-100 animate-pulse ring-2 ring-inset ring-red-500"
                              : "bg-slate-50"
                          }
                        >
                          <td
                            className={`px-3 py-2 font-mono font-bold ${isActive ? "text-red-700 text-base" : ""}`}
                          >
                            {t.activation_code}
                          </td>
                          <td className="px-3 py-2">
                            {t.name ?? <span className="text-slate-400">—</span>}
                          </td>
                          <td className="px-3 py-2 font-mono">
                            {t.a_number ?? <span className="text-slate-400">—</span>}
                          </td>
                          <td className="px-3 py-2">
                            {t.date_of_birth ?? <span className="text-slate-400">—</span>}
                          </td>
                          <td className="px-3 py-2">
                            {t.place_of_birth ?? <span className="text-slate-400">—</span>}
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-600">
                            {new Date(t.triggered_at).toLocaleString()}
                          </td>
                          <td className="px-3 py-2">
                            {isActive ? (
                              <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                                ● ACTIVE
                              </span>
                            ) : (
                              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                                CANCELLED
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              className="text-xs font-semibold text-slate-700 underline"
                              onClick={() => setOpenId(isOpen ? null : t.alert_id)}
                            >
                              {isOpen ? "Close" : "Open file"}
                            </button>
                          </td>
                        </tr>
                        {isOpen && (
                          <tr>
                            <td colSpan={8} className="bg-white px-4 py-4">
                              <TriggerDetail t={t} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
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
                  {registered.map((r: any) => (
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

function TriggerDetail({ t }: { t: any }) {
  const hasLoc = typeof t.lat === "number" && typeof t.lng === "number";
  return (
    <div className="grid gap-4 sm:grid-cols-3 text-xs">
      <div className="rounded border border-slate-200 p-3">
        <div className="font-bold uppercase tracking-wide text-slate-500 mb-1">Client</div>
        <div className="font-semibold">{t.name ?? "—"}</div>
        <div className="text-slate-600">{t.email ?? "no email"}</div>
        <div className="text-slate-600">{t.phone ?? "no phone"}</div>
        <div className="mt-1 text-slate-500">
          Country: {t.country_of_origin ?? "—"}
        </div>
        <div className="mt-1 flex gap-1 flex-wrap">
          {t.has_asset_protection && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 font-semibold text-amber-800">
              Asset protection
            </span>
          )}
          {t.has_pet_rescue && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-semibold text-emerald-800">
              Pet rescue
            </span>
          )}
        </div>
        <div className="mt-2 text-slate-600">
          Forms on file: {t.draft_forms_count} draft
          {t.app_uploads_count > 0 ? ` · ${t.app_uploads_count} from phone` : ""}
        </div>
        {hasLoc && (
          <div className="mt-1">
            <a
              className="text-blue-700 underline"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://maps.google.com/?q=${t.lat},${t.lng}`}
            >
              Location: {t.lat}, {t.lng}
            </a>
          </div>
        )}
      </div>

      <div className="rounded border border-slate-200 p-3">
        <div className="font-bold uppercase tracking-wide text-slate-500 mb-1">
          Emergency contacts ({t.contacts.length})
        </div>
        {t.contacts.length === 0 ? (
          <div className="text-slate-500">None on file.</div>
        ) : (
          <ul className="space-y-1">
            {t.contacts.map((c: any, i: number) => (
              <li key={i}>
                <span className="font-semibold">{c.name}</span>
                {c.relationship ? ` · ${c.relationship}` : ""}
                <div className="text-slate-600">
                  {c.phone_e164 ?? "—"} · {c.email ?? "—"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded border border-slate-200 p-3">
        <div className="font-bold uppercase tracking-wide text-slate-500 mb-1">Pet rescue</div>
        {t.pet_rescue ? (
          <div className="space-y-0.5">
            <div>
              <span className="font-semibold">{t.pet_rescue.pet_name ?? "—"}</span>{" "}
              {t.pet_rescue.pet_type ? `(${t.pet_rescue.pet_type})` : ""}
            </div>
            <div className="text-slate-600">Location: {t.pet_rescue.pet_location ?? "—"}</div>
            <div className="text-slate-600">Access: {t.pet_rescue.access_instructions ?? "—"}</div>
            <div className="text-slate-600">Notify: {t.pet_rescue.who_to_notify ?? "—"}</div>
            {t.pet_rescue.no_kill_shelter_preferred && (
              <div className="text-slate-600">
                No-kill shelter: {t.pet_rescue.no_kill_shelter_address ?? "preferred"}
              </div>
            )}
          </div>
        ) : (
          <div className="text-slate-500">No pet rescue on file.</div>
        )}
      </div>
    </div>
  );
}
