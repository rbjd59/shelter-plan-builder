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
  appStoreExpireBuild,
  appStoreSetWhatToTest,
  appStoreListTesters,
  appStoreInviteTesters,
  appStoreRemoveTester,
} from "@/lib/appstore.functions";

export const Route = createFileRoute("/_admin/admin/app-store")({
  component: AppStorePage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-xl p-8 text-center">
      <h1 className="text-xl font-semibold">App Store console unavailable</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {String((error as Error)?.message || "").includes("Forbidden")
          ? "This page requires an admin account. Sign in with an admin user."
          : "Something went wrong loading App Store Connect data."}
      </p>
      <Link to="/" className="mt-4 inline-block text-sm underline">
        Back to home
      </Link>
    </div>
  ),
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
  const listVersionsFn = useServerFn(appStoreListVersions);
  const addToGroup = useServerFn(appStoreAddBuildToGroup);
  const submitForReviewFn = useServerFn(appStoreSubmitForReview);
  const credStatusFn = useServerFn(appStoreCredStatus);
  const expireBuildFn = useServerFn(appStoreExpireBuild);
  const setNotesFn = useServerFn(appStoreSetWhatToTest);
  const listTestersFn = useServerFn(appStoreListTesters);
  const inviteTestersFn = useServerFn(appStoreInviteTesters);
  const removeTesterFn = useServerFn(appStoreRemoveTester);

  const [appId, setAppId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string>("");
  const [promoting, setPromoting] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [confirmVersion, setConfirmVersion] = useState<{
    buildId: string;
    buildNumber: string;
    versionString: string;
    conflict?: { versionString: string; appStoreState: string } | null;
  } | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [expiring, setExpiring] = useState<string | null>(null);
  const [notesBuild, setNotesBuild] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [testerText, setTesterText] = useState("");
  const [inviting, setInviting] = useState(false);

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
  const versionsQ = useQuery({
    queryKey: ["asc-versions", selectedApp],
    queryFn: () =>
      selectedApp ? listVersionsFn({ data: { appId: selectedApp } }) : Promise.resolve([]),
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

  const testersQ = useQuery({
    queryKey: ["asc-testers", targetGroup],
    queryFn: () =>
      targetGroup ? listTestersFn({ data: { groupId: targetGroup } }) : Promise.resolve([]),
    enabled: !!targetGroup,
  });

  const expire = async (buildId: string) => {
    if (!confirm("Expire this build? Testers will no longer be able to install it.")) return;
    setExpiring(buildId);
    setErr(null);
    setMsg(null);
    try {
      await expireBuildFn({ data: { buildId } });
      setMsg("Build expired.");
      buildsQ.refetch();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setExpiring(null);
    }
  };

  const saveNotes = async () => {
    const buildId = notesBuild || buildsQ.data?.[0]?.id || "";
    if (!buildId || !notes.trim()) {
      setErr("Pick a build and write release notes first.");
      return;
    }
    setSavingNotes(true);
    setErr(null);
    setMsg(null);
    try {
      await setNotesFn({ data: { buildId, whatsNew: notes.trim() } });
      setMsg("Release notes saved to TestFlight (\u201cWhat to Test\u201d).");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSavingNotes(false);
    }
  };

  const parseTesters = (text: string) =>
    text
      .split(/[\n,;]+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/\s+/);
        const email = parts.find((p) => p.includes("@")) ?? "";
        const names = parts.filter((p) => !p.includes("@"));
        return { email, firstName: names[0], lastName: names.slice(1).join(" ") || undefined };
      })
      .filter((t) => t.email.includes("@"));

  const inviteTesters = async () => {
    if (!targetGroup) {
      setErr("No external TestFlight group selected.");
      return;
    }
    const testers = parseTesters(testerText);
    if (testers.length === 0) {
      setErr("Enter at least one valid email address.");
      return;
    }
    setInviting(true);
    setErr(null);
    setMsg(null);
    try {
      const results = await inviteTestersFn({ data: { groupId: targetGroup, testers } });
      const ok = results.filter((r) => r.ok).length;
      const failed = results.filter((r) => !r.ok);
      setMsg(
        `Invited ${ok} of ${results.length} testers.` +
          (failed.length
            ? ` Failed: ${failed.map((f) => `${f.email} (${f.error})`).join("; ")}`
            : ""),
      );
      if (failed.length === 0) setTesterText("");
      testersQ.refetch();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setInviting(false);
    }
  };

  const dropTester = async (testerId: string, email: string) => {
    if (!targetGroup) return;
    if (!confirm(`Remove ${email} from this TestFlight group?`)) return;
    try {
      await removeTesterFn({ data: { groupId: targetGroup, testerId } });
      testersQ.refetch();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const submitForReview = async (buildId: string, versionString: string) => {
    if (!selectedApp) return;
    setSubmitting(buildId);
    setErr(null);
    setMsg(null);
    try {
      const result = await submitForReviewFn({
        data: {
          appId: selectedApp,
          buildId,
          versionString,
          replaceExisting,
          whatsNew: notes.trim() || undefined,
        },
      });
      if (result.submitted) {
        setMsg(
          `Version ${result.versionString} submitted for App Store review (submission ${result.submissionId}).${result.deletedVersion ? ` Existing version ${result.deletedVersion} was removed.` : ""}`,
        );
      } else {
        setMsg(
          `Version ${result.versionString} is prepared for review (build attached and localization updated), but App Store Connect refused the automatic submission. Reason: ${result.submissionError ?? "unknown"}. You will need to click “Submit for Review” manually in App Store Connect.`,
        );
      }
      versionsQ.refetch();
      buildsQ.refetch();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSubmitting(null);
      setConfirmVersion(null);
    }
  };

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
                      <td className="px-3 py-2 font-mono">{b.buildNumber}</td>
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
                        {["VALID", "VALID_BUT_NOT_SUBMITTED", "READY_TO_TEST", "IN_TESTING"].includes(
                          b.processingState,
                        ) && (
                          <button
                            className="ml-2 rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            disabled={submitting !== null}
                            onClick={() => {
                              const conflict = (versionsQ.data ?? []).find(
                                (v) =>
                                  v.versionString !== b.version &&
                                  v.appStoreState === "PREPARE_FOR_SUBMISSION",
                              );
                              setReplaceExisting(false);
                              setConfirmVersion({
                                buildId: b.id,
                                buildNumber: b.buildNumber,
                                versionString: b.version,
                                conflict: conflict
                                  ? { versionString: conflict.versionString, appStoreState: conflict.appStoreState }
                                  : null,
                              });
                            }}
                          >
                            {submitting === b.id ? "Submitting…" : "Submit for Review"}
                          </button>
                        )}
                        <button
                          className="ml-2 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          disabled={expiring !== null}
                          onClick={() => expire(b.id)}
                        >
                          {expiring === b.id ? "Expiring…" : "Expire"}
                        </button>
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

      {selectedApp && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
            App Store versions
          </h2>
          {versionsQ.isLoading ? (
            <p className="text-sm text-slate-500">Loading versions…</p>
          ) : versionsQ.isError ? (
            <p className="text-sm text-red-600">{(versionsQ.error as Error).message}</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Version</th>
                  <th className="px-3 py-2">State</th>
                  <th className="px-3 py-2">Build</th>
                  <th className="px-3 py-2">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(versionsQ.data ?? []).map((v) => (
                  <tr key={v.id}>
                    <td className="px-3 py-2 font-mono">{v.versionString}</td>
                    <td className="px-3 py-2">
                      <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        {v.appStoreState}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-600">
                      {v.buildId ? "attached" : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      {fmtDate(v.createdDate)}
                    </td>
                  </tr>
                ))}
                {(versionsQ.data?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                      No App Store versions found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>
      )}

      {selectedApp && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
            Release notes
          </h2>
          <p className="mb-3 text-xs text-slate-600">
            Saved to TestFlight as “What to Test” for the chosen build, and reused as the
            App Store “What’s New” text when you submit for review.
          </p>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Build
          </label>
          <select
            className="mt-1 mb-3 block w-72 rounded border border-slate-300 px-3 py-2 text-sm"
            value={notesBuild || buildsQ.data?.[0]?.id || ""}
            onChange={(e) => setNotesBuild(e.target.value)}
          >
            {(buildsQ.data ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.version} ({b.buildNumber})
              </option>
            ))}
          </select>
          <textarea
            className="block w-full rounded border border-slate-300 px-3 py-2 text-sm"
            rows={5}
            maxLength={4000}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={"What changed in this build and what testers should try."}
          />
          <button
            className="mt-3 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
            disabled={savingNotes}
            onClick={saveNotes}
          >
            {savingNotes ? "Saving…" : "Save release notes"}
          </button>
        </section>
      )}

      {selectedApp && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
            TestFlight testers
          </h2>
          <p className="mb-3 text-xs text-slate-600">
            Paste one tester per line as <span className="font-mono">email First Last</span> (name
            optional). Apple emails each of them a TestFlight invite for the selected external
            group. External groups hold up to 10,000 testers.
          </p>
          <textarea
            className="block w-full rounded border border-slate-300 px-3 py-2 font-mono text-sm"
            rows={7}
            value={testerText}
            onChange={(e) => setTesterText(e.target.value)}
            placeholder={"maria@example.com Maria Lopez\njean@example.com Jean Baptiste"}
          />
          <div className="mt-3 flex items-center gap-3">
            <button
              className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
              disabled={inviting || !targetGroup}
              onClick={inviteTesters}
            >
              {inviting ? "Inviting…" : "Invite testers"}
            </button>
            <span className="text-xs text-slate-500">
              {parseTesters(testerText).length} valid email(s) detected
            </span>
          </div>

          <h3 className="mt-6 mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Current testers ({testersQ.data?.length ?? 0})
          </h3>
          {testersQ.isLoading ? (
            <p className="text-sm text-slate-500">Loading testers…</p>
          ) : testersQ.isError ? (
            <p className="text-sm text-red-600">{(testersQ.error as Error).message}</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(testersQ.data ?? []).map((t) => (
                  <tr key={t.id}>
                    <td className="px-3 py-2 font-mono text-xs">{t.email}</td>
                    <td className="px-3 py-2 text-xs">
                      {[t.firstName, t.lastName].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">{t.state || "—"}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        onClick={() => dropTester(t.id, t.email)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {(testersQ.data?.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                      No testers in this group yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </section>
      )}

      {confirmVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900">Prepare for App Store Review?</h3>
            <p className="mt-2 text-sm text-slate-700">
              This will attach build <strong className="font-mono">{confirmVersion.buildNumber}</strong> to
              the App Store version{" "}
              <strong className="font-mono">{confirmVersion.versionString}</strong> (or the existing
              editable version if Apple requires it), apply a default en-US localization, and then attempt
              to submit it to Apple automatically.
            </p>
            {confirmVersion.conflict && (
              <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <p className="font-semibold">Existing editable version found</p>
                <p>
                  App Store version{" "}
                  <strong className="font-mono">{confirmVersion.conflict.versionString}</strong> is
                  already in "{confirmVersion.conflict.appStoreState}". If Apple allows it, this will
                  replace it; otherwise the existing version will be used.
                </p>
                <label className="mt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!replaceExisting}
                    onChange={(e) => setReplaceExisting(e.target.checked)}
                    className="h-4 w-4 rounded border-amber-300 text-amber-600"
                  />
                  <span>Delete existing version and replace it if possible</span>
                </label>
              </div>
            )}
            <p className="mt-2 text-xs text-amber-700">
              Make sure screenshots, app review information, and pricing are already set in App Store
              Connect. If the Apple API key has only Developer role, the final “Submit for Review” click
              must still be done manually in App Store Connect by an App Manager or Admin.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                onClick={() => setConfirmVersion(null)}
              >
                Cancel
              </button>
              <button
                className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={submitting !== null || (!!confirmVersion.conflict && !replaceExisting)}
                onClick={() =>
                  submitForReview(confirmVersion.buildId, confirmVersion.versionString)
                }
              >
                {submitting ? "Submitting…" : "Submit for Review"}
              </button>
            </div>
          </div>
        </div>
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
