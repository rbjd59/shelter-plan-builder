// Cron-driven retry: drains *_dlq queues back into the live queues so the
// worker can re-attempt delivery. Called by pg_cron hourly.
// Auth: shared secret in `x-trigger-secret` header (REPLIT_TRIGGER_SECRET),
// matching the existing cron-route pattern in this project.

import { createFileRoute } from "@tanstack/react-router";
import { retryDlqEmails } from "@/lib/email-retry.server";

export const Route = createFileRoute("/api/public/cron/retry-failed-emails")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.REPLIT_TRIGGER_SECRET?.trim();
        const incoming = request.headers.get("x-trigger-secret")?.trim() ?? "";
        if (!expected || incoming !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const stats = await retryDlqEmails(50);
          return Response.json({ ok: true, ...stats });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error("retry-failed-emails failed", msg);
          return Response.json({ ok: false, error: msg }, { status: 500 });
        }
      },
    },
  },
});
