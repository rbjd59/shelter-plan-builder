import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHmac } from "crypto";

const WEBHOOK_URL =
  process.env.INTAKE_WEBHOOK_URL ||
  "https://bynibqfcjsmugcjaaaho.supabase.co/functions/v1/intake-webhook";

const AnswersSchema = z.record(z.string(), z.union([z.string(), z.boolean()]));

const InputSchema = z.object({
  answers: AnswersSchema,
  intakeSessionId: z.string().min(1),
  language: z.string().optional(),
  paymentStatus: z.string().optional(),
  paymentAmount: z.number().optional(),
});

function s(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "boolean") return v ? "yes" : "no";
  return String(v).trim();
}

function splitName(full: string): { first: string; middle: string; last: string } {
  const t = full.trim();
  if (!t) return { first: "", middle: "", last: "" };
  const parts = t.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], middle: "", last: "" };
  if (parts.length === 2) return { first: parts[0], middle: "", last: parts[1] };
  return {
    first: parts[0],
    middle: parts.slice(1, -1).join(" "),
    last: parts[parts.length - 1],
  };
}

const LANG_LABEL: Record<string, string> = { en: "English", es: "Spanish", ht: "Haitian Creole" };

function buildBody(input: z.infer<typeof InputSchema>) {
  const a = input.answers;
  const fullName = s(a.full_name);
  const { first, middle, last } = splitName(fullName);
  const langCode = (input.language || "en").toLowerCase();
  const prefLang = LANG_LABEL[langCode] || langCode;

  return {
    event_id: input.intakeSessionId,
    intake_session_id: input.intakeSessionId,
    client: {
      full_name: fullName,
      first_name: first,
      middle_name: middle,
      last_name: last,
      date_of_birth: s(a.dob),
      country_of_birth: s(a.country_of_citizenship),
      a_number: s(a.a_number),
      phone: s(a.contact_phone),
      email: s(a.contact_email),
      preferred_language: prefLang,
      languages_spoken: [prefLang].filter(Boolean),
      address: s(a.mail_current_location) || s(a.facility_address),
    },
    emergency_contacts: [
      {
        full_name: s(a.emergency_contact_name),
        relationship: s(a.emergency_contact_relation),
        phone: s(a.emergency_contact_phone),
        email: s(a.emergency_contact_email),
        is_primary: true,
        notify_on_detention: true,
      },
    ].filter((c) => c.full_name || c.phone || c.email),
    payment: {
      status: input.paymentStatus || "paid",
      amount: input.paymentAmount ?? 199,
    },
    language: langCode,
  };
}

const ResponseSchema = z.object({
  ok: z.boolean().optional(),
  client_id: z.string().optional(),
  invite_code: z.string().optional(),
});

type LogRow = {
  endpoint: string;
  intake_session_id: string | null;
  request_timestamp: string | null;
  status_code: number | null;
  ok: boolean;
  error_kind: string | null;
  error_message: string | null;
  response_snippet: string | null;
  duration_ms: number | null;
};

async function logAttempt(row: LogRow) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("webhook_send_log").insert(row);
  } catch (e) {
    console.error("[intake-webhook] failed to write log row", e);
  }
}

