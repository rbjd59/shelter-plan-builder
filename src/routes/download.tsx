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

function DownloadPage() {
  const fetchApk = useServerFn(getApkInfo);
  const [state, setState] = useState<{ loading: boolean; url: string | null; version: string | null }>({
    loading: true,
    url: null,
    version: null,
  });
  const [autoStarted, setAutoStarted] = useState(false);

  useEffect(() => {
    fetchApk()
      .then((info) => setState({ loading: false, url: info.url, version: info.version }))
      .catch(() => setState({ loading: false, url: null, version: null }));
  }, [fetchApk]);

  // If URL is set, auto-start the download after 1.5s so the user sees what's happening.
  useEffect(() => {
    if (state.url && !autoStarted) {
      const t = setTimeout(() => {
        setAutoStarted(true);
        window.location.href = state.url!;
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [state.url, autoStarted]);

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
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 12px" }}>HELP NOW App</h1>

        {state.loading && <p style={{ color: "#a1a1aa" }}>Loading…</p>}

        {!state.loading && state.url && (
          <>
            <p style={{ color: "#d4d4d8", lineHeight: 1.55, margin: "0 0 24px" }}>
              Your download is starting. If it doesn't begin in a few seconds, tap the button below.
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
                marginTop: 32,
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
              <strong style={{ color: "#fff" }}>How to install:</strong>
              <ol style={{ paddingLeft: 20, margin: "8px 0 0" }}>
                <li>Tap the download button above.</li>
                <li>When Android asks, allow installs from this site.</li>
                <li>Open the downloaded file and tap <strong>Install</strong>.</li>
                <li>Open the app, sign in with the email you used at checkout, and complete one-time setup.</li>
              </ol>
            </div>
          </>
        )}

        {!state.loading && !state.url && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 12px", color: "#fbbf24" }}>
              Almost ready
            </h2>
            <p style={{ color: "#d4d4d8", lineHeight: 1.55, margin: "0 0 20px" }}>
              The Android app is in final testing. We'll email everyone with an active plan the moment
              it's available — usually within 48 hours of signing up.
            </p>
            <p style={{ color: "#a1a1aa", fontSize: 14, lineHeight: 1.55, margin: "0 0 24px" }}>
              In the meantime, your case is fully active. The web-based emergency page works on any phone:
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
