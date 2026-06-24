// Returns the current Android APK + iOS TestFlight info for the /download page.
// Reads from the public.app_releases table (RLS allows anon to read is_current rows).
// The APK URL is always /app/latest.apk — a stable server route that 302s to a
// freshly-signed Supabase Storage URL each request, so the link never expires
// even after we publish a new build.
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

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
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      return {
        android: { available: false, url: null, version: null, minAndroidSdk: null },
        ios: { available: false, testflightUrl: null, version: null },
      };
    }
    const supa = createClient<Database>(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });

    const { data } = await supa
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
  },
);
