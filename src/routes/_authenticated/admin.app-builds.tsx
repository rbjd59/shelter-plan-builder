import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
import {
  listAppReleases,
  createAppRelease,
  setCurrentRelease,
  deleteAppRelease,
  type AppRelease,
} from "@/lib/app-releases.functions";

export const Route = createFileRoute("/_authenticated/admin/app-builds")({
  head: () => ({ meta: [{ title: "App builds — Admin" }] }),
  component: AppBuildsPage,
});

function AppBuildsPage() {
  const fetchList = useServerFn(listAppReleases);
  const create = useServerFn(createAppRelease);
  const setCurrent = useServerFn(setCurrentRelease);
  const removeRelease = useServerFn(deleteAppRelease);

  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Android upload form
  const [version, setVersion] = useState("");
  const [minSdk, setMinSdk] = useState("26");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>("");

  // iOS TestFlight form
  const [iosVersion, setIosVersion] = useState("");
  const [iosUrl, setIosUrl] = useState("");
  const [iosNotes, setIosNotes] = useState("");
  const [savingIos, setSavingIos] = useState(false);

  // QR code generator
  const [qrText, setQrText] = useState("https://testflight.apple.com/join/5GBXYZJLF2");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!qrText.trim()) {
      setQrDataUrl("");
      return;
    }
    QRCode.toDataURL(qrText.trim(), { width: 320, margin: 2, errorCorrectionLevel: "M" })
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
          setQrError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) setQrError(e instanceof Error ? e.message : "QR generation failed");
      });
    return () => {
      cancelled = true;
    };
  }, [qrText]);


  const refresh = async () => {
    setLoading(true);
    try {
      const data = await fetchList();
      setReleases(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load releases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAndroidUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !version.trim()) {
      setError("Pick an APK file and enter a version number.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".apk")) {
      setError("File must be a .apk");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const path = `android/${version.trim()}-${Date.now()}.apk`;
      setProgress("Uploading APK…");
      const { error: upErr } = await supabase.storage
        .from("app-builds")
        .upload(path, file, { contentType: "application/vnd.android.package-archive", upsert: false });
      if (upErr) throw upErr;

      setProgress("Recording release…");
      await create({
        data: {
          platform: "android",
          version: version.trim(),
          apk_path: path,
          min_android_sdk: Number(minSdk) || 26,
          notes: notes.trim() || null,
          make_current: true,
        },
      });

      setProgress("Done.");
      setVersion("");
      setNotes("");
      setFile(null);
      (document.getElementById("apk-file") as HTMLInputElement | null)?.value && ((document.getElementById("apk-file") as HTMLInputElement).value = "");
      await refresh();
      setTimeout(() => setProgress(""), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setProgress("");
    } finally {
      setUploading(false);
    }
  };

  const handleIosSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!iosVersion.trim() || !iosUrl.trim()) {
      setError("Enter both version and TestFlight URL.");
      return;
    }
    setSavingIos(true);
    setError(null);
    try {
      await create({
        data: {
          platform: "ios",
          version: iosVersion.trim(),
          testflight_url: iosUrl.trim(),
          notes: iosNotes.trim() || null,
          make_current: true,
        },
      });
      setIosVersion("");
      setIosUrl("");
      setIosNotes("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingIos(false);
    }
  };

  const handleSetCurrent = async (r: AppRelease) => {
    try {
      await setCurrent({ data: { id: r.id, platform: r.platform } });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  };

  const handleDelete = async (r: AppRelease) => {
    if (!confirm(`Delete ${r.platform} v${r.version}? This cannot be undone.`)) return;
    try {
      await removeRelease({ data: { id: r.id } });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={{ marginBottom: 24 }}>
          <Link to="/dashboard" style={{ color: "#a1a1aa", fontSize: 13, textDecoration: "none" }}>
            ← Dashboard
          </Link>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 6px" }}>App builds</h1>
        <p style={{ color: "#a1a1aa", margin: "0 0 24px", fontSize: 14 }}>
          Upload new Android APKs and update the iOS TestFlight invite. The active build is what /download
          serves at /app/latest.apk.
        </p>

        {error && (
          <div style={s.errorBox}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Android upload */}
        <section style={s.card}>
          <h2 style={s.h2}>🤖 Upload Android APK</h2>
          <form onSubmit={handleAndroidUpload} style={{ display: "grid", gap: 12 }}>
            <label style={s.label}>
              Version (e.g. 1.0.0)
              <input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
                style={s.input}
                required
              />
            </label>
            <label style={s.label}>
              Minimum Android SDK (Premio said 26 for Android 8.0)
              <input
                type="number"
                value={minSdk}
                onChange={(e) => setMinSdk(e.target.value)}
                min={1}
                max={99}
                style={s.input}
              />
            </label>
            <label style={s.label}>
              APK file
              <input
                id="apk-file"
                type="file"
                accept=".apk,application/vnd.android.package-archive"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                style={s.input}
              />
              {file && (
                <span style={{ fontSize: 12, color: "#71717a" }}>
                  {file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB
                </span>
              )}
            </label>
            <label style={s.label}>
              Release notes (optional)
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={{ ...s.input, fontFamily: "inherit" }}
              />
            </label>
            <button type="submit" disabled={uploading} style={s.primaryBtn}>
              {uploading ? progress || "Uploading…" : "Upload + make current"}
            </button>
          </form>
        </section>

        {/* iOS TestFlight */}
        <section style={s.card}>
          <h2 style={s.h2}> Update iOS TestFlight link</h2>
          <form onSubmit={handleIosSave} style={{ display: "grid", gap: 12 }}>
            <label style={s.label}>
              Version (e.g. 1.0.0)
              <input
                value={iosVersion}
                onChange={(e) => setIosVersion(e.target.value)}
                placeholder="1.0.0"
                style={s.input}
                required
              />
            </label>
            <label style={s.label}>
              TestFlight URL (https://testflight.apple.com/join/XXXXXXXX)
              <input
                type="url"
                value={iosUrl}
                onChange={(e) => setIosUrl(e.target.value)}
                placeholder="https://testflight.apple.com/join/XXXXXXXX"
                style={s.input}
                required
              />
            </label>
            <label style={s.label}>
              Notes (optional)
              <textarea
                value={iosNotes}
                onChange={(e) => setIosNotes(e.target.value)}
                rows={2}
                style={{ ...s.input, fontFamily: "inherit" }}
              />
            </label>
            <button type="submit" disabled={savingIos} style={s.primaryBtn}>
              {savingIos ? "Saving…" : "Save + make current"}
            </button>
          </form>
        </section>

        {/* QR code generator */}
        <section style={s.card}>
          <h2 style={s.h2}>📱 QR code generator</h2>
          <p style={{ color: "#a1a1aa", fontSize: 13, margin: "0 0 12px" }}>
            Generate a scannable QR for the TestFlight invite (or any URL). Print it on flyers or show it on
            screen — people scan with their iPhone camera to join.
          </p>
          <label style={s.label}>
            URL or text
            <input
              value={qrText}
              onChange={(e) => setQrText(e.target.value)}
              placeholder="https://testflight.apple.com/join/XXXXXXXX"
              style={s.input}
            />
          </label>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {releases
              .filter((r) => r.platform === "ios" && r.testflight_url)
              .slice(0, 3)
              .map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setQrText(r.testflight_url!)}
                  style={s.smallBtn}
                >
                  Use v{r.version} link
                </button>
              ))}
            <button type="button" onClick={() => setQrText("https://detenciondefensa.com/download")} style={s.smallBtn}>
              Use /download page
            </button>
          </div>
          {qrError && <p style={{ color: "#fca5a5", fontSize: 13, marginTop: 10 }}>{qrError}</p>}
          {qrDataUrl && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <img
                src={qrDataUrl}
                alt="QR code"
                style={{ width: 280, height: 280, background: "#fff", padding: 8, borderRadius: 8 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href={qrDataUrl}
                  download={`qr-${Date.now()}.png`}
                  style={{ ...s.smallBtn, textDecoration: "none", display: "inline-block" }}
                >
                  Download PNG
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const w = window.open("");
                    if (w) {
                      w.document.write(
                        `<html><head><title>QR — ${qrText}</title></head><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;"><img src="${qrDataUrl}" style="width:480px;height:480px"/><p style="font-size:14px;margin-top:16px;word-break:break-all;max-width:480px;text-align:center">${qrText}</p><script>window.print()</script></body></html>`,
                      );
                      w.document.close();
                    }
                  }}
                  style={s.smallBtn}
                >
                  Print
                </button>
              </div>
            </div>
          )}
        </section>



        {/* History */}
        <section style={{ marginTop: 32 }}>
          <h2 style={s.h2}>Release history</h2>
          {loading ? (
            <p style={{ color: "#a1a1aa" }}>Loading…</p>
          ) : releases.length === 0 ? (
            <p style={{ color: "#a1a1aa" }}>No releases yet.</p>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {releases.map((r) => (
                <div key={r.id} style={s.row}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>
                      {r.platform === "android" ? "🤖" : ""} v{r.version}
                      {r.is_current && <span style={s.currentPill}>CURRENT</span>}
                    </div>
                    <div style={{ fontSize: 12, color: "#71717a", marginTop: 4 }}>
                      {new Date(r.created_at).toLocaleString()}
                      {r.platform === "android" && r.min_android_sdk && ` · min SDK ${r.min_android_sdk}`}
                      {r.platform === "ios" && r.testflight_url && (
                        <>
                          {" · "}
                          <a href={r.testflight_url} target="_blank" rel="noreferrer" style={{ color: "#60a5fa" }}>
                            invite link
                          </a>
                        </>
                      )}
                    </div>
                    {r.notes && (
                      <div style={{ fontSize: 12, color: "#a1a1aa", marginTop: 4, whiteSpace: "pre-wrap" }}>
                        {r.notes}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {!r.is_current && (
                      <button onClick={() => handleSetCurrent(r)} style={s.smallBtn}>
                        Make current
                      </button>
                    )}
                    <button onClick={() => handleDelete(r)} style={{ ...s.smallBtn, color: "#fca5a5" }}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#0b0b0d",
    color: "#f4f4f5",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: "32px 16px",
  } as const,
  container: { maxWidth: 720, margin: "0 auto" } as const,
  card: {
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  } as const,
  h2: { fontSize: 18, fontWeight: 700, margin: "0 0 14px" } as const,
  label: { display: "grid", gap: 4, fontSize: 13, color: "#a1a1aa" } as const,
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #3f3f46",
    background: "#0b0b0d",
    color: "#f4f4f5",
    fontSize: 14,
  } as const,
  primaryBtn: {
    padding: "12px 20px",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
  } as const,
  smallBtn: {
    padding: "6px 12px",
    background: "transparent",
    color: "#d4d4d8",
    border: "1px solid #3f3f46",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
  } as const,
  row: {
    display: "flex",
    gap: 12,
    padding: 12,
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: 8,
    alignItems: "flex-start",
  } as const,
  currentPill: {
    marginLeft: 8,
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: 999,
    background: "#065f46",
    color: "#a7f3d0",
    letterSpacing: 1,
  } as const,
  errorBox: {
    background: "#7f1d1d",
    border: "1px solid #fca5a5",
    color: "#fee2e2",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  } as const,
};
