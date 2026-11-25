import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  businessFileSchema,
  isTrustDocument,
  normalizeBusinessTrustLanguage,
  trustDocumentLanguage,
} from "./business-trust";
import { BUSINESS_TRUST_LANGUAGES, languageNames } from "./business-trust-forms";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
const reference = z.object({ id: z.string().uuid(), source: z.enum(["assessment", "app"]) });
async function staff(context: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data)
    throw new Error("Sign in with an approved staff account to manage this file.");
}
export const getServiceFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(reference)
  .handler(async ({ data, context }) => {
    await staff(context);
    const { loadServiceClient } = await import("./service-client.server");
    const client = await loadServiceClient(data.id, data.source);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: callbacks, error } = await supabaseAdmin
      .from("service_callbacks")
      .select("*")
      .eq(data.source === "assessment" ? "assessment_id" : "app_client_id", data.id)
      .order("starts_at");
    if (error) throw new Error(error.message);
    const documents =
      data.source === "assessment"
        ? await supabaseAdmin
            .from("assessment_documents")
            .select(
              "id,title,review_status,review_notes,attorney_reviewed_at,source_document_id,created_at,document_type",
            )
            .eq("assessment_id", data.id)
            .in("document_type", ["service_trust", "service_business_trust", "service_vehicle_rescue"])
            .order("created_at", { ascending: false })
        : await supabaseAdmin
            .from("client_documents")
            .select(
              "id,title,review_status,review_notes,attorney_reviewed_at,source_document_id,created_at,document_type",
            )
            .eq("client_id", data.id)
            .in("document_type", ["service_trust", "service_business_trust", "service_vehicle_rescue"])
            .order("created_at", { ascending: false });
    if (documents.error) throw new Error(documents.error.message);
    const { data: vehicleEnrollments, error: vehicleError } = await supabaseAdmin
      .from("vehicle_rescue_enrollments")
      .select("id,owner_name,language,vehicle_data,review_status,draft_document_id,approved_document_id,created_at")
      .eq(data.source === "assessment" ? "assessment_id" : "app_client_id", data.id)
      .order("created_at", { ascending: false });
    if (vehicleError) throw new Error(vehicleError.message);
    return { client, callbacks: callbacks ?? [], trustDocuments: documents.data, vehicleEnrollments: vehicleEnrollments ?? [] };
  });
