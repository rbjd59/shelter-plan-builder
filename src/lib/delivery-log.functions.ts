import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const STEP_ORDER = [
  "board_registration",
  "contacts_synced",
  "documents_generated",
  "staff_notification_email",
  "activation_email",
  "activation_sms",
  "partner_webhook",
  "mobile_delivery",
] as const;

export interface DeliveryRow {
  id: string;
  intake_session_id: string | null;
  client_id: string | null;
  activation_code: string | null;
  step: string;
  status: string;
  target: string | null;
  error_message: string | null;
  duration_ms: number | null;
  created_at: string;
  /** JSON-encoded for safe transport. */
  metadata: string | null;
}

export interface DeliveryCase {
  key: string;
  intakeSessionId: string | null;
  activationCode: string | null;
  clientName: string | null;
  activatedAt: string | null;
  firstSeen: string;
  lastSeen: string;
  failures: number;
  rows: DeliveryRow[];
  missingSteps: string[];
}

export const listIntakeDeliveryLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        onlyFailures: z.boolean().optional(),
        step: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(1000).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { data: role } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!role) throw new Error("Not authorized");

    let query = supabaseAdmin
      .from("intake_delivery_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 400);

    if (data.onlyFailures) query = query.eq("status", "failed");
    if (data.step) query = query.eq("step", data.step);
    if (data.search && data.search.trim()) {
      const s = data.search.trim();
      query = query.or(
        `activation_code.ilike.%${s}%,intake_session_id.ilike.%${s}%,target.ilike.%${s}%`,
      );
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    const list = ((rows ?? []) as unknown as Array<Record<string, unknown>>).map((r) => ({
      ...r,
      metadata:
        r.metadata && Object.keys(r.metadata as object).length
          ? JSON.stringify(r.metadata)
          : null,
    })) as unknown as DeliveryRow[];

    // Enrich with mobile delivery (activation on the phone) from app_clients
    const codes = Array.from(
      new Set(list.map((r) => r.activation_code).filter(Boolean) as string[]),
    );
    const clientsByCode = new Map<
      string,
      { full_name: string | null; activated_at: string | null }
    >();
    if (codes.length) {
      const { data: clients } = await supabaseAdmin
        .from("app_clients")
        .select("invite_token, full_name, activated_at")
        .in("invite_token", codes);
      for (const c of clients ?? []) {
        clientsByCode.set((c as any).invite_token, {
          full_name: (c as any).full_name ?? null,
          activated_at: (c as any).activated_at ?? null,
        });
      }
    }

    const grouped = new Map<string, DeliveryCase>();
    for (const row of list) {
      const key = row.intake_session_id ?? row.activation_code ?? row.id;
      let entry = grouped.get(key);
      if (!entry) {
        entry = {
          key,
          intakeSessionId: row.intake_session_id,
          activationCode: row.activation_code,
          clientName: null,
          activatedAt: null,
          firstSeen: row.created_at,
          lastSeen: row.created_at,
          failures: 0,
          rows: [],
          missingSteps: [],
        };
        grouped.set(key, entry);
      }
      entry.rows.push(row);
      if (!entry.activationCode && row.activation_code) entry.activationCode = row.activation_code;
      if (row.created_at < entry.firstSeen) entry.firstSeen = row.created_at;
      if (row.created_at > entry.lastSeen) entry.lastSeen = row.created_at;
      if (row.status === "failed") entry.failures += 1;
    }

    const cases = Array.from(grouped.values()).map((c) => {
      const client = c.activationCode ? clientsByCode.get(c.activationCode) : undefined;
      c.clientName = client?.full_name ?? null;
      c.activatedAt = client?.activated_at ?? null;
      const seen = new Set(c.rows.map((r) => r.step));
      c.missingSteps = STEP_ORDER.filter(
        (s) => s !== "partner_webhook" && s !== "mobile_delivery" && !seen.has(s),
      );
      c.rows.sort((a, b) => a.created_at.localeCompare(b.created_at));
      return c;
    });
    cases.sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));

    const totals = {
      events: list.length,
      failed: list.filter((r) => r.status === "failed").length,
      skipped: list.filter((r) => r.status === "skipped").length,
      cases: cases.length,
    };

    return { cases, totals, steps: STEP_ORDER as unknown as string[] };
  });
