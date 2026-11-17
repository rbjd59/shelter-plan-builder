import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { score } from "./score";
import type { Answers } from "./questions";
import { parseAssessmentLead, type AssessmentLeadInput } from "./lead";

export const submitAssessmentLead = createServerFn({ method: "POST" })
  .inputValidator((d: AssessmentLeadInput) => parseAssessmentLead(d))
  .handler(async ({ data }) => {
    const { createLead } = await import("../leads.server");
    return createLead({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      language: data.language,
      need: "Homepage questionnaire",
      message: data.next === "videos" ? "Chose to watch Save My Home and Save My Business before answering questions." : "Started the homepage questionnaire.",
      source: "homepage-assessment",
    });
  });

type Input = { language: string; answers: Answers; help: string[]; signedName: string };
type ScheduleInput = { assessmentId: string; accessToken: string; kind: "home" | "business"; appointmentAt: string };

async function hashToken(token: string) {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

function newAccessToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const submitAssessment = createServerFn({ method: "POST" })
  .inputValidator((d: Input) => {
    if (!d || typeof d.answers !== "object" || JSON.stringify(d).length > 100_000) throw new Error("Invalid");
    if (typeof d.signedName !== "string" || d.signedName.trim().length < 2) throw new Error("Signature needed");
    return {
      language: String(d.language).slice(0, 5),
      answers: d.answers,
      help: (d.help ?? []).map(String).slice(0, 200),
      signedName: d.signedName.trim().slice(0, 120),
    };
  })
  .handler(async ({ data }) => {
    const { isRateLimited, logAttempt } = await import("../abuse-guard.server");
    const request = getRequest();
    if (await isRateLimited({ step: "assessment_submit", request, max: 5, windowMinutes: 15 })) {
      await logAttempt({ step: "assessment_submit", status: "rate_limited", request });
      throw new Error("Too many tries. Please wait 15 minutes and try again.");
    }
    await logAttempt({ step: "assessment_submit", status: "started", request });
    const { lookupPropertyEstimate } = await import("./property.server");
    const propertyEstimate = await lookupPropertyEstimate(data.answers);
    const scoredAnswers: Answers = {
      ...data.answers,
      ...(propertyEstimate.value !== null ? { estimatedValue: String(propertyEstimate.value) } : {}),
    };
    const results = score(scoredAnswers);
    const callAt = new Date(Date.now() + 2 * 24 * 3600 * 1000);
    const accessToken = newAccessToken();
    const accessTokenHash = await hashToken(accessToken);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const s = (k: string) => typeof scoredAnswers[k] === "string" ? String(scoredAnswers[k]).slice(0, 500) : null;
    const { data: inserted, error } = await supabaseAdmin.from("assessments").insert({
      language: data.language,
      full_name: s("name"),
      phone: s("phone"),
      email: s("email"),
      answers: scoredAnswers as never,
      results: results as never,
      help_requested: data.help,
      authorization_signed_name: data.signedName,
      authorization_signed_at: new Date().toISOString(),
      paralegal_call_at: callAt.toISOString(),
      access_token_hash: accessTokenHash,
      property_estimate: propertyEstimate as never,
    }).select("id").single();
    if (error || !inserted) {
      console.error("Could not save assessment", error?.message);
      throw new Error("Could not save. Please try again.");
    }

    let familyPacketReady = false;
    try {
      const { buildAssessmentFamilyPacket } = await import("./family-packet.server");
      const bytes = await buildAssessmentFamilyPacket(scoredAnswers, s("name") ?? data.signedName);
      const { error: packetError } = await supabaseAdmin.from("assessment_documents").insert({
        assessment_id: inserted.id,
        title: "Family forms packet — draft for attorney review",
        document_type: "family_forms_packet",
        content: Buffer.from(bytes).toString("base64"),
        review_status: "draft_pending_review",
      });
      if (packetError) console.error("Could not save family packet", packetError.message);
      else familyPacketReady = true;
    } catch (packetError) {
      console.error("Could not build family packet", packetError);
    }

    return {
      assessmentId: inserted.id,
      accessToken,
      results,
      callAt: callAt.toISOString(),
      propertyEstimate,
      familyPacketReady,
    };
  });

export const scheduleAssessment = createServerFn({ method: "POST" })
  .inputValidator((d: ScheduleInput) => {
    if (!/^[0-9a-f-]{36}$/i.test(d.assessmentId) || !/^[0-9a-f]{64}$/i.test(d.accessToken)) throw new Error("Invalid scheduling link");
    if (!["home", "business"].includes(d.kind)) throw new Error("Invalid appointment type");
    const when = new Date(d.appointmentAt);
    if (!Number.isFinite(when.getTime()) || when.getTime() < Date.now() || when.getTime() > Date.now() + 90 * 24 * 3600 * 1000) throw new Error("Choose a future date");
    return d;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: assessment } = await supabaseAdmin.from("assessments").select("id, access_token_hash").eq("id", data.assessmentId).maybeSingle();
    if (!assessment || assessment.access_token_hash !== await hashToken(data.accessToken)) throw new Error("This scheduling link is not valid");
    const column = data.kind === "home" ? "home_appointment_at" : "business_appointment_at";
    const { error } = await supabaseAdmin.from("assessments").update({ [column]: new Date(data.appointmentAt).toISOString() } as never).eq("id", data.assessmentId);
    if (error) throw new Error("Could not save the appointment. Please try again.");
    return { ok: true, appointmentAt: new Date(data.appointmentAt).toISOString() };
  });
