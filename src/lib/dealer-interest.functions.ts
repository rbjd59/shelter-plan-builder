import { createServerFn } from "@tanstack/react-start";
import { dealerAlertText, dealerInterestSchema, dealerLeadFields } from "./dealer-interest";

export const submitDealerInterest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => dealerInterestSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("leads")
      .select("id")
      .eq("id", data.requestId)
      .maybeSingle();
    if (lookupError) throw new Error("Could not save request.");
    if (existing) return { id: existing.id, saved: true };

    const { count, error: limitError } = await supabaseAdmin
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("source", "dealer-interest")
      .eq("phone", data.phone.replace(/\D/g, ""))
      .gte("created_at", new Date(Date.now() - 3600000).toISOString());
    if (limitError || (count ?? 0) >= 3) throw new Error("Please call us about your existing request.");

    const { error } = await supabaseAdmin.from("leads").insert(dealerLeadFields(data));
    if (error) throw new Error("Could not save request.");

    let emailSent = false;
    let smsSent = false;
    try {
      const { notifyNewLead } = await import("./lead-notify.server");
      emailSent = await notifyNewLead(data.requestId, {
        source: "dealer-interest",
        fullName: data.contactName,
        phone: data.phone,
        email: data.email,
        need: data.dealershipName,
        city: data.counties,
        language: data.language,
      });
    } catch {
      console.error("Dealer interest email failed; saved request remains in lead inbox", { id: data.requestId });
    }
    try {
      const { sendSms } = await import("./twilio-sms.server");
      const { staffPhone } = await import("./live-chat-sms");
      const result = await sendSms({
        to: staffPhone(process.env.LIVE_CHAT_STAFF_PHONE),
        body: dealerAlertText(data),
        purpose: "dealer_interest_alert",
        metadata: { lead_id: data.requestId },
      });
      smsSent = result.ok;
    } catch {
      console.error("Dealer interest SMS failed; saved request remains in lead inbox", { id: data.requestId });
    }
    return { id: data.requestId, saved: true, emailSent, smsSent };
  });
