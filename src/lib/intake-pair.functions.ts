import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PAIR_URL = "https://ice-defense-plan.replit.app/api/intake/pair";

const AnswersSchema = z.record(z.string(), z.union([z.string(), z.boolean()]));

const InputSchema = z.object({
  answers: AnswersSchema,
  intakeSessionId: z.string().optional(),
});

function s(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "boolean") return v ? "yes" : "no";
  return String(v).trim();
}

function splitName(full: string): { first: string; last: string } {
  const t = full.trim();
  if (!t) return { first: "", last: "" };
  const parts = t.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function buildPayload(a: Record<string, string | boolean>) {
  const { first, last } = splitName(s(a.full_name));
  return {
    firstName: first,
    lastName: last,
    dateOfBirth: s(a.dob),
    aNumber: s(a.a_number),
    countryOfOrigin: s(a.country_of_citizenship),
    contact1: {
      name: s(a.emergency_contact_name),
      phone: s(a.emergency_contact_phone),
      email: s(a.emergency_contact_email),
      relation: s(a.emergency_contact_relation),
    },
    contact2: {
      name: s(a.contact_name),
      phone: s(a.contact_phone),
      email: s(a.contact_email),
      relation: s(a.contact_relation),
    },
    intakeAnswers: {
      warden_name: s(a.warden_name),
      warden_title: s(a.warden_title),
      facility_name: s(a.facility_name),
      facility_address: s(a.facility_address),
      ifp_employer: s(a.ifp_employer),
      ifp_monthly_pay: s(a.ifp_monthly_pay),
      ifp_cash_on_hand: s(a.ifp_cash_on_hand),
      ifp_property: s(a.ifp_property),
      ifp_monthly_expenses: s(a.ifp_monthly_expenses),
      ifp_dependents: s(a.ifp_dependents),
      ifp_debts: s(a.ifp_debts),
      ifp_other_income: s(a.ifp_other_income),
      other_names_used: s(a.other_names_used),
      date_taken_into_custody: s(a.date_taken_into_custody),
      detainer_date: s(a.detainer_date),
      prior_immigration_proceedings: s(a.prior_immigration_proceedings),
      ground_one: s(a.ground_one),
      ground_two: s(a.ground_two),
      relief_requested: s(a.relief_requested),
      booking_number: s(a.booking_number),
    },
  };
}

const ResponseSchema = z.object({
  success: z.boolean().optional(),
  code: z.string(),
  expiresAt: z.union([z.string(), z.number()]).optional(),
});

async function logBackup(row: {
  intake_session_id?: string;
  payload: unknown;
  code?: string | null;
  expires_at?: string | null;
  http_status?: number | null;
  error_message?: string | null;
}) {
  try {
    await supabaseAdmin.from("intake_pair_logs").insert({
      intake_session_id: row.intake_session_id ?? null,
      payload: row.payload as object,
      code: row.code ?? null,
      expires_at: row.expires_at ?? null,
      http_status: row.http_status ?? null,
      error_message: row.error_message ?? null,
    });
  } catch (e) {
    console.error("[intake-pair] backup log failed", e);
  }
}

export const pairIntakeWithApp = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const payload = buildPayload(data.answers);

    let res: Response;
    try {
      res = await fetch(PAIR_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      const msg = (err as Error).message;
      await logBackup({
        intake_session_id: data.intakeSessionId,
        payload,
        error_message: `network: ${msg}`,
      });
      throw new Error(`Could not reach pairing service: ${msg}`);
    }

    const text = await res.text();
    if (!res.ok) {
      await logBackup({
        intake_session_id: data.intakeSessionId,
        payload,
        http_status: res.status,
        error_message: text.slice(0, 500),
      });
      throw new Error(
        `Pairing service returned ${res.status}: ${text.slice(0, 300)}`,
      );
    }

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      await logBackup({
        intake_session_id: data.intakeSessionId,
        payload,
        http_status: res.status,
        error_message: `non-JSON: ${text.slice(0, 300)}`,
      });
      throw new Error(`Pairing service returned non-JSON: ${text.slice(0, 200)}`);
    }

    const parsed = ResponseSchema.safeParse(json);
    if (!parsed.success) {
      await logBackup({
        intake_session_id: data.intakeSessionId,
        payload,
        http_status: res.status,
        error_message: `bad shape: ${text.slice(0, 300)}`,
      });
      throw new Error(
        `Unexpected response shape from pairing service: ${text.slice(0, 200)}`,
      );
    }

    const expiresAt =
      parsed.data.expiresAt != null ? String(parsed.data.expiresAt) : null;

    await logBackup({
      intake_session_id: data.intakeSessionId,
      payload,
      code: parsed.data.code,
      expires_at: expiresAt,
      http_status: res.status,
    });

    return {
      code: parsed.data.code,
      expiresAt,
    };
  });
