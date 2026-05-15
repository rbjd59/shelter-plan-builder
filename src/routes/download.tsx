import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getApkInfo } from "@/lib/download.functions";

export const Route = createFileRoute("/download")({
  component: DownloadPage,
  head: () => ({
    meta: [
      { title: "Download the HELP NOW App — DetencionDefensa" },
      {
        name: "description",
        content:
          "Install the DetencionDefensa HELP NOW Android app — one tap notifies your legal team and family the moment ICE detains you.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function detectPlatform(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "other";
}

function DownloadPage() {
  const fetchApk = useServerFn(getApkInfo);
  const [state, setState] = useState<{ loading: boolean; url: string | null; version: string | null }>({
    loading: true,
    url: null,
    version: null,
  });
  const [autoStarted, setAutoStarted] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");
  const [tab, setTab] = useState<"ios" | "android">("android");

  useEffect(() => {
    const p = detectPlatform();
    setPlatform(p);
    setTab(p === "ios" ? "ios" : "android");
  }, []);

  useEffect(() => {
    fetchApk()
      .then((info) => setState({ loading: false, url: info.url, version: info.version }))
      .catch(() => setState({ loading: false, url: null, version: null }));
  }, [fetchApk]);

  // Auto-start APK download only on Android — never on iPhone (the .apk won't install).
  useEffect(() => {
    if (state.url && !autoStarted && platform === "android") {
      const t = setTimeout(() => {
        setAutoStarted(true);
        window.location.href = state.url!;
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [state.url, autoStarted, platform]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b0d",
        color: "#f4f4f5",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 16 }}>📱</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px" }}>Install HELP NOW</h1>
        <p style={{ color: "#a1a1aa", fontSize: 14, margin: "0 0 20px" }}>
          One tap on the detainee's phone alerts your legal team and family — even if the phone is taken.
        </p>

        {/* Platform tabs */}
        <div style={{ display: "inline-flex", background: "#18181b", border: "1px solid #27272a", borderRadius: 10, padding: 4, marginBottom: 24 }}>
          <button
            onClick={() => setTab("ios")}
            style={{
              padding: "8px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
              background: tab === "ios" ? "#dc2626" : "transparent",
              color: tab === "ios" ? "#fff" : "#a1a1aa",
            }}
          >
             iPhone
          </button>
          <button
            onClick={() => setTab("android")}
            style={{
              padding: "8px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
              background: tab === "android" ? "#dc2626" : "transparent",
              color: tab === "android" ? "#fff" : "#a1a1aa",
            }}
          >
            🤖 Android
          </button>
        </div>

        {tab === "ios" && (
          <>
            <p style={{ color: "#d4d4d8", lineHeight: 1.55, margin: "0 0 20px" }}>
              iPhone uses the web app — no App Store needed. Open the page in <strong>Safari</strong>, then add it to your home screen.
            </p>
            <a
              href="/app"
              style={{
                display: "inline-block",
                background: "#dc2626",
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
                padding: "16px 32px",
                borderRadius: 12,
                textDecoration: "none",
                marginBottom: 16,
              }}
            >
              Open HELP NOW Page
            </a>
            <div
              style={{
                marginTop: 24,
                padding: 16,
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: 10,
                textAlign: "left",
                fontSize: 14,
                color: "#d4d4d8",
                lineHeight: 1.7,
              }}
            >
              <strong style={{ color: "#fff" }}>How to install on iPhone:</strong>
              <ol style={{ paddingLeft: 20, margin: "8px 0 0" }}>
                <li>Open <strong>detenciondefensa.com/app</strong> in <strong>Safari</strong> (not Chrome).</li>
                <li>Tap the <strong>Share</strong> button (square with an up-arrow) at the bottom.</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                <li>Tap <strong>Add</strong>. The red HELP NOW icon appears on your home screen.</li>
                <li>Open it from the icon, allow location, and complete one-time setup.</li>
              </ol>
              <p style={{ color: "#fbbf24", margin: "12px 0 0", fontSize: 13 }}>
                ⚠️ The install link from your confirmation email must be opened in Safari for the setup to load.
              </p>
            </div>
          </>
        )}

        {tab === "android" && state.loading && <p style={{ color: "#a1a1aa" }}>Loading…</p>}

        {tab === "android" && !state.loading && state.url && (
          <>
            <p style={{ color: "#d4d4d8", lineHeight: 1.55, margin: "0 0 24px" }}>
              {platform === "android"
                ? "Your download is starting. If it doesn't begin in a few seconds, tap the button below."
                : "Open this page on your Android phone, or tap below to download the .apk."}
            </p>
            <a
              href={state.url}
              style={{
                display: "inline-block",
                background: "#dc2626",
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
                padding: "16px 32px",
                borderRadius: 12,
                textDecoration: "none",
                marginBottom: 16,
              }}
            >
              Download Android App (.apk)
            </a>
            {state.version && (
              <p style={{ color: "#71717a", fontSize: 13, margin: "8px 0 0" }}>Version {state.version}</p>
            )}
            <div
              style={{
                marginTop: 24,
                padding: 16,
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: 10,
                textAlign: "left",
                fontSize: 14,
                color: "#d4d4d8",
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: "#fff" }}>How to install on Android:</strong>
              <ol style={{ paddingLeft: 20, margin: "8px 0 0" }}>
                <li>Tap the download button above.</li>
                <li>When Android asks, allow installs from this site.</li>
                <li>Open the downloaded file and tap <strong>Install</strong>.</li>
                <li>Open the app, then tap the install link from your confirmation email to load setup.</li>
              </ol>
            </div>
          </>
        )}

        {tab === "android" && !state.loading && !state.url && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 12px", color: "#fbbf24" }}>
              Android app in final testing
            </h2>
            <p style={{ color: "#d4d4d8", lineHeight: 1.55, margin: "0 0 20px" }}>
              The Android .apk is in final testing. Use the iPhone-style web app on Android in the meantime — it works the same way.
            </p>
            <a
              href="/app"
              style={{
                display: "inline-block",
                background: "#dc2626",
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                padding: "14px 28px",
                borderRadius: 12,
                textDecoration: "none",
              }}
            >
              Open Web Emergency Page
            </a>
          </>
        )}

        <div style={{ marginTop: 40 }}>
          <a href="/" style={{ color: "#71717a", fontSize: 13, textDecoration: "none" }}>
            ← Back to DetencionDefensa
          </a>
        </div>
      </div>
    </div>
  );
}
