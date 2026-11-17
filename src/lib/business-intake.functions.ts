import { createServerFn } from "@tanstack/react-start";
import { BUSINESS_INTAKE_ASSIGNEE, businessIntakeSchema } from "./business-intake";

export const submitBusinessIntake = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => businessIntakeSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: assignee, error: staffError } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("user_id", BUSINESS_INTAKE_ASSIGNEE.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (staffError || !assignee)
      throw new Error("The assigned team member is unavailable. Please call us.");
    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("leads")
      .select("id")
      .eq("id", data.requestId)
      .maybeSingle();
    if (lookupError) throw new Error("Could not save request.");
    if (existing) return { id: existing.id, saved: true };
    const phone = data.phone.replace(/\D/g, "");
    const { count, error: limitError } = await supabaseAdmin
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("source", "business-call-intake")
      .eq("phone", phone)
      .gte("created_at", new Date(Date.now() - 3600000).toISOString());
    if (limitError || (count ?? 0) >= 3)
      throw new Error("Please call us about your existing request.");
    const details = [
      `Business: ${data.businessName}`,
      `Work: ${data.work}`,
      `Preferred call time: ${data.bestTime}`,
      `Contact permission: yes`,
      data.message,
    ].join("\n");
    const { error } = await supabaseAdmin.from("leads").insert({
      id: data.requestId,
      full_name: data.fullName,
      phone,
      email: data.email || null,
      language: data.language,
      city: data.city || null,
      need: data.work,
      message: details,
      source: "business-call-intake",
      status: "routed",
      routed_to: assignee.user_id,
      routed_at: new Date().toISOString(),
      assigned_note: `Assigned to ${BUSINESS_INTAKE_ASSIGNEE.name}`,
    });
    if (error) throw new Error("Could not save request.");
    let notified = false;
    try {
      const { sendTemplateEmail } = await import("./email-templates/send-email");
      const result = await sendTemplateEmail(
        "business-call-request",
        BUSINESS_INTAKE_ASSIGNEE.email,
        {
          templateData: {
            name: data.fullName,
            phone: data.phone,
            language: data.language,
            details: `${details}\nCity: ${data.city}\nEmail: ${data.email}\nRequest: ${data.requestId}`,
          },
          idempotencyKey: `business-call-${data.requestId}`,
        },
      );
      notified = result.sent;
    } catch {
      console.error("Business call notification failed; saved request remains in lead inbox", {
        id: data.requestId,
      });
    }
    return { id: data.requestId, saved: true, notified };
  });
