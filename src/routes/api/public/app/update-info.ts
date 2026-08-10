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

const ContactSchema = z.object({
  name: z.string().max(160).optional().nullable(),
  email: z.string().max(200).optional().nullable(),
  phone: z.string().max(32).optional().nullable(),
  phone_e164: z.string().max(32).optional().nullable(),
  relationship: z.string().max(80).optional().nullable(),
}).passthrough();

const UpdateInfoSchema = z.object({
  case_id: z.string().min(1).max(64).optional(),
  token: z.string().min(1).max(64).optional(),
  contacts: z.array(ContactSchema).max(20).optional(),
  requested_at: z.string().optional(),
}).passthrough();

export const Route = createFileRoute("/api/public/app/update-info")({
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

        const parsed = UpdateInfoSchema.safeParse(parsedBody);
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
        if (signatureError || (signatureData as { ok?: boolean } | null)?.ok !== true) {
          return json({ ok: false, error: "bad_signature" }, { status: 401 });
        }

        const { data: client, error: clientError } = await supabaseAdmin
          .from("app_clients")
          .select("id")
          .eq("invite_token", caseId)
          .maybeSingle();
        if (clientError || !client) {
          return json({ ok: false, error: "invalid_case_id" }, { status: 404 });
        }

        const { data: inserted, error: insertError } = await supabaseAdmin
          .from("client_update_requests")
          .insert({
            client_id: (client as { id: string }).id,
            source: "phone_app",
            request_payload: {
              case_id: caseId,
              requested_at: parsed.data.requested_at ?? new Date().toISOString(),
              received_at: new Date().toISOString(),
            },
          } as never)
          .select("id")
          .single();

        if (insertError) {
          console.error("[app/update-info] insert failed", insertError);
          return json({ ok: false, error: "request_insert_failed" }, { status: 500 });
        }

        return json({ ok: true, event_id: (inserted as { id: string }).id });
      },
    },
  },
});
