// Public emergency activation endpoint. Called from the PWA on the locked
// person's phone the instant they tap HELP, BEFORE the mailto opens. This
// is the fail-safe — even if the mailto is intercepted, blocked, or the
// user closes the mail app, we have the alert server-side and route it
// through our queue (which uses our verified sender domain — no spam).
//
// No auth: the case_id is a UUID issued at intake; the only attack surface
// is creating noise rows, which we accept (email rate limit is per case).

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { triggerVaultRelease } from "@/lib/readiness.server";

const ActivateSchema = z.object({
  intake_session_id: z.string().min(8).max(128),
  role: z.enum(["client", "family"]),
  full_name: z.string().min(1).max(200).optional(),
  alert_email: z.string().email().max(200).optional(),
  contact_email: z.string().email().max(200).optional(),
  gps_lat: z.number().min(-90).max(90).optional(),
  gps_lng: z.number().min(-180).max(180).optional(),
  gps_raw: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  cancel_of: z.string().uuid().optional(),
});

const FROM = "intake@gohomesooner.com";
const SENDER_DOMAIN = "notify.gohomesooner.com";
const LEGAL_INBOX = "intake@detenciondefensa.com";

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function enqueueAlertEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  label: string;
  idempotencyKey: string;
}) {
  const messageId = crypto.randomUUID();
  await supabaseAdmin.from("email_send_log" as never).insert({
    message_id: messageId,
    template_name: opts.label,
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
      label: opts.label,
      idempotency_key: opts.idempotencyKey,
      message_id: messageId,
      queued_at: new Date().toISOString(),
    } as never,
  } as never);
}

