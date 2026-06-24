// Returns the current Android APK + iOS TestFlight info for the /download page.
// Reads app_releases server-side with the admin client and returns ONLY
// non-sensitive fields to the browser. The internal storage path (apk_path)
// never leaves the server; the public APK link is the stable redirect route
// at /api/public/app/latest.apk, which signs a fresh URL on every request.
import { createServerFn } from "@tanstack/react-start";

export interface AppDownloadInfo {
  android: {
    available: boolean;
    url: string | null;
    version: string | null;
    minAndroidSdk: number | null;
  };
  ios: {
    available: boolean;
    testflightUrl: string | null;
    version: string | null;
  };
}

export const getAppDownloadInfo = createServerFn({ method: "GET" }).handler(
  async (): Promise<AppDownloadInfo> => {
    const empty: AppDownloadInfo = {
      android: { available: false, url: null, version: null, minAndroidSdk: null },
      ios: { available: false, testflightUrl: null, version: null },
    };

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data } = await supabaseAdmin
        .from("app_releases")
        .select("platform, version, apk_path, testflight_url, min_android_sdk")
        .eq("is_current", true);

      const rows = data ?? [];
      const android = rows.find((r) => r.platform === "android");
      const ios = rows.find((r) => r.platform === "ios");

      return {
        android: {
          available: !!android?.apk_path,
          url: android?.apk_path ? "/api/public/app/latest.apk" : null,
          version: android?.version ?? null,
          minAndroidSdk: android?.min_android_sdk ?? null,
        },
        ios: {
          available: !!ios?.testflight_url,
          testflightUrl: ios?.testflight_url ?? null,
          version: ios?.version ?? null,
        },
      };
    } catch {
      return empty;
    }
  },
);

