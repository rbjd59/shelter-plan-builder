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
import { sendSosSmsToContacts } from "@/lib/twilio-sms.server";

const AppContactSchema = z.object({
  name: z.string().max(160).optional().nullable(),
  email: z.string().email().max(200).optional().nullable(),
  phone: z.string().max(32).optional().nullable(),
  phone_e164: z.string().max(32).optional().nullable(),
  relationship: z.string().max(80).optional().nullable(),
}).passthrough();

const ActivateSchema = z.object({
  intake_session_id: z.string().min(1).max(128).optional(),
  activation_code: z.string().regex(/^[A-Za-z0-9]{8}$/).optional(),
  token: z.string().regex(/^[A-Za-z0-9]{8}$/).optional(),
  role: z.enum(["client", "family"]).default("client"),
  full_name: z.string().min(1).max(200).optional(),
  alert_email: z.string().email().max(200).optional(),
  contact_email: z.string().email().max(200).optional(),
  contacts: z.array(AppContactSchema).max(20).optional(),
  gps_lat: z.number().min(-90).max(90).optional(),
  gps_lng: z.number().min(-180).max(180).optional(),
  gps_raw: z.string().max(200).optional(),
  battery_pct: z.number().int().min(0).max(100).optional().nullable(),
  device_timestamp: z.string().max(80).optional(),
  notes: z.string().max(1000).optional(),
  cancel_of: z.string().uuid().optional(),
  cancel_pin: z.string().regex(/^\d{4,8}$/).optional(),
}).refine((data) => data.intake_session_id || data.activation_code || data.token, {
  message: "intake_session_id_or_activation_code_required",
  path: ["intake_session_id"],
});

const FROM = "intake@gohomesooner.com";
const SENDER_DOMAIN = "notify.gohomesooner.com";
const LEGAL_INBOX = "legal@detenciondefensa.com";
const FORMS_BUCKET = "intake-forms";
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

async function signedPacketLinks(caseId: string): Promise<{ name: string; url: string }[]> {
  const files = [
    { name: "AO 242 — Habeas Petition", path: `${caseId}/AO242-habeas-2241.pdf` },
    { name: "AO 240 — In Forma Pauperis", path: `${caseId}/AO240-in-forma-pauperis.pdf` },
    { name: "JS-44 — Civil Cover Sheet", path: `${caseId}/JS44-Civil-Cover-Sheet.pdf` },
    { name: "Motion — Request for Volunteer Attorney", path: `${caseId}/SDFL-Motion-Referral-Volunteer-Attorney.pdf` },
  ];
  const out: { name: string; url: string }[] = [];
  for (const f of files) {
    try {
      const { data } = await supabaseAdmin.storage
        .from(FORMS_BUCKET)
        .createSignedUrl(f.path, 60 * 60 * 24 * 14);
      if (data?.signedUrl) out.push({ name: f.name, url: data.signedUrl });
    } catch { /* ignore missing files */ }
  }
  return out;
}

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeActivationCode(value: string | undefined): string | null {
  const normalized = value?.trim().toUpperCase() ?? "";
  return /^[A-Z0-9]{8}$/.test(normalized) ? normalized : null;
}

async function resolveMirrorToken(caseRef: string, explicitCode?: string | null): Promise<string | null> {
  if (explicitCode) return explicitCode;
  const rawToken = caseRef.toUpperCase();
  if (/^[A-Z0-9]{8}$/.test(rawToken)) return rawToken;
  try {
    const { data: clientRow } = await supabaseAdmin
      .from("app_clients" as never)
      .select("invite_token")
      .eq("intake_session_id", caseRef)
      .maybeSingle();
    if (clientRow && (clientRow as { invite_token: string }).invite_token) {
      return (clientRow as { invite_token: string }).invite_token;
    }
  } catch (e) {
    console.error("[activate] invite_token lookup failed", e);
  }
  return null;
}

