import { describe, expect, it } from "vitest";
import {
  buildReadinessPlan,
  EMPTY_READINESS_ANSWERS,
  isReadinessScreenComplete,
  type ReadinessAnswers,
} from "./readiness-screener";

const base: ReadinessAnswers = {
  timeInUs: "2to10",
  currentStatus: "tps",
  priorRemoval: "no",
  ownsHome: "no",
  ownsBusiness: "no",
};

describe("emergency readiness screener", () => {
  it("requires time in the U.S., status, prior-order, home and business answers", () => {
    expect(isReadinessScreenComplete(base)).toBe(true);
    expect(isReadinessScreenComplete(EMPTY_READINESS_ANSWERS)).toBe(false);
    for (const key of Object.keys(base) as (keyof ReadinessAnswers)[]) {
      expect(isReadinessScreenComplete({ ...base, [key]: "" })).toBe(false);
    }
  });

  it("prioritizes licensed-counsel review for a prior removal order or an uncertain answer", () => {
    expect(buildReadinessPlan({ ...base, priorRemoval: "yes" }).counselReviewUrgent).toBe(true);
    expect(buildReadinessPlan({ ...base, priorRemoval: "unsure" }).counselReviewUrgent).toBe(true);
    expect(buildReadinessPlan({ ...base, priorRemoval: "no" }).counselReviewUrgent).toBe(false);
  });

  it("shows Save My Home only when the person reports home ownership", () => {
    expect(buildReadinessPlan({ ...base, ownsHome: "yes" }).showHome).toBe(true);
    expect(buildReadinessPlan({ ...base, ownsHome: "no" }).showHome).toBe(false);
  });

  it("shows Save My Business only when the person reports business ownership", () => {
    expect(buildReadinessPlan({ ...base, ownsBusiness: "yes" }).showBusiness).toBe(true);
    expect(buildReadinessPlan({ ...base, ownsBusiness: "no" }).showBusiness).toBe(false);
  });

  it("always organizes a case file without deciding eligibility or legal standing", () => {
    expect(buildReadinessPlan(base)).toEqual({
      organizeCaseFile: true,
      counselReviewUrgent: false,
      showHome: false,
      showBusiness: false,
    });
  });
});
