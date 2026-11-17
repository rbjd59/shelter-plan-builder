import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import {
  businessTrustApprovalTermsSchema,
  businessTrustAttorneyTermsSchema,
  businessTrustDetails,
  trustDocumentLanguage,
} from "./business-trust";
import { languageNames } from "./business-trust-forms";

const reference = z.object({ id: z.string().uuid(), source: z.enum(["assessment", "app"]) });
const reviewInput = reference.extend({
  terms: businessTrustAttorneyTermsSchema,
  reviewNotes: z.string().max(12000).default(""),
});
const snapshotSchema = z.object({
  client: z.object({ full_name: z.string().nullable(), answers: z.unknown() }),
  file: z.record(z.unknown()),
});

type ReviewDocument = {
  id: string;
  title: string;
  content: string;
  review_status: string;
  review_notes: string | null;
  attorney_terms: unknown;
  attorney_reviewed_at: string | null;
  source_document_id: string | null;
  packet_input: unknown;
  created_at: string;
  assessment_id?: string;
  client_id?: string;
};

async function assertFirm(context: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "firm",
  });
  if (error || !data) throw new Error("Sign in with an authorized law-firm account.");
}

async function loadDocument(
  admin: SupabaseClient<Database>,
  data: z.infer<typeof reference>,
): Promise<ReviewDocument> {
  const columns =
    "id,title,content,review_status,review_notes,attorney_terms,attorney_reviewed_at,source_document_id,packet_input,created_at";
  const result =
    data.source === "assessment"
      ? await admin
          .from("assessment_documents")
          .select(`${columns},assessment_id`)
          .eq("id", data.id)
          .eq("document_type", "service_business_trust")
          .single()
      : await admin
          .from("client_documents")
          .select(`${columns},client_id`)
          .eq("id", data.id)
          .eq("document_type", "service_business_trust")
          .single();
  if (result.error || !result.data) throw new Error("Business trust draft not found.");
  return result.data as unknown as ReviewDocument;
}

function documentClientId(document: ReviewDocument, source: "assessment" | "app") {
  const id = source === "assessment" ? document.assessment_id : document.client_id;
  if (!id) throw new Error("The draft is not attached to a client file.");
  return id;
}

async function findApprovedDocument(
  admin: SupabaseClient<Database>,
  source: "assessment" | "app",
  sourceDocumentId: string,
): Promise<ReviewDocument | null> {
  const table = source === "assessment" ? "assessment_documents" : "client_documents";
  const { data, error } = await admin
    .from(table)
    .select(
      "id,title,content,review_status,review_notes,attorney_terms,attorney_reviewed_at,source_document_id,packet_input,created_at",
    )
    .eq("source_document_id", sourceDocumentId)
    .eq("document_type", "service_business_trust")
    .eq("review_status", "approved")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as unknown as ReviewDocument | null) ?? null;
}

export const getBusinessTrustReviewQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertFirm(context);
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const columns =
      "id,title,content,review_status,review_notes,attorney_terms,attorney_reviewed_at,source_document_id,packet_input,created_at";
    const [assessments, apps] = await Promise.all([
      admin
        .from("assessment_documents")
        .select(`${columns},assessment_id`)
        .eq("document_type", "service_business_trust")
        .is("source_document_id", null)
        .order("created_at", { ascending: false })
        .limit(100),
      admin
        .from("client_documents")
        .select(`${columns},client_id`)
        .eq("document_type", "service_business_trust")
        .is("source_document_id", null)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    if (assessments.error) throw new Error(assessments.error.message);
    if (apps.error) throw new Error(apps.error.message);
    const { loadServiceClient } = await import("./service-client.server");
    const rows = [
      ...(assessments.data ?? []).map((document) => ({
        document: document as unknown as ReviewDocument,
        source: "assessment" as const,
      })),
      ...(apps.data ?? []).map((document) => ({
        document: document as unknown as ReviewDocument,
        source: "app" as const,
      })),
    ];
    const result = await Promise.all(
      rows.map(async ({ document, source }) => {
        const clientId = documentClientId(document, source);
        const client = await loadServiceClient(clientId, source);
        const approved = await findApprovedDocument(admin, source, document.id);
        return {
          id: document.id,
          source,
          clientId,
          clientName: client.full_name ?? "Client",
          title: document.title,
          reviewStatus: document.review_status,
          reviewNotes: document.review_notes,
          createdAt: document.created_at,
          approvedDocumentId: approved?.id ?? null,
        };
      }),
    );
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });

export const getBusinessTrustReviewDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(reference)
  .handler(async ({ data, context }) => {
    await assertFirm(context);
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const document = await loadDocument(admin, data);
    const clientId = documentClientId(document, data.source);
    const { loadServiceClient } = await import("./service-client.server");
    const client = await loadServiceClient(clientId, data.source);
    const approved = await findApprovedDocument(admin, data.source, document.id);
    return {
      document: {
        id: document.id,
        title: document.title,
        pdfB64: document.content,
        reviewStatus: document.review_status,
        reviewNotes: document.review_notes ?? "",
        terms: businessTrustAttorneyTermsSchema.parse(document.attorney_terms ?? {}),
        hasFactSnapshot: snapshotSchema.safeParse(document.packet_input).success,
        createdAt: document.created_at,
      },
      approvedDocument: approved
        ? {
            id: approved.id,
            title: approved.title,
            pdfB64: approved.content,
            approvedAt: approved.attorney_reviewed_at,
          }
        : null,
      client: {
        id: clientId,
        name: client.full_name ?? "Client",
        language: trustDocumentLanguage(document.title, client.language),
      },
    };
  });

