// Backfill secondary case PDFs (JS-44, attorney referral, brochure) for an
// already-installed app.
import { createServerFn } from "@tanstack/react-start";

export const backfillAppPdfs = createServerFn({ method: "POST" })
  .inputValidator((input: { caseId: string }) => {
    if (!input?.caseId || typeof input.caseId !== "string" || input.caseId.length < 8) {
      throw new Error("Invalid caseId");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { runBackfillAppPdfs } = await import("@/lib/app-backfill.server");
    return runBackfillAppPdfs(data.caseId);
  });