export const notifyIntakeWebhook = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const secret = process.env.INTAKE_WEBHOOK_SECRET;
    if (!secret) throw new Error("INTAKE_WEBHOOK_SECRET is not configured");

    const body = buildBody(data);
    const rawBody = JSON.stringify(body);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = createHmac("sha256", secret)
      .update(`${timestamp}.${rawBody}`)
      .digest("hex");

    const startedAt = Date.now();
    let res: Response;
    try {
      const anonKey =
        process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "";
      res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-timestamp": timestamp,
          "x-webhook-signature": signature,
          ...(anonKey ? { Authorization: `Bearer ${anonKey}`, apikey: anonKey } : {}),
        },
        body: rawBody,
      });
    } catch (err) {
      const msg = (err as Error).message;
      await logAttempt({
        endpoint: WEBHOOK_URL,
        intake_session_id: data.intakeSessionId,
        request_timestamp: timestamp,
        status_code: null,
        ok: false,
        error_kind: "network",
        error_message: msg,
        response_snippet: null,
        duration_ms: Date.now() - startedAt,
      });
      throw new Error(`Could not reach intake webhook: ${msg}`);
    }

    const text = await res.text();
    const duration = Date.now() - startedAt;
    const snippet = text.slice(0, 500);

    if (!res.ok) {
      // Classify 401 (signature/timestamp rejected) distinctly.
      const kind =
        res.status === 401
          ? "signature_rejected"
          : res.status >= 500
            ? "server_error"
            : "http_error";
      await logAttempt({
        endpoint: WEBHOOK_URL,
        intake_session_id: data.intakeSessionId,
        request_timestamp: timestamp,
        status_code: res.status,
        ok: false,
        error_kind: kind,
        error_message: `Webhook returned ${res.status}`,
        response_snippet: snippet,
        duration_ms: duration,
      });
      console.warn(
        `[intake-webhook] verification/HTTP failure status=${res.status} kind=${kind} session=${data.intakeSessionId} ts=${timestamp} body=${snippet}`,
      );
      throw new Error(`Intake webhook returned ${res.status}: ${snippet.slice(0, 300)}`);
    }

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      await logAttempt({
        endpoint: WEBHOOK_URL,
        intake_session_id: data.intakeSessionId,
        request_timestamp: timestamp,
        status_code: res.status,
        ok: false,
        error_kind: "invalid_response_json",
        error_message: "Non-JSON response",
        response_snippet: snippet,
        duration_ms: duration,
      });
      throw new Error(`Intake webhook returned non-JSON: ${snippet.slice(0, 200)}`);
    }
    const parsed = ResponseSchema.safeParse(json);
    if (!parsed.success) {
      await logAttempt({
        endpoint: WEBHOOK_URL,
        intake_session_id: data.intakeSessionId,
        request_timestamp: timestamp,
        status_code: res.status,
        ok: false,
        error_kind: "invalid_response_shape",
        error_message: parsed.error.message,
        response_snippet: snippet,
        duration_ms: duration,
      });
      throw new Error(`Unexpected webhook response shape: ${snippet.slice(0, 200)}`);
    }

    await logAttempt({
      endpoint: WEBHOOK_URL,
      intake_session_id: data.intakeSessionId,
      request_timestamp: timestamp,
      status_code: res.status,
      ok: true,
      error_kind: null,
      error_message: null,
      response_snippet: snippet,
      duration_ms: duration,
    });

    const inviteCode = parsed.data.invite_code ?? null;
    const clientId = parsed.data.client_id ?? null;
    console.info(
      `[invite-code] webhook_response session=${data.intakeSessionId} ok=${parsed.data.ok ?? true} client_id=${clientId ?? "null"} invite_code=${inviteCode ?? "MISSING"} invite_code_len=${inviteCode?.length ?? 0} duration_ms=${duration}`,
    );
    if (!inviteCode) {
      const keys = json && typeof json === "object" ? Object.keys(json as object).join(",") : "(non-object)";
      console.warn(
        `[invite-code] MISSING invite_code in webhook response session=${data.intakeSessionId} response_keys=${keys} snippet=${snippet.slice(0, 200)}`,
      );
    }

    return {
      ok: parsed.data.ok ?? true,
      clientId,
      inviteCode,
    };
  });

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listWebhookSendLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { onlyFailures?: boolean; limit?: number; errorKind?: string } | undefined) => ({
      onlyFailures: input?.onlyFailures ?? false,
      limit: Math.min(Math.max(input?.limit ?? 100, 1), 500),
      errorKind: input?.errorKind && input.errorKind !== "" ? input.errorKind : null,
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Not authorized");
    let q = supabaseAdmin
      .from("webhook_send_log")
      .select(
        "id, created_at, endpoint, intake_session_id, request_timestamp, status_code, ok, error_kind, error_message, response_snippet, duration_ms",
      )
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.onlyFailures) q = q.eq("ok", false);
    if (data.errorKind) q = q.eq("error_kind", data.errorKind);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const listInviteCodeStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { limit?: number } | undefined) => ({
    limit: Math.min(Math.max(input?.limit ?? 100, 1), 500),
  }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: role } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) throw new Error("Not authorized");

    // Pull recent webhook attempts; we derive invite_code from response_snippet.
    const { data: hookRows, error: hookErr } = await supabaseAdmin
      .from("webhook_send_log")
      .select("id, created_at, intake_session_id, ok, status_code, error_kind, response_snippet")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (hookErr) throw new Error(hookErr.message);

    // Latest attempt per session.
    const bySession = new Map<
      string,
      {
        session_id: string;
        webhook_at: string;
        webhook_ok: boolean;
        webhook_status: number | null;
        webhook_error_kind: string | null;
        invite_code: string | null;
        client_id: string | null;
        raw_snippet: string | null;
      }
    >();
    for (const r of hookRows ?? []) {
      if (!r.intake_session_id || bySession.has(r.intake_session_id)) continue;
      let invite_code: string | null = null;
      let client_id: string | null = null;
      if (r.response_snippet) {
        try {
          const j = JSON.parse(r.response_snippet) as { invite_code?: string; client_id?: string };
          invite_code = j.invite_code ?? null;
          client_id = j.client_id ?? null;
        } catch {
          /* non-JSON snippet (error body) */
        }
      }
      bySession.set(r.intake_session_id, {
        session_id: r.intake_session_id,
        webhook_at: r.created_at,
        webhook_ok: r.ok,
        webhook_status: r.status_code,
        webhook_error_kind: r.error_kind,
        invite_code,
        client_id,
        raw_snippet: r.response_snippet,
      });
    }

    const sessionIds = Array.from(bySession.keys());
    if (sessionIds.length === 0) return { rows: [] };

    const { data: intakes, error: intakeErr } = await supabaseAdmin
      .from("intake_submissions")
      .select("stripe_session_id, answers, email, language, updated_at, created_at")
      .in("stripe_session_id", sessionIds);
    if (intakeErr) throw new Error(intakeErr.message);

    type Row = {
      session_id: string;
      recipient_email: string;
      recipient_role: "client" | "family" | "emergency" | "stripe";
      language: string | null;
      invite_code: string | null;
      activation_block: "defensasiempre_deeplink" | "pwa_install_fallback" | "no_activation_block";
      webhook_at: string;
      webhook_ok: boolean;
      webhook_status: number | null;
      webhook_error_kind: string | null;
      intake_updated_at: string | null;
      client_id: string | null;
      raw_snippet: string | null;
    };
    const rows: Row[] = [];

    for (const intake of intakes ?? []) {
      const sid = (intake as { stripe_session_id: string }).stripe_session_id;
      const hook = bySession.get(sid);
      if (!hook) continue;
      const a = ((intake as { answers: Record<string, unknown> | null }).answers ?? {}) as Record<
        string,
        unknown
      >;
      const stripeEmail = (intake as { email: string | null }).email;
      const language = (intake as { language: string | null }).language ?? null;
      const updated_at =
        (intake as { updated_at: string | null }).updated_at ??
        (intake as { created_at: string | null }).created_at ??
        null;

      const recipients: Array<{ email: string; role: Row["recipient_role"] }> = [];
      const contactEmail = typeof a.contact_email === "string" ? a.contact_email : null;
      const emergencyEmail =
        typeof a.emergency_contact_email === "string" ? a.emergency_contact_email : null;
      if (contactEmail) recipients.push({ email: contactEmail.toLowerCase(), role: "family" });
      if (emergencyEmail && emergencyEmail.toLowerCase() !== contactEmail?.toLowerCase())
        recipients.push({ email: emergencyEmail.toLowerCase(), role: "emergency" });
      if (
        stripeEmail &&
        !recipients.some((r) => r.email === stripeEmail.toLowerCase())
      )
        recipients.push({ email: stripeEmail.toLowerCase(), role: "stripe" });

      if (recipients.length === 0) {
        recipients.push({ email: "(no recipient on file)", role: "client" });
      }

      const block: Row["activation_block"] = hook.invite_code
        ? "defensasiempre_deeplink"
        : "pwa_install_fallback";

      for (const rcp of recipients) {
        rows.push({
          session_id: sid,
          recipient_email: rcp.email,
          recipient_role: rcp.role,
          language,
          invite_code: hook.invite_code,
          activation_block: block,
          webhook_at: hook.webhook_at,
          webhook_ok: hook.webhook_ok,
          webhook_status: hook.webhook_status,
          webhook_error_kind: hook.webhook_error_kind,
          intake_updated_at: updated_at,
          client_id: hook.client_id,
          raw_snippet: hook.raw_snippet,
        });
      }
    }

    rows.sort((a, b) => (a.webhook_at < b.webhook_at ? 1 : -1));
    return { rows };
  });
