// One-tap installer link used by the welcome email + SMS.
// Sniffs the User-Agent on the server and redirects:
//   - Android  -> /api/public/app/latest.apk (browser starts APK download)
//   - iOS      -> TestFlight URL (when configured), else /download instructions
//   - Anything else -> /download (full instructions page)
//
// This URL is the ONLY thing we need to share with non-technical users.
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/get-app")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const ua = (request.headers.get("user-agent") ?? "").toLowerCase();
        const isAndroid = ua.includes("android");
        const isIOS = /iphone|ipad|ipod/.test(ua) || (ua.includes("mac") && ua.includes("mobile"));

        if (isAndroid) {
          return Response.redirect("https://detenciondefensa.com/api/public/app/latest.apk", 302);
        }

        if (isIOS) {
          try {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const { data } = await supabaseAdmin
              .from("app_releases")
              .select("testflight_url")
              .eq("platform", "ios")
              .eq("is_current", true)
              .maybeSingle();
            if (data?.testflight_url) {
              return Response.redirect(data.testflight_url, 302);
            }
          } catch {
            // fall through to /download
          }
          return Response.redirect("https://detenciondefensa.com/download?ios=pending", 302);
        }

        // Desktop / unknown — show full instructions page so they can switch to phone
        return Response.redirect("https://detenciondefensa.com/download", 302);
      },
    },
  },
});
