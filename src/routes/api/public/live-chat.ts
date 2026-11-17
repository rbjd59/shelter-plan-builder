import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const reference = z.object({
  id: z.string().uuid(),
  key: z.string().min(40).max(100),
});
const inputSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start"), language: z.enum(["en", "es", "ht"]) }),
  reference.extend({ action: z.literal("message"), text: z.string().trim().min(1).max(4000) }),
  reference.extend({ action: z.literal("mode"), mode: z.enum(["staff", "ai"]) }),
  reference.extend({
    action: z.literal("callback"),
    name: z.string().trim().min(2).max(200),
    phone: z.string().trim().min(7).max(30),
    startsAt: z.string().datetime(),
    timezone: z.string().max(60),
  }),
]);

async function keyHash(key: string) {
  const bytes = new TextEncoder().encode(key);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function visitorView(db: SupabaseClient<Database>, id: string, key: string) {
  const { data: conversation, error } = await db
    .from("live_chat_conversations")
    .select(
      "id,language,status,visitor_name,visitor_phone,assigned_name,callback_at,callback_timezone,updated_at",
    )
    .eq("id", id)
    .eq("visitor_key_hash", await keyHash(key))
    .single();
  if (error || !conversation) return null;
  const { data: messages, error: messageError } = await db
    .from("live_chat_messages")
    .select("id,sender,body,created_at")
    .eq("conversation_id", id)
    .order("created_at");
  if (messageError) throw new Error("Chat is unavailable.");
  return { conversation, messages: messages ?? [] };
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export const Route = createFileRoute("/api/public/live-chat")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!sameOrigin(request)) return Response.json({ error: "Use this website." }, { status: 403 });
        const url = new URL(request.url);
        const parsed = reference.safeParse({ id: url.searchParams.get("id"), key: url.searchParams.get("key") });
        if (!parsed.success) return Response.json({ error: "Chat not found." }, { status: 400 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const view = await visitorView(supabaseAdmin, parsed.data.id, parsed.data.key);
        return view
          ? Response.json(view, { headers: { "Cache-Control": "no-store" } })
          : Response.json({ error: "Chat not found." }, { status: 404 });
      },
      POST: async ({ request }) => {
        if (!sameOrigin(request)) return Response.json({ error: "Use this website." }, { status: 403 });
        const parsed = inputSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "Please check your information." }, { status: 400 });
        const input = parsed.data;
        const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
        if (input.action === "start") {
          const raw = crypto.getRandomValues(new Uint8Array(32));
          const key = Array.from(raw, (byte) => byte.toString(16).padStart(2, "0")).join("");
          const { data: conversation, error } = await db
            .from("live_chat_conversations")
            .insert({ language: input.language, visitor_key_hash: await keyHash(key) })
            .select("id,language,status,visitor_name,visitor_phone,assigned_name,callback_at,callback_timezone,updated_at")
            .single();
          if (error || !conversation) return Response.json({ error: "Chat is unavailable." }, { status: 500 });
          return Response.json({ conversation, key, messages: [] });
        }
        const existing = await visitorView(db, input.id, input.key);
        if (!existing) return Response.json({ error: "Chat not found." }, { status: 404 });
        if (existing.conversation.status === "closed")
          return Response.json({ error: "This chat is closed." }, { status: 409 });
        if (input.action === "message") {
          if (existing.conversation.status === "ai")
            return Response.json({ error: "Use the AI assistant below." }, { status: 409 });
          const { error } = await db.from("live_chat_messages").insert({
            conversation_id: input.id,
            sender: "visitor",
            body: input.text,
          });
          if (error) return Response.json({ error: "Message was not sent." }, { status: 500 });
          await db.from("live_chat_conversations").update({ updated_at: new Date().toISOString() }).eq("id", input.id);
        } else if (input.action === "mode") {
          const { error } = await db
            .from("live_chat_conversations")
            .update({ status: input.mode === "ai" ? "ai" : "waiting_staff", updated_at: new Date().toISOString() })
            .eq("id", input.id);
          if (error) return Response.json({ error: "Could not change chat." }, { status: 500 });
        } else {
          const starts = Date.parse(input.startsAt);
          if (!Number.isFinite(starts) || starts <= Date.now() || starts > Date.now() + 366 * 86400000)
            return Response.json({ error: "Choose a future call time." }, { status: 400 });
          try {
            new Intl.DateTimeFormat("en-US", { timeZone: input.timezone }).format();
          } catch {
            return Response.json({ error: "Choose a valid time zone." }, { status: 400 });
          }
          const { error } = await db
            .from("live_chat_conversations")
            .update({
              visitor_name: input.name,
              visitor_phone: input.phone,
              callback_at: input.startsAt,
              callback_timezone: input.timezone,
              status: "waiting_staff",
              updated_at: new Date().toISOString(),
            })
            .eq("id", input.id);
          if (error) return Response.json({ error: "Could not save the call." }, { status: 500 });
        }
        return Response.json(await visitorView(db, input.id, input.key));
      },
    },
  },
});
