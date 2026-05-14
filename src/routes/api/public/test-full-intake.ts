import { createFileRoute } from "@tanstack/react-router";
import { enqueueIntakeNotification } from "@/lib/email/intake-notification.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/test-full-intake")({
  server: {
    handlers: {
      GET: async () => {
        const sessionId = `test-full-${Date.now()}`;
        const familyEmail = "rbjd@dr.com";
        const answers = {
          full_name: "Juan Test Pérez",
          mail_inmate_name: "Juan Test Pérez",
          mail_inmate_number: "A123-456-789",
          mail_current_location: "Krome Detention Center",
          mail_facility_address: "18201 SW 12th St\nMiami, FL 33194",
          contact_name: "Maria Test",
          contact_relation: "spouse",
          contact_email: familyEmail,
          contact_phone: "+1 305-555-0199",
          contact_address: "1234 NW 1st St\nMiami, FL 33125",
          country_of_origin: "Honduras",
          date_of_birth: "1985-04-12",
          custody_facility: "Krome Detention Center",
          custody_date: "2026-05-10",
          fear_return: true,
          ifp_employment: "Unemployed",
          ifp_assets: "None significant",
          ifp_dependents: "2 children",
        };

        // Seed an intake_submissions row so app-install bootstrap works.
        await supabaseAdmin
          .from("intake_submissions")
          .insert({
            stripe_session_id: sessionId,
            email: familyEmail,
            language: "es",
            answers: answers as never,
            paid: true,
          } as never);

        try {
          await enqueueIntakeNotification({
            sessionId,
            answers,
            language: "es",
            contactEmail: familyEmail,
          });
        } catch (e) {
          return new Response(
            JSON.stringify({
              ok: false,
              sessionId,
              error: e instanceof Error ? e.message : String(e),
            }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        // Pull recent log rows for this session
        const { data: logs } = await supabaseAdmin
          .from("email_send_log")
          .select("template_name, recipient_email, status, message_id, created_at, error_message")
          .order("created_at", { ascending: false })
          .limit(10);

        return new Response(
          JSON.stringify({ ok: true, sessionId, familyEmail, recentLogs: logs }, null, 2),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
