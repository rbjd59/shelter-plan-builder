import type { Results } from "./score";

export type Phase = "q" | "homeVideo" | "homeSchedule" | "bizVideo" | "bizSchedule" | "report";

export function firstResultPhase(results: Pick<Results, "home" | "business">): Phase {
  return results.home === "save_my_home" ? "homeVideo" : results.business ? "bizVideo" : "report";
}

export function afterHomeVideo(results: Pick<Results, "business">): Phase {
  return results.business ? "bizVideo" : "homeSchedule";
}

export function afterBusinessVideo(results: Pick<Results, "home">): Phase {
  return results.home === "save_my_home" ? "homeSchedule" : "bizSchedule";
}