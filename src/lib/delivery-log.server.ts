/**
 * Intake delivery log — server-only.
 *
 * Records every step of the intake handoff (board registration, staff email,
 * activation email, activation SMS, document generation, mobile delivery) with
 * a timestamp, the target it went to, success/failure and the failure reason.
 *
 * Logging must NEVER break the pipeline: every helper swallows its own errors.
 */
import { createClient } from "@supabase/supabase-js";

export type DeliveryStep =
  | "board_registration"
  | "contacts_synced"
  | "documents_generated"
  | "staff_notification_email"
  | "activation_email"
  | "activation_sms"
  | "partner_webhook"
  | "mobile_delivery";

export type DeliveryStatus = "success" | "failed" | "skipped";

export interface DeliveryLogEntry {
  intakeSessionId?: string | null;
  clientId?: string | null;
  activationCode?: string | null;
  step: DeliveryStep;
  status: DeliveryStatus;
  /** Email address, phone number, endpoint, or other destination. */
  target?: string | null;
  errorMessage?: string | null;
  metadata?: Record<string, unknown>;
  durationMs?: number | null;
}

function admin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function logDelivery(entry: DeliveryLogEntry): Promise<void> {
  try {
    await admin()
      .from("intake_delivery_log")
      .insert({
        intake_session_id: entry.intakeSessionId ?? null,
        client_id: entry.clientId ?? null,
        activation_code: entry.activationCode ?? null,
        step: entry.step,
        status: entry.status,
        target: entry.target ?? null,
        error_message: entry.errorMessage ? String(entry.errorMessage).slice(0, 2000) : null,
        metadata: entry.metadata ?? {},
        duration_ms: entry.durationMs ?? null,
      } as never);
  } catch (e) {
    console.error("[delivery-log] insert failed", e);
  }
}

/**
 * Runs `fn`, logging one success or failure row with its duration.
 * Re-throws nothing — returns `{ ok, value, error }` so callers stay resilient.
 */
export async function trackDelivery<T>(
  base: Omit<DeliveryLogEntry, "status" | "durationMs">,
  fn: () => Promise<T>,
): Promise<{ ok: boolean; value?: T; error?: string }> {
  const started = Date.now();
  try {
    const value = await fn();
    await logDelivery({ ...base, status: "success", durationMs: Date.now() - started });
    return { ok: true, value };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    await logDelivery({
      ...base,
      status: "failed",
      errorMessage: error,
      durationMs: Date.now() - started,
    });
    return { ok: false, error };
  }
}
