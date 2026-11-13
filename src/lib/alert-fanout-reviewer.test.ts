import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  sendManagedEmail: vi.fn(),
  sendSms: vi.fn(),
}));

vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: { from: mocks.from },
}));
vi.mock("@/lib/email/managed-send.server", () => ({
  sendManagedEmail: mocks.sendManagedEmail,
}));
vi.mock("@/lib/twilio-sms.server", () => ({
  sendSms: mocks.sendSms,
  normalizeE164: (value: string | null) => value,
}));

import { notifyAppActivation, notifySosEvent } from "@/lib/alert-fanout.server";

function mockCase(client: Record<string, unknown>, contacts: Array<Record<string, unknown>> = []) {
  const updateEq = vi.fn().mockResolvedValue({ error: null });
  mocks.from.mockImplementation((table: string) => {
    if (table === "app_clients") {
      return {
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: client }) }),
        }),
        update: () => ({ eq: updateEq }),
      };
    }
    if (table === "client_contacts") {
      return {
        select: () => ({ eq: () => ({ order: async () => ({ data: contacts }) }) }),
      };
    }
    throw new Error(`Unexpected table: ${table}`);
  });
  return { updateEq };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("store reviewer notification isolation", () => {
  it("allows repeat reviewer activation while recording it and sending nothing", async () => {
    const { updateEq } = mockCase({
      id: "reviewer-id",
      invite_token: "E7657",
      full_name: "Store Reviewer [TEST - DO NOT FILE]",
      is_reviewer: true,
      activated_at: "2026-11-13T21:00:00Z",
    });

    const result = await notifyAppActivation("E7657");

    expect(result).toEqual({ ok: true, skipped: "reviewer_no_fanout", contacts_notified: 0 });
    expect(updateEq).toHaveBeenCalledWith("id", "reviewer-id");
    expect(mocks.sendManagedEmail).not.toHaveBeenCalled();
    expect(mocks.sendSms).not.toHaveBeenCalled();
  });

  it("keeps real repeat activations on the original already-activated path", async () => {
    const { updateEq } = mockCase({
      id: "real-client-id",
      invite_token: "R2345",
      full_name: "Real Client",
      is_reviewer: false,
      activated_at: "2026-11-13T21:00:00Z",
    });

    const result = await notifyAppActivation("R2345");

    expect(result).toEqual({ ok: true, skipped: "already_activated" });
    expect(updateEq).not.toHaveBeenCalled();
    expect(mocks.sendManagedEmail).not.toHaveBeenCalled();
    expect(mocks.sendSms).not.toHaveBeenCalled();
  });

  it("suppresses reviewer SOS fan-out even when contacts are present", async () => {
    mockCase(
      {
        id: "reviewer-id",
        invite_token: "E7657",
        full_name: "Store Reviewer [TEST - DO NOT FILE]",
        is_reviewer: true,
      },
      [{ name: "Should Not Notify", email: "person@example.com", phone_e164: "+13055550100", role: "family", notify_on_sos: true }],
    );

    const result = await notifySosEvent({ token: "E7657", kind: "alert", lat: 25.7617, lng: -80.1918 });

    expect(result).toEqual({ ok: true, skipped: "reviewer_no_fanout", contacts_notified: 0 });
    expect(mocks.sendManagedEmail).not.toHaveBeenCalled();
    expect(mocks.sendSms).not.toHaveBeenCalled();
  });
});
