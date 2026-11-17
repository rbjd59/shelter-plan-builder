import { beforeEach, describe, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  client: null as Record<string, unknown> | null,
  inserts: [] as Array<{ table: string; row: unknown }>,
  tables: [] as string[],
  rpc: vi.fn(),
  sendManagedEmail: vi.fn(async () => ({ sent: true })),
  sendSms: vi.fn(async () => ({ ok: true })),
  sendSosSmsToContacts: vi.fn(async () => ({ ok: true })),
}));

// Generic query chain: every method chains; awaiting gives empty results.
function chain(table: string): unknown {
  const result = { data: null, error: null, count: 0 };
  const c: Record<string, unknown> = {};
  const self = new Proxy(c, {
    get(_t, prop) {
      if (prop === "then") return (res: (v: unknown) => void) => res(result);
      if (prop === "maybeSingle" || prop === "single")
        return async () => ({ data: table === "app_clients" ? m.client : null, error: null });
      if (prop === "insert")
        return (row: unknown) => {
          m.inserts.push({ table, row });
          return self;
        };
      return () => self;
    },
  });
  return self;
}

vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: {
    from: (t: string) => {
      m.tables.push(t);
      return chain(t);
    },
    rpc: m.rpc,
    storage: { from: () => ({ createSignedUrl: async () => ({ data: null, error: null }) }) },
  },
}));
vi.mock("@/lib/email/managed-send.server", () => ({ sendManagedEmail: m.sendManagedEmail }));
vi.mock("@/lib/twilio-sms.server", () => ({
  sendSms: m.sendSms,
  sendSosSmsToContacts: m.sendSosSmsToContacts,
  normalizeE164: (v: string | null) => v,
}));
vi.mock("@/lib/readiness.server", () => ({ triggerVaultRelease: vi.fn(async () => ({})) }));

import { Route as activate } from "@/routes/api/public/app/activate";
import { Route as activated } from "@/routes/api/public/app/activated";
import { Route as syncContacts } from "@/routes/api/public/app/sync-contacts";
import { Route as updateInfo } from "@/routes/api/public/app/update-info";
import { Route as trigger } from "@/routes/api/public/app-trigger";
import { Route as updateRequest } from "@/routes/api/public/app-update-request";
import { Route as emergency } from "@/routes/api/public/emergency/activate";
import { Route as apk } from "@/routes/api/public/app/latest[.]apk";
import { RETIRED_DEMO_CODES } from "@/lib/app-code-guard";

type Handler = (ctx: { request: Request }) => Promise<Response>;
const post = (route: unknown): Handler =>
  (route as { options: { server: { handlers: { POST: Handler } } } }).options.server.handlers.POST;

const ENDPOINTS: Array<[string, Handler, (code: string) => Record<string, unknown>]> = [
  ["app/activate", post(activate), (c) => ({ activation_code: c })],
  ["app/activated", post(activated), (c) => ({ activation_code: c })],
  ["app/sync-contacts", post(syncContacts), (c) => ({ activation_code: c, contacts: [] })],
  ["app/update-info", post(updateInfo), (c) => ({ case_id: c })],
  ["app-trigger", post(trigger), (c) => ({ case_id: c, action: "sos" })],
  ["app-update-request", post(updateRequest), (c) => ({ case_id: c, notes: "x" })],
  ["emergency/activate", post(emergency), (c) => ({ activation_code: c, role: "client" })],
];

function req(body: Record<string, unknown>) {
  return new Request("https://example.com/x", {
    method: "POST",
    headers: { "content-type": "application/json", "x-app-signature": "abc", "user-agent": "old-build", "cf-connecting-ip": "1.2.3.4" },
    body: JSON.stringify(body),
  });
}

function expectNothingRecorded() {
  expect(m.rpc).not.toHaveBeenCalled();
  expect(m.sendManagedEmail).not.toHaveBeenCalled();
  expect(m.sendSms).not.toHaveBeenCalled();
  expect(m.sendSosSmsToContacts).not.toHaveBeenCalled();
  expect(m.inserts.every((i) => i.table === "refused_app_codes")).toBe(true);
}

