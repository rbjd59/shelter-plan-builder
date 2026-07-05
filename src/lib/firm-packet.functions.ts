// Attorney document packet — server functions powering the /firm/packet/$id
// route: seed a fully-populated demo case, list every document in the
// packet, preview each PDF, and email the entire bundle (as signed URLs)
// to the signed-in attorney.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const FORMS_BUCKET = "intake-forms";
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7;

async function assertFirmOrAdmin(userId: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["firm", "admin"])
    .maybeSingle();
  if (!data) throw new Error("Not authorized");
}

// ---------- Demo case fixture ----------

const DEMO_SESSION_ID = "demo-juan-hernandez-001";
const DEMO_TOKEN = "DEMO0001";

const DEMO_ANSWERS: Record<string, unknown> = {
  // Personal
  full_name: "Juan Demo Hernández",
  other_names_used: "Juan H.",
  date_of_birth: "1987-04-12",
  place_of_birth: "Tegucigalpa, Honduras",
  country_of_origin: "Honduras",
  country_of_citizenship: "Honduras",
  language: "es",
  a_number: "A123-456-789",

  // Contact (family)
  contact_name: "María Hernández",
  contact_relation: "spouse",
  contact_email: "maria.demo@example.com",
  contact_phone: "+13055550199",
  contact_address: "1234 SW 8th St\nMiami, FL 33135",

  // Detention
  date_taken_into_custody: "2026-05-15",
  facility_name: "Krome North Service Processing Center",
  facility_address: "18201 SW 12th St\nMiami, FL 33194",
  warden_name: "ICE Field Office Director",
  warden_title: "Field Office Director, Miami",
  booking_number: "KR-2026-0815",

  // Mailing
  mail_inmate_name: "Juan Demo Hernández",
  mail_inmate_number: "A123-456-789",
  mail_current_location: "Krome North Service Processing Center",
  mail_facility_address: "18201 SW 12th St\nMiami, FL 33194",

  // Emergency contacts
  emergency_contact_name: "María Hernández",
  emergency_contact_phone: "+13055550199",
  emergency_contact_email: "maria.demo@example.com",
  emergency_contact_relation: "spouse",
  emergency_contact_2_name: "Pastor Luis Ramírez",
  emergency_contact_2_phone: "+13055550144",
  emergency_contact_2_email: "pastor.luis@example.com",
  emergency_contact_2_relation: "pastor",

  // Case narrative
  years_in_us: "11 years",
  community_ties:
    "U.S. citizen spouse (María Hernández) and two U.S. citizen children (ages 6 and 9) " +
    "residing in Miami-Dade County; active member of Iglesia Cristiana Vida Nueva for 8 years.",
  employer:
    "Sunshine Roofing LLC — full-time crew lead since 2019, supervisor letter of support on file.",
  criminal_history: "None.",
  prior_immigration_proceedings:
    "Petitioner was placed in removal proceedings on May 17, 2026 following an ICE home arrest. " +
    "Petitioner has not received an individualized bond hearing.",
  ground_one:
    "Continued detention without an individualized bond hearing violates the Due Process Clause of the Fifth Amendment.",
  ground_two:
    "Petitioner is not subject to mandatory detention under 8 U.S.C. § 1226(c) and is neither a flight risk nor a danger to the community.",
  relief_requested:
    "Issue a writ of habeas corpus; order immediate release or, in the alternative, an individualized bond hearing.",
  filing_district: "Southern District of Florida",
  federal_district: "Southern District of Florida",
};

