/**
 * ENDPOINT 1 — the app exchanges the activation code for its bundle.
 *
 *   POST /api/public/app/activate
 *   Body: { activation_code: "K4827" }   (case_id / token also accepted)
 *
 * Returns client_id, client_name, language, cancellation_pin (created by the
 * client on the website), hmac_secret (used to sign the three webhooks),
 * emergency_contacts, and the add-on flags.
 *
 * This endpoint does NOT fan out notifications. The app confirms activation by
 * POSTing { action: "activated" } to /api/public/app-trigger, signed with the
 * hmac_secret returned here — that is what triggers the activation notices.
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
};

function json(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");
  headers.set("cache-control", "no-store");
  for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
  return new Response(JSON.stringify(body), { ...init, headers });
}

const Schema = z
  .object({
    activation_code: z.string().min(4).max(16).optional(),
    case_id: z.string().min(4).max(16).optional(),
    token: z.string().min(4).max(16).optional(),
  })
  .passthrough();

export const Route = createFileRoute("/api/public/app/activate")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json({ ok: false, error: "invalid_json" }, { status: 400 });
        }
        const parsed = Schema.safeParse(body);
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_request" }, { status: 400 });
        }
        const code = (parsed.data.activation_code ?? parsed.data.case_id ?? parsed.data.token ?? "")
          .trim()
          .toUpperCase();
        if (!/^[A-Z0-9]{5,8}$/.test(code)) {
          return json({ ok: false, error: "invalid_activation_code" }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.rpc("get_client_bundle" as never, {
          p_token: code,
        } as never);
        if (error || !data) {
          console.warn("[app/activate] bundle lookup failed", code, error?.message);
          return json({ ok: false, error: "invalid_activation_code" }, { status: 404 });
        }

        return json({ ok: true, ...(data as Record<string, unknown>) });
      },
    },
  },
});
