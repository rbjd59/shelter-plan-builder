import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().max(160).optional().nullable(),
  email: z.string().email().max(200).optional().nullable(),
  phone: z.string().max(32).optional().nullable(),
  phone_e164: z.string().max(32).optional().nullable(),
  relationship: z.string().max(80).optional().nullable(),
  role: z.enum(["family", "lawyer", "company"]).optional().nullable(),
}).passthrough();

const SyncSchema = z.object({
  activation_code: z.string().regex(/^[A-Za-z0-9]{8}$/).optional(),
  case_id: z.string().regex(/^[A-Za-z0-9]{8}$/).optional(),
  // The app sends an opaque USER_TOKEN here; only used as a case code if it
  // happens to be an 8-char activation code.
  token: z.string().min(1).max(512).optional(),
  intake_session_id: z.string().min(1).max(128).optional(),
  contacts: z.array(ContactSchema).max(20).optional(),
  cancel_pin: z.string().regex(/^[0-9]{4,8}$/).optional(),
  dead_man_switch_hours: z.union([z.literal(24), z.literal(36), z.literal(72), z.null()]).optional(),
  last_checkin: z.string().datetime().optional(),
}).refine((data) => data.activation_code || data.case_id || data.token || data.intake_session_id, {
  message: "activation_code_or_intake_session_id_required",
  path: ["activation_code"],
});


const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type, authorization, apikey, x-client-info",
};

function jsonResponse(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");
  for (const [key, value] of Object.entries(CORS_HEADERS)) headers.set(key, value);
  return new Response(JSON.stringify(body), {
    ...init,
    headers,
  });
}

function normalizeActivationCode(value: string | undefined): string | null {
  const normalized = value?.trim().toUpperCase() ?? "";
  return /^[A-Z0-9]{8}$/.test(normalized) ? normalized : null;
}

export const Route = createFileRoute("/api/public/app/sync-contacts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ ok: false, error: "invalid_json" }, { status: 400 });
        }

        const parsed = SyncSchema.safeParse(body);
        if (!parsed.success) {
          return jsonResponse({ ok: false, error: parsed.error.flatten() }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const d = parsed.data;
        let token =
          normalizeActivationCode(d.activation_code) ??
          normalizeActivationCode(d.case_id) ??
          normalizeActivationCode(d.token);


        if (!token && d.intake_session_id) {
          const raw = d.intake_session_id.trim().toUpperCase();
          if (/^[A-Z0-9]{8}$/.test(raw)) {
            token = raw;
          } else {
            const { data: client, error } = await supabaseAdmin
              .from("app_clients" as never)
              .select("invite_token")
              .eq("intake_session_id", d.intake_session_id)
              .maybeSingle();
            if (error) {
              console.error("[sync-contacts] client lookup failed", error);
              return jsonResponse({ ok: false, error: "client_lookup_failed" }, { status: 500 });
            }
            token = (client as { invite_token?: string } | null)?.invite_token ?? null;
          }
        }

        if (!token) {
          return jsonResponse({ ok: false, error: "client_not_found" }, { status: 404 });
        }

        const result: Record<string, unknown> = { ok: true, case_id: token };

        // 1. Contacts (only if provided & non-empty)
        if (d.contacts && d.contacts.length > 0) {
          const { data, error } = await supabaseAdmin.rpc("sync_client_contacts" as never, {
            _token: token,
            _contacts: d.contacts,
          } as never);
          if (error) {
            console.error("[sync-contacts] sync failed", error);
            return jsonResponse({ ok: false, error: "sync_failed" }, { status: 500 });
          }
          result.contacts = data ?? { ok: true };
        }

        // 2. Dead Man's Switch + last check-in + cancel PIN — direct column updates on app_clients
        const patch: Record<string, unknown> = {};
        if (d.dead_man_switch_hours !== undefined) patch.dead_man_switch_hours = d.dead_man_switch_hours;
        if (d.last_checkin) patch.last_checkin_at = d.last_checkin;

        if (Object.keys(patch).length > 0) {
          const { error: updErr } = await supabaseAdmin
            .from("app_clients" as never)
            .update(patch as never)
            .eq("invite_token", token);
          if (updErr) {
            console.error("[sync-contacts] client update failed", updErr);
            return jsonResponse({ ok: false, error: "client_update_failed" }, { status: 500 });
          }
          result.client_patched = Object.keys(patch);
        }

        // 3. Cancel PIN — hash via DB function so it matches cancel_sos_alert_with_pin
        if (d.cancel_pin) {
          const { data: client, error: cidErr } = await supabaseAdmin
            .from("app_clients" as never)
            .select("id")
            .eq("invite_token", token)
            .maybeSingle();
          if (cidErr || !client) {
            console.error("[sync-contacts] pin client lookup failed", cidErr);
            return jsonResponse({ ok: false, error: "pin_set_failed" }, { status: 500 });
          }
          const clientId = (client as { id: string }).id;
          // Use raw SQL via rpc-equivalent: hash with pgcrypto
          const { error: pinErr } = await supabaseAdmin.rpc(
            "set_sos_cancel_pin_admin" as never,
            { _client_id: clientId, _pin: d.cancel_pin } as never,
          );
          if (pinErr) {
            // Fallback: silently note — keep older clients working even if RPC missing
            console.warn("[sync-contacts] pin RPC not available; skipped", pinErr.message);
            result.cancel_pin = "rpc_missing";
          } else {
            result.cancel_pin = "set";
          }
        }

        return jsonResponse(result);
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: CORS_HEADERS,
        }),
    },
  },
});
