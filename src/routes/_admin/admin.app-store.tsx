import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  appStoreListApps,
  appStoreListBuilds,
  appStoreListBetaGroups,
  appStoreListVersions,
  appStoreAddBuildToGroup,
  appStoreSubmitForReview,
  appStoreCredStatus,
} from "@/lib/appstore.functions";

export const Route = createFileRoute("/_admin/admin/app-store")({
  component: AppStorePage,
});

function statusInfo(state: string): { label: string; color: string } {
  switch (state) {
    case "PROCESSING":
      return { label: "Processing", color: "bg-slate-100 text-slate-700" };
    case "UPLOADED":
      return { label: "Uploaded", color: "bg-slate-100 text-slate-700" };
    case "VALID_BUT_NOT_SUBMITTED":
      return { label: "Valid, not submitted", color: "bg-blue-100 text-blue-800" };
    case "IN_TESTING":
      return { label: "In TestFlight", color: "bg-green-100 text-green-800" };
    case "READY_TO_TEST":
      return { label: "Ready to test", color: "bg-green-100 text-green-800" };
    case "FAILED":
      return { label: "Failed", color: "bg-red-100 text-red-800" };
    default:
      return { label: state, color: "bg-slate-100 text-slate-700" };
  }
}

function fmtDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function AppStorePage() {
  const listAppsFn = useServerFn(appStoreListApps);
  const listBuildsFn = useServerFn(appStoreListBuilds);
  const listGroupsFn = useServerFn(appStoreListBetaGroups);
  const addToGroup = useServerFn(appStoreAddBuildToGroup);
  const credStatusFn = useServerFn(appStoreCredStatus);

  const [appId, setAppId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string>("");
  const [promoting, setPromoting] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const appsQ = useQuery({ queryKey: ["asc-apps"], queryFn: () => listAppsFn() });
  const credQ = useQuery({ queryKey: ["asc-creds"], queryFn: () => credStatusFn() });

  const selectedApp = appId ?? appsQ.data?.[0]?.id ?? null;

  const buildsQ = useQuery({
    queryKey: ["asc-builds", selectedApp],
    queryFn: () =>
      selectedApp ? listBuildsFn({ data: { appId: selectedApp } }) : Promise.resolve([]),
    enabled: !!selectedApp,
  });
  const groupsQ = useQuery({
    queryKey: ["asc-groups", selectedApp],
    queryFn: () =>
      selectedApp ? listGroupsFn({ data: { appId: selectedApp } }) : Promise.resolve([]),
    enabled: !!selectedApp,
  });

  const externalGroups = (groupsQ.data ?? []).filter((g) => !g.isInternalGroup);
  const targetGroup = groupId || externalGroups[0]?.id || "";

  const promote = async (buildId: string) => {
    if (!targetGroup) {
      setErr("No external TestFlight group found to send the build to.");
      return;
    }
    setPromoting(buildId);
    setErr(null);
    setMsg(null);
    try {
      await addToGroup({ data: { buildId, groupId: targetGroup } });
      setMsg("Build added to the TestFlight external group. It may take a few minutes to appear.");
      buildsQ.refetch();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setPromoting(null);
    }
  };

  const selectedAppInfo = appsQ.data?.find((a) => a.id === selectedApp);

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-xl font-bold text-slate-900">App Store Connect</h1>
        <p className="mt-1 text-sm text-slate-600">
          Live build status from Apple, plus the ability to send a build to your external
          TestFlight group (your{" "}
          <Link to="/admin/app-release" className="text-amber-700 underline">
            public TestFlight link
          </Link>
          ). Powered by your stored App Store Connect API credentials.
        </p>
      </header>


      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
          Apple API credentials
        </h2>
        {credQ.isLoading ? (
          <p className="text-sm text-slate-500">Checking…</p>
        ) : credQ.data ? (
          <div className="space-y-2 text-sm">
            <CredRow
              label="Issuer ID"
              ok={credQ.data.hasIssuer}
              value={credQ.data.issuerId}
            />
            <CredRow label="Key ID" ok={credQ.data.hasKeyId} value={credQ.data.keyId} />
            <CredRow
              label="Private key (.p8)"
              ok={credQ.data.hasP8 && credQ.data.p8LooksValid}
              value={
                credQ.data.hasP8
                  ? credQ.data.p8LooksValid
                    ? "Stored (valid PKCS#8 format)"
                    : "Stored, but does not look like a .p8 private key"
                  : null
              }
            />
            <p className="pt-2 text-xs text-slate-500">
              All three values must come from the <strong>same key row</strong> in App Store
              Connect. Copy the Issuer ID and Key ID above into Primio exactly as shown, and
              upload the matching <code>.p8</code> file.
            </p>
          </div>
        ) : (
          <p className="text-sm text-red-600">Could not read credential status.</p>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
          Where to find the Apple API key (for Primio)
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>
            Sign in at <span className="font-mono">appstoreconnect.apple.com</span> with the
            Account Holder or Admin account.
          </li>
          <li>
            Top nav: <strong>Users and Access</strong> → tab <strong>Integrations</strong> →
            left sidebar <strong>App Store Connect API</strong> → sub-tab{" "}
            <strong>Team Keys</strong>.
          </li>
          <li>
            The <strong>Issuer ID</strong> is the long UUID printed at the top of that page
            (one per team). Click <em>Copy</em>.
          </li>
          <li>
            In the key table, your key row shows <strong>Name</strong>,{" "}
            <strong>Key ID</strong> (10 characters), <strong>Access</strong> and{" "}
            <strong>Status</strong>. Status must say <strong>Active</strong>.
          </li>
          <li>
            If you no longer have the <code>.p8</code> file, Apple will not let you download it
            again — click <strong>+</strong>, name it, set Access ={" "}
            <strong>App Manager</strong>, generate, and download the new{" "}
            <code>AuthKey_XXXXXXXXXX.p8</code> once.
          </li>
          <li>
            In Primio: <strong>Publish → iOS</strong> → paste the Issuer ID, type the Key ID,
            upload the <code>.p8</code>, then <strong>Build IPA</strong>. Primio does not store
            the <code>.p8</code> — re-upload it each session.
          </li>
        </ol>
      </section>

      {appsQ.isLoading && <p className="text-sm text-slate-500">Connecting to App Store Connect…</p>}
      {appsQ.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">Could not reach App Store Connect</p>
          <p className="mt-1 text-xs text-red-600">{(appsQ.error as Error).message}</p>
        </div>
      )}

      {appsQ.isSuccess && appsQ.data.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No apps were returned. Check that the API key has access to your app and that the
          credentials are correct.
        </div>
      )}

      {appsQ.isSuccess && appsQ.data.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                App
              </label>
              {appsQ.data.length > 1 ? (
                <select
                  className="mt-1 block w-64 rounded border border-slate-300 px-3 py-2 text-sm"
                  value={selectedApp ?? ""}
                  onChange={(e) => setAppId(e.target.value || null)}
                >
                  {appsQ.data.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} · {a.bundleId}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {selectedAppInfo?.name} ·{" "}
                  <span className="font-mono text-xs">{selectedAppInfo?.bundleId}</span>
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                TestFlight group
              </label>
              <select
                className="mt-1 block w-64 rounded border border-slate-300 px-3 py-2 text-sm"
                value={targetGroup}
                onChange={(e) => setGroupId(e.target.value)}
              >
                {externalGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} (external{groupName(g)})
                  </option>
                ))}
              </select>
              {externalGroups.length === 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  No external (public) TestFlight group found — builds below can only go to
                  internal testers.
                </p>
              )}
            </div>
          </div>
          {msg && <p className="mt-3 text-sm text-green-700">{msg}</p>}
          {err && <p className="mt-3 text-sm text-red-700">{err}</p>}
        </section>
      )}

      {selectedApp && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
            Recent builds
          </h2>
          {buildsQ.isLoading ? (
            <p className="text-sm text-slate-500">Loading builds…</p>
          ) : buildsQ.isError ? (
            <p className="text-sm text-red-600">{(buildsQ.error as Error).message}</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Version</th>
                  <th className="px-3 py-2">Build</th>
                  <th className="px-3 py-2">Uploaded</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">TestFlight</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {buildsQ.data?.map((b) => {
                  const st = statusInfo(b.processingState);
                  return (
                    <tr key={b.id}>
                      <td className="px-3 py-2 font-mono">{b.version}</td>
                      <td className="px-3 py-2 font-mono">{b.buildVersion}</td>
                      <td className="px-3 py-2 text-xs text-slate-600">
                        {fmtDate(b.uploadedDate)}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {b.inExternalTesting ? (
                          <span className="font-semibold text-green-700">✓ In external</span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {!b.inExternalTesting && (
                          <button
                            className="rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                            disabled={promoting !== null || !targetGroup}
                            onClick={() => promote(b.id)}
                          >
                            {promoting === b.id ? "Sending…" : "Send to TestFlight"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {(buildsQ.data?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                      No builds found for this app.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}

function CredRow({ label, ok, value }: { label: string; ok: boolean; value: string | null }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
      >
        {ok ? "OK" : "Missing"}
      </span>
      <span className="w-40 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span className="font-mono text-xs text-slate-800">{value ?? "not set"}</span>
    </div>
  );
}

function groupName(g: { name: string; publicLinkEnabled: boolean }): string {
  return g.publicLinkEnabled ? " · public link on" : "";
}
