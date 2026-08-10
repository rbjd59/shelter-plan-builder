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
  action: z.enum(["trigger", "cancel"]).optional(),
  triggered_at: z.string().max(64).optional(),
  cancel_pin: z.string().regex(/^\d{4,8}$/).optional(),
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
        // Accept both "sha256=<hex>" (Primo/Premio format) and a bare hex digest.
        const signature = (request.headers.get("x-app-signature") ?? "")
          .trim()
          .replace(/^sha256=/i, "");
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

        // Look up the client so the Replit mirror + SMS fan-out have a name.
        const { data: clientRow } = await supabaseAdmin
          .from("app_clients")
          .select("id, full_name, phone_e164, email")
          .eq("invite_token", caseId)
          .maybeSingle();
        const clientName = clientRow?.full_name ?? null;

        async function mirrorToReplit(payload: Record<string, unknown>) {
          const replitUrl = process.env.REPLIT_TRIGGER_URL?.trim();
          const replitSecret = process.env.REPLIT_TRIGGER_SECRET?.trim();
          if (!replitUrl || !replitSecret) return;
          try {
            const resp = await fetch(replitUrl, {
              method: "POST",
              headers: {
                "content-type": "application/json",
                "x-trigger-secret": replitSecret,
              },
              body: JSON.stringify(payload),
            });
            if (!resp.ok) {
              console.error("[app-trigger] replit mirror non-ok", resp.status);
            }
          } catch (e) {
            console.error("[app-trigger] replit mirror failed", e);
          }
        }

        // Cancellation path — the phone's "enter cancel PIN" flow hits us here.
        if (parsed.data.action === "cancel") {
          const { sendSosSmsToContacts } = await import("@/lib/twilio-sms.server");
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
            const result = await sendSosSmsToContacts({
              token: caseId,
              clientName,
              kind: "cancel",
            });
            console.log("[app-trigger] cancel sms fan-out", result);
          } catch (e) {
            console.error("[app-trigger] cancel sms failed", e);
          }
          await mirrorToReplit({
            source: "detenciondefensa-app",
            event: "cancel",
            case_id: caseId,
            activation_code: caseId,
            intake_session_id: caseId,
            full_name: clientName,
            contact_email: clientRow?.email ?? null,
            contact_phone: clientRow?.phone_e164 ?? null,
            cancelled_at: new Date().toISOString(),
          });
          return json({ ok: true, cancelled: true });
        }

        const loc = parsed.data.last_known_location;
        const lat = typeof loc?.lat === "number" ? loc.lat : null;
        const lng = typeof loc?.lng === "number" ? loc.lng : null;
        const { data: alertId, error: alertError } = await supabaseAdmin.rpc(
          "record_sos_alert" as never,
          {
            _token: caseId,
            _lat: lat,
            _lng: lng,
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

        // SMS fan-out to all client_contacts (mirrors the intake fire path).
        try {
          const { sendSosSmsToContacts } = await import("@/lib/twilio-sms.server");
          const mapsUrl =
            lat != null && lng != null
              ? `https://maps.google.com/?q=${lat},${lng}`
              : null;
          const smsResult = await sendSosSmsToContacts({
            token: caseId,
            clientName,
            kind: "alert",
            mapsUrl,
            activationId: alertId as string | null,
          });
          console.log("[app-trigger] alert sms fan-out", smsResult);
        } catch (e) {
          console.error("[app-trigger] alert sms failed", e);
        }

        await mirrorToReplit({
          source: "detenciondefensa-app",
          event: "fire",
          case_id: caseId,
          activation_code: caseId,
          intake_session_id: caseId,
          activation_id: alertId,
          alert_id: alertId,
          full_name: clientName,
          contact_email: clientRow?.email ?? null,
          contact_phone: clientRow?.phone_e164 ?? null,
          gps_lat: lat,
          gps_lng: lng,
          gps_raw: loc ?? null,
          arrest_location_hint: parsed.data.arrest_location_hint ?? null,
          battery_pct: parsed.data.battery_pct ?? null,
          triggered_at: parsed.data.triggered_at ?? new Date().toISOString(),
          fired_at: new Date().toISOString(),
        });


        return json({ ok: true, event_id: alertId, alert_id: alertId, signature_status: "ok" });

      },
    },
  },
});
