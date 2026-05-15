// Returns the current Android APK download URL (set via APK_URL env var on the
// server). Kept as a server function so the URL can be rotated without a
// frontend rebuild — set/update APK_URL in Lovable Cloud secrets and it goes
// live immediately.
import { createServerFn } from "@tanstack/react-start";

export interface ApkInfo {
  url: string | null;
  version: string | null;
}

export const getApkInfo = createServerFn({ method: "GET" }).handler(async (): Promise<ApkInfo> => {
  const url = process.env.APK_URL?.trim() || null;
  const version = process.env.APK_VERSION?.trim() || null;
  return { url, version };
});
