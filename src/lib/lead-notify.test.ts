import { describe, expect, it } from "vitest";
import { buildLeadNotification, LEAD_NOTIFY_EMAIL } from "./lead-notify";

describe("lead notification", () => {
  it("goes to info@detenciondefensa.com", () => {
    expect(LEAD_NOTIFY_EMAIL).toBe("info@detenciondefensa.com");
    expect(buildLeadNotification({ source: "x", fullName: "A", language: "en" }).to).toBe("info@detenciondefensa.com");
  });
  it("uses the 'New lead: <source> - <need>' subject", () => {
    expect(buildLeadNotification({ source: "business-call-intake", fullName: "A", need: "Lawn care", language: "es" }).subject).toBe(
      "New lead: business-call-intake - Lawn care",
    );
  });
});