export const saveBusinessTrustReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(reviewInput.extend({ decision: z.enum(["save", "request_changes"]) }))
  .handler(async ({ data, context }) => {
    await assertFirm(context);
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const document = await loadDocument(admin, data);
    if (document.source_document_id)
      throw new Error("Review the original draft, not an issued packet.");
    if (await findApprovedDocument(admin, data.source, document.id))
      throw new Error(
        "This draft already has an approved packet. Prepare a new draft for changes.",
      );
    const reviewStatus =
      data.decision === "request_changes" ? "changes_requested" : "draft_pending_review";
    const table = data.source === "assessment" ? "assessment_documents" : "client_documents";
    const { error } = await admin
      .from(table)
      .update({
        review_status: reviewStatus,
        review_notes: data.reviewNotes || null,
        attorney_terms: data.terms,
        attorney_reviewed_at: null,
        attorney_reviewed_by: null,
      })
      .eq("id", document.id);
    if (error) throw new Error(error.message);
    const { error: auditError } = await admin.from("attorney_actions").insert({
      case_id: document.id,
      attorney_user_id: context.userId,
      action:
        data.decision === "request_changes"
          ? "business_trust_changes_requested"
          : "business_trust_review_saved",
      notes: data.reviewNotes || null,
      metadata: { source: data.source, clientId: documentClientId(document, data.source) },
    });
    if (auditError) throw new Error(auditError.message);
    return { ok: true, reviewStatus };
  });

export const approveBusinessTrustPacket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(reviewInput)
  .handler(async ({ data, context }) => {
    await assertFirm(context);
    const terms = businessTrustApprovalTermsSchema.parse(data.terms);
    const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
    const document = await loadDocument(admin, data);
    if (document.source_document_id)
      throw new Error("Approve the original draft, not an issued packet.");
    const table = data.source === "assessment" ? "assessment_documents" : "client_documents";
    const alreadyApproved = await findApprovedDocument(admin, data.source, document.id);
    if (alreadyApproved) {
      await admin.from(table).update({ review_status: "superseded" }).eq("id", document.id);
      return {
        approvedDocumentId: alreadyApproved.id,
        pdfB64: alreadyApproved.content,
        filename: "approved-business-trust-packet.pdf",
      };
    }
    const parsedSnapshot = snapshotSchema.safeParse(document.packet_input);
    if (!parsedSnapshot.success)
      throw new Error(
        "Prepare a fresh draft so the attorney can approve its saved client-fact snapshot.",
      );
    const client = {
      full_name: parsedSnapshot.data.client.full_name,
      answers: parsedSnapshot.data.client.answers,
    };
    const file = parsedSnapshot.data.file;
    const business = businessTrustDetails(client, file);
    const missing = [
      ["client name", client.full_name],
      ["business name", business.name],
      ["trust name", business.trustName],
      ["trustee", file.trustee],
      ["backup trustee", file.backupTrustee],
      ["beneficiaries", file.beneficiaries],
      ["business assets and ownership", business.assets],
    ].filter(([, value]) => typeof value !== "string" || !value.trim());
    if (missing.length)
      throw new Error(
        `Complete ${missing.map(([label]) => label).join(", ")} and prepare a fresh draft.`,
      );
    const clientId = documentClientId(document, data.source);
    const { loadServiceClient } = await import("./service-client.server");
    const currentClient = await loadServiceClient(clientId, data.source);
    const language = trustDocumentLanguage(document.title, currentClient.language);
    const approvedAt = new Date().toISOString();
    const { approvedBusinessTrustPacket } = await import("./service-packet.server");
    const bytes = await approvedBusinessTrustPacket(client, file, language, terms, approvedAt);
    const pdfB64 = Buffer.from(bytes).toString("base64");
    const insertValues = {
      title: `APPROVED business trust packet (${languageNames[language]}) [${language}]`,
      document_type: "service_business_trust",
      content: pdfB64,
      review_status: "approved",
      review_notes: data.reviewNotes || null,
      attorney_terms: terms,
      attorney_reviewed_at: approvedAt,
      attorney_reviewed_by: context.userId,
      source_document_id: document.id,
      packet_input: JSON.parse(JSON.stringify(parsedSnapshot.data)) as Json,
    };
    const inserted =
      data.source === "assessment"
        ? await admin
            .from("assessment_documents")
            .insert({ ...insertValues, assessment_id: clientId })
            .select("id")
            .single()
        : await admin
            .from("client_documents")
            .insert({
              ...insertValues,
              client_id: clientId,
              send_on_alert: false,
              from_app: false,
              ai_generated: false,
            })
            .select("id")
            .single();
    if (inserted.error || !inserted.data)
      throw new Error(inserted.error?.message ?? "Could not issue packet.");
    const { error: sourceError } = await admin
      .from(table)
      .update({
        review_status: "superseded",
        review_notes: data.reviewNotes || null,
        attorney_terms: terms,
        attorney_reviewed_at: approvedAt,
        attorney_reviewed_by: context.userId,
      })
      .eq("id", document.id);
    if (sourceError) throw new Error(sourceError.message);
    const { error: auditError } = await admin.from("attorney_actions").insert({
      case_id: document.id,
      attorney_user_id: context.userId,
      action: "business_trust_approved",
      notes: data.reviewNotes || null,
      metadata: {
        source: data.source,
        clientId,
        approvedDocumentId: inserted.data.id,
        language,
      },
    });
    if (auditError) throw new Error(auditError.message);
    return {
      approvedDocumentId: inserted.data.id,
      pdfB64,
      filename: `approved-business-trust-packet-${language}.pdf`,
    };
  });
