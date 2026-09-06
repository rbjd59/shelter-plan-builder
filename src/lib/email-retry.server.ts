// Server-only helpers for re-sending emails.
//
// Email goes out synchronously through Lovable's managed email delivery,
// which owns transport retries, backoff and rate limiting. When a send still
// fails (API down, missing key, request rejected), managed-send.server.ts logs
// a `failed` row in email_send_log with the full payload under
// metadata.retry_payload. retryDlqEmails() re-sends those payloads.
//
// - resendIntakeForSubmission(): re-runs enqueueIntakeNotification for a given
//   intake_submissions row, optionally scoped to internal / welcome / all.

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { enqueueIntakeNotification } from "@/lib/email/intake-notification.server";
import { sendManagedEmail, type ManagedEmailPayload } from "@/lib/email/managed-send.server";

export interface RetryStats {
  /** Emails successfully re-sent. */
  requeued: number;
  /** Emails given up on (too many attempts, no stored payload, or suppressed). */
  dropped: number;
  errors: string[];
}

const MAX_ATTEMPTS = 5;
/** How far back we look for failed rows at all. */
const WINDOW_DAYS = 30;
/**
 * Non-urgent emails (welcome, forms, internal notices) are only retried if
 * the original send is younger than this. Older ones are marked dlq.
 */
const GENERAL_MAX_AGE_MS = 48 * 60 * 60 * 1000;
/**
 * Time-sensitive alerts (SOS fan-out, emergency notices, cancellations) are
 * useless — and alarming — if delivered late. Only retry within this window.
 */
const URGENT_MAX_AGE_MS = 2 * 60 * 60 * 1000;
const URGENT_LABEL_RE = /^(sos-|emergency-|locate_handoff$)/;

function isUrgentLabel(label: string): boolean {
  return URGENT_LABEL_RE.test(label);
}

interface LogRow {
  id: string;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: string;
  metadata: { retry_payload?: ManagedEmailPayload } | null;
  created_at: string;
}

export async function retryDlqEmails(batchSize = 25): Promise<RetryStats> {
  const stats: RetryStats = { requeued: 0, dropped: 0, errors: [] };
  const since = new Date(Date.now() - WINDOW_DAYS * 86400000).toISOString();

  const { data, error } = await supabaseAdmin
    .from("email_send_log")
    .select("id, message_id, template_name, recipient_email, status, metadata, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) {
    stats.errors.push(error.message);
    return stats;
  }

  // Group by message_id; only messages whose LATEST row is 'failed' are eligible.
  const byMessage = new Map<string, LogRow[]>();
  for (const row of (data ?? []) as LogRow[]) {
    const key = row.message_id ?? `row-${row.id}`;
    const list = byMessage.get(key) ?? [];
    list.push(row);
    byMessage.set(key, list);
  }

  let processed = 0;
  for (const [key, rows] of byMessage) {
    if (processed >= batchSize) break;
    const latest = rows[0]!;
    if (latest.status !== "failed") continue;
    processed++;

    const attempts = rows.filter((r) => r.status === "failed").length;
    const payload = rows.find((r) => r.metadata?.retry_payload)?.metadata?.retry_payload;
    // Age is measured from the ORIGINAL failed send, not the latest retry.
    const firstFailedAt = new Date(rows[rows.length - 1]!.created_at).getTime();
    const ageMs = Date.now() - firstFailedAt;
    const urgent = isUrgentLabel(latest.template_name);
    const maxAgeMs = urgent ? URGENT_MAX_AGE_MS : GENERAL_MAX_AGE_MS;

    let giveUpReason: string | null = null;
    if (!payload) giveUpReason = "No stored payload to retry (sent before retry support)";
    else if (attempts >= MAX_ATTEMPTS) giveUpReason = `Gave up after ${attempts} failed attempts`;
    else if (ageMs > maxAgeMs) {
      giveUpReason = urgent
        ? "Time-sensitive alert too old to re-send safely (>2h)"
        : "Too old to re-send (>48h)";
    }

    if (giveUpReason) {
      await supabaseAdmin.from("email_send_log" as never).insert({
        message_id: latest.message_id,
        template_name: latest.template_name,
        recipient_email: latest.recipient_email,
        status: "dlq",
        error_message: giveUpReason,
      } as never);
      stats.dropped++;
      continue;
    }

    const result = await sendManagedEmail(payload);
    if (result.sent) {
      stats.requeued++;
    } else if (result.reason === "recipient_suppressed") {
      stats.dropped++;
    } else {
      stats.errors.push(`${key}: ${result.error}`);
    }
  }

  return stats;
}

export async function resendIntakeForSubmission(opts: {
  submissionId: string;
  scope: "all" | "internal" | "welcome";
}): Promise<{ ok: true; sessionId: string }> {
  const { data: sub, error } = await supabaseAdmin
    .from("intake_submissions")
    .select("id, stripe_session_id, email, language, answers")
    .eq("id", opts.submissionId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!sub) throw new Error("Submission not found");

  const sessionId = (sub.stripe_session_id as string | null) ?? sub.id;
  await enqueueIntakeNotification({
    sessionId,
    answers: (sub.answers as Record<string, unknown>) ?? {},
    language: (sub.language as string) ?? "es",
    contactEmail: sub.email,
    scope: opts.scope,
  });
  return { ok: true, sessionId };
}