export const seedDummyCase = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ intakeSessionId: string; clientId: string | null }> => {
    await assertFirmOrAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const sid = DEMO_SESSION_ID;

    // 1) intake_submissions — upsert by stripe_session_id
    await supabaseAdmin
      .from("intake_submissions")
      .upsert(
        {
          stripe_session_id: sid,
          email: String(DEMO_ANSWERS.contact_email),
          language: "es",
          paid: true,
          answers: DEMO_ANSWERS as never,
        } as never,
        { onConflict: "stripe_session_id" } as never,
      );

    // 2) case_tracking — upsert by intake_session_id
    const { data: existingCase } = await supabaseAdmin
      .from("case_tracking")
      .select("intake_session_id")
      .eq("intake_session_id", sid)
      .maybeSingle();
    if (!existingCase) {
      await supabaseAdmin
        .from("case_tracking")
        .insert({
          intake_session_id: sid,
          contact_email: String(DEMO_ANSWERS.contact_email),
          contact_phone: String(DEMO_ANSWERS.contact_phone),
          contact_name: String(DEMO_ANSWERS.contact_name),
          inmate_name: String(DEMO_ANSWERS.full_name),
          language: "es",
        } as never);
    }

    // 3) legal_retainers — only insert if none exists
    const { data: existingRetainer } = await supabaseAdmin
      .from("legal_retainers")
      .select("id")
      .eq("intake_session_id", sid)
      .maybeSingle();
    if (!existingRetainer) {
      await supabaseAdmin.from("legal_retainers").insert({
        intake_session_id: sid,
        version: "v1.0-demo",
        language: "es",
        signed_name: String(DEMO_ANSWERS.contact_name),
        body_snapshot: "DEMO RETAINER — Limited-scope engagement for habeas review.",
        ip: "127.0.0.1",
        user_agent: "demo-seed",
      } as never);
    }

    // 4) app_clients — upsert by invite_token
    const { data: existingClient } = await supabaseAdmin
      .from("app_clients")
      .select("id")
      .eq("invite_token", DEMO_TOKEN)
      .maybeSingle();
    let clientId: string | null = (existingClient as { id: string } | null)?.id ?? null;
    if (!clientId) {
      const { data: inserted } = await supabaseAdmin
        .from("app_clients")
        .insert({
          invite_token: DEMO_TOKEN,
          full_name: String(DEMO_ANSWERS.full_name),
          email: String(DEMO_ANSWERS.contact_email),
          phone_e164: String(DEMO_ANSWERS.contact_phone),
          place_of_birth: String(DEMO_ANSWERS.place_of_birth),
          country_of_origin: String(DEMO_ANSWERS.country_of_origin),
          language: "es",
          intake_session_id: sid,
        } as never)
        .select("id")
        .single();
      clientId = (inserted as { id: string } | null)?.id ?? null;
    }

    return { intakeSessionId: sid, clientId };
  });

// ---------- Packet builder ----------

type PacketDocKey =
  | "memorandum"
  | "ao242"
  | "ao240"
  | "js44"
  | "motion_referral"
  | "mailing_label";

type PacketDoc = {
  key: PacketDocKey;
  label: string;
  filename: string;
  description: string;
};

const PACKET: PacketDoc[] = [
  {
    key: "memorandum",
    label: "Memorandum of Law",
    filename: "Memorandum-of-Law.pdf",
    description:
      "Brief in support of the § 2241 habeas petition. Generated from intake answers; bracketed placeholders flag any facts the attorney still needs to fill in.",
  },
  {
    key: "ao242",
    label: "AO 242 — Petition for Writ of Habeas Corpus",
    filename: "AO242-habeas-2241.pdf",
    description: "Official U.S. Courts AO 242 form, pre-filled.",
  },
  {
    key: "ao240",
    label: "AO 240 — Application to Proceed In Forma Pauperis",
    filename: "AO240-in-forma-pauperis.pdf",
    description: "Official U.S. Courts AO 240 (blank; petitioner fills at filing).",
  },
  {
    key: "js44",
    label: "JS-44 — Civil Cover Sheet",
    filename: "JS44-civil-cover.pdf",
    description: "Federal civil cover sheet.",
  },
  {
    key: "motion_referral",
    label: "Motion for Referral to Volunteer Attorney Program",
    filename: "SDFL-Motion-Referral.pdf",
    description: "SDFL motion referral.",
  },
  {
    key: "mailing_label",
    label: "Mailing Label — Detention Facility",
    filename: "Mailing-Label.pdf",
    description: "USPS-style mailing label for the inmate package.",
  },
];

async function loadAnswers(sid: string): Promise<Record<string, unknown>> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("intake_submissions")
    .select("answers")
    .eq("stripe_session_id", sid)
    .maybeSingle();
  const ans = (data as { answers?: Record<string, unknown> } | null)?.answers;
  return ans && typeof ans === "object" ? ans : {};
}

