import { createFileRoute } from "@tanstack/react-router";

// Public health check that asks the Replit backend which MAIL_FROM it booted with.
// Usage: GET https://www.detenciondefensa.com/api/public/mail-from-check
// Returns JSON like: { ok: true, upstream: { mailFrom: "legal@detenciondefensa.com", ... } }
export const Route = createFileRoute("/api/public/mail-from-check")({
  server: {
    handlers: {
      GET: async () => {
        const upstreamUrl = "https://ice-defense-plan.replit.app/api/health/mail-from";
        try {
          const res = await fetch(upstreamUrl, {
            method: "GET",
            headers: { Accept: "application/json" },
          });
          const text = await res.text();
          let parsed: unknown = text;
          try {
            parsed = JSON.parse(text);
          } catch {
            // keep as text
          }
          return new Response(
            JSON.stringify(
              {
                ok: res.ok,
                upstreamStatus: res.status,
                upstreamUrl,
                upstream: parsed,
                checkedAt: new Date().toISOString(),
              },
              null,
              2,
            ),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        } catch (err) {
          return new Response(
            JSON.stringify({
              ok: false,
              upstreamUrl,
              error: err instanceof Error ? err.message : String(err),
              checkedAt: new Date().toISOString(),
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
