import { describe, expect, it } from "vitest";
import { alertText, DEFAULT_STAFF_PHONE, staffPhone, processInboundSms, shortRef, shouldAlert, twilioSignature, type InboundDb } from "./live-chat-sms";

const TOKEN = "test-auth-token";
const URL_ = "https://example.com/api/public/twilio/inbound-sms";
const STAFF = "+13053377713";
const A = "aaaaaa11-0000-4000-8000-000000000001";
const B = "bbbbbb22-0000-4000-8000-000000000002";

function fakeDb() {
  const convs = [{ id: A, status: "waiting_staff" }, { id: B, status: "waiting_staff" }]; // B is most recently alerted
  const messages: { id: string; body: string }[] = [];
  const db: InboundDb = {
    findByRef: async (ref) => convs.find((c) => shortRef(c.id) === ref) ?? null,
    findLatestAlerted: async () => convs[1],
    insertStaffMessage: async (id, body) => { messages.push({ id, body }); },
    markActive: async (id) => { const conv = convs.find((c) => c.id === id); if (conv) conv.status = "active"; },
  };
  return { db, convs, messages };
}
async function send(params: Record<string, string>, opts: { badSig?: boolean } = {}) {
  const f = fakeDb();
  const signature = opts.badSig ? "AAAA" : await twilioSignature(TOKEN, URL_, params);
  const out = await processInboundSms({ url: URL_, params, signature, authToken: TOKEN, staffPhone: STAFF, db: f.db });
  return { out, ...f };
}

describe("live chat SMS alerts", () => {
  it("defaults staff alerts and inbound authorization to the corrected owner number", () => {
    expect(DEFAULT_STAFF_PHONE).toBe("+13053377713");
    expect(staffPhone(undefined)).toBe("+13053377713");
  });
  it("alerts once per burst: first message, not again within 10 minutes, again after 10+", () => {
    const now = Date.parse("2026-11-17T17:00:00Z");
    expect(shouldAlert(null, now)).toBe(true);
    expect(shouldAlert("2026-11-17T16:55:00Z", now)).toBe(false);
    expect(shouldAlert("2026-11-17T16:50:00Z", now)).toBe(true);
  });
  it("alert text holds only language, 120 chars and the ref", () => {
    const t = alertText("es", "x".repeat(300), A);
    expect(t).toBe(`DetencionDefensa chat (ES): '${"x".repeat(120)}'. Reply to this text to answer. Ref AAAAAA`);
  });
});

describe("inbound staff SMS", () => {
  it("rejects a bad signature", async () => {
    const { out, messages } = await send({ From: STAFF, Body: "hi" }, { badSig: true });
    expect(out.status).toBe(403);
    expect(messages).toHaveLength(0);
  });
  it("rejects texts from another number", async () => {
    const { out, messages } = await send({ From: "+15551234567", Body: "hi" });
    expect(out.result).toBe("wrong_sender");
    expect(messages).toHaveLength(0);
  });
  it("puts the reply in the most recently alerted chat and marks it active", async () => {
    const { out, messages, convs } = await send({ From: STAFF, Body: "Hola, le ayudo" });
    expect(out.conversationId).toBe(B);
    expect(messages).toEqual([{ id: B, body: "Hola, le ayudo" }]);
    expect(convs[1].status).toBe("active");
  });
  it("uses the ref in the text to pick the right chat", async () => {
    const { out, messages } = await send({ From: STAFF, Body: "Ref AAAAAA Yes we can help" });
    expect(out.conversationId).toBe(A);
    expect(messages).toEqual([{ id: A, body: "Yes we can help" }]);
  });
  it("refuses when the auth token is not configured", async () => {
    const f = fakeDb();
    const out = await processInboundSms({ url: URL_, params: { From: STAFF, Body: "x" }, signature: "x", authToken: undefined, staffPhone: STAFF, db: f.db });
    expect(out.status).toBe(503);
  });
});
