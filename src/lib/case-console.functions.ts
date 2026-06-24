// Server functions for the office case console.
// Auth: requireSupabaseAuth + isOfficeStaff allowlist.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertOfficeStaff } from "@/lib/office-auth.server";
import { buildMailingLabelPdf } from "@/lib/mailing-label-pdf.server";
import { sendCaseStepSms } from "@/lib/sms-notifications.server";

const SIGNED_TTL = 60 * 60 * 24; // 1 day

async function notifyCaseStep(sessionId: string, step: 1 | 2 | 3): Promise<void> {
  try {
    const { data } = await supabaseAdmin
      .from("case_tracking")
      .select("contact_phone, language, inmate_name")
      .eq("intake_session_id", sessionId)
      .maybeSingle();
    const row = data as {
      contact_phone: string | null;
      language: string | null;
      inmate_name: string | null;
    } | null;
    if (!row?.contact_phone) return;
    await sendCaseStepSms({
      phone: row.contact_phone,
      language: row.language,
      inmateName: row.inmate_name,
      step,
      intakeSessionId: sessionId,
    });
  } catch (e) {
    console.error("[case-step-sms] failed", e);
  }
}

export type AnswerValue = string | number | boolean | null;
export interface CaseDetail {
  activation: {
    id: string;
    intake_session_id: string;
    role: string;
    fired_at: string;
    act_after: string;
    cancelled_at: string | null;
    family_notified_at: string | null;
    full_name: string | null;
    contact_email: string | null;
    alert_email: string | null;
    gps_lat: number | null;
    gps_lng: number | null;
    gps_raw: string | null;
    warden_name: string | null;
    facility_name: string | null;
    facility_address: string | null;
    date_of_arrest: string | null;
    a_number: string | null;
    office_notes: string | null;
    mailing_label_generated_at: string | null;
  };
  intake: {
    answers: Record<string, AnswerValue>;
    language: string;
  } | null;
  contacts: {
    contact_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    inmate_name: string | null;
    tracking_token: string | null;
  } | null;
  pdfs: { habeasUrl: string | null; ifpUrl: string | null };
}

function flattenAnswers(raw: unknown): Record<string, AnswerValue> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, AnswerValue> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (v == null) out[k] = null;
    else if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") out[k] = v;
    else out[k] = JSON.stringify(v);
  }
  return out;
}

export const getCaseDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ activation_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<CaseDetail> => {
    assertOfficeStaff(context.claims.email as string | undefined);

    const { data: act, error } = await supabaseAdmin
      .from("emergency_activations" as never)
      .select("*")
      .eq("id", data.activation_id)
      .single();
    if (error || !act) throw new Error("Activation not found");
    const sessionId = (act as { intake_session_id: string }).intake_session_id;

    const [{ data: intake }, { data: tracking }] = await Promise.all([
      supabaseAdmin
        .from("intake_submissions")
        .select("answers,language")
        .eq("stripe_session_id", sessionId)
        .maybeSingle(),
      supabaseAdmin
        .from("case_tracking")
        .select("contact_name,contact_email,contact_phone,inmate_name,tracking_token")
        .eq("intake_session_id", sessionId)
        .maybeSingle(),
    ]);

    // Signed PDF URLs
    const habeasPath = `${sessionId}/AO242-habeas-2241.pdf`;
    const ifpPath = `${sessionId}/AO240-in-forma-pauperis.pdf`;
    const [s1, s2] = await Promise.all([
      supabaseAdmin.storage.from("intake-forms").createSignedUrl(habeasPath, SIGNED_TTL),
      supabaseAdmin.storage.from("intake-forms").createSignedUrl(ifpPath, SIGNED_TTL),
    ]);

    return {
      activation: act as CaseDetail["activation"],
      intake: intake
        ? {
            answers: flattenAnswers((intake as { answers: unknown }).answers),
            language: (intake as { language: string }).language,
          }
        : null,
      contacts: (tracking as CaseDetail["contacts"]) ?? null,
      pdfs: { habeasUrl: s1.data?.signedUrl ?? null, ifpUrl: s2.data?.signedUrl ?? null },
    };
  });

const UpdateSchema = z.object({
  activation_id: z.string().uuid(),
  warden_name: z.string().max(200).optional().nullable(),
  facility_name: z.string().max(300).optional().nullable(),
  facility_address: z.string().max(1000).optional().nullable(),
  date_of_arrest: z.string().optional().nullable(),
  a_number: z.string().max(50).optional().nullable(),
  office_notes: z.string().max(4000).optional().nullable(),
});

