/**
 * POST /api/public/app/update-request
 *
 * The app's profile section is read-only. If the client's address, vehicle,
 * immigration status, or any other detail changes, the app posts a free-text
 * request here. Staff apply the change on the company board.
 *
 * Body: { case_id: "K4827", message: "...", field?: "address" }
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

const Schema = z.object({
  case_id: z.string().min(4).max(16).optional(),
  activation_code: z.string().min(4).max(16).optional(),
  token: z.string().min(4).max(16).optional(),
  field: z.string().max(80).optional(),
  message: z.string().min(1).max(4000),
});

export const Route = createFileRoute("/api/public/app/update-request")({
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
        const d = parsed.data;
        const code = (d.case_id ?? d.activation_code ?? d.token ?? "").trim().toUpperCase();
        if (!/^[A-Z0-9]{5,8}$/.test(code)) {
          return json({ ok: false, error: "invalid_case_id" }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: client, error: lookupErr } = await supabaseAdmin
          .from("app_clients" as never)
          .select("id")
          .eq("invite_token", code)
          .maybeSingle();
        if (lookupErr) {
          console.error("[app/update-request] lookup failed", lookupErr);
          return json({ ok: false, error: "lookup_failed" }, { status: 500 });
        }
        if (!client) {
          return json({ ok: false, error: "client_not_found" }, { status: 404 });
        }

        const clientId = (client as { id: string }).id;
        const { error: insErr } = await supabaseAdmin
          .from("client_update_requests" as never)
          .insert({
            client_id: clientId,
            source: "app",
            status: "pending",
            notes: d.field ? `[${d.field}] ${d.message}` : d.message,
            request_payload: { case_id: code, field: d.field ?? null, message: d.message },
          } as never);
        if (insErr) {
          console.error("[app/update-request] insert failed", insErr);
          return json({ ok: false, error: "save_failed" }, { status: 500 });
        }

        return json({ ok: true, case_id: code, status: "pending" });
      },
    },
  },
});
