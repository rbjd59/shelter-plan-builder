import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { alertText, shortRef, shouldAlert, staffPhone, type InboundDb } from "@/lib/live-chat-sms";

type Db = SupabaseClient<Database>;

/** Call BEFORE inserting the visitor message. Texts staff on the first message or after a 10+ minute gap. */
export async function maybeAlertStaff(db: Db, conv: { id: string; language: string }, text: string) {
  const { data: last, error: lastError } = await db
    .from("live_chat_messages")
    .select("created_at")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (lastError) throw new Error(`Chat alert history lookup failed: ${lastError.message}`);
  if (!shouldAlert(last?.created_at ?? null, Date.now())) return;
  const phone = staffPhone(process.env.LIVE_CHAT_STAFF_PHONE);
  const { sendSms } = await import("@/lib/twilio-sms.server");
  const sent = await sendSms({
    to: phone,
    body: alertText(conv.language, text, conv.id),
    purpose: "live_chat_alert",
    metadata: { conversation_ref: shortRef(conv.id) },
  });
  if (!sent.ok) throw new Error(`Chat SMS alert failed: ${sent.error ?? "sender returned failure"}`);
  const { error } = await db.from("live_chat_conversations").update({ alerted_phone: phone, last_alert_at: new Date().toISOString() }).eq("id", conv.id);
  if (error) throw new Error(`Chat alert tracking failed: ${error.message}`);
}

export function inboundDb(db: Db): InboundDb {
  return {
    async findByRef(ref, phone) {
      const { data } = await db
        .from("live_chat_conversations")
        .select("id,status")
        .eq("alerted_phone", phone)
        .neq("status", "closed")
        .order("last_alert_at", { ascending: false })
        .limit(200);
      return (data ?? []).find((c) => shortRef(c.id) === ref) ?? null;
    },
    async findLatestAlerted(phone) {
      const { data } = await db
        .from("live_chat_conversations")
        .select("id,status")
        .eq("alerted_phone", phone)
        .neq("status", "closed")
        .order("last_alert_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data ?? null;
    },
    async insertStaffMessage(id, body) {
      const { error } = await db.from("live_chat_messages").insert({ conversation_id: id, sender: "staff", body });
      if (error) throw new Error("insert failed");
    },
    async markActive(id) {
      const { error } = await db.from("live_chat_conversations").update({ status: "active", assigned_name: "Paralegal", updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw new Error(`Chat reply status update failed: ${error.message}`);
    },
  };
}