async function syncContactsForToken(
  token: string,
  contacts: z.infer<typeof AppContactSchema>[] | undefined,
): Promise<{ contacts_saved: number; error?: string }> {
  if (!contacts?.length) return { contacts_saved: 0 };
  try {
    const { data, error } = await supabaseAdmin.rpc("sync_client_contacts" as never, {
      _token: token,
      _contacts: contacts,
    } as never);
    if (error) throw error;
    const saved = (data as { contacts_saved?: number } | null)?.contacts_saved;
    return { contacts_saved: typeof saved === "number" ? saved : 0 };
  } catch (e) {
    console.error("[activate] contact sync failed", e);
    return { contacts_saved: 0, error: "contact_sync_failed" };
  }
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

async function enqueueAlertEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  label: string;
  idempotencyKey: string;
}) {
  const messageId = crypto.randomUUID();
  const unsubscribeToken = await getOrCreateUnsubscribeToken(opts.to);
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
      unsubscribe_token: unsubscribeToken,
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
          return jsonResponse({ ok: false, error: "invalid_json" }, { status: 400 });
        }
        const parsed = ActivateSchema.safeParse(body);
        if (!parsed.success) {
          return jsonResponse({ ok: false, error: parsed.error.flatten() }, { status: 400 });
        }
        const d = parsed.data;
        const explicitCode = normalizeActivationCode(d.activation_code) ?? normalizeActivationCode(d.token);
        const caseRef = d.intake_session_id ?? explicitCode;
        if (!caseRef) {
          return jsonResponse({ ok: false, error: "missing_activation_code" }, { status: 400 });
        }
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
            .eq("id", d.cancel_of)
            .eq("intake_session_id", caseRef);

          // Mirror cancellation into client_sos_alerts (the board schema).
          // Resolve the activation token from intake_session_id directly or by
          // looking up the client row.
          const cancelToken = await resolveMirrorToken(caseRef, explicitCode);
          if (cancelToken) {
            try {
              if (d.cancel_pin) {
                const { data: pinOk, error: pinErr } = await supabaseAdmin.rpc(
                  "cancel_sos_alert_with_pin" as never,
                  { _token: cancelToken, _pin: d.cancel_pin } as never,
                );
                if (pinErr || pinOk === false) {
                  console.warn("[activate] PIN rejected", { pinErr, pinOk });
                  return jsonResponse({ ok: false, error: "invalid_pin" }, { status: 403 });
                }
                console.log("[activate] cancel via PIN ok");
              } else {
                await supabaseAdmin.rpc("cancel_sos_alert" as never, {
                  _token: cancelToken,
                } as never);
              }
            } catch (e) {
              console.error("[activate] cancel_sos_alert mirror failed", e);
            }
            // Twilio SMS fan-out — cancellation
            try {
              const result = await sendSosSmsToContacts({
                token: cancelToken,
                clientName: d.full_name ?? null,
                kind: "cancel",
                activationId: d.cancel_of,
              });
              console.log("[activate] sms cancel fan-out", result);
            } catch (e) {
              console.error("[activate] sms cancel fan-out failed", e);
            }
          }



          const subject = `CANCEL EMERGENCY [${d.role.toUpperCase()}] — ${d.full_name ?? caseRef.slice(0, 12)}`;
          const text = `FALSE ALARM — please disregard the previous emergency alert.

Case: ${caseRef}
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
          return jsonResponse({ ok: true, cancelled: d.cancel_of }, { status: 200 });
        }

        // Fire path — insert row, compute act-after window, send alert.
        const isFamily = d.role === "family";
        const windowMs = isFamily ? 12 * 3600_000 : 2 * 3600_000;
        const firedAt = new Date();
        const actAfter = new Date(firedAt.getTime() + windowMs);

        const { data: row, error } = await supabaseAdmin
          .from("emergency_activations" as never)
          .insert({
            intake_session_id: caseRef,
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
          return jsonResponse({ ok: false, error: "insert_failed" }, { status: 500 });
        }
        const activationId = (row as { id: string }).id;

        // Mirror into client_sos_alerts so the company and attorney boards see
        // this trigger. The boards read from client_sos_alerts (keyed by
        // app_clients.invite_token), not from the legacy emergency_activations
        // table. Resolve the activation token from either the intake_session_id
        // (when it is already an 8-char code) or by looking up the client row.
        const mirrorToken = await resolveMirrorToken(caseRef, explicitCode);
        let contactSyncResult: { contacts_saved: number; error?: string } = { contacts_saved: 0 };
        if (mirrorToken) {
          contactSyncResult = await syncContactsForToken(mirrorToken, d.contacts);
          try {
            await supabaseAdmin.rpc("record_sos_alert" as never, {
              _token: mirrorToken,
              _lat: d.gps_lat ?? null,
              _lng: d.gps_lng ?? null,
              _battery_pct: d.battery_pct ?? null,
              _payload: {
                name: d.full_name ?? null,
                contact_email: d.contact_email ?? null,
                alert_email: d.alert_email ?? null,
                battery_pct: d.battery_pct ?? null,
                device_timestamp: d.device_timestamp ?? null,
                notes: d.notes ?? null,
                role: d.role,
                source: "web-emergency-activate",
                contacts_saved: contactSyncResult.contacts_saved,
              },
            } as never);
          } catch (e) {
            console.error("[activate] record_sos_alert mirror failed", e);
          }
          // Twilio SMS fan-out — alert
          try {
            const mapsUrlForSms =
              d.gps_lat != null && d.gps_lng != null
                ? `https://maps.google.com/?q=${d.gps_lat},${d.gps_lng}`
                : null;
            const result = await sendSosSmsToContacts({
              token: mirrorToken,
              clientName: d.full_name ?? null,
              kind: "alert",
              mapsUrl: mapsUrlForSms,
              activationId,
            });
            console.log("[activate] sms alert fan-out", result);
          } catch (e) {
            console.error("[activate] sms alert fan-out failed", e);
          }
        }




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
        const subject = `EMERGENCY [${roleTag}] — ${d.full_name ?? "case"} — ${caseRef.slice(0, 12)}`;
        const packet = await signedPacketLinks(caseRef);
        const packetText = packet.length
          ? "\n\nCOURT PACKET (download links — valid 14 days):\n" +
            packet.map((p) => `• ${p.name}: ${p.url}`).join("\n")
          : "\n\nCourt packet on file in intake-forms bucket.";
        const packetHtml = packet.length
          ? `<h3 style="margin:18px 0 6px;font-size:14px">Court packet (download links — valid 14 days)</h3>
             <ul style="margin:0;padding-left:18px">${packet
               .map(
                 (p) =>
                   `<li style="margin:4px 0"><a href="${esc(p.url)}">${esc(p.name)}</a></li>`,
               )
               .join("")}</ul>`
          : `<p style="margin:0">Court packet on file under <code>${esc(caseRef)}</code>.</p>`;

        const text = `EMERGENCY ALERT — Triggered from ${isFamily ? "FAMILY CONTACT PHONE" : "CLIENT PHONE"}.
Response window: ${windowLabel}.
Begin response at (UTC): ${actAfter.toISOString()}

Detainee/Client: ${d.full_name ?? "(unknown)"}
Case ID: ${caseRef}
Activation ID: ${activationId}
Time (UTC): ${firedAt.toISOString()}
GPS: ${gps}
${mapsUrl ? `Maps: ${mapsUrl}` : ""}

Family contact on file: ${d.contact_email ?? "(none)"}
Alert email on phone: ${d.alert_email ?? "(none)"}
${packetText}

ACTION: If not cancelled by ${actAfter.toISOString()}, begin locating, notify contacts, prepare and mail packet.

Download the responder app: https://detenciondefensa.com/download`;

        const html = `<div style="font:14px/1.55 Arial,sans-serif;color:#111;max-width:640px">
          <h1 style="color:#b91c1c;margin:0 0 8px;font-size:20px">EMERGENCY [${roleTag}]</h1>
          <p style="margin:0 0 12px"><strong>${esc(windowLabel)}</strong></p>
          <p style="margin:0 0 4px"><strong>Begin response at (UTC):</strong> ${esc(actAfter.toISOString())}</p>
          <hr style="border:none;border-top:1px solid #ddd;margin:14px 0">
          <p style="margin:0 0 4px"><strong>Detainee/Client:</strong> ${esc(d.full_name ?? "(unknown)")}</p>
          <p style="margin:0 0 4px"><strong>Case ID:</strong> ${esc(caseRef)}</p>
          <p style="margin:0 0 4px"><strong>Activation ID:</strong> ${esc(activationId)}</p>
          <p style="margin:0 0 4px"><strong>Fired at (UTC):</strong> ${esc(firedAt.toISOString())}</p>
          <p style="margin:0 0 4px"><strong>GPS:</strong> ${esc(gps)} ${mapsUrl ? `&mdash; <a href="${mapsUrl}">open in Maps</a>` : ""}</p>
          <p style="margin:0 0 4px"><strong>Family contact:</strong> ${esc(d.contact_email ?? "(none)")}</p>
          <hr style="border:none;border-top:1px solid #ddd;margin:14px 0">
          ${packetHtml}
          <p style="margin:12px 0 0;color:#7f1d1d"><strong>ACTION:</strong> If not cancelled by ${esc(actAfter.toISOString())}, begin locating, notify contacts, prepare and mail packet.</p>
          <p style="margin:14px 0 0"><a href="https://detenciondefensa.com/download" style="display:inline-block;background:#b91c1c;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600">Download the responder app</a></p>
          <p style="margin:6px 0 0;font-size:12px;color:#666">Or open: https://detenciondefensa.com/download</p>
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
        if (
          d.contact_email &&
          d.contact_email !== LEGAL_INBOX &&
          d.contact_email !== d.alert_email
        ) {
          await enqueueAlertEmail({
            to: d.contact_email,
            subject,
            html,
            text,
            label: "emergency-activation",
            idempotencyKey: `fire-${activationId}-contact`,
          });
        }

        // Sentinel Readiness Packet vault release — fire-and-log, never block alert.
        try {
          await triggerVaultRelease({
            intakeSessionId: caseRef,
            emergencyActivationId: activationId,
          });
        } catch (e) {
          console.error("[activate] vault release failed", e);
        }

        // Replit backend mirror — redundant alert path. Fire-and-forget; failures
        // here must NEVER block the primary Resend send above.
        const replitUrl = process.env.REPLIT_TRIGGER_URL?.trim();
        const replitSecret = process.env.REPLIT_TRIGGER_SECRET?.trim();
        if (replitUrl && replitSecret) {
          try {
            const resp = await fetch(replitUrl, {
              method: "POST",
              headers: {
                "content-type": "application/json",
                "x-trigger-secret": replitSecret,
              },
              body: JSON.stringify({
                source: "detenciondefensa-site",
                event: "fire",
                activation_id: activationId,
                intake_session_id: caseRef,
                role: d.role,
                full_name: d.full_name ?? null,
                contact_email: d.contact_email ?? null,
                alert_email: d.alert_email ?? null,
                gps_lat: d.gps_lat ?? null,
                gps_lng: d.gps_lng ?? null,
                gps_raw: d.gps_raw ?? null,
                fired_at: firedAt.toISOString(),
                act_after: actAfter.toISOString(),
                notes: d.notes ?? null,
              }),
            });
            if (!resp.ok) {
              console.error("[activate] replit mirror non-ok", resp.status);
            }
          } catch (e) {
            console.error("[activate] replit mirror failed", e);
          }
        }

        return jsonResponse({ ok: true, activation_id: activationId, act_after: actAfter.toISOString(), ...contactSyncResult }, { status: 200 });
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: CORS_HEADERS,
        }),
    },
  },
});
