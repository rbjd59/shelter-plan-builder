import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { retryDlqEmails, resendIntakeForSubmission } from "./email-retry.server";

async function assertAdmin(userId: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Not authorized");
  const { data: u } = await supabaseAdmin.auth.admin.getUserById(userId);
  return u?.user?.email ?? userId;
}

// List the latest email_send_log row per message_id, filtered to recent failures.
export const listFailedEmails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data, error } = await supabaseAdmin
      .from("email_send_log")
      .select("id, message_id, template_name, recipient_email, status, error_message, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) throw new Error(error.message);
    // Dedupe by message_id keeping latest status.
    const latest = new Map<string, typeof data[number]>();
    for (const row of data ?? []) {
      const key = row.message_id ?? `row-${row.id}`;
      if (!latest.has(key)) latest.set(key, row);
    }
    const rows = Array.from(latest.values()).filter(
      (r) => r.status === "failed" || r.status === "dlq",
    );
    return { rows };
  });

// Trigger an immediate DLQ drain (same logic the cron uses).
export const manualRetryDlq = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const stats = await retryDlqEmails(50);
    return stats;
  });

// Resend full intake notification (internal recipients and/or family welcome).
export const resendIntakeEmails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      submissionId: z.string().min(1),
      scope: z.enum(["all", "internal", "welcome"]).default("all"),
    }).parse,
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    return await resendIntakeForSubmission({ submissionId: data.submissionId, scope: data.scope });
  });
