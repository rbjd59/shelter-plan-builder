import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  rpc: vi.fn(),
  sendManagedEmail: vi.fn(),
  sendSms: vi.fn(),
  trackDelivery: vi.fn(),
  logDelivery: vi.fn(),
  contactInsert: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/email/managed-send.server", () => ({ sendManagedEmail: mocks.sendManagedEmail }));
vi.mock("@/lib/sms.server", () => ({
  sendSms: mocks.sendSms,
  activationSmsBody: () => "activation",
}));
vi.mock("@/lib/twilio-sms.server", () => ({ normalizeE164: (value: string | null) => value }));
vi.mock("@/lib/delivery-log.server", () => ({
  trackDelivery: mocks.trackDelivery,
  logDelivery: mocks.logDelivery,
}));

import { provisionAppClient } from "@/lib/app-clients.server";

beforeEach(() => {
  vi.clearAllMocks();
  process.env.SUPABASE_URL = "https://example.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only";

  mocks.rpc.mockResolvedValue({ error: null });
  mocks.logDelivery.mockResolvedValue(undefined);
  mocks.from.mockImplementation((table: string) => {
    if (table === "app_clients") {
      return {
        insert: (payload: Record<string, unknown>) => ({
          select: () => ({
            single: async () => {
              expect(payload.is_reviewer).toBe(true);
              expect(payload.hmac_secret).toMatch(/^[a-f0-9]{64}$/);
              return { data: { id: "reviewer-id" }, error: null };
            },
          }),
        }),
      };
    }
    if (table === "client_form_answers") {
      return { upsert: vi.fn().mockResolvedValue({ error: null }) };
    }
    if (table === "client_contacts") {
      return { insert: mocks.contactInsert };
    }
    throw new Error(`Unexpected table: ${table}`);
  });
  mocks.createClient.mockReturnValue({ from: mocks.from, rpc: mocks.rpc });
});

describe("store reviewer provisioning", () => {
  it("uses the normal provisioning path without contacts, email, or SMS", async () => {
    const result = await provisionAppClient({
      intakeSessionId: "store-reviewer-test",
      language: "en",
      isReviewer: true,
      answers: {
        full_name: "Store Reviewer [TEST - DO NOT FILE]",
        client_email: "accidental@example.com",
        client_mobile: "+13055550100",
        cancel_pin: "4752",
      },
    });

    expect(result).toEqual({ ok: true, clientId: "reviewer-id", code: expect.stringMatching(/^[A-Z][2-9]{4}$/) });
    expect(mocks.rpc).toHaveBeenCalledWith("set_sos_cancel_pin_admin", { _client_id: "reviewer-id", _pin: "4752" });
    expect(mocks.contactInsert).not.toHaveBeenCalled();
    expect(mocks.trackDelivery).not.toHaveBeenCalled();
    expect(mocks.sendManagedEmail).not.toHaveBeenCalled();
    expect(mocks.sendSms).not.toHaveBeenCalled();
  });
});
