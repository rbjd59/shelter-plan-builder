// Cron-driven processor: finds activations whose 2h/12h cancel window has
// elapsed without cancellation, emails the family contacts, and marks
// family_notified_at so we never double-send.
//
// Called by pg_cron every 5 minutes. Auth: caller MUST pass the shared
// secret in the `x-trigger-secret` header (same secret used by the Replit
// mirror — REPLIT_TRIGGER_SECRET). Without this check, any internet
// caller could flood the queue with duplicate sends.

import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const FROM = "intake@gohomesooner.com";
const SENDER_DOMAIN = "notify.gohomesooner.com";

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

async function getOrCreateUnsubscribeToken(email: string): Promise<string> {
  const { data: existing } = await supabaseAdmin
    .from("email_unsubscribe_tokens" as never)
    .select("token")
    .eq("email", email)
    .maybeSingle();
  if (existing && (existing as { token: string }).token) {
    return (existing as { token: string }).token;
  }
  const token = crypto.randomUUID();
  await supabaseAdmin
    .from("email_unsubscribe_tokens" as never)
    .insert({ email, token } as never);
  return token;
}

async function enqueueFamilyAlert(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}) {
  const messageId = crypto.randomUUID();
  const unsubscribeToken = await getOrCreateUnsubscribeToken(opts.to);
  await supabaseAdmin.from("email_send_log" as never).insert({
    message_id: messageId,
    template_name: "emergency-family-notify",
    recipient_email: opts.to,
    status: "pending",
  } as never);
  await supabaseAdmin.rpc("enqueue_email" as never, {
    queue_name: "transactional_emails",
    payload: {
      to: opts.to,
      from: FROM,
      sender_domain: SENDER_DOMAIN,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      purpose: "transactional",
      label: "emergency-family-notify",
      idempotency_key: opts.idempotencyKey,
      message_id: messageId,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    } as never,
  } as never);
}

interface ActivationRow {
  id: string;
  intake_session_id: string;
  full_name: string | null;
  contact_email: string | null;
  fired_at: string;
  role: string;
}

interface TrackingRow {
  contact_email: string | null;
  contact_name: string | null;
  tracking_token: string | null;
}

export const Route = createFileRoute("/api/public/cron/process-due-activations")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.REPLIT_TRIGGER_SECRET?.trim();
        const incoming = request.headers.get("x-trigger-secret")?.trim() ?? "";
        if (!expected || incoming !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        const nowIso = new Date().toISOString();
        const { data: rows, error } = await supabaseAdmin
          .from("emergency_activations" as never)
          .select("id,intake_session_id,full_name,contact_email,fired_at,role")
          .lte("act_after", nowIso)
          .is("cancelled_at", null)
          .is("family_notified_at", null)
          .limit(50);
        if (error) {
          console.error("[cron] query failed", error);
          return Response.json({ ok: false, error: error.message }, { status: 500 });
        }
        const list = (rows ?? []) as ActivationRow[];
        let notified = 0;

        for (const r of list) {
          let { data: trk } = await supabaseAdmin
            .from("case_tracking")
            .select("contact_email,contact_name,tracking_token")
            .eq("intake_session_id", r.intake_session_id)
            .maybeSingle();
          // Auto-create a tracking row if missing so the email link always
          // resolves to a real /track/<token> page.
          if (!trk) {
            const ins = await supabaseAdmin
              .from("case_tracking")
              .insert({
                intake_session_id: r.intake_session_id,
                contact_email: r.contact_email,
                contact_name: r.full_name,
                inmate_name: r.full_name,
                language: "es",
              } as never)
              .select("contact_email,contact_name,tracking_token")
              .single();
            trk = ins.data ?? null;
          }
          const tracking = (trk as TrackingRow | null) ?? null;
          const recipients = new Set<string>();
          if (r.contact_email) recipients.add(r.contact_email.toLowerCase());
          if (tracking?.contact_email) recipients.add(tracking.contact_email.toLowerCase());

          if (recipients.size === 0) {
            // No contact on file — mark notified anyway so we don't loop forever.
            await supabaseAdmin
              .from("emergency_activations" as never)
              .update({ family_notified_at: nowIso } as never)
              .eq("id", r.id);
            continue;
          }

          const trackUrl = tracking?.tracking_token
            ? `https://detenciondefensa.com/track/${tracking.tracking_token}`
            : "https://detenciondefensa.com";
          const name = esc(r.full_name || tracking?.contact_name || "");
          const subject = `URGENT: Detention alert was not cancelled — ${name || r.intake_session_id.slice(0, 8)}`;
          const text = `URGENT — DETENTION CONFIRMED

The emergency alert for ${name || "your loved one"} fired at ${new Date(r.fired_at).toLocaleString()}
and was not cancelled within the safety window. We are now beginning the response protocol:

  1. Locating in the ICE Online Detainee Locator
  2. Preparing the federal court packet (AO 242 + AO 240)
  3. Mailing the packet to the facility once located

Track your case: ${trackUrl}

If this was a false alarm, contact us immediately at intake@detenciondefensa.com.`;
          const html = `<!doctype html><html><body style="margin:0;background:#fff;font-family:Arial,sans-serif;color:#111;">
  <div style="max-width:560px;margin:0 auto;padding:28px 22px;">
    <div style="background:#fef2f2;border:2px solid #dc2626;border-radius:10px;padding:22px;">
      <h1 style="margin:0 0 8px;color:#991b1b;font-size:20px;">URGENT — Detention confirmed</h1>
      <p style="margin:0 0 14px;font-size:14px;color:#7f1d1d;">
        The emergency alert for <strong>${name || "your loved one"}</strong> fired at
        <strong>${esc(new Date(r.fired_at).toLocaleString())}</strong> and was not cancelled within the safety window.
      </p>
      <p style="margin:0 0 6px;font-size:14px;color:#1a1a1a;"><strong>We are now:</strong></p>
      <ol style="margin:0 0 14px 20px;font-size:14px;color:#1a1a1a;line-height:1.6;">
        <li>Locating in the ICE Online Detainee Locator</li>
        <li>Preparing the federal court packet (AO 242 + AO 240)</li>
        <li>Mailing the packet to the facility once located</li>
      </ol>
      <p style="text-align:center;margin:18px 0 0;">
        <a href="${trackUrl}" style="display:inline-block;background:#0b1220;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;font-weight:700;font-size:14px;">Track your case</a>
      </p>
      <p style="margin:18px 0 0;font-size:12px;color:#7f1d1d;border-top:1px solid #fecaca;padding-top:12px;">
        False alarm? Contact us immediately at <a href="mailto:intake@detenciondefensa.com" style="color:#7f1d1d;">intake@detenciondefensa.com</a>.
      </p>
    </div>
  </div>
</body></html>`;
          for (const to of recipients) {
            try {
              await enqueueFamilyAlert({
                to, subject, html, text,
                idempotencyKey: `family-notify-${r.id}-${to}`,
              });
            } catch (e) {
              console.error("[cron] enqueue failed", e);
            }
          }
          await supabaseAdmin
            .from("emergency_activations" as never)
            .update({ family_notified_at: nowIso } as never)
            .eq("id", r.id);
          notified++;
        }

        return Response.json({ ok: true, processed: list.length, notified });
      },
    },
  },
});
