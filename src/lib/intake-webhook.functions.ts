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

    let res: Response;
    try {
      res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-timestamp": timestamp,
          "x-webhook-signature": signature,
        },
        body: rawBody,
      });
    } catch (err) {
      throw new Error(`Could not reach intake webhook: ${(err as Error).message}`);
    }

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Intake webhook returned ${res.status}: ${text.slice(0, 300)}`);
    }

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`Intake webhook returned non-JSON: ${text.slice(0, 200)}`);
    }
    const parsed = ResponseSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error(`Unexpected webhook response shape: ${text.slice(0, 200)}`);
    }
    return {
      ok: parsed.data.ok ?? true,
      clientId: parsed.data.client_id ?? null,
      inviteCode: parsed.data.invite_code ?? null,
    };
  });
