import { describe, expect, it } from "vitest";
import { PROGRAM_PATHS } from "@/lib/home-review-content";
import { requestReviewSchema } from "@/lib/review-request";

const valid = {
  fullName: "Josh Pastor",
  phone: "(728) 201-4606",
  email: "josh@example.com",
  language: "en",
  need: "legal",
  website: "",
} as const;

describe("Request a Review validation", () => {
  it("accepts complete contact details and a supported primary need", () => {
    expect(requestReviewSchema.safeParse(valid).success).toBe(true);
  });

  it("requires an email address", () => {
    expect(requestReviewSchema.safeParse({ ...valid, email: "" }).success).toBe(false);
  });

  it("rejects a phone number with fewer than seven digits", () => {
    expect(requestReviewSchema.safeParse({ ...valid, phone: "123-456" }).success).toBe(false);
  });

  it("rejects a primary need outside the four listed choices", () => {
    expect(requestReviewSchema.safeParse({ ...valid, need: "other" }).success).toBe(false);
  });
});

describe("Core service destinations", () => {
  it("uses the five requested public pages", () => {
    expect(PROGRAM_PATHS).toEqual({
      app: "/get-app",
      home: "/own-property",
      business: "/save-my-business",
      family: "/family-forms",
      legal: "/qualify",
    });
  });
});
