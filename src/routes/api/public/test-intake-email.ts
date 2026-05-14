// TEMP test endpoint — sends a sample intake notification to a fixed test address.
// DELETE after testing.
import { createFileRoute } from "@tanstack/react-router";
import { sendLovableEmail } from "@lovable.dev/email-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildIntakePdfs } from "@/lib/email/intake-pdfs.server";

const TEST_RECIPIENT = "rbjd@dr.com";
const FROM = "intake@gohomesooner.com";
const SENDER_DOMAIN = "notify.gohomesooner.com";
const FORMS_BUCKET = "intake-forms";
const TTL = 60 * 60 * 24 * 14;

const sampleAnswers = {
  contact_name: "Maria Lopez",
  contact_relation: "Spouse",
  contact_email: TEST_RECIPIENT,
  contact_phone: "+1-305-555-0144",
  contact_address: "123 Test St\nMiami, FL 33101",
  mail_inmate_name: "Juan Lopez",
  mail_inmate_number: "A123-456-789",
  mail_current_location: "Krome Detention Center",
  mail_facility_address: "18201 SW 12th St\nMiami, FL 33194",
  date_of_arrest: "2026-05-10",
  warden_name: "Warden Sample",
  language_pref: "es",
  notes: "This is an end-to-end test submission.",
};

export const Route = createFileRoute("/api/public/test-intake-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get("key") !== "lovable-test-2026") {
          return new Response("forbidden", { status: 403 });
        }

        const sessionId = `test-${Date.now()}`;
        const errors: string[] = [];
        let habeasUrl: string | null = null;
        let ifpUrl: string | null = null;

        try {
          const { habeas, ifp } = await buildIntakePdfs(sampleAnswers);
          const habeasPath = `${sessionId}/AO242-habeas-2241.pdf`;
          const ifpPath = `${sessionId}/AO240-in-forma-pauperis.pdf`;
          const u1 = await supabaseAdmin.storage
            .from(FORMS_BUCKET)
            .upload(habeasPath, habeas, { contentType: "application/pdf", upsert: true });
          if (u1.error) errors.push(`habeas upload: ${u1.error.message}`);
          const u2 = await supabaseAdmin.storage
            .from(FORMS_BUCKET)
            .upload(ifpPath, ifp, { contentType: "application/pdf", upsert: true });
          if (u2.error) errors.push(`ifp upload: ${u2.error.message}`);
          const s1 = await supabaseAdmin.storage
            .from(FORMS_BUCKET)
            .createSignedUrl(habeasPath, TTL);
          const s2 = await supabaseAdmin.storage
            .from(FORMS_BUCKET)
            .createSignedUrl(ifpPath, TTL);
          if (s1.error) errors.push(`habeas sign: ${s1.error.message}`);
          if (s2.error) errors.push(`ifp sign: ${s2.error.message}`);
          habeasUrl = s1.data?.signedUrl ?? null;
          ifpUrl = s2.data?.signedUrl ?? null;
        } catch (e) {
          errors.push(`pdf build: ${e instanceof Error ? e.message : String(e)}`);
        }

        const subject = `[TEST] New Intake Submission — ${sampleAnswers.mail_inmate_name}`;
        const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111;">
          <div style="max-width:680px;margin:0 auto;padding:24px;">
            <h1 style="font-size:20px;">[TEST] New Intake Submission — DetencionDefensa.com</h1>
            <p style="color:#555;font-size:13px;">Session: ${sessionId} · Test recipient: ${TEST_RECIPIENT}</p>
            <h2 style="font-size:15px;margin-top:20px;">Completed Forms</h2>
            <div style="border:1px solid #d0d7de;border-radius:8px;padding:16px;background:#f6f8fa;">
              ${habeasUrl ? `<p><a href="${habeasUrl}" style="color:#0a58ca;">AO 242 — Petition for Writ of Habeas Corpus.pdf</a></p>` : `<p style="color:#a40000;">AO 242 PDF unavailable.</p>`}
              ${ifpUrl ? `<p><a href="${ifpUrl}" style="color:#0a58ca;">AO 240 — Application to Proceed In Forma Pauperis.pdf</a></p>` : `<p style="color:#a40000;">AO 240 PDF unavailable.</p>`}
              <p style="font-size:11px;color:#666;margin-top:10px;">Links expire in 14 days.</p>
            </div>
            <h2 style="font-size:15px;margin-top:20px;">Sample Answers</h2>
            <pre style="background:#f6f8fa;padding:12px;border-radius:6px;font-size:12px;white-space:pre-wrap;">${JSON.stringify(sampleAnswers, null, 2)}</pre>
            ${errors.length ? `<h3 style="color:#a40000;">Errors during build:</h3><pre>${errors.join("\n")}</pre>` : ""}
          </div>
        </body></html>`;
        const text = `[TEST] New Intake Submission\nSession: ${sessionId}\nHabeas: ${habeasUrl ?? "(unavailable)"}\nIFP: ${ifpUrl ?? "(unavailable)"}\n\n${JSON.stringify(sampleAnswers, null, 2)}`;

        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return Response.json({ ok: false, error: "LOVABLE_API_KEY missing", errors });
        }

        try {
          const messageId = crypto.randomUUID();
          await sendLovableEmail(
            {
              to: TEST_RECIPIENT,
              from: FROM,
              sender_domain: SENDER_DOMAIN,
              subject,
              html,
              text,
              purpose: "transactional",
              label: "intake-submission-test",
              idempotency_key: `test-intake-${sessionId}`,
              message_id: messageId,
              unsubscribe_token: crypto.randomUUID(),
            },
            { apiKey },
          );
          return Response.json({
            ok: true,
            sessionId,
            recipient: TEST_RECIPIENT,
            messageId,
            habeasUrl,
            ifpUrl,
            buildErrors: errors,
          });
        } catch (e) {
          return Response.json({
            ok: false,
            error: e instanceof Error ? e.message : String(e),
            buildErrors: errors,
          }, { status: 500 });
        }
      },
    },
  },
});
