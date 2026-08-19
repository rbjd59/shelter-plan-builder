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
import { sendSosSmsToContacts, sendSms, normalizeE164 } from "@/lib/twilio-sms.server";

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
  payload: z.object({
    contacts: z.array(AppContactSchema).max(20).optional(),
    name: z.string().max(200).optional().nullable(),
    a_number: z.string().max(40).optional().nullable(),
    trigger_type: z.string().max(40).optional().nullable(),
    lat: z.number().min(-90).max(90).optional().nullable(),
    lng: z.number().min(-180).max(180).optional().nullable(),
  }).passthrough().optional(),
  gps_lat: z.number().min(-90).max(90).optional(),
  gps_lng: z.number().min(-180).max(180).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  name: z.string().min(1).max(200).optional(),
  a_number: z.string().max(40).optional(),
  gps_raw: z.string().max(200).optional(),
  battery_pct: z.number().int().min(0).max(100).optional().nullable(),
  device_timestamp: z.string().max(80).optional(),
  notes: z.string().max(1000).optional(),
  cancel_of: z.string().uuid().optional(),
  cancel_pin: z.string().regex(/^\d{4,8}$/).optional(),
  action: z.enum(["trigger", "fire", "cancel"]).optional(),
}).passthrough().refine((data) => data.intake_session_id || data.activation_code || data.token, {
  message: "intake_session_id_or_activation_code_required",
  path: ["intake_session_id"],
});

const FROM = "intake@gohomesooner.com";
const SENDER_DOMAIN = "notify.gohomesooner.com";
// Trigger + cancellation notices go to the alerts desk, which runs the locate.
const LEGAL_INBOX = "alerts@detenciondefensa.com";
// Always copied on every SOS fire and cancel, per operating agreement.
const ALWAYS_CC = ["alerts@detenciondefensa.com", "intake@sorrentinolawfirm.com"];
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


/** Plain-language notice sent to family/lawyer contacts supplied by the app. */
function contactNoticeBodies(opts: {
  kind: "alert" | "cancel";
  clientName: string;
  caseRef: string;
  mapsUrl: string | null;
}) {
  const { kind, clientName, caseRef, mapsUrl } = opts;
  const text =
    kind === "alert"
      ? `EMERGENCY ALERT

${clientName} has triggered their DetencionDefensa emergency app and may have been detained by ICE or police.

Case reference: ${caseRef}
Time (UTC): ${new Date().toISOString()}${mapsUrl ? `\nLast known location: ${mapsUrl}` : ""}

The legal team has been notified and is responding. Please keep your phone available.

— DetencionDefensa`
      : `CANCELLED — FALSE ALARM

${clientName} has CANCELLED the earlier DetencionDefensa emergency alert. ${clientName} is OK and no action is needed.

Case reference: ${caseRef}
Time (UTC): ${new Date().toISOString()}

— DetencionDefensa`;
  const html = `<div style="font:14px/1.55 Arial,sans-serif;color:#111;max-width:640px"><pre style="font:14px/1.55 Arial,sans-serif;white-space:pre-wrap;margin:0">${esc(text)}</pre></div>`;
  return { text, html };
}

/** Collect unique, valid emails from the contacts array the app sends. */
function contactEmails(contacts: { email?: string | null }[] | undefined): string[] {
  const seen = new Set<string>();
  for (const c of contacts ?? []) {
    const e = c.email?.trim().toLowerCase();
    if (e && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) seen.add(e);
  }
  return [...seen];
}


