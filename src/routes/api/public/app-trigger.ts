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
  action: z.enum(["trigger", "cancel", "activated", "activate", "activation"]).optional(),
  activated_at: z.string().max(64).optional(),
  cancelled_at: z.string().max(64).optional(),
  phone_model: z.string().max(120).nullable().optional(),
  os_version: z.string().max(120).nullable().optional(),

  triggered_at: z.string().max(64).optional(),
  cancel_pin: z.string().regex(/^\d{4,8}$/).optional(),
  // GPS may arrive nested (documented shape) or flat (what the phone app
  // actually sends). Accept both so coordinates never get silently dropped.
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  last_known_location: z
    .object({
      lat: z.number().min(-90).max(90).nullable().optional(),
      lng: z.number().min(-180).max(180).nullable().optional(),
    })
    .passthrough()
    .nullable()
    .optional(),
  arrest_location_hint: z.string().max(500).nullable().optional(),
  battery_pct: z.number().int().min(0).max(100).nullable().optional(),
}).passthrough();


export const Route = createFileRoute("/api/public/app-trigger")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const rawBody = await request.text();
        // Accept both "sha256=<hex>" (Primo/Premio format) and a bare hex digest.
        const signature = (request.headers.get("x-app-signature") ?? "")
          .trim()
          .replace(/^sha256=/i, "");
        let parsedBody: unknown;
        try {
          parsedBody = JSON.parse(rawBody);
        } catch {
          console.warn("[app-trigger] 400 invalid_json", { bytes: rawBody.length, preview: rawBody.slice(0, 200) });
          return json({ ok: false, error: "invalid_json" }, { status: 400 });
        }
        const parsed = TriggerSchema.safeParse(parsedBody);
        if (!parsed.success) {
          const bodyKeys = parsedBody && typeof parsedBody === "object" ? Object.keys(parsedBody as object) : [];
          console.warn("[app-trigger] 400 schema", { issues: parsed.error.flatten(), bodyKeys, has_signature: !!signature });
          return json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
        }

        // Accept "X5956-EN" style codes: the app may append the language.
        const caseId = parsed.data.case_id.trim().toUpperCase().split("-")[0]!;

        if (!/^[A-Z0-9]{5,8}$/.test(caseId)) {
          console.warn("[app-trigger] 400 invalid_case_id", { case_id: parsed.data.case_id, action: parsed.data.action ?? "trigger" });
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

        // All notification fan-out (contacts, company, Sorrentino) happens in
        // alert-fanout.server.ts. This route only records the event.

        // ACTIVATION — the phone confirms the code was entered. This is NOT an
        // emergency: no SOS row is written and no alert is raised.
        const action = parsed.data.action ?? "trigger";
        if (action === "activated" || action === "activate" || action === "activation") {
          if (parsed.data.phone_model || parsed.data.os_version) {
            await supabaseAdmin
              .from("app_clients")
              .update({
                device_info: {
                  phone_model: parsed.data.phone_model ?? null,
                  os_version: parsed.data.os_version ?? null,
                  activated_at: parsed.data.activated_at ?? new Date().toISOString(),
                },
              } as never)
              .eq("invite_token", caseId);
          }
          try {
            const { notifyAppActivation } = await import("@/lib/alert-fanout.server");
            const fan = await notifyAppActivation(caseId);
            console.log("[app-trigger] activation fan-out", fan);
            return json({ ...fan, ok: true, activated: true });
          } catch (e) {
            console.error("[app-trigger] activation fan-out failed", e);
            return json({ ok: false, error: "activation_fanout_failed" }, { status: 500 });
          }
        }





        // Cancellation path — the phone's "enter cancel PIN" flow hits us here.
        if (parsed.data.action === "cancel") {
          try {
            if (parsed.data.cancel_pin) {
              const { data: pinRes, error: pinErr } = await supabaseAdmin.rpc(
                "cancel_sos_alert_with_pin" as never,
                { _token: caseId, _pin: parsed.data.cancel_pin } as never,
              );
              if (pinErr) {
                console.warn("[app-trigger] cancel PIN rejected", pinErr);
                return json({ ok: false, error: "invalid_pin" }, { status: 403 });
              }
              console.log("[app-trigger] cancel via PIN ok", pinRes);
            } else {
              await supabaseAdmin.rpc("cancel_sos_alert" as never, {
                _token: caseId,
              } as never);
            }
          } catch (e) {
            console.error("[app-trigger] cancel failed", e);
            return json({ ok: false, error: "cancel_failed" }, { status: 500 });
          }
          try {
            const { notifySosEvent } = await import("@/lib/alert-fanout.server");
            const fan = await notifySosEvent({ token: caseId, kind: "cancel" });
            console.log("[app-trigger] cancel fan-out", fan);
          } catch (e) {
            console.error("[app-trigger] cancel fan-out failed", e);
          }
          return json({ ok: true, cancelled: true });
        }

        // GPS: the app reports coordinates with the trigger so the locate desk
        // has a starting point. Accept both the nested and flat shapes.
        const lat =
          parsed.data.lat ?? parsed.data.latitude ?? parsed.data.last_known_location?.lat ?? null;
        const lng =
          parsed.data.lng ?? parsed.data.longitude ?? parsed.data.last_known_location?.lng ?? null;

        const { data: alertId, error: alertError } = await supabaseAdmin.rpc(
          "record_sos_alert" as never,
          {
            _token: caseId,
            _lat: lat,
            _lng: lng,
            _battery_pct: parsed.data.battery_pct ?? null,
            _payload: {
              case_id: caseId,
              source: "primo_app_trigger",
              triggered_at: parsed.data.triggered_at ?? null,
              arrest_location_hint: parsed.data.arrest_location_hint ?? null,
            },
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
          has_location: lat !== null && lng !== null,
        });

        // Single fan-out: contacts, company (email + SMS + board), Sorrentino.
        try {
          const { notifySosEvent } = await import("@/lib/alert-fanout.server");
          const fan = await notifySosEvent({
            token: caseId,
            kind: "alert",
            lat,
            lng,
            alertId: (alertId as string | null) ?? null,
            triggeredAt: parsed.data.triggered_at ?? null,
          });
          console.log("[app-trigger] alert fan-out", fan);
        } catch (e) {
          console.error("[app-trigger] alert fan-out failed", e);
        }

        return json({ ok: true, event_id: alertId, alert_id: alertId, signature_status: "ok" });


      },
    },
  },
});
