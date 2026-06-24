// Stable APK download URL: https://detenciondefensa.com/app/latest.apk
// Looks up the current Android release in public.app_releases, generates a
// short-lived signed URL for its file in the private "app-builds" bucket,
// and 302-redirects the browser to it. The user-facing URL never changes
// even when we publish a new build — admins just upload a new APK via
// /admin/app-builds.
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/app/latest/apk")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: release, error } = await supabaseAdmin
          .from("app_releases")
          .select("apk_path, version")
          .eq("platform", "android")
          .eq("is_current", true)
          .maybeSingle();

        if (error || !release?.apk_path) {
          return new Response(
            "Android build is being prepared. Please check back shortly or contact support@detenciondefensa.com.",
            { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } },
          );
        }

        const { data: signed, error: signErr } = await supabaseAdmin.storage
          .from("app-builds")
          .createSignedUrl(release.apk_path, 60 * 10); // 10 minutes

        if (signErr || !signed?.signedUrl) {
          return new Response(
            "Unable to prepare the download right now. Please try again in a minute.",
            { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } },
          );
        }

        return new Response(null, {
          status: 302,
          headers: {
            Location: signed.signedUrl,
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
