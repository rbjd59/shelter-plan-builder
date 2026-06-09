// Dev/test endpoint: issue a one-time install token tied to an existing
// intake session and email the welcome (with install link) to a recipient.
// Guarded by REPLIT_TRIGGER_SECRET so only the operator can call it.
//
//   curl -X POST https://detenciondefensa.com/api/public/dev/send-install \
//     -H "x-trigger-secret: $SECRET" \
//     -H "content-type: application/json" \
//     -d '{"email":"jbittleman@me.com","intake_session_id":"e2e-test-...","language":"en"}'

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { issueAppInstallToken, buildAppInstallUrl } from "@/lib/app-install.server";
import { createOrUpdateCaseTracking, sendWelcomeEmail } from "@/lib/case-tracking.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const Body = z.object({
  email: z.string().email().max(200),
  intake_session_id: z.string().min(4).max(200),
  language: z.enum(["es", "en", "ht"]).optional(),
});

export const Route = createFileRoute("/api/public/dev/send-install")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = request.headers.get("x-trigger-secret");
        const expected = process.env.REPLIT_TRIGGER_SECRET?.trim();
        if (!expected || secret !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const parsed = Body.safeParse(body);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
        const { email, intake_session_id, language } = parsed.data;

        const { data: intake } = await supabaseAdmin
          .from("intake_submissions")
          .select("answers, language")
          .eq("stripe_session_id", intake_session_id)
          .maybeSingle();
        if (!intake) {
          return new Response(JSON.stringify({ error: "intake not found" }), {
            status: 404,
            headers: { "content-type": "application/json" },
          });
        }
        const ans = ((intake as { answers: Record<string, unknown> | null }).answers ?? {}) as Record<string, unknown>;
        const lang = language ?? ((intake as { language: string }).language || "es");

        const tracking = await createOrUpdateCaseTracking({
          sessionId: intake_session_id,
          answers: ans,
          language: lang,
          contactEmailFromStripe: email,
        });
        if (!tracking) {
          return new Response("tracking failed", { status: 500 });
        }

        const [clientToken, familyToken] = await Promise.all([
          issueAppInstallToken(intake_session_id, "client"),
          issueAppInstallToken(intake_session_id, "family"),
        ]);
        const clientInstallUrl = clientToken ? buildAppInstallUrl(clientToken, "client") : null;
        const familyInstallUrl = familyToken ? buildAppInstallUrl(familyToken, "family") : null;
        const inmateName =
          (typeof ans.mail_inmate_name === "string" && ans.mail_inmate_name) ||
          (typeof ans.full_name === "string" && ans.full_name) ||
          "your loved one";

        await sendWelcomeEmail({
          to: email,
          trackingToken: tracking.token,
          language: lang,
          clientInstallUrl,
          familyInstallUrl,
          inmateName,
        });

        return new Response(
          JSON.stringify({
            ok: true,
            sent_to: email,
            language: lang,
            client_install_url: clientInstallUrl,
            family_install_url: familyInstallUrl,
            tracking_url: `https://detenciondefensa.com/track/${tracking.token}`,
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});
