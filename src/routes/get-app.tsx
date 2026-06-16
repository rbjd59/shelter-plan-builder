import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export const Route = createFileRoute("/get-app")({
  component: InstallPage,
  head: () => ({
    meta: [
      { title: "Install the DetencionDefensa app" },
      {
        name: "description",
        content:
          "Download the DetencionDefensa mobile app on Android or join the iOS test build, then enter your activation code.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function InstallPage() {
  const [platform, setPlatform] = useState<Platform>("other");
  // These come in at build/render time via window.__INSTALL__ injection — but
  // simpler: read public env at runtime via fetch to a tiny config endpoint.
  // For now, read from data-attribute set in HTML via env at build.
  const apkUrl = (import.meta as any).env?.VITE_APK_URL || "https://detenciondefensa.com/download";
  const testflightUrl = (import.meta as any).env?.VITE_TESTFLIGHT_URL || "";

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const showAndroid = platform === "android" || platform === "other";
  const showIos = platform === "ios" || platform === "other";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        color: "#f6efe1",
        fontFamily: "Inter Tight, system-ui, sans-serif",
        padding: "32px 20px",
      }}
    >
      <div style={{ maxWidth: 540, margin: "0 auto" }}>
        <h1
          style={{
            fontSize: 30,
            fontWeight: 700,
            fontFamily: "Fraunces, serif",
            marginBottom: 8,
          }}
        >
          Install the DetencionDefensa app
        </h1>
        <p style={{ color: "#a8a59a", fontSize: 15, marginBottom: 24 }}>
          The app holds your defense file offline and lets you press one button to alert
          your family and your attorney if you are detained.
        </p>

        {showAndroid && (
          <Card title="Android — install now" subtitle="Side-load while we wait for Play Store approval.">
            <a href={apkUrl} style={btnPrimary}>
              Download APK
            </a>
            <ol style={list}>
              <li>Tap the button above to download.</li>
              <li>
                When Android warns about the source, allow installs from your browser this
                one time.
              </li>
              <li>Open the file to install.</li>
              <li>Open the app and enter your 8-character activation code.</li>
            </ol>
          </Card>
        )}

        {showIos && (
          <Card title="iPhone — join the test build" subtitle="Free TestFlight invite while we wait for App Store approval.">
            {testflightUrl ? (
              <a href={testflightUrl} style={btnPrimary}>
                Join TestFlight
              </a>
            ) : (
              <p style={{ color: "#e8a04a", fontSize: 14 }}>
                The TestFlight link is being set up. Check your activation email — the link
                will be there as soon as it's ready.
              </p>
            )}
            <ol style={list}>
              <li>Install Apple's TestFlight app from the App Store (free).</li>
              <li>Tap the button above to accept the invite.</li>
              <li>Tap "Install" inside TestFlight.</li>
              <li>Open the app and enter your 8-character activation code.</li>
            </ol>
          </Card>
        )}

        <div
          style={{
            marginTop: 24,
            padding: 16,
            background: "#1a2436",
            borderRadius: 8,
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "#e8a04a" }}>No activation code yet?</strong>
          <br />
          You get a code after you complete intake and payment on{" "}
          <a href="/" style={{ color: "#e8a04a" }}>
            detenciondefensa.com
          </a>
          . It is emailed and texted to the contacts you list.
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#1a2436",
        borderRadius: 10,
        padding: 22,
        marginBottom: 18,
      }}
    >
      <h2 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>{title}</h2>
      <p style={{ color: "#a8a59a", fontSize: 13, margin: "4px 0 16px" }}>{subtitle}</p>
      {children}
    </div>
  );
}

const btnPrimary: React.CSSProperties = {
  display: "inline-block",
  background: "#e8a04a",
  color: "#0b1220",
  padding: "12px 20px",
  borderRadius: 6,
  fontSize: 15,
  fontWeight: 700,
  textDecoration: "none",
  marginBottom: 12,
};

const list: React.CSSProperties = {
  paddingLeft: 20,
  color: "#d8d3c4",
  fontSize: 14,
  lineHeight: 1.7,
  margin: 0,
};
