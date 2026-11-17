import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

async function staff(context: { supabase: SupabaseClient<Database>; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Sign in with an approved staff account.");
}

export const listLiveChats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await staff(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("live_chat_conversations")
      .select("id,language,status,visitor_name,visitor_phone,assigned_name,callback_at,callback_timezone,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);
    return data;
  });

export const getLiveChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await staff(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: messages, error } = await supabaseAdmin
      .from("live_chat_messages")
      .select("id,sender,body,created_at")
      .eq("conversation_id", data.id)
      .order("created_at");
    if (error) throw new Error(error.message);
    return messages;
  });

export const replyLiveChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), text: z.string().trim().min(1).max(4000) }))
  .handler(async ({ data, context }) => {
    await staff(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("live_chat_messages").insert({
      conversation_id: data.id,
      sender: "staff",
      body: data.text,
    });
    if (error) throw new Error(error.message);
    const update = await supabaseAdmin
      .from("live_chat_conversations")
      .update({
        status: "active",
        assigned_to: context.userId,
        assigned_name: "Law office staff",
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (update.error) throw new Error(update.error.message);
    return { ok: true };
  });

export const closeLiveChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await staff(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("live_chat_conversations")
      .update({ status: "closed", updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
