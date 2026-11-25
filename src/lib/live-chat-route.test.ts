import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  messages: [] as Array<{ id: number; conversation_id: string; sender: string; body: string; created_at: string }>,
  conv: { id: "aaaaaa11-0000-4000-8000-000000000001", language: "es", status: "waiting_staff", alerted_phone: null as string | null },
  sendSms: vi.fn(),
  events: [] as string[],
}));

function query(table: string) {
  let operation = "select";
  let row: Record<string, unknown> = {};
  let descending = false;
  const result = () => {
    if (operation === "insert" && table === "live_chat_messages") {
      m.events.push("insert");
      m.messages.push({ id: m.messages.length + 1, conversation_id: m.conv.id, sender: String(row.sender), body: String(row.body), created_at: new Date().toISOString() });
    }
    if (operation === "update" && table === "live_chat_conversations") Object.assign(m.conv, row);
    const rows = descending ? [...m.messages].reverse() : m.messages;
    return { data: table === "live_chat_conversations" ? [m.conv] : rows, error: null };
  };
  const chain = {
    select: () => chain,
    eq: () => chain,
    neq: () => chain,
    order: (_key: string, opts?: { ascending: boolean }) => { descending = opts?.ascending === false; return chain; },
    limit: () => chain,
    insert: (value: Record<string, unknown>) => { operation = "insert"; row = value; return chain; },
    update: (value: Record<string, unknown>) => { operation = "update"; row = value; return chain; },
    single: async () => ({ data: m.conv, error: null }),
    maybeSingle: async () => ({ data: table === "live_chat_conversations" ? m.conv : [...m.messages].reverse()[0] ?? null, error: null }),
    then: (resolve: (value: ReturnType<typeof result>) => unknown) => Promise.resolve(result()).then(resolve),
  };
  return chain;
}

vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: { from: query } }));
vi.mock("@/lib/twilio-sms.server", () => ({ sendSms: m.sendSms }));
import { Route as chat } from "@/routes/api/public/live-chat";
import { Route as inbound } from "@/routes/api/public/twilio/inbound-sms";
import { twilioSignature } from "./live-chat-sms";
type Handler = (ctx: { request: Request }) => Promise<Response>;
const handlers = (route: unknown) => (route as { options: { server: { handlers: { POST: Handler; GET: Handler } } } }).options.server.handlers;
const key = "a".repeat(64);
const url = "https://detenciondefensa.com/api/public/twilio/inbound-sms";

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("LIVE_CHAT_STAFF_PHONE", "");
  m.messages = []; m.events = [];
  Object.assign(m.conv, { status: "waiting_staff", alerted_phone: null });
  m.sendSms.mockReset().mockImplementation(async () => { m.events.push("sms"); return { ok: true }; });
});

const message = () => handlers(chat).POST({ request: new Request("https://detenciondefensa.com/api/public/live-chat", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ action: "message", id: m.conv.id, key, text: "TEST - routing check" }),
}) });

describe("visitor message and staff SMS route integration", () => {
  it("sends the first alert before inserting and sends once per burst, then again at 10 minutes", async () => {
    expect((await message()).status).toBe(200);
    expect(m.events).toEqual(["sms", "insert"]);
    expect(m.sendSms).toHaveBeenCalledWith(expect.objectContaining({ to: "+13053377713", purpose: "live_chat_alert" }));
    expect(m.conv.alerted_phone).toBe("+13053377713");
    await message();
    expect(m.sendSms).toHaveBeenCalledTimes(1);
    for (const msg of m.messages) msg.created_at = new Date(Date.now() - 600000).toISOString();
    await message();
    expect(m.sendSms).toHaveBeenCalledTimes(2);
  });

  it("validates an incoming signature and makes the staff reply available to visitor polling", async () => {
    await message();
    vi.stubEnv("TWILIO_AUTH_TOKEN", "synthetic-test-token");
    const params = { From: "+13053377713", Body: "Ref AAAAAA Hola, le ayudo" };
    const signature = await twilioSignature("synthetic-test-token", url, params);
    const response = await handlers(inbound).POST({ request: new Request(url, {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Twilio-Signature": signature }, body: new URLSearchParams(params),
    }) });
    expect(response.status).toBe(200);
    const poll = await handlers(chat).GET({ request: new Request(`https://detenciondefensa.com/api/public/live-chat?id=${m.conv.id}&key=${key}`) });
    const view = await poll.json();
    expect(view.conversation.status).toBe("active");
    expect(view.messages.at(-1)).toMatchObject({ sender: "staff", body: "Hola, le ayudo" });
  });
});