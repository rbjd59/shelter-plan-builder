import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PACKET_LINK_SECONDS } from "./family-packet";

export const generateFamilyPacket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(input => z.object({ language: z.enum(["en", "es", "ht"]), requestId: z.string().uuid() }).strict().parse(input))
  .handler(async ({ context, data }) => {
    const { data: auth, error: authError } = await context.supabase.auth.getUser();
    if (authError || !auth.user?.email || !auth.user.email_confirmed_at) throw new Error("Confirm your account email first.");
    const { data: draft, error } = await context.supabase.from("intake_drafts").select("answers").eq("user_id", context.userId).maybeSingle();
    if (error || !draft) throw new Error("Save your intake answers first.");
    const schema = z.record(z.union([z.string().max(5000), z.boolean()]));
    const answers = schema.parse(draft.answers);
    if (answers.intake_terms_accepted !== true || !String(answers.full_name || "").trim()) throw new Error("Complete your name and consent first.");
    if (!["yes", "no"].includes(String(answers.prep_children)) || !["yes", "no"].includes(String(answers.prep_vehicle))) throw new Error("Complete your family and vehicle choices first.");
    const { buildFamilyPacket } = await import("./family-packet.server");
    const packet = await buildFamilyPacket(answers, data.language);
    // Own-draft read is authorized under RLS; admin storage access is limited to this user's private path.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const path = `family-packets/${context.userId}/${data.requestId}.pdf`;
    const upload = await supabaseAdmin.storage.from("intake-forms").upload(path, packet.bytes, { contentType: "application/pdf", upsert: true });
    if (upload.error) throw new Error("Unable to store your packet securely.");
    const signed = await supabaseAdmin.storage.from("intake-forms").createSignedUrl(path, PACKET_LINK_SECONDS);
    if (!signed.data?.signedUrl) throw new Error("Unable to create your private download.");
    const { sendTemplateEmail } = await import("./email-templates/send-email");
    let emailStatus: "sent" | "suppressed" | "failed" = "failed";
    try { const result = await sendTemplateEmail("family-packet", auth.user.email, { templateData: { name: String(answers.full_name), language: data.language, url: signed.data.signedUrl }, idempotencyKey: `family-packet-${context.userId}-${data.requestId}` }); emailStatus = result.sent ? "sent" : "suppressed"; } catch { /* Download remains available; no automatic retry or notification fan-out. */ }
    return { url: signed.data.signedUrl, emailStatus, documents: packet.documents };
  });