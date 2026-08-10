// Dev/test endpoint: run the FULL intake pipeline for a fake client.
// Inserts a paid intake submission, generates every legal + asset-protection
// PDF, provisions the app client (activation code + contacts + documents),
// and enqueues the activation emails. Guarded by REPLIT_TRIGGER_SECRET.
//
//   curl -X POST /api/public/dev/fire-demo-client \
//     -H "x-trigger-secret: $REPLIT_TRIGGER_SECRET" \
//     -H "content-type: application/json" \
//     -d '{"label":"Test 04 ES","language":"es"}'

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Contact = z.object({
  name: z.string().min(1).max(160),
  phone: z.string().max(32).optional(),
  email: z.string().max(200).optional(),
  relationship: z.string().max(80).optional(),
  role: z.enum(["family", "lawyer", "company"]).optional(),
});

const Body = z.object({
  label: z.string().min(1).max(60).optional(),
  language: z.enum(["es", "en", "ht"]).optional(),
  code: z.string().regex(/^[A-Z0-9]{8}$/).optional(),
  client_email: z.string().max(200).optional(),
  client_mobile: z.string().max(32).optional(),
  contacts: z.array(Contact).max(10).optional(),
});


function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/dev/fire-demo-client")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.REPLIT_TRIGGER_SECRET?.trim();
        if (!expected || request.headers.get("x-trigger-secret") !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          raw = {};
        }
        const parsed = Body.safeParse(raw ?? {});
        if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);

        const label = parsed.data.label ?? "Test 04 ES";
        const language = parsed.data.language ?? "es";

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { provisionAppClient } = await import("@/lib/app-clients.server");
        const { enqueueIntakeNotification } = await import(
          "@/lib/email/intake-notification.server"
        );

        const answers: Record<string, unknown> = {
          full_name: `Cliente ${label}`,
          client_full_name: `Cliente ${label}`,
          client_email: "intake@detenciondefensa.com",
          client_mobile: "+13055551234",
          a_number: "A123456789",
          dob: "1985-04-12",
          place_of_birth: "San Salvador, El Salvador",
          country_of_citizenship: "El Salvador",
          country_of_origin: "El Salvador",
          detained_location: "Krome Detention Center, Miami, FL",
          detention_facility: "Krome Detention Center",
          date_of_detention: new Date().toISOString().slice(0, 10),
          grounds_not_convicted: true,
          grounds_not_danger: true,
          grounds_not_flight_risk: true,
          grounds_due_process: true,
          relief_release: true,
          relief_bond_hearing: true,
          relief_declare_unlawful: true,
          relief_any_other_relief: true,
          mail_to_name: `Familia ${label}`,
          mail_to_address: "1234 SW 8th St",
          mail_to_city: "Miami",
          mail_to_state: "FL",
          mail_to_zip: "33130",
          contact_name: `Rosario ${label}`,
          contact_email: "intake@detenciondefensa.com",
          contact_phone: "+13055555678",
          contact_relation: "esposa",
          emergency_contact_name: `Rosario ${label}`,
          emergency_contact_email: "intake@detenciondefensa.com",
          emergency_contact_phone: "+13055555678",
          emergency_contact_relation: "esposa",
          emergency_contact_2_name: `Segundo Contacto ${label}`,
          emergency_contact_2_email: "intake@detenciondefensa.com",
          emergency_contact_2_phone: "+13055559012",
          emergency_contact_2_relation: "hermano",
          emergency_contact_3_name: `Tercer Contacto ${label}`,
          emergency_contact_3_email: "intake@detenciondefensa.com",
          emergency_contact_3_phone: "+13055553456",
          emergency_contact_3_relation: "amigo",
          addon_asset_protection: true,
          atty_immigration_history:
            "Entró a EE.UU. en 2015. Solicitó asilo en 2016. Caso pendiente en Corte de Inmigración de Miami.",
          atty_criminal_history: "Sin antecedentes penales.",
          atty_family_ties:
            "Esposa (residente legal) y dos hijos ciudadanos en Miami, FL.",
          atty_fear_return:
            "Sí. Persecución por pandillas (MS-13) en su ciudad natal.",
          demo_label: label,
        };

        const sessionId = `demo-${crypto.randomUUID()}`;

        const { error } = await supabaseAdmin.from("intake_submissions").insert({
          stripe_session_id: sessionId,
          language,
          email: answers.client_email as string,
          paid: true,
          answers: answers as never,
        } as never);
        if (error) return json({ error: error.message }, 500);

        const provisioned = await provisionAppClient({
          intakeSessionId: sessionId,
          language,
          answers,
        });

        let notifyError: string | null = null;
        try {
          await enqueueIntakeNotification({
            sessionId,
            answers,
            language,
            contactEmail: answers.contact_email as string,
            demoMode: true,
            inviteCode: provisioned.code ?? null,
          });
        } catch (e) {
          notifyError = e instanceof Error ? e.message : String(e);
        }

        return json({
          ok: true,
          sessionId,
          activationCode: provisioned.code ?? null,
          clientId: provisioned.clientId ?? null,
          provisionError: provisioned.error ?? null,
          notifyError,
        });
      },
    },
  },
});
