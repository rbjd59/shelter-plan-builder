import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().max(160).optional().nullable(),
  email: z.string().email().max(200).optional().nullable(),
  phone: z.string().max(32).optional().nullable(),
  phone_e164: z.string().max(32).optional().nullable(),
  relationship: z.string().max(80).optional().nullable(),
}).passthrough();

const SyncSchema = z.object({
  activation_code: z.string().regex(/^[A-Za-z0-9]{8}$/).optional(),
  token: z.string().regex(/^[A-Za-z0-9]{8}$/).optional(),
  intake_session_id: z.string().min(1).max(128).optional(),
  contacts: z.array(ContactSchema).max(20),
}).refine((data) => data.activation_code || data.token || data.intake_session_id, {
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
        let token = normalizeActivationCode(d.activation_code) ?? normalizeActivationCode(d.token);

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

        const { data, error } = await supabaseAdmin.rpc("sync_client_contacts" as never, {
          _token: token,
          _contacts: d.contacts,
        } as never);
        if (error) {
          console.error("[sync-contacts] sync failed", error);
          return jsonResponse({ ok: false, error: "sync_failed" }, { status: 500 });
        }

        return jsonResponse(data ?? { ok: true });
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: CORS_HEADERS,
        }),
    },
  },
});