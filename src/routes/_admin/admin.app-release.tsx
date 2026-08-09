import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  listAppReleases,
  createAppRelease,
  setCurrentRelease,
} from "@/lib/app-releases.functions";

export const Route = createFileRoute("/_admin/admin/app-release")({
  component: AppReleasePage,
});

function AppReleasePage() {
  const list = useServerFn(listAppReleases);
  const create = useServerFn(createAppRelease);
  const setCurrent = useServerFn(setCurrentRelease);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["app-releases"],
    queryFn: () => list(),
  });

  const [url, setUrl] = useState("");
  const [version, setVersion] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const releases = data ?? [];
  const currentIos = releases.find((r) => r.platform === "ios" && r.is_current);
  const currentAndroid = releases.find((r) => r.platform === "android" && r.is_current);

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      await create({
        data: {
          platform: "ios",
          version: version.trim() || "testflight",
          testflight_url: url.trim(),
          make_current: true,
        },
      });
      setUrl("");
      setVersion("");
      setMsg("Saved. iPhone clients now go straight to TestFlight.");
      await refetch();
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-xl font-bold text-slate-900">App delivery links</h1>
        <p className="mt-1 text-sm text-slate-600">
          Every client email and SMS points at one link:{" "}
          <span className="font-mono">detenciondefensa.com/get-app</span>. That link sends
          Android phones to the APK and iPhones to TestFlight. Paste the TestFlight public
          link below so iPhone clients stop landing on the "coming soon" page.
        </p>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
          Current
        </h2>
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : error ? (
          <p className="text-sm text-red-600">{(error as Error).message}</p>
        ) : (
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="font-semibold text-slate-700">iPhone (TestFlight)</dt>
              <dd className="text-slate-600">
                {currentIos?.testflight_url ? (
                  <a
                    className="break-all text-blue-700 underline"
                    href={currentIos.testflight_url}
                  >
                    {currentIos.testflight_url}
                  </a>
                ) : (
                  <span className="text-red-600">
                    Not set — iPhone clients see the "invite coming soon" page.
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-700">Android (APK)</dt>
              <dd className="break-all text-slate-600">
                {currentAndroid?.apk_path ?? "Not set"}
              </dd>
            </div>
          </dl>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
          Set TestFlight public link
        </h2>
        <p className="mb-3 text-xs text-slate-500">
          In App Store Connect: TestFlight → your external tester group → Public Link →
          Enable, then copy the <span className="font-mono">testflight.apple.com/join/…</span>{" "}
          URL and paste it here.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm"
            placeholder="https://testflight.apple.com/join/XXXXXXXX"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <input
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm sm:w-40"
            placeholder="Version (0.4.0)"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />
          <button
            className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            disabled={busy || !url.trim().startsWith("https://")}
            onClick={save}
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
        {msg && <p className="mt-2 text-sm text-slate-700">{msg}</p>}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
          History {isFetching ? "…" : ""}
        </h2>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Platform</th>
              <th className="px-3 py-2">Version</th>
              <th className="px-3 py-2">Link / file</th>
              <th className="px-3 py-2">Current</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {releases.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2">{r.platform}</td>
                <td className="px-3 py-2 font-mono">{r.version}</td>
                <td className="max-w-xs break-all px-3 py-2 text-xs text-slate-600">
                  {r.testflight_url ?? r.apk_path ?? "—"}
                </td>
                <td className="px-3 py-2">{r.is_current ? "✓" : ""}</td>
                <td className="px-3 py-2 text-right">
                  {!r.is_current && (
                    <button
                      className="text-xs font-semibold text-slate-700 underline"
                      onClick={async () => {
                        await setCurrent({ data: { id: r.id, platform: r.platform } });
                        await refetch();
                      }}
                    >
                      Make current
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {releases.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                  No releases yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