async function buildPdfFor(
  key: PacketDocKey,
  answers: Record<string, unknown>,
  opts?: { aiNarrative?: import("@/lib/ai-legal-drafts.server").MemoNarrative; aiModel?: string; skipWatermark?: boolean },
): Promise<Uint8Array> {
  let bytes: Uint8Array;
  switch (key) {
    case "memorandum": {
      const { buildMemorandumOfLawPdf } = await import("@/lib/email/memorandum-of-law.server");
      bytes = await buildMemorandumOfLawPdf(
        answers,
        opts?.aiNarrative
          ? {
              statement_of_facts: opts.aiNarrative.statement_of_facts,
              community_ties_argument: opts.aiNarrative.community_ties_argument,
              dangerousness_rebuttal: opts.aiNarrative.dangerousness_rebuttal,
              aiModel: opts.aiModel,
            }
          : undefined,
      );
      break;
    }
    case "ao242": {
      const { buildIntakePdfs } = await import("@/lib/email/intake-pdfs.server");
      const r = await buildIntakePdfs(answers);
      bytes = r.habeas;
      break;
    }
    case "ao240": {
      const { buildIntakePdfs } = await import("@/lib/email/intake-pdfs.server");
      const r = await buildIntakePdfs(answers);
      bytes = r.ifp;
      break;
    }
    case "js44": {
      const { buildJs44Pdf } = await import("@/lib/email/js44.server");
      bytes = await buildJs44Pdf(answers);
      break;
    }
    case "motion_referral": {
      const { buildMotionReferralPdf } = await import("@/lib/email/motion-referral.server");
      bytes = await buildMotionReferralPdf(answers);
      break;
    }
    case "mailing_label": {
      const { buildMailingLabelPdf } = await import("@/lib/mailing-label-pdf.server");
      bytes = await buildMailingLabelPdf({
        inmateName: String(answers.mail_inmate_name ?? answers.full_name ?? ""),
        aNumber: answers.mail_inmate_number ? String(answers.mail_inmate_number) : null,
        facilityName: String(answers.mail_current_location ?? answers.facility_name ?? ""),
        facilityAddress: String(answers.mail_facility_address ?? answers.facility_address ?? ""),
        caseId: "DEMO",
      });
      break;
    }
  }

  if (!opts?.skipWatermark) {
    const { applyDraftWatermark } = await import("@/lib/pdf-watermark.server");
    bytes = await applyDraftWatermark(bytes);
  }
  return bytes;
}

// Per-request cache so a single packet build doesn't call GPT-5 six times.
async function getAiNarrativeForSession(
  sid: string,
  answers: Record<string, unknown>,
): Promise<{ narrative?: import("@/lib/ai-legal-drafts.server").MemoNarrative; model?: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: existing } = await supabaseAdmin
    .from("client_documents")
    .select("content, ai_model, ai_generated")
    .eq("stripe_session_id", sid)
    .eq("document_type", "memorandum_ai_narrative")
    .maybeSingle();
  if (existing && (existing as { content: string }).content) {
    try {
      const parsed = JSON.parse((existing as { content: string }).content);
      return { narrative: parsed, model: (existing as { ai_model?: string }).ai_model ?? undefined };
    } catch {
      /* fall through and regenerate */
    }
  }

  const { generateMemoNarrative } = await import("@/lib/ai-legal-drafts.server");
  const { narrative, model, ok } = await generateMemoNarrative(answers);
  if (ok) {
    await supabaseAdmin.from("client_documents").insert({
      client_id: null as never,
      title: "AI narrative cache — memorandum of law",
      document_type: "memorandum_ai_narrative",
      content: JSON.stringify(narrative),
      ai_generated: true,
      ai_model: model,
      review_status: "draft_pending_review",
      stripe_session_id: sid,
      send_on_alert: false,
    } as never);
  }
  return { narrative, model };
}


export const getPacketManifest = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { intakeSessionId: string }) => {
    if (!data.intakeSessionId) throw new Error("Missing intakeSessionId");
    return data;
  })
  .handler(async ({ data, context }) => {
    await assertFirmOrAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: c } = await supabaseAdmin
      .from("case_tracking")
      .select("intake_session_id, contact_name, contact_email, inmate_name, language, step1_received_at")
      .eq("intake_session_id", data.intakeSessionId)
      .maybeSingle();
    return { case: c, docs: PACKET };
  });