/** SMS the contacts the app sent inline, skipping numbers already texted. */
async function smsInlineContacts(opts: {
  contacts: { name?: string | null; phone?: string | null; phone_e164?: string | null }[];
  alreadySent: string[];
  kind: "alert" | "cancel";
  clientName: string | null;
  caseRef: string;
}): Promise<number> {
  const done = new Set(opts.alreadySent.map((p) => normalizeE164(p)).filter(Boolean) as string[]);
  const name = opts.clientName ?? "Your contact";
  const body =
    opts.kind === "alert"
      ? `ALERT: ${name} has triggered their DetencionDefensa emergency app and may have been detained by ICE or police. Their attorney and family have been notified. — DetencionDefensa`
      : `CANCELLED — FALSE ALARM: ${name} has CANCELLED the earlier DetencionDefensa emergency alert. ${name} is OK. No action is needed. — DetencionDefensa`;
  let sent = 0;
  for (const c of opts.contacts) {
    const to = normalizeE164(c.phone_e164 ?? c.phone ?? null);
    if (!to || done.has(to)) continue;
    done.add(to);
    const res = await sendSms({
      to,
      body,
      purpose: `sos_${opts.kind}`,
      metadata: { source: "inline-contacts", case_ref: opts.caseRef, contact_name: c.name ?? null },
    });
    if (res.ok) sent++;
  }
  return sent;
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
        // The Flutter app sends lat/lng (and name inside payload); older
        // callers send gps_lat/gps_lng/full_name. Normalize both shapes.
        const latVal = d.gps_lat ?? d.lat ?? d.payload?.lat ?? null;
        const lngVal = d.gps_lng ?? d.lng ?? d.payload?.lng ?? null;
        const fullName = d.full_name ?? d.name ?? d.payload?.name ?? null;
        const inlineContacts = d.contacts ?? d.payload?.contacts ?? [];
        const inlineEmails = contactEmails(inlineContacts);
        const ip =
          request.headers.get("cf-connecting-ip") ||
          request.headers.get("x-forwarded-for") ||
          null;
        const ua = request.headers.get("user-agent") || null;

        // Cancellation path — mark prior activation cancelled, send a follow-up email.
        // A cancel can arrive as an explicit cancel_of id, or (from the phone
        // app) as action:"cancel" / a bare cancel PIN with no activation id.
        const isCancel = Boolean(d.cancel_of) || d.action === "cancel" || Boolean(d.cancel_pin);
        if (isCancel) {
          if (d.cancel_of) {
            await supabaseAdmin
              .from("emergency_activations" as never)
              .update({ cancelled_at: new Date().toISOString() } as never)
              .eq("id", d.cancel_of)
              .eq("intake_session_id", caseRef);
          } else {
            await supabaseAdmin
              .from("emergency_activations" as never)
              .update({ cancelled_at: new Date().toISOString() } as never)
              .eq("intake_session_id", caseRef)
              .is("cancelled_at", null);
          }


          // Mirror cancellation into client_sos_alerts (the board schema).
          // Resolve the activation token from intake_session_id directly or by
          // looking up the client row.
          const cancelToken = await resolveMirrorToken(caseRef, explicitCode);
          let cancelSmsPhones: string[] = [];
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
                clientName: fullName,
                kind: "cancel",
                activationId: d.cancel_of ?? null,
              });
              console.log("[activate] sms cancel fan-out", result);
            } catch (e) {
              console.error("[activate] sms cancel fan-out failed", e);
            }
          }



          const subject = `CANCEL EMERGENCY [${d.role.toUpperCase()}] — ${fullName ?? caseRef.slice(0, 12)}`;
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
            idempotencyKey: `cancel-${d.cancel_of ?? caseRef}-${Date.now()}`,
          });
          // Always copy the firm inboxes (LEGAL_INBOX already received it above).
          for (const cc of ALWAYS_CC) {
            if (cc === LEGAL_INBOX) continue;
            await enqueueAlertEmail({
              to: cc,
              subject,
              html,
              text,
              label: "emergency-cancel",
              idempotencyKey: `cancel-${d.cancel_of ?? caseRef}-${cc}`,
            });
          }

          // Plain-language cancellation notice to every contact the app sent.
          const cancelNotice = contactNoticeBodies({
            kind: "cancel",
            clientName: fullName ?? "Your contact",
            caseRef,
            mapsUrl: null,
          });
          for (const email of inlineEmails) {
            if (email === LEGAL_INBOX || ALWAYS_CC.includes(email)) continue;
            await enqueueAlertEmail({
              to: email,
              subject: `FALSE ALARM — ${fullName ?? "DetencionDefensa"} cancelled the emergency alert`,
              html: cancelNotice.html,
              text: cancelNotice.text,
              label: "emergency-cancel-contact",
              idempotencyKey: `cancel-contact-${caseRef}-${email}`,
            });
          }
          await smsInlineContacts({
            contacts: inlineContacts,
            alreadySent: cancelSmsPhones,
            kind: "cancel",
            clientName: fullName,
            caseRef,
          });

          return jsonResponse({ ok: true, cancelled: d.cancel_of ?? caseRef }, { status: 200 });
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
            gps_lat: latVal,
            gps_lng: lngVal,
            gps_raw: d.gps_raw ?? null,
            user_agent: ua,
            ip,
            alert_email: d.alert_email ?? null,
            contact_email: d.contact_email ?? null,
            full_name: fullName,
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
        let alertSmsPhones: string[] = [];
        const incomingContacts = inlineContacts;
        console.log("[activate] contacts received", {
          token: mirrorToken,
          top_level_count: d.contacts?.length ?? 0,
          payload_count: d.payload?.contacts?.length ?? 0,
        });
        if (mirrorToken) {
          contactSyncResult = await syncContactsForToken(mirrorToken, incomingContacts);
          console.log("[activate] contacts synced", contactSyncResult);
          try {
            await supabaseAdmin.rpc("record_sos_alert" as never, {
              _token: mirrorToken,
              _lat: latVal,
              _lng: lngVal,
              _battery_pct: d.battery_pct ?? null,
              _payload: {
                name: fullName,
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
              latVal != null && lngVal != null
                ? `https://maps.google.com/?q=${latVal},${lngVal}`
                : null;
            const result = await sendSosSmsToContacts({
              token: mirrorToken,
              clientName: fullName,
              kind: "alert",
              mapsUrl: mapsUrlForSms,
              activationId,
            });
            alertSmsPhones = result.phones;
            console.log("[activate] sms alert fan-out", result);
          } catch (e) {
            console.error("[activate] sms alert fan-out failed", e);
          }
        }




        const gps =
          latVal != null && lngVal != null
            ? `${latVal.toFixed(6)}, ${lngVal.toFixed(6)}`
            : d.gps_raw ?? "(not captured)";
        const mapsUrl =
          latVal != null && lngVal != null
            ? `https://maps.google.com/?q=${latVal},${lngVal}`
            : null;

        const roleTag = isFamily ? "FAMILY" : "CLIENT";
        const windowLabel = isFamily
          ? "12-HOUR confirmation window (family-triggered — wait before locating)"
          : "2-HOUR window (client-triggered — at-scene alert)";
        const subject = `EMERGENCY [${roleTag}] — ${fullName ?? "case"} — ${caseRef.slice(0, 12)}`;
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

Detainee/Client: ${fullName ?? "(unknown)"}
Case ID: ${caseRef}
Activation ID: ${activationId}
Time (UTC): ${firedAt.toISOString()}
GPS: ${gps}
${mapsUrl ? `Maps: ${mapsUrl}` : ""}

Family contact on file: ${d.contact_email ?? "(none)"}
Alert email on phone: ${d.alert_email ?? "(none)"}
${packetText}

ACTION: If not cancelled by ${actAfter.toISOString()}, begin locating, notify contacts, prepare and mail packet.`;


        const html = `<div style="font:14px/1.55 Arial,sans-serif;color:#111;max-width:640px">
          <h1 style="color:#b91c1c;margin:0 0 8px;font-size:20px">EMERGENCY [${roleTag}]</h1>
          <p style="margin:0 0 12px"><strong>${esc(windowLabel)}</strong></p>
          <p style="margin:0 0 4px"><strong>Begin response at (UTC):</strong> ${esc(actAfter.toISOString())}</p>
          <hr style="border:none;border-top:1px solid #ddd;margin:14px 0">
          <p style="margin:0 0 4px"><strong>Detainee/Client:</strong> ${esc(fullName ?? "(unknown)")}</p>
          <p style="margin:0 0 4px"><strong>Case ID:</strong> ${esc(caseRef)}</p>
          <p style="margin:0 0 4px"><strong>Activation ID:</strong> ${esc(activationId)}</p>
          <p style="margin:0 0 4px"><strong>Fired at (UTC):</strong> ${esc(firedAt.toISOString())}</p>
          <p style="margin:0 0 4px"><strong>GPS:</strong> ${esc(gps)} ${mapsUrl ? `&mdash; <a href="${mapsUrl}">open in Maps</a>` : ""}</p>
          <p style="margin:0 0 4px"><strong>Family contact:</strong> ${esc(d.contact_email ?? "(none)")}</p>
          <hr style="border:none;border-top:1px solid #ddd;margin:14px 0">
          ${packetHtml}
          <p style="margin:12px 0 0;color:#7f1d1d"><strong>ACTION:</strong> If not cancelled by ${esc(actAfter.toISOString())}, begin locating, notify contacts, prepare and mail packet.</p>
        </div>`;


        // Full-detail responder email goes ONLY to the attorney / legal inbox.
        // Family contacts receive a separate plain-language notice via the
        // database trigger _enqueue_sos_emails (fired on client_sos_alerts
        // INSERT). Do NOT send the responder packet or any "Download the app"
        // link to family contacts here.
        await enqueueAlertEmail({
          to: LEGAL_INBOX,
          subject,
          html,
          text,
          label: "emergency-activation",
          idempotencyKey: `fire-${activationId}`,
        });

        // Always copy the firm inboxes on every fire (LEGAL_INBOX already sent above).
        for (const cc of ALWAYS_CC) {
          if (cc === LEGAL_INBOX) continue;
          await enqueueAlertEmail({
            to: cc,
            subject,
            html,
            text,
            label: "emergency-activation",
            idempotencyKey: `fire-${activationId}-${cc}`,
          });
        }

        // Plain-language alert to every contact address the app sent us.
        const fireNotice = contactNoticeBodies({
          kind: "alert",
          clientName: fullName ?? "Your contact",
          caseRef,
          mapsUrl,
        });
        for (const email of inlineEmails) {
          if (email === LEGAL_INBOX || ALWAYS_CC.includes(email)) continue;
          await enqueueAlertEmail({
            to: email,
            subject: `EMERGENCY — ${fullName ?? "your contact"} may have been detained`,
            html: fireNotice.html,
            text: fireNotice.text,
            label: "emergency-activation-contact",
            idempotencyKey: `fire-contact-${activationId}-${email}`,
          });
        }

        // SMS any inline numbers the database fan-out did not already cover.
        await smsInlineContacts({
          contacts: inlineContacts,
          alreadySent: alertSmsPhones,
          kind: "alert",
          clientName: fullName,
          caseRef,
        });


        // Sentinel Readiness Packet vault release — fire-and-log, never block alert.
        try {
          await triggerVaultRelease({
            intakeSessionId: caseRef,
            emergencyActivationId: activationId,
          });
        } catch (e) {
          console.error("[activate] vault release failed", e);
        }

        // NOTE: the legacy DefensaSiempre/Replit mirror was removed. All alert
        // email + SMS now originate from this backend only, so nothing goes out
        // under the old project's branding or sender domain.


        return jsonResponse({ ok: true, alert_id: activationId, activation_id: activationId, act_after: actAfter.toISOString(), ...contactSyncResult }, { status: 200 });
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: CORS_HEADERS,
        }),
    },
  },
});
