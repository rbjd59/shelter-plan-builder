// Stable APK download URL: https://detenciondefensa.com/app/latest.apk
// Looks up the current Android release in public.app_releases, generates a
// short-lived signed URL for its file in the private "app-builds" bucket,
// and 302-redirects the browser to it. The user-facing URL never changes
// even when we publish a new build — admins just upload a new APK via
// /admin/app-builds.
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/app/latest.apk")({
  server: {
    handlers: {
      GET: async ({ request }) => {
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

        // `download` forces Content-Disposition: attachment with a real .apk
        // filename so Android's download manager marks the file complete and
        // offers "Open" to run the installer.
        const versionSlug = String(release.version ?? "latest")
          .replace(/[^a-zA-Z0-9._-]+/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
        const fileName = `detenciondefensa-${versionSlug || "latest"}.apk`;
        const { data: signed, error: signErr } = await supabaseAdmin.storage
          .from("app-builds")
          .createSignedUrl(release.apk_path, 60 * 10, { download: fileName }); // 10 minutes

        if (signErr || !signed?.signedUrl) {
          return new Response(
            "Unable to prepare the download right now. Please try again in a minute.",
            { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } },
          );
        }

        // Stream the file through our own URL with Android's APK MIME type.
        // A redirect to object storage returns application/octet-stream; some
        // Android download managers finish the bytes but do not offer Install.
        const range = request.headers.get("range");
        const upstream = await fetch(signed.signedUrl, {
          headers: range ? { Range: range } : undefined,
        });
        if (!upstream.ok && upstream.status !== 206) {
          return new Response("Unable to download the installer right now.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }

        const headers = new Headers();
        headers.set("Content-Type", "application/vnd.android.package-archive");
        headers.set("Content-Disposition", `attachment; filename="${fileName}"`);
        headers.set("Cache-Control", "private, no-store");
        headers.set("Accept-Ranges", "bytes");
        for (const name of ["content-length", "content-range", "etag", "last-modified"]) {
          const value = upstream.headers.get(name);
          if (value) headers.set(name, value);
        }

        return new Response(upstream.body, {
          status: upstream.status,
          headers,
        });
      },
    },
  },
});
