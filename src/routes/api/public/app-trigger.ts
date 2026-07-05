// Stub webhook for the Primo phone app dead-man switch / SOS trigger.
//
// Contract (v0 stub):
//   POST /api/public/app-trigger
//   Headers:
//     content-type: application/json
//     x-app-signature: <hex HMAC-SHA256 of raw body, keyed by app_clients.hmac_secret>
//   Body: { case_id, triggered_at, last_known_location?, arrest_location_hint? }
//   Response: { ok: true, event_id: "<uuid>" }
//
// The full activation/notification flow still runs through
// /api/public/emergency/activate. This route exists so Primo can wire the
// Flutter SOS path immediately; the real logic (mirror into
// client_sos_alerts, fan out SMS/email, etc.) will move behind this route
// in a follow-up with no app changes required.

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type, x-app-signature",
};

function json(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");
  for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
  return new Response(JSON.stringify(body), { ...init, headers });
}

const TriggerSchema = z.object({
  case_id: z.string().min(1).max(64),
  triggered_at: z.string().max(64).optional(),
  last_known_location: z
    .object({
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
    })
    .passthrough()
    .optional(),
  arrest_location_hint: z.string().max(500).optional(),
}).passthrough();

export const Route = createFileRoute("/api/public/app-trigger")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("x-app-signature") ?? "";
        let parsedBody: unknown;
        try {
          parsedBody = JSON.parse(rawBody);
        } catch {
          return json({ ok: false, error: "invalid_json" }, { status: 400 });
        }
        const parsed = TriggerSchema.safeParse(parsedBody);
        if (!parsed.success) {
          return json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
        }

        const eventId = crypto.randomUUID();
        const caseId = parsed.data.case_id.trim().toUpperCase();

        // Verify HMAC signature against the client's hmac_secret when the
        // case_id looks like an 8-char activation token. Missing signatures
        // are logged but accepted during stub rollout so Primo can wire the
        // path before HMAC is fully plumbed on the app side.
        let signatureStatus: "ok" | "missing" | "bad" | "skipped" = "skipped";
        if (/^[A-Z0-9]{8}$/.test(caseId)) {
          if (!signature) {
            signatureStatus = "missing";
          } else {
            try {
              const { supabaseAdmin } = await import(
                "@/integrations/supabase/client.server"
              );
              const { data, error } = await supabaseAdmin.rpc(
                "verify_app_trigger_signature" as never,
                { _token: caseId, _body: rawBody, _signature: signature } as never,
              );
              const ok = (data as { ok?: boolean } | null)?.ok === true;
              signatureStatus = error || !ok ? "bad" : "ok";
            } catch (e) {
              console.error("[app-trigger] signature verify threw", e);
              signatureStatus = "bad";
            }
          }
        }

        console.log("[app-trigger] stub received", {
          event_id: eventId,
          case_id: caseId,
          triggered_at: parsed.data.triggered_at ?? null,
          has_location: !!parsed.data.last_known_location,
          signature_status: signatureStatus,
        });

        return json({ ok: true, event_id: eventId, signature_status: signatureStatus });
      },
    },
  },
});
