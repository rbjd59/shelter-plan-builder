// Public, read-only JSON endpoint returning ONLY the safe release fields
// used by the install flow:
//   - androidAvailable / iosAvailable
//   - the stable APK URL (a redirect route — never the storage path)
//   - version + minAndroidSdk + testflightUrl
//
// The internal storage path (apk_path) is read server-side with the admin
// client and DELIBERATELY NOT returned. This endpoint exists so external
// callers (the Flutter app, support tools, monitoring) can check for a
// newer release without ever seeing the private bucket layout.
import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=60",
  "Content-Type": "application/json",
} as const;

export const Route = createFileRoute("/api/public/app/info")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async () => {
        const empty = {
          android: { available: false, url: null, version: null, minAndroidSdk: null },
          ios: { available: false, testflightUrl: null, version: null },
        };
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin
            .from("app_releases")
            .select("platform, version, apk_path, testflight_url, min_android_sdk")
            .eq("is_current", true);
          if (error) {
            return new Response(JSON.stringify(empty), { status: 200, headers: CORS });
          }
          const rows = data ?? [];
          const android = rows.find((r) => r.platform === "android");
          const ios = rows.find((r) => r.platform === "ios");
          const payload = {
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
          return new Response(JSON.stringify(payload), { status: 200, headers: CORS });
        } catch {
          return new Response(JSON.stringify(empty), { status: 200, headers: CORS });
        }
      },
    },
  },
});
