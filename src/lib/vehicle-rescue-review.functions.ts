import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { vehicleIntakeSchema } from "./vehicle-rescue";

const reference = z.object({ id: z.string().uuid() });
const reviewInput = reference.extend({ reviewerName: z.string().trim().min(2).max(200), reviewNotes: z.string().trim().max(12000).default("") });
const snapshotSchema = z.object({ enrollmentId: z.string().uuid(), appClientId: z.string().uuid(), ownerName: z.string(), language: z.enum(["en","es","ht"]), vehicle: vehicleIntakeSchema });
async function assertFirm(context: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "firm" });
  if (error || !data) throw new Error("Sign in with an authorized law-firm account.");
}
async function loadDocument(admin: SupabaseClient<Database>, id: string) {
  const { data, error } = await admin.from("client_documents").select("id,client_id,title,content,review_status,review_notes,packet_input,created_at,source_document_id").eq("id", id).eq("document_type", "service_vehicle_rescue").single();
  if (error || !data) throw new Error("Vehicle packet not found.");
  return data;
}
async function approvedFor(admin: SupabaseClient<Database>, sourceId: string) {
  const { data } = await admin.from("client_documents").select("id,title,content,attorney_reviewed_at").eq("source_document_id", sourceId).eq("document_type", "service_vehicle_rescue").eq("review_status", "approved").order("created_at", { ascending: false }).limit(1).maybeSingle();
  return data;
}

export const getVehicleReviewQueue = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await assertFirm(context);
  const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await admin.from("client_documents").select("id,client_id,title,review_status,created_at,source_document_id").eq("document_type", "service_vehicle_rescue").is("source_document_id", null).order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error(error.message);
  const clientIds = [...new Set((data ?? []).map((row) => row.client_id))];
  const { data: clients } = clientIds.length ? await admin.from("app_clients").select("id,full_name").in("id", clientIds) : { data: [] };
  return Promise.all((data ?? []).map(async (row) => ({
    id: row.id,
    clientId: row.client_id,
    clientName: clients?.find((client) => client.id === row.client_id)?.full_name ?? "Client",
    title: row.title,
    reviewStatus: row.review_status,
    createdAt: row.created_at,
    approvedDocumentId: (await approvedFor(admin, row.id))?.id ?? null,
  })));
});

export const getVehicleReviewDocument = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(reference).handler(async ({ data, context }) => {
  await assertFirm(context);
  const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
  const document = await loadDocument(admin, data.id);
  const approved = await approvedFor(admin, document.id);
  const snapshot = snapshotSchema.safeParse(document.packet_input);
  return {
    document: { id: document.id, title: document.title, pdfB64: document.content, reviewStatus: document.review_status, reviewNotes: document.review_notes ?? "", hasFactSnapshot: snapshot.success, createdAt: document.created_at },
    approvedDocument: approved ? { id: approved.id, title: approved.title, pdfB64: approved.content, approvedAt: approved.attorney_reviewed_at } : null,
  };
});

export const saveVehicleReview = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(reviewInput.extend({ decision: z.enum(["save","request_changes"]) })).handler(async ({ data, context }) => {
  await assertFirm(context);
  const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
  const document = await loadDocument(admin, data.id);
  if (document.source_document_id) throw new Error("Review the original draft, not an issued packet.");
  if (await approvedFor(admin, document.id)) throw new Error("This draft already has an approved packet.");
  const reviewStatus = data.decision === "request_changes" ? "changes_requested" : "draft_pending_review";
  const { error } = await admin.from("client_documents").update({ review_status: reviewStatus, review_notes: data.reviewNotes || null }).eq("id", document.id);
  if (error) throw new Error(error.message);
  await admin.from("vehicle_rescue_enrollments").update({ review_status: reviewStatus, updated_at: new Date().toISOString() }).eq("draft_document_id", document.id);
  await admin.from("attorney_actions").insert({ case_id: document.id, attorney_user_id: context.userId, action: data.decision === "request_changes" ? "vehicle_rescue_changes_requested" : "vehicle_rescue_review_saved", notes: data.reviewNotes || null, metadata: { clientId: document.client_id } });
  return { ok: true, reviewStatus };
});

export const approveVehiclePacket = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(reviewInput).handler(async ({ data, context }) => {
  await assertFirm(context);
  const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
  const document = await loadDocument(admin, data.id);
  if (document.source_document_id) throw new Error("Approve the original draft, not an issued packet.");
  const already = await approvedFor(admin, document.id);
  if (already) return { approvedDocumentId: already.id, pdfB64: already.content, filename: "approved-vehicle-rescue-packet.pdf" };
  const parsed = snapshotSchema.safeParse(document.packet_input);
  if (!parsed.success) throw new Error("Prepare a fresh draft with a saved client-fact snapshot.");
  const { data: enrollment } = await admin.from("vehicle_rescue_enrollments").select("id").eq("id", parsed.data.enrollmentId).eq("draft_document_id", document.id).eq("app_client_id", document.client_id).single();
  if (!enrollment) throw new Error("The packet is not linked to its vehicle enrollment.");
  const approvedAt = new Date().toISOString();
  const { vehicleRescuePacket } = await import("./vehicle-packet.server");
  const bytes = await vehicleRescuePacket({ language: parsed.data.language, ownerName: parsed.data.ownerName, vehicle: parsed.data.vehicle, approved: true, reviewerName: data.reviewerName, approvedAt });
  const pdfB64 = Buffer.from(bytes).toString("base64");
  const { data: inserted, error } = await admin.from("client_documents").insert({
    client_id: document.client_id,
    title: `APPROVED Vehicle Rescue Packet [${parsed.data.language}]`,
    document_type: "service_vehicle_rescue",
    content: pdfB64,
    review_status: "approved",
    review_notes: data.reviewNotes || null,
    attorney_reviewed_at: approvedAt,
    attorney_reviewed_by: context.userId,
    source_document_id: document.id,
    packet_input: document.packet_input,
    attorney_terms: { reviewerName: data.reviewerName },
    send_on_alert: false,
    from_app: false,
    ai_generated: false,
  }).select("id").single();
  if (error || !inserted) throw new Error(error?.message ?? "Could not issue approved packet.");
  const { error: sourceError } = await admin.from("client_documents").update({ review_status: "superseded", review_notes: data.reviewNotes || null, attorney_reviewed_at: approvedAt, attorney_reviewed_by: context.userId }).eq("id", document.id);
  if (sourceError) throw new Error(sourceError.message);
  const { error: enrollmentError } = await admin.from("vehicle_rescue_enrollments").update({ review_status: "approved", approved_document_id: inserted.id, updated_at: approvedAt }).eq("id", enrollment.id);
  if (enrollmentError) throw new Error(enrollmentError.message);
  await admin.from("attorney_actions").insert({ case_id: document.id, attorney_user_id: context.userId, action: "vehicle_rescue_approved", notes: data.reviewNotes || null, metadata: { clientId: document.client_id, approvedDocumentId: inserted.id, enrollmentId: enrollment.id } });
  return { approvedDocumentId: inserted.id, pdfB64, filename: `approved-vehicle-rescue-packet-${parsed.data.language}.pdf` };
});