export const previewPacketDoc = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { intakeSessionId: string; docKey: PacketDocKey }) => {
    if (!data.intakeSessionId) throw new Error("Missing intakeSessionId");
    if (!PACKET.some((d) => d.key === data.docKey)) throw new Error("Invalid docKey");
    return data;
  })
  .handler(async ({ data, context }): Promise<{ filename: string; base64: string }> => {
    await assertFirmOrAdmin(context.userId);
    const answers = await loadAnswers(data.intakeSessionId);
    const ai = data.docKey === "memorandum"
      ? await getAiNarrativeForSession(data.intakeSessionId, answers)
      : {};
    const bytes = await buildPdfFor(data.docKey, answers, {
      aiNarrative: ai.narrative,
      aiModel: ai.model,
    });
    const meta = PACKET.find((d) => d.key === data.docKey)!;
    const base64 = Buffer.from(bytes).toString("base64");
    return { filename: meta.filename, base64 };
  });


export const emailPacketToMe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { intakeSessionId: string; toEmail?: string }) => {
    if (!data.intakeSessionId) throw new Error("Missing intakeSessionId");
    return data;
  })
  .handler(async ({ data, context }): Promise<{ ok: true; to: string; sent: number }> => {
    await assertFirmOrAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const sid = data.intakeSessionId;
    const to =
      data.toEmail?.trim() ||
      (context.claims as { email?: string }).email ||
      "";
    if (!to || !/.+@.+\..+/.test(to)) throw new Error("No email on file for attorney account");

    const answers = await loadAnswers(sid);
    const ai = await getAiNarrativeForSession(sid, answers);

    // Build all PDFs in parallel, upload to private bucket, sign URLs.
    const built = await Promise.all(
      PACKET.map(async (d) => ({
        d,
        bytes: await buildPdfFor(d.key, answers, {
          aiNarrative: d.key === "memorandum" ? ai.narrative : undefined,
          aiModel: d.key === "memorandum" ? ai.model : undefined,
        }),
      })),
    );

    const signed: Array<{ label: string; url: string | null; filename: string }> = [];
    for (const { d, bytes } of built) {
      const path = `${sid}/packet/${d.filename}`;
      const up = await supabaseAdmin.storage
        .from(FORMS_BUCKET)
        .upload(path, bytes, { contentType: "application/pdf", upsert: true });
      if (up.error) {
        signed.push({ label: d.label, url: null, filename: d.filename });
        continue;
      }
      const sg = await supabaseAdmin.storage.from(FORMS_BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
      signed.push({ label: d.label, url: sg.data?.signedUrl ?? null, filename: d.filename });
    }

    const escape = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const links = signed
      .map((s) =>
        s.url
          ? `<p style="margin:0 0 8px;"><a href="${s.url}" style="color:#0a58ca;font-size:14px;">${escape(s.label)}</a></p>`
          : `<p style="margin:0 0 8px;color:#a40000;">${escape(s.label)} (build failed)</p>`,
      )
      .join("");
    const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111;max-width:640px;margin:0 auto;padding:24px;">
      <h1 style="font-size:18px;margin:0 0 6px;">Attorney Document Packet</h1>
      <p style="font-size:13px;color:#555;margin:0 0 14px;">Case session: ${escape(sid)}</p>
      <div style="border:1px solid #d0d7de;border-radius:8px;padding:16px;background:#f6f8fa;">${links}</div>
      <p style="font-size:11px;color:#777;margin-top:14px;">Signed links expire in 7 days. Generated by DetencionDefensa for ${escape(to)}.</p>
    </body></html>`;
    const text = `Attorney Document Packet — ${sid}\n\n${signed
      .map((s) => `${s.label}: ${s.url ?? "(unavailable)"}`)
      .join("\n")}`;

    // Reuse the transactional email queue.
    let unsub: string | null = null;
    const { data: existing } = await supabaseAdmin
      .from("email_unsubscribe_tokens" as never)
      .select("token")
      .eq("email", to)
      .maybeSingle();
    if (existing && (existing as { token: string }).token) {
      unsub = (existing as { token: string }).token;
    } else {
      unsub = crypto.randomUUID();
      await supabaseAdmin
        .from("email_unsubscribe_tokens" as never)
        .insert({ email: to, token: unsub } as never);
    }

    const messageId = crypto.randomUUID();
    await supabaseAdmin.from("email_send_log" as never).insert({
      message_id: messageId,
      template_name: "firm-packet",
      recipient_email: to,
      status: "pending",
    } as never);
    const { error } = await supabaseAdmin.rpc("enqueue_email" as never, {
      queue_name: "transactional_emails",
      payload: {
        to,
        from: "intake@gohomesooner.com",
        sender_domain: "notify.gohomesooner.com",
        subject: `Attorney Document Packet — ${sid}`,
        html,
        text,
        purpose: "transactional",
        label: "firm-packet",
        idempotency_key: `firm-packet-${sid}-${messageId}`,
        message_id: messageId,
        unsubscribe_token: unsub,
        queued_at: new Date().toISOString(),
      } as never,
    } as never);
    if (error) throw new Error(`Email enqueue failed: ${error.message}`);

    return { ok: true, to, sent: signed.filter((s) => s.url).length };
  });

// ---------- Approve & release, regenerate AI narrative ----------

export const getPacketReviewStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { intakeSessionId: string }) => {
    if (!data.intakeSessionId) throw new Error("Missing intakeSessionId");
    return data;
  })
  .handler(async ({ data, context }) => {
    await assertFirmOrAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: intake } = await supabaseAdmin
      .from("intake_submissions")
      .select("packet_status, packet_generated_at, packet_released_at, packet_released_by")
      .eq("stripe_session_id", data.intakeSessionId)
      .maybeSingle();
    const { data: aiRow } = await supabaseAdmin
      .from("client_documents")
      .select("ai_model, review_status, attorney_reviewed_at, created_at")
      .eq("stripe_session_id", data.intakeSessionId)
      .eq("document_type", "memorandum_ai_narrative")
      .maybeSingle();
    return {
      packet: intake ?? { packet_status: "pending" },
      aiNarrative: aiRow ?? null,
    };
  });

export const regenerateAiNarrative = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { intakeSessionId: string }) => {
    if (!data.intakeSessionId) throw new Error("Missing intakeSessionId");
    return data;
  })
  .handler(async ({ data, context }) => {
    await assertFirmOrAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Clear cached narrative so the next build regenerates it.
    await supabaseAdmin
      .from("client_documents")
      .delete()
      .eq("stripe_session_id", data.intakeSessionId)
      .eq("document_type", "memorandum_ai_narrative");
    const answers = await loadAnswers(data.intakeSessionId);
    const { generateMemoNarrative } = await import("@/lib/ai-legal-drafts.server");
    const { narrative, model, ok, error } = await generateMemoNarrative(answers);
    if (ok) {
      await supabaseAdmin.from("client_documents").insert({
        client_id: null as never,
        title: "AI narrative cache — memorandum of law",
        document_type: "memorandum_ai_narrative",
        content: JSON.stringify(narrative),
        ai_generated: true,
        ai_model: model,
        review_status: "draft_pending_review",
        stripe_session_id: data.intakeSessionId,
        send_on_alert: false,
      } as never);
    }
    return { ok, model, error: error ?? null };
  });

export const approveAndReleasePacket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { intakeSessionId: string; notes?: string }) => {
    if (!data.intakeSessionId) throw new Error("Missing intakeSessionId");
    return data;
  })
  .handler(async ({ data, context }) => {
    await assertFirmOrAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();

    await supabaseAdmin
      .from("intake_submissions")
      .update({
        packet_status: "attorney_approved",
        packet_released_at: now,
        packet_released_by: context.userId,
      } as never)
      .eq("stripe_session_id", data.intakeSessionId);

    await supabaseAdmin
      .from("client_documents")
      .update({
        review_status: "attorney_approved",
        attorney_reviewed_at: now,
        attorney_reviewed_by: context.userId,
        review_notes: data.notes ?? null,
      } as never)
      .eq("stripe_session_id", data.intakeSessionId);

    // Mark firm earnings row (if any) as reviewed — attorney's own transfer
    // from IOLTA to operating is manual outside this system.
    await supabaseAdmin
      .from("firm_earnings")
      .update({
        reviewed_at: now,
        reviewed_by: context.userId,
      } as never)
      .eq("stripe_session_id", data.intakeSessionId)
      .is("reviewed_at", null);

    return { ok: true, releasedAt: now };
  });
