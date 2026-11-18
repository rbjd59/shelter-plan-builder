import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { vehicleEnrollmentInputSchema } from "./vehicle-rescue";

export const createVehicleEnrollment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => vehicleEnrollmentInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const { data: profile } = await context.supabase.from("profiles").select("email").eq("id", context.userId).single();
    const { data: client, error: clientError } = await admin
      .from("app_clients")
      .select("id,user_id,email,full_name,phone_e164,intake_session_id")
      .eq("intake_session_id", data.intakeSessionId)
      .single();
    if (clientError || !client) throw new Error("The vehicle must be attached to a completed client intake.");
    const accountEmail = profile?.email?.trim().toLowerCase();
    if ((client.user_id && client.user_id !== context.userId) || (!client.user_id && client.email?.trim().toLowerCase() !== accountEmail)) {
      throw new Error("This vehicle intake belongs to a different account.");
    }

    const { data: existing } = await admin.from("vehicle_rescue_enrollments").select("id,draft_document_id,user_id").eq("intake_session_id", data.intakeSessionId).maybeSingle();
    if (existing) {
      if (existing.user_id !== context.userId) throw new Error("This vehicle enrollment belongs to a different account.");
      if (!existing.draft_document_id) throw new Error("The saved vehicle packet is unavailable.");
      const { data: document } = await admin.from("client_documents").select("content").eq("id", existing.draft_document_id).eq("client_id", client.id).single();
      if (!document) throw new Error("The saved vehicle packet is unavailable.");
      return { enrollmentId: existing.id, documentId: existing.draft_document_id, pdfB64: document.content, filename: `vehicle-rescue-packet-${data.language}.pdf`, duplicate: true };
    }

    const { vehicleRescuePacket } = await import("./vehicle-packet.server");
    const bytes = await vehicleRescuePacket({ language: data.language, ownerName: data.ownerName, vehicle: data.vehicle });
    const pdfB64 = Buffer.from(bytes).toString("base64");
    const { data: enrollment, error: enrollmentError } = await admin.from("vehicle_rescue_enrollments").insert({
      intake_session_id: data.intakeSessionId,
      app_client_id: client.id,
      user_id: context.userId,
      language: data.language,
      owner_name: data.ownerName,
      vehicle_data: data.vehicle,
    }).select("id").single();
    if (enrollmentError || !enrollment) throw new Error(enrollmentError?.message ?? "Could not save vehicle enrollment.");
    const packetInput = { enrollmentId: enrollment.id, appClientId: client.id, ownerName: data.ownerName, language: data.language, vehicle: data.vehicle };
    const { data: document, error: documentError } = await admin.from("client_documents").insert({
      client_id: client.id,
      title: `Vehicle Rescue Packet [${data.language}]`,
      document_type: "service_vehicle_rescue",
      content: pdfB64,
      review_status: "draft_pending_review",
      packet_input: packetInput,
      send_on_alert: false,
      from_app: false,
      ai_generated: false,
    }).select("id").single();
    if (documentError || !document) throw new Error(documentError?.message ?? "Could not save the vehicle packet.");
    const { error: linkError } = await admin.from("vehicle_rescue_enrollments").update({ draft_document_id: document.id, updated_at: new Date().toISOString() }).eq("id", enrollment.id);
    if (linkError) throw new Error(linkError.message);

    let emailSent = false;
    let smsSent = false;
    try {
      const { notifyNewLead } = await import("./lead-notify.server");
      emailSent = await notifyNewLead(enrollment.id, {
        source: "vehicle-rescue",
        fullName: data.ownerName,
        phone: data.vehicle.contactPhone,
        email: accountEmail,
        need: `${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}`,
        city: data.vehicle.plateState,
        language: data.language,
      });
    } catch { console.error("Vehicle packet staff email failed", { enrollmentId: enrollment.id }); }
    try {
      const { sendSms } = await import("./twilio-sms.server");
      const { staffPhone } = await import("./live-chat-sms");
      const result = await sendSms({
        to: staffPhone(process.env.LIVE_CHAT_STAFF_PHONE),
        body: `DetencionDefensa vehicle packet (${data.language.toUpperCase()}): ${data.ownerName}, ${data.vehicle.year} ${data.vehicle.make} ${data.vehicle.model}. New packet awaiting attorney review. Ref ${enrollment.id.slice(0, 8)}`,
        purpose: "vehicle_rescue_enrollment",
        metadata: { enrollment_id: enrollment.id, client_id: client.id, document_id: document.id },
      });
      smsSent = result.ok;
    } catch { console.error("Vehicle packet staff SMS failed", { enrollmentId: enrollment.id }); }
    return { enrollmentId: enrollment.id, documentId: document.id, pdfB64, filename: `vehicle-rescue-packet-${data.language}.pdf`, emailSent, smsSent, duplicate: false };
  });

export const getCompanyVehicleEnrollments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Sign in with an approved staff account.");
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await admin.from("vehicle_rescue_enrollments")
      .select("id,app_client_id,owner_name,language,vehicle_data,review_status,draft_document_id,approved_document_id,created_at")
      .not("app_client_id", "is", null).order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMyVehiclePackets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const { data: enrollments, error } = await admin.from("vehicle_rescue_enrollments")
      .select("id,language,owner_name,vehicle_data,review_status,draft_document_id,approved_document_id,created_at")
      .eq("user_id", context.userId).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return Promise.all((enrollments ?? []).map(async (enrollment) => {
      const documentId = enrollment.approved_document_id ?? enrollment.draft_document_id;
      const { data: document } = documentId ? await admin.from("client_documents").select("content,review_status").eq("id", documentId).single() : { data: null };
      const vehicle = enrollment.vehicle_data as { year?: string; make?: string; model?: string };
      return {
        enrollmentId: enrollment.id,
        title: `${vehicle.year ?? ""} ${vehicle.make ?? ""} ${vehicle.model ?? ""}`.trim() || "Vehicle Rescue Packet",
        language: enrollment.language,
        approved: Boolean(enrollment.approved_document_id),
        reviewStatus: enrollment.review_status,
        pdfB64: document?.content ?? null,
      };
    }));
  });

export const downloadVehiclePacket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ enrollmentId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const { data: enrollment, error } = await admin.from("vehicle_rescue_enrollments").select("id,user_id,language,draft_document_id,approved_document_id").eq("id", data.enrollmentId).single();
    if (error || !enrollment || enrollment.user_id !== context.userId) throw new Error("Vehicle packet not found.");
    const documentId = enrollment.approved_document_id ?? enrollment.draft_document_id;
    if (!documentId) throw new Error("Vehicle packet not found.");
    const { data: document } = await admin.from("client_documents").select("content").eq("id", documentId).single();
    if (!document) throw new Error("Vehicle packet not found.");
    return { pdfB64: document.content, filename: `vehicle-rescue-packet-${enrollment.language}.pdf` };
  });
