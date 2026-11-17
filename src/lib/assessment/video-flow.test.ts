import { describe, expect, it } from "vitest";
import { firstResultPhase, afterHomeVideo, afterBusinessVideo } from "./video-flow";

describe("qualified video order", () => {
  it("plays home then business before scheduling when both qualify", () => {
    const results = { home: "save_my_home", business: true } as const;
    expect(firstResultPhase(results)).toBe("homeVideo");
    expect(afterHomeVideo(results)).toBe("bizVideo");
    expect(afterBusinessVideo(results)).toBe("homeSchedule");
  });
  it("does not play business when it does not qualify", () => {
    expect(afterHomeVideo({ business: false })).toBe("homeSchedule");
  });
  it("starts with business when there is no qualifying home", () => {
    expect(firstResultPhase({ home: "none", business: true })).toBe("bizVideo");
    expect(afterBusinessVideo({ home: "none" })).toBe("bizSchedule");
  });
  it("skips videos when neither service qualifies", () => {
    expect(firstResultPhase({ home: "none", business: false })).toBe("report");
  });
});