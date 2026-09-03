// Server-only helpers for re-sending emails.
//
// Email now goes out synchronously through Lovable's managed email delivery,
// which owns retries, backoff and rate limiting. The old dead-letter queues
// (auth_emails_dlq / transactional_emails_dlq) no longer exist, so there is
// nothing to drain: retryDlqEmails() is kept only so the hourly cron route and
// the admin "retry" button keep working, and it reports that no queue exists.
//
// - resendIntakeForSubmission(): re-runs enqueueIntakeNotification for a given
//   intake_submissions row, optionally scoped to internal / welcome / all.

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { enqueueIntakeNotification } from "@/lib/email/intake-notification.server";

export interface RetryStats {
  requeued: number;
  dropped: number;
  errors: string[];
}

export async function retryDlqEmails(_batchSize = 25): Promise<RetryStats> {
  // Managed delivery: failed sends are retried by Lovable automatically and a
  // permanently rejected send shows up in the platform email logs. Individual
  // messages can be re-sent from their own feature (e.g. "Resend activation").
  return { requeued: 0, dropped: 0, errors: [] };
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
