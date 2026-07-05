// Webhook for the Primo phone app dead-man switch / SOS trigger.
//
// Contract:
//   POST /api/public/app-trigger
//   Headers:
//     content-type: application/json
//     x-app-signature: <hex HMAC-SHA256 of raw body, keyed by app_clients.hmac_secret>
//   Body: { case_id, triggered_at, last_known_location?, arrest_location_hint? }
//   Response: { ok: true, event_id: "<uuid>", alert_id: "<uuid>" }

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
  battery_pct: z.number().int().min(0).max(100).optional(),
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

        const caseId = parsed.data.case_id.trim().toUpperCase();

        if (!/^[A-Z0-9]{8}$/.test(caseId)) {
          return json({ ok: false, error: "invalid_case_id" }, { status: 400 });
        }

        if (!signature) {
          return json({ ok: false, error: "missing_signature" }, { status: 401 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: signatureData, error: signatureError } = await supabaseAdmin.rpc(
          "verify_app_trigger_signature" as never,
          { _token: caseId, _body: rawBody, _signature: signature } as never,
        );
        const signatureOk = (signatureData as { ok?: boolean } | null)?.ok === true;
        if (signatureError || !signatureOk) {
          return json({ ok: false, error: "bad_signature" }, { status: 401 });
        }

        const loc = parsed.data.last_known_location;
        const { data: alertId, error: alertError } = await supabaseAdmin.rpc(
          "record_sos_alert" as never,
          {
            _token: caseId,
            _lat: typeof loc?.lat === "number" ? loc.lat : null,
            _lng: typeof loc?.lng === "number" ? loc.lng : null,
            _battery_pct: parsed.data.battery_pct ?? null,
            _payload: { ...parsed.data, case_id: caseId, source: "primo_app_trigger" },
          } as never,
        );

        if (alertError) {
          console.error("[app-trigger] alert insert failed", alertError);
          return json({ ok: false, error: "alert_insert_failed" }, { status: 500 });
        }

        console.log("[app-trigger] alert recorded", {
          alert_id: alertId,
          case_id: caseId,
          triggered_at: parsed.data.triggered_at ?? null,
          has_location: !!parsed.data.last_known_location,
        });

        return json({ ok: true, event_id: alertId, alert_id: alertId, signature_status: "ok" });
      },
    },
  },
});