beforeEach(() => {
  vi.clearAllMocks();
  m.client = null;
  m.inserts = [];
  m.tables = [];
});

describe("retired demo codes", () => {
  for (const [name, handler, body] of ENDPOINTS) {
    for (const code of RETIRED_DEMO_CODES) {
      for (const variant of [code, code.toLowerCase(), `${code}-EN`]) {
        it(`${name} refuses ${variant}`, async () => {
          m.client = { id: "should-not-matter", invite_token: code };
          const res = await handler({ request: req(body(variant)) });
          // sync-contacts' schema rejects a suffixed code outright (400), which is also a refusal.
          expect([400, 401]).toContain(res.status);
          const json = (await res.json()) as Record<string, unknown>;
          expect(json.ok).toBe(false);
          expect(json).not.toHaveProperty("client_id");
          expectNothingRecorded();
          if (res.status === 401) {
            expect(m.inserts).toEqual([
              { table: "refused_app_codes", row: expect.objectContaining({ code, reason: "retired_demo_code", ip: "1.2.3.4", user_agent: "old-build" }) },
            ]);
          }
        });
      }
    }
  }

  it("app download refuses a demo code", async () => {
    const get = (apk as unknown as { options: { server: { handlers: { GET: Handler } } } }).options.server.handlers.GET;
    const res = await get({ request: new Request("https://example.com/app/latest.apk?code=TEST1234-ES") });
    expect(res.status).toBe(401);
    expect(m.inserts[0]).toMatchObject({ table: "refused_app_codes", row: { code: "TEST1234", reason: "retired_demo_code" } });
  });
});

describe("unknown codes", () => {
  for (const [name, handler, body] of ENDPOINTS) {
    it(`${name} refuses an unknown code with 404`, async () => {
      m.client = null;
      const res = await handler({ request: req(body("ZZ999")) });
      expect(res.status).toBe(404);
      expectNothingRecorded();
      expect(m.inserts[0]).toMatchObject({ table: "refused_app_codes", row: { code: "ZZ999", reason: "unknown_code" } });
    });
  }
});

describe("reviewer code E7657", () => {
  const reviewer = { id: "rev-id", invite_token: "E7657", is_reviewer: true, full_name: "Store Reviewer", activated_at: "2026-11-13T21:00:00Z" };

  it("still activates", async () => {
    m.client = reviewer;
    m.rpc.mockImplementation(async (fn: string) =>
      fn === "get_client_bundle"
        ? { data: { client_id: "rev-id", case_id: "E7657", language: "en", cancellation_pin: "1234" }, error: null }
        : { data: null, error: null },
    );
    const res = await post(activate)({ request: req({ activation_code: "E7657-EN" }) });
    expect(res.status).toBe(200);
    expect(m.rpc).toHaveBeenCalledWith("get_client_bundle", { p_token: "E7657" });
    expect(m.inserts.some((i) => i.table === "refused_app_codes")).toBe(false);
  });

  it("records an SOS without sending email or SMS", async () => {
    m.client = reviewer;
    m.rpc.mockImplementation(async (fn: string) =>
      fn === "verify_app_trigger_signature"
        ? { data: { ok: true, client_id: "rev-id" }, error: null }
        : fn === "record_sos_alert"
          ? { data: "alert-1", error: null }
          : { data: null, error: null },
    );
    const res = await post(trigger)({ request: req({ case_id: "E7657", action: "sos" }) });
    expect(res.status).toBeLessThan(300);
    expect(m.rpc).toHaveBeenCalledWith("record_sos_alert", expect.objectContaining({ _token: "E7657" }));
    expect(m.sendManagedEmail).not.toHaveBeenCalled();
    expect(m.sendSms).not.toHaveBeenCalled();
    expect(m.inserts.some((i) => i.table === "refused_app_codes")).toBe(false);
  });
});
