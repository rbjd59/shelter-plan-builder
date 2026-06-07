// Test endpoint to verify the Replit mirror is reachable and the
// x-trigger-secret header is accepted. Sends a synthetic "fire" event
// (clearly marked as a test) and returns the upstream status + body.
//
// Auth: caller must pass the REPLIT_TRIGGER_SECRET in the
// `x-trigger-secret` HTTP header so the secret never appears in URLs,
// server access logs, CDN logs, or browser history.
//
// Usage:
//   curl -H 'x-trigger-secret: <REPLIT_TRIGGER_SECRET>' \
//     https://detenciondefensa.com/api/public/emergency/test-mirror
//   curl -X POST -H 'x-trigger-secret: <REPLIT_TRIGGER_SECRET>' \
//     -H 'content-type: application/json' -d '{"note":"anything"}' \
//     https://detenciondefensa.com/api/public/emergency/test-mirror

import { createFileRoute } from "@tanstack/react-router";

async function runTest(request: Request): Promise<Response> {
  const token = request.headers.get("x-trigger-secret") ?? "";

  const replitUrl = process.env.REPLIT_TRIGGER_URL?.trim();
  const replitSecret = process.env.REPLIT_TRIGGER_SECRET?.trim();

  if (!replitUrl || !replitSecret) {
    return Response.json(
      { ok: false, error: "REPLIT_TRIGGER_URL or REPLIT_TRIGGER_SECRET not configured" },
      { status: 500 },
    );
  }
  if (token !== replitSecret) {
    return new Response("Forbidden", { status: 403 });
  }

  let extra: Record<string, unknown> = {};
  if (request.method === "POST") {
    try {
      extra = (await request.json()) as Record<string, unknown>;
    } catch {
      /* ignore */
    }
  }

  const payload = {
    source: "detenciondefensa-site",
    event: "test",
    test: true,
    activation_id: `test-${crypto.randomUUID()}`,
    intake_session_id: "test-session",
    role: "client",
    full_name: "TEST — please ignore",
    contact_email: null,
    alert_email: null,
    gps_lat: null,
    gps_lng: null,
    gps_raw: "test",
    fired_at: new Date().toISOString(),
    act_after: new Date(Date.now() + 2 * 3600_000).toISOString(),
    notes: "Synthetic test event from /api/public/emergency/test-mirror",
    ...extra,
  };

  const start = Date.now();
  let upstreamStatus = 0;
  let upstreamBody = "";
  let upstreamError: string | null = null;
  try {
    const resp = await fetch(replitUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-trigger-secret": replitSecret,
      },
      body: JSON.stringify(payload),
    });
    upstreamStatus = resp.status;
    upstreamBody = (await resp.text().catch(() => "")).slice(0, 2000);
  } catch (e) {
    upstreamError = (e as Error).message;
  }

  return Response.json({
    ok: upstreamError === null && upstreamStatus >= 200 && upstreamStatus < 300,
    target: replitUrl,
    upstream_status: upstreamStatus,
    upstream_body: upstreamBody,
    upstream_error: upstreamError,
    duration_ms: Date.now() - start,
    sent_payload: payload,
  });
}

export const Route = createFileRoute("/api/public/emergency/test-mirror")({
  server: {
    handlers: {
      GET: async ({ request }) => runTest(request),
      POST: async ({ request }) => runTest(request),
    },
  },
});