export const Route = createFileRoute("/api/public/emergency/activate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const parsed = ActivateSchema.safeParse(body);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
        const d = parsed.data;
        const ip =
          request.headers.get("cf-connecting-ip") ||
          request.headers.get("x-forwarded-for") ||
          null;
        const ua = request.headers.get("user-agent") || null;

        // Cancellation path — mark prior activation cancelled, send a follow-up email.
        if (d.cancel_of) {
          await supabaseAdmin
            .from("emergency_activations" as never)
            .update({ cancelled_at: new Date().toISOString() } as never)
            .eq("id", d.cancel_of);

          const subject = `CANCEL EMERGENCY [${d.role.toUpperCase()}] — ${d.full_name ?? d.intake_session_id.slice(0, 12)}`;
          const text = `FALSE ALARM — please disregard the previous emergency alert.

Case: ${d.intake_session_id}
Role: ${d.role}
Cancelled at (UTC): ${new Date().toISOString()}`;
          const html = `<pre style="font:14px/1.5 monospace">${esc(text)}</pre>`;
          await enqueueAlertEmail({
            to: LEGAL_INBOX,
            subject,
            html,
            text,
            label: "emergency-cancel",
            idempotencyKey: `cancel-${d.cancel_of}`,
          });
          if (d.alert_email && d.alert_email !== LEGAL_INBOX) {
            await enqueueAlertEmail({
              to: d.alert_email,
              subject,
              html,
              text,
              label: "emergency-cancel",
              idempotencyKey: `cancel-${d.cancel_of}-alt`,
            });
          }
          return new Response(JSON.stringify({ ok: true, cancelled: d.cancel_of }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        // Fire path — insert row, compute act-after window, send alert.
        const isFamily = d.role === "family";
        const windowMs = isFamily ? 12 * 3600_000 : 2 * 3600_000;
        const firedAt = new Date();
        const actAfter = new Date(firedAt.getTime() + windowMs);

        const { data: row, error } = await supabaseAdmin
          .from("emergency_activations" as never)
          .insert({
            intake_session_id: d.intake_session_id,
            role: d.role,
            fired_at: firedAt.toISOString(),
            act_after: actAfter.toISOString(),
            gps_lat: d.gps_lat ?? null,
            gps_lng: d.gps_lng ?? null,
            gps_raw: d.gps_raw ?? null,
            user_agent: ua,
            ip,
            alert_email: d.alert_email ?? null,
            contact_email: d.contact_email ?? null,
            full_name: d.full_name ?? null,
            notes: d.notes ?? null,
          } as never)
          .select("id")
          .single();
        if (error || !row) {
          console.error("emergency_activations insert failed", error);
          return new Response("Insert failed", { status: 500 });
        }
        const activationId = (row as { id: string }).id;

        const gps =
          d.gps_lat != null && d.gps_lng != null
            ? `${d.gps_lat.toFixed(6)}, ${d.gps_lng.toFixed(6)}`
            : d.gps_raw ?? "(not captured)";
        const mapsUrl =
          d.gps_lat != null && d.gps_lng != null
            ? `https://maps.google.com/?q=${d.gps_lat},${d.gps_lng}`
            : null;

        const roleTag = isFamily ? "FAMILY" : "CLIENT";
        const windowLabel = isFamily
          ? "12-HOUR confirmation window (family-triggered — wait before locating)"
          : "2-HOUR window (client-triggered — at-scene alert)";
        const subject = `EMERGENCY [${roleTag}] — ${d.full_name ?? "case"} — ${d.intake_session_id.slice(0, 12)}`;
        const text = `EMERGENCY ALERT — Triggered from ${isFamily ? "FAMILY CONTACT PHONE" : "CLIENT PHONE"}.
Response window: ${windowLabel}.
Begin response at (UTC): ${actAfter.toISOString()}

Detainee/Client: ${d.full_name ?? "(unknown)"}
Case ID: ${d.intake_session_id}
Activation ID: ${activationId}
Time (UTC): ${firedAt.toISOString()}
GPS: ${gps}
${mapsUrl ? `Maps: ${mapsUrl}` : ""}

Family contact on file: ${d.contact_email ?? "(none)"}
Alert email on phone: ${d.alert_email ?? "(none)"}

AO 242 Habeas + AO 240 IFP for this case are already on file (intake-forms bucket).
ACTION: If not cancelled by ${actAfter.toISOString()}, begin locating, notify contacts, prepare and mail packet.`;
        const html = `<div style="font:14px/1.55 Arial,sans-serif;color:#111;max-width:640px">
          <h1 style="color:#b91c1c;margin:0 0 8px;font-size:20px">EMERGENCY [${roleTag}]</h1>
          <p style="margin:0 0 12px"><strong>${esc(windowLabel)}</strong></p>
          <p style="margin:0 0 4px"><strong>Begin response at (UTC):</strong> ${esc(actAfter.toISOString())}</p>
          <hr style="border:none;border-top:1px solid #ddd;margin:14px 0">
          <p style="margin:0 0 4px"><strong>Detainee/Client:</strong> ${esc(d.full_name ?? "(unknown)")}</p>
          <p style="margin:0 0 4px"><strong>Case ID:</strong> ${esc(d.intake_session_id)}</p>
          <p style="margin:0 0 4px"><strong>Activation ID:</strong> ${esc(activationId)}</p>
          <p style="margin:0 0 4px"><strong>Fired at (UTC):</strong> ${esc(firedAt.toISOString())}</p>
          <p style="margin:0 0 4px"><strong>GPS:</strong> ${esc(gps)} ${mapsUrl ? `&mdash; <a href="${mapsUrl}">open in Maps</a>` : ""}</p>
          <p style="margin:0 0 4px"><strong>Family contact:</strong> ${esc(d.contact_email ?? "(none)")}</p>
          <hr style="border:none;border-top:1px solid #ddd;margin:14px 0">
          <p style="margin:0">AO 242 Habeas + AO 240 IFP are on file in the intake-forms bucket under <code>${esc(d.intake_session_id)}</code>.</p>
          <p style="margin:12px 0 0;color:#7f1d1d"><strong>ACTION:</strong> If not cancelled by ${esc(actAfter.toISOString())}, begin locating, notify contacts, prepare and mail packet.</p>
        </div>`;

        await enqueueAlertEmail({
          to: LEGAL_INBOX,
          subject,
          html,
          text,
          label: "emergency-activation",
          idempotencyKey: `fire-${activationId}`,
        });
        if (d.alert_email && d.alert_email !== LEGAL_INBOX) {
          await enqueueAlertEmail({
            to: d.alert_email,
            subject,
            html,
            text,
            label: "emergency-activation",
            idempotencyKey: `fire-${activationId}-alt`,
          });
        }

        // Sentinel Readiness Packet vault release — fire-and-log, never block alert.
        try {
          await triggerVaultRelease({
            intakeSessionId: d.intake_session_id,
            emergencyActivationId: activationId,
          });
        } catch (e) {
          console.error("[activate] vault release failed", e);
        }

        return new Response(
          JSON.stringify({ ok: true, activation_id: activationId, act_after: actAfter.toISOString() }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "POST, OPTIONS",
            "access-control-allow-headers": "content-type",
          },
        }),
    },
  },
});
