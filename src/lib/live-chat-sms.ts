// Live-chat SMS alert + reply-by-text logic. Pure/injectable so it can be tested without a database.
export const DEFAULT_STAFF_PHONE = "+13057737713";
export const ALERT_GAP_MS = 10 * 60 * 1000;

export function staffPhone(env: string | undefined) {
  return env && /^\+[1-9]\d{6,14}$/.test(env.trim()) ? env.trim() : DEFAULT_STAFF_PHONE;
}

export function shortRef(id: string) {
  return id.replace(/-/g, "").slice(0, 6).toUpperCase();
}

/** Alert on the first visitor message, or after 10+ minutes with no messages. */
export function shouldAlert(lastMessageAt: string | null, now: number) {
  if (!lastMessageAt) return true;
  return now - Date.parse(lastMessageAt) >= ALERT_GAP_MS;
}

export function alertText(language: string, text: string, id: string) {
  const snippet = text.replace(/\s+/g, " ").trim().slice(0, 120);
  return `DetencionDefensa chat (${language.toUpperCase()}): '${snippet}'. Reply to this text to answer. Ref ${shortRef(id)}`;
}

/** Finds a "Ref ABC123" (or a bare leading 6-char ref) in a staff reply and returns [ref, rest]. */
export function parseRef(body: string): { ref: string | null; text: string } {
  const m = body.match(/^\s*(?:ref[:\s#]*)?([0-9a-f]{6})\b[:\s-]*/i);
  if (m && /ref/i.test(m[0].slice(0, 4))) return { ref: m[1].toUpperCase(), text: body.slice(m[0].length).trim() };
  const inline = body.match(/\bref[:\s#]*([0-9a-f]{6})\b/i);
  if (inline) return { ref: inline[1].toUpperCase(), text: body.replace(inline[0], "").trim() };
  return { ref: null, text: body.trim() };
}

/** Twilio X-Twilio-Signature: base64(HMAC-SHA1(authToken, url + sorted(key+value)...)). */
export async function twilioSignature(authToken: string, url: string, params: Record<string, string>) {
  const data = url + Object.keys(params).sort().map((k) => k + params[k]).join("");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(authToken), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)));
  let bin = "";
  sig.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export interface Conv { id: string; status: string }
export interface InboundDb {
  findByRef(ref: string, phone: string): Promise<Conv | null>;
  findLatestAlerted(phone: string): Promise<Conv | null>;
  insertStaffMessage(conversationId: string, body: string): Promise<void>;
  markActive(conversationId: string): Promise<void>;
}

export const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

export async function processInboundSms(opts: {
  url: string;
  params: Record<string, string>;
  signature: string | null;
  authToken: string | undefined;
  staffPhone: string;
  db: InboundDb;
}): Promise<{ status: number; result: string; conversationId?: string }> {
  if (!opts.authToken) return { status: 503, result: "not_configured" };
  if (!opts.signature) return { status: 403, result: "bad_signature" };
  const expected = await twilioSignature(opts.authToken, opts.url, opts.params);
  if (!safeEqual(expected, opts.signature)) return { status: 403, result: "bad_signature" };
  if ((opts.params.From ?? "").trim() !== opts.staffPhone) return { status: 403, result: "wrong_sender" };
  const { ref, text } = parseRef(opts.params.Body ?? "");
  if (!text) return { status: 200, result: "empty" };
  const conv = ref ? await opts.db.findByRef(ref, opts.staffPhone) : await opts.db.findLatestAlerted(opts.staffPhone);
  if (!conv || conv.status === "closed") return { status: 200, result: "no_conversation" };
  await opts.db.insertStaffMessage(conv.id, text.slice(0, 4000));
  await opts.db.markActive(conv.id);
  return { status: 200, result: "delivered", conversationId: conv.id };
}