const fileSchema = z.object({
  notes: z.string().max(12000).default(""),
  trustName: z.string().max(200).default(""),
  trustee: z.string().max(200).default(""),
  backupTrustee: z.string().max(200).default(""),
  beneficiaries: z.string().max(3000).default(""),
  legalDescription: z.string().max(4000).default(""),
  authorizedPerson: z.string().max(200).default(""),
  providerOrder: z.string().max(500).default(""),
  titleOrder: z.string().max(500).default(""),
  business: businessFileSchema,
  checklist: z.record(z.enum(["missing", "requested", "received", "reviewed"])).default({}),
});
export const saveServiceFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(reference.extend({ file: fileSchema }))
  .handler(async ({ data, context }) => {
    await staff(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from(data.source === "assessment" ? "assessments" : "app_clients")
      .update({ service_file: data.file })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const addServiceCallback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    reference.extend({
      title: z.string().min(2).max(200),
      startsAt: z.string().datetime(),
      timezone: z.string().max(60).default("America/New_York"),
      paralegalEmail: z.string().email().max(254),
      notes: z.string().max(3000).default(""),
    }),
  )
  .handler(async ({ data, context }) => {
    await staff(context);
    if (Date.parse(data.startsAt) <= Date.now()) throw new Error("Choose a future date and time.");
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: data.timezone }).format();
    } catch {
      throw new Error("Choose a valid time zone.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: callback, error } = await supabaseAdmin
      .from("service_callbacks")
      .insert({
        assessment_id: data.source === "assessment" ? data.id : null,
        app_client_id: data.source === "app" ? data.id : null,
        title: data.title,
        starts_at: data.startsAt,
        timezone: data.timezone,
        paralegal_email: data.paralegalEmail,
        notes: data.notes,
      })
      .select("id")
      .single();
    if (error || !callback) throw new Error(error?.message ?? "Could not save call");
    const { loadServiceClient } = await import("./service-client.server");
    const client = await loadServiceClient(data.id, data.source);
    let confirmation: "sent" | "suppressed" | "failed" | "no_email" = "no_email";
    if (client.email) {
      try {
        const { sendTemplateEmail } = await import("./email-templates/send-email");
        const language = client.language ?? "en";
        const title =
          language === "es"
            ? "Su llamada está programada"
            : language === "ht"
              ? "Apèl ou a pwograme"
              : "Your call is scheduled";
        const time = new Date(data.startsAt).toLocaleString(
          language === "ht" ? "fr-HT" : language === "es" ? "es-US" : "en-US",
          { timeZone: data.timezone },
        );
        const result = await sendTemplateEmail("service-notice", client.email, {
          templateData: {
            title,
            name: client.full_name,
            language,
            lines: [
              `${time} (${data.timezone})`,
              language === "es"
                ? "Reúna los documentos que tenga. Si falta algo, le ayudamos."
                : language === "ht"
                  ? "Rasanble dokiman ou genyen yo. Si yon bagay manke, n ap ede ou."
                  : "Gather the papers you have. We can help with missing papers.",
              "+13053377713",
            ],
          },
          idempotencyKey: `callback-confirmation-${callback.id}`,
        });
        confirmation = result.sent ? "sent" : "suppressed";
      } catch {
        confirmation = "failed";
      }
    }
    return { ok: true, confirmation };
  });
export const updateServiceCallback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), status: z.enum(["completed", "cancelled"]) }))
  .handler(async ({ data, context }) => {
    await staff(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("service_callbacks")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const generateServicePacket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    reference.extend({
      kind: z.enum(["heloc", "sale", "rental", "trust", "business", "business_trust", "family"]),
      language: z.enum(BUSINESS_TRUST_LANGUAGES).optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    await staff(context);
    const { loadServiceClient } = await import("./service-client.server");
    const client = await loadServiceClient(data.id, data.source);
    const file = (client.service_file ?? {}) as Record<string, unknown>;
    const { servicePacket, familyPacket, businessTrustPacket } =
      await import("./service-packet.server");
    const answers = (client.answers ?? {}) as Record<string, unknown>;
    const packetLanguage = normalizeBusinessTrustLanguage(data.language ?? client.language);
    const bytes =
      data.kind === "family"
        ? await familyPacket(
            { ...answers, authorizedPerson: file.authorizedPerson },
            client.full_name ?? "Client",
          )
        : data.kind === "business_trust"
          ? await businessTrustPacket(client, file, packetLanguage)
          : await servicePacket(data.kind, client, file);
    const b64 = Buffer.from(bytes).toString("base64");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const documentTitle =
      data.kind === "business_trust"
        ? `Business trust forms (${languageNames[packetLanguage]}) [${packetLanguage}]`
        : `${data.kind} preparation draft`;
    if (data.source === "assessment") {
      const { error } = await supabaseAdmin.from("assessment_documents").insert({
        assessment_id: data.id,
        title: documentTitle,
        document_type: `service_${data.kind}`,
        content: b64,
        review_status: "draft_pending_review",
        packet_input:
          data.kind === "business_trust"
            ? (JSON.parse(
                JSON.stringify({
                  client: { full_name: client.full_name, answers: client.answers },
                  file,
                }),
              ) as Json)
            : {},
      });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("client_documents").insert({
        client_id: data.id,
        title: documentTitle,
        document_type: `service_${data.kind}`,
        content: b64,
        review_status: "draft_pending_review",
        packet_input:
          data.kind === "business_trust"
            ? (JSON.parse(
                JSON.stringify({
                  client: { full_name: client.full_name, answers: client.answers },
                  file,
                }),
              ) as Json)
            : {},
        send_on_alert: false,
      });
      if (error) throw new Error(error.message);
    }
    return {
      pdfB64: b64,
      filename:
        data.kind === "business_trust"
          ? `business-trust-forms-${packetLanguage}.pdf`
          : `${data.kind}-preparation-draft.pdf`,
    };
  });
export const downloadServiceVehiclePacket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(reference.extend({ documentId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await staff(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = data.source === "assessment"
      ? await supabaseAdmin.from("assessment_documents").select("title,content").eq("id", data.documentId).eq("assessment_id", data.id).eq("document_type", "service_vehicle_rescue").single()
      : await supabaseAdmin.from("client_documents").select("title,content").eq("id", data.documentId).eq("client_id", data.id).eq("document_type", "service_vehicle_rescue").single();
    if (result.error || !result.data) throw new Error("Vehicle PDF not found in this client file.");
    return { pdfB64: result.data.content, filename: `${result.data.title.replace(/[^a-z0-9_-]+/gi, "-")}.pdf` };
  });

export const emailClientChecklist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    reference.extend({
      kind: z.enum(["heloc", "sale", "rental", "trust", "business"]),
      eventId: z.string().uuid(),
    }),
  )
  .handler(async ({ data, context }) => {
    await staff(context);
    const { loadServiceClient } = await import("./service-client.server");
    const client = await loadServiceClient(data.id, data.source);
    if (!client.email) throw new Error("Add the client email first.");
    const { sendTemplateEmail } = await import("./email-templates/send-email");
    const language = client.language === "es" ? "es" : client.language === "ht" ? "ht" : "en";
    const localized = await import("./service-notice-content");
    return sendTemplateEmail("service-notice", client.email, {
      templateData: {
        title: localized.noticeTitle(language),
        name: client.full_name,
        language,
        lines: localized.checklistNotice(language, data.kind),
      },
      idempotencyKey: `client-checklist-${data.id}-${data.eventId}`,
    });
  });
export const emailTrustPackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(reference.extend({ documentId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await staff(context);
    const { loadServiceClient } = await import("./service-client.server");
    const client = await loadServiceClient(data.id, data.source);
    if (!client.email || !z.string().email().safeParse(client.email).success)
      throw new Error("Add a valid client email first.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result =
      data.source === "assessment"
        ? await supabaseAdmin
            .from("assessment_documents")
            .select("id,title,content,document_type")
            .eq("id", data.documentId)
            .eq("assessment_id", data.id)
            .in("document_type", ["service_trust", "service_business_trust", "service_vehicle_rescue"])
            .single()
        : await supabaseAdmin
            .from("client_documents")
            .select("id,title,content,document_type")
            .eq("id", data.documentId)
            .eq("client_id", data.id)
            .in("document_type", ["service_trust", "service_business_trust", "service_vehicle_rescue"])
            .single();
    if (result.error || !result.data) throw new Error("Trust PDF not found in this client file.");
    if (!isTrustDocument(result.data.document_type)) throw new Error("Trust PDF not found.");
    if (!Buffer.from(result.data.content, "base64").subarray(0, 5).equals(Buffer.from("%PDF-")))
      throw new Error("Prepare a valid PDF first.");
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Email is not configured.");
    const { signTrustDownload } = await import("./trust-download.server");
    const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const params = new URLSearchParams({
      id: data.documentId,
      source: data.source,
      expires: String(expires),
      signature: signTrustDownload(data.documentId, data.source, expires, key),
    });
    const { sendTemplateEmail } = await import("./email-templates/send-email");
    return sendTemplateEmail("trust-package", client.email, {
      templateData: {
        name: client.full_name,
        packageKind: result.data.document_type === "service_business_trust" ? "business" : "home",
        language: trustDocumentLanguage(result.data.title, client.language),
        downloadUrl: `https://detenciondefensa.com/api/public/trust-package?${params}`,
      },
      idempotencyKey: `trust-package-${data.source}-${data.documentId}-${Math.floor(Date.now() / (24 * 60 * 60 * 1000))}`,
    });
  });
