// Pure helpers for activation codes; shared by every public app endpoint.

/** Demo codes hard-coded in old app builds. The server must never accept them. */
export const RETIRED_DEMO_CODES = ["TEST1234", "DEMO0001", "JAYTEST1", "BOARD001", "BRD2A6K9"] as const;

/** Uppercases, trims and drops a language suffix such as "-EN". */
export function normalizeCode(raw: string | null | undefined): string {
  return String(raw ?? "").trim().toUpperCase().split("-")[0] ?? "";
}

export function isRetiredDemoCode(raw: string | null | undefined): boolean {
  return (RETIRED_DEMO_CODES as readonly string[]).includes(normalizeCode(raw));
}
