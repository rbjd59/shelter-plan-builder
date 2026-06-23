import { createFileRoute, redirect } from "@tanstack/react-router";

// Legacy install page — consolidated into /download (the canonical install
// page with iOS/Android tabs, language selector, and APK fetcher).
export const Route = createFileRoute("/get-app")({
  beforeLoad: () => {
    throw redirect({ to: "/download" });
  },
});
