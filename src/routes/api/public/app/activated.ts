/**
 * The ONE thing the phone app tells us at setup time:
 * "the activation code was entered successfully on a phone".
 *
 *   POST /api/public/app/activated
 *   Body: { activation_code | case_id | token: "K4827" }
 *   Optional header: x-app-signature (hex HMAC-SHA256 of the raw body)
 *
 * Everything that follows — contact notices, company email/SMS, Sorrentino
 * email/SMS with the forms, board updates — is sent from this backend.
 * The app sends nothing itself.
 */
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

const Schema = z
  .object({
    activation_code: z.string().min(4).max(16).optional(),
    case_id: z.string().min(4).max(16).optional(),
    token: z.string().min(4).max(16).optional(),
    device_platform: z.string().max(40).optional().nullable(),
  })
  .passthrough();

export const Route = createFileRoute("/api/public/app/activated")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const raw = await request.text();
        let parsedBody: unknown;
        try {
          parsedBody = JSON.parse(raw);
        } catch {
          return json({ ok: false, error: "invalid_json" }, { status: 400 });
        }
        const parsed = Schema.safeParse(parsedBody);
        if (!parsed.success) {
          return json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
        }
        const code = (parsed.data.activation_code ?? parsed.data.case_id ?? parsed.data.token ?? "")
          .trim()
          .toUpperCase();
        if (!/^[A-Z0-9]{5,8}$/.test(code)) {
          return json({ ok: false, error: "invalid_activation_code" }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Signature is optional here (activation carries no PII), but if the
        // app sends one we verify it.
        const signature = (request.headers.get("x-app-signature") ?? "").trim().replace(/^sha256=/i, "");
        if (signature) {
          const { data } = await supabaseAdmin.rpc("verify_app_trigger_signature" as never, {
            _token: code,
            _body: raw,
            _signature: signature,
          } as never);
          if ((data as { ok?: boolean } | null)?.ok !== true) {
            return json({ ok: false, error: "bad_signature" }, { status: 401 });
          }
        }

        const { notifyAppActivation } = await import("@/lib/alert-fanout.server");
        const result = await notifyAppActivation(code);
        if (!result.ok) return json({ ok: false, error: result.skipped }, { status: 404 });
        return json(result);
      },
    },
  },
});
