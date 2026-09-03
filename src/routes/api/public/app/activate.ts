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

/** Shown on the activation screen, below the code field, before activating. */
const LEGAL_NOTICE = {
  en: "DetencionDefensa is not a law firm and does not provide legal advice. This app notifies your emergency contacts and our team if you are detained. Nothing here creates an attorney-client relationship. Any legal representation is a separate agreement with an independent licensed attorney. Location data is collected only when you press SOS and is used solely to help locate you.",
  es: "DetencionDefensa no es un bufete de abogados y no brinda asesoramiento legal. Esta aplicacion notifica a sus contactos de emergencia y a nuestro equipo si usted es detenido. Nada aqui crea una relacion abogado-cliente. Cualquier representacion legal es un acuerdo separado con un abogado independiente con licencia. Los datos de ubicacion se recopilan unicamente cuando presiona SOS y se usan solo para ayudar a localizarlo.",
  ht: "DetencionDefensa se pa yon kabinè avoka epi li pa bay konsèy legal. Aplikasyon sa a avèti kontak ijans ou yo ak ekip nou an si yo detni ou. Anyen isit la pa kreye yon relasyon avoka-kliyan. Nenpòt reprezantasyon legal se yon akò separe ak yon avoka endepandan ki gen lisans. Done kote yo kolekte sèlman lè ou peze SOS epi yo sèvi sèlman pou ede jwenn ou.",
} as const;

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

        const bundle = data as Record<string, unknown>;
        const lang = String(bundle.language ?? "en").toLowerCase();
        const legalNotice = LEGAL_NOTICE[lang as keyof typeof LEGAL_NOTICE] ?? LEGAL_NOTICE.en;

        // Safety net: if the bundle has no PIN (legacy client), set 0000 now so
        // the phone's cancel screen works, and return it in this response.
        if (!bundle.cancellation_pin) {
          const { error: pinErr } = await supabaseAdmin.rpc("set_sos_cancel_pin_admin" as never, {
            _client_id: bundle.client_id,
            _pin: "0000",
          } as never);
          if (!pinErr) {
            bundle.cancellation_pin = "0000";
            bundle.cancel_pin = "0000";
          } else {
            console.warn("[app/activate] default PIN set failed", code, pinErr.message);
          }
        }

        // A successful code exchange IS the activation. Fan out the
        // "your loved one activated" notices right here (idempotent — only the
        // first activation sends) instead of waiting for a second signed
        // { action: "activated" } webhook the phone may never send.
        let activation: Record<string, unknown> = {};
        try {
          const { notifyAppActivation } = await import("@/lib/alert-fanout.server");
          activation = await notifyAppActivation(code);
          console.log("[app/activate] activation fan-out", code, activation);
        } catch (e) {
          console.error("[app/activate] activation fan-out failed", code, e);
        }

        return json({
          ok: true,
          ...bundle,
          legal_notice: legalNotice,
          activation_notices: activation,
          // v4.3: emergency contacts are the one section the client may edit
          // in the app; edits are pushed back via /api/public/app/sync-contacts.
          contacts_editable_in_app: true,
          contacts_sync_endpoint: "https://detenciondefensa.com/api/public/app/sync-contacts",
        });
      },
    },
  },
});