export const updateCaseFields = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => UpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    assertOfficeStaff(context.claims.email as string | undefined);
    const { activation_id, ...patch } = data;
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      if (v !== undefined) cleaned[k] = v === "" ? null : v;
    }
    const { error } = await supabaseAdmin
      .from("emergency_activations" as never)
      .update(cleaned as never)
      .eq("id", activation_id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const generateMailingLabel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ activation_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    assertOfficeStaff(context.claims.email as string | undefined);
    const { data: row, error } = await supabaseAdmin
      .from("emergency_activations" as never)
      .select("*")
      .eq("id", data.activation_id)
      .single();
    if (error || !row) throw new Error("Activation not found");
    const a = row as Record<string, string | null>;

    const pdf = await buildMailingLabelPdf({
      inmateName: a.full_name || "(name)",
      aNumber: a.a_number,
      facilityName: a.facility_name,
      facilityAddress: a.facility_address,
      caseId: a.intake_session_id || data.activation_id,
    });

    const path = `${a.intake_session_id}/mailing-label-${data.activation_id}.pdf`;
    const up = await supabaseAdmin.storage
      .from("intake-forms")
      .upload(path, pdf, { contentType: "application/pdf", upsert: true });
    if (up.error) throw new Error(up.error.message);

    const nowIso = new Date().toISOString();
    await supabaseAdmin
      .from("emergency_activations" as never)
      .update({ mailing_label_generated_at: nowIso } as never)
      .eq("id", data.activation_id);

    // Auto-stamp tracking step 2 (forms mailed to detainee) when label generated.
    if (a.intake_session_id) {
      const { data: updated } = await supabaseAdmin
        .from("case_tracking")
        .update({ step2_sent_to_inmate_at: nowIso } as never)
        .eq("intake_session_id", a.intake_session_id)
        .is("step2_sent_to_inmate_at", null)
        .select("id");
      // Only notify if this update actually flipped the column (null -> now).
      if (updated && (updated as unknown as unknown[]).length > 0) {
        await notifyCaseStep(a.intake_session_id, 2);
      }
    }

    const sig = await supabaseAdmin.storage
      .from("intake-forms")
      .createSignedUrl(path, SIGNED_TTL);
    return { url: sig.data?.signedUrl ?? null };
  });

export const markCaseStep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      activation_id: z.string().uuid(),
      step: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      clear: z.boolean().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    assertOfficeStaff(context.claims.email as string | undefined);
    const { data: act, error: aerr } = await supabaseAdmin
      .from("emergency_activations" as never)
      .select("intake_session_id")
      .eq("id", data.activation_id)
      .single();
    if (aerr || !act) throw new Error("Activation not found");
    const sessionId = (act as { intake_session_id: string }).intake_session_id;

    const col =
      data.step === 1 ? "step1_received_at" :
      data.step === 2 ? "step2_sent_to_inmate_at" :
      "step3_sent_to_family_at";
    const value = data.clear ? null : new Date().toISOString();

    // Ensure tracking row exists
    const { data: existing } = await supabaseAdmin
      .from("case_tracking")
      .select("id")
      .eq("intake_session_id", sessionId)
      .maybeSingle();
    if (!existing) {
      await supabaseAdmin.from("case_tracking").insert({
        intake_session_id: sessionId,
        language: "es",
        [col]: value,
      } as never);
    } else {
      await supabaseAdmin
        .from("case_tracking")
        .update({ [col]: value } as never)
        .eq("intake_session_id", sessionId);
    }
    // Notify the family contact when a step is set (not when cleared).
    if (!data.clear) {
      await notifyCaseStep(sessionId, data.step);
    }
    return { ok: true as const };
  });

export const getCaseTrackingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ activation_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    assertOfficeStaff(context.claims.email as string | undefined);
    const { data: act } = await supabaseAdmin
      .from("emergency_activations" as never)
      .select("intake_session_id")
      .eq("id", data.activation_id)
      .single();
    if (!act) return { step1At: null, step2At: null, step3At: null, token: null as string | null };
    const sessionId = (act as { intake_session_id: string }).intake_session_id;
    const { data: row } = await supabaseAdmin
      .from("case_tracking")
      .select("tracking_token,step1_received_at,step2_sent_to_inmate_at,step3_sent_to_family_at")
      .eq("intake_session_id", sessionId)
      .maybeSingle();
    const r = row as {
      tracking_token: string | null;
      step1_received_at: string | null;
      step2_sent_to_inmate_at: string | null;
      step3_sent_to_family_at: string | null;
    } | null;
    return {
      step1At: r?.step1_received_at ?? null,
      step2At: r?.step2_sent_to_inmate_at ?? null,
      step3At: r?.step3_sent_to_family_at ?? null,
      token: r?.tracking_token ?? null,
    };
  });

export interface CaseListItem {
  id: string;
  intake_session_id: string;
  fired_at: string;
  act_after: string;
  cancelled_at: string | null;
  family_notified_at: string | null;
  role: string;
  full_name: string | null;
  facility_name: string | null;
}

export const listRecentActivations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CaseListItem[]> => {
    assertOfficeStaff(context.claims.email as string | undefined);
    const { data, error } = await supabaseAdmin
      .from("emergency_activations" as never)
      .select(
        "id,intake_session_id,fired_at,act_after,cancelled_at,family_notified_at,role,full_name,facility_name",
      )
      .order("fired_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []) as CaseListItem[];
  });

export const checkOfficeAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = (context.claims.email as string | undefined) ?? null;
    const { isOfficeStaff } = await import("@/lib/office-auth.server");
    return { email, isOffice: isOfficeStaff(email) };
  });
