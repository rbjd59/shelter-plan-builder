// Server-only helpers for retrying failed emails.
//
// - retryDlqEmails(): drains messages from auth_emails_dlq + transactional_emails_dlq,
//   re-enqueues them into the live queue (capped by auto_retry_count), and logs
//   a fresh `pending` row so the next worker tick will attempt delivery.
// - resendIntakeForSubmission(): re-runs enqueueIntakeNotification for a given
//   intake_submissions row, optionally scoped to internal / welcome / all.

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { enqueueIntakeNotification } from "@/lib/email/intake-notification.server";

const MAX_AUTO_RETRIES = 3;
const QUEUES: Array<{ dlq: string; live: string }> = [
  { dlq: "auth_emails_dlq", live: "auth_emails" },
  { dlq: "transactional_emails_dlq", live: "transactional_emails" },
];

export interface RetryStats {
  requeued: number;
  dropped: number;
  errors: string[];
}

export async function retryDlqEmails(batchSize = 25): Promise<RetryStats> {
  const stats: RetryStats = { requeued: 0, dropped: 0, errors: [] };

  for (const { dlq, live } of QUEUES) {
    const { data, error } = await supabaseAdmin.rpc("read_email_batch" as never, {
      queue_name: dlq,
      batch_size: batchSize,
      vt: 60,
    } as never);

    if (error) {
      stats.errors.push(`read ${dlq}: ${error.message}`);
      continue;
    }
    const messages = (data ?? []) as Array<{ msg_id: number; message: Record<string, unknown> }>;
    if (!messages.length) continue;

    for (const msg of messages as Array<{ msg_id: number; message: Record<string, unknown> }>) {
      const payload = { ...(msg.message ?? {}) } as Record<string, unknown>;
      const autoRetry = Number(payload.auto_retry_count ?? 0);

      if (autoRetry >= MAX_AUTO_RETRIES) {
        stats.dropped++;
        // Leave the message in DLQ for manual inspection; just release the VT
        // by NOT re-enqueueing or deleting. The next read after vt expires
        // will hit the same cap and skip again.
        continue;
      }

      payload.auto_retry_count = autoRetry + 1;
      payload.queued_at = new Date().toISOString();
      const newMessageId =
        typeof payload.message_id === "string" && payload.message_id
          ? payload.message_id
          : (crypto.randomUUID() as string);
      payload.message_id = newMessageId;

      const { error: sendErr } = await supabaseAdmin.rpc("enqueue_email" as never, {
        queue_name: live,
        payload: payload as never,
      } as never);

      if (sendErr) {
        stats.errors.push(`enqueue ${live}: ${sendErr.message}`);
        continue;
      }

      await supabaseAdmin.from("email_send_log" as never).insert({
        message_id: newMessageId,
        template_name: (payload.label as string) || live,
        recipient_email: (payload.to as string) ?? "",
        status: "pending",
      } as never);

      const { error: delErr } = await supabaseAdmin.rpc("delete_email" as never, {
        queue_name: dlq,
        message_id: msg.msg_id,
      } as never);
      if (delErr) {
        stats.errors.push(`delete ${dlq}#${msg.msg_id}: ${delErr.message}`);
      }
      stats.requeued++;
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
