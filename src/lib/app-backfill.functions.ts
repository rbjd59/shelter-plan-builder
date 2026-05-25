// Backfill secondary case PDFs (JS-44, attorney referral, brochure) for an
// already-installed app. Used when an existing local install is missing
// these forms because they were added after the user installed.
import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildMotionReferralPdf } from "@/lib/email/motion-referral.server";
import { buildJs44Pdf } from "@/lib/email/js44.server";
import brochureB64Asset from "@/assets/forms/SDFL-ProSeBrochure.pdf.b64";

const FORMS_BUCKET = "intake-forms";

function bytesToB64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function tryDownload(path: string): Promise<Uint8Array | null> {
  try {
    const r = await supabaseAdmin.storage.from(FORMS_BUCKET).download(path);
    if (r.data) return new Uint8Array(await r.data.arrayBuffer());
  } catch { /* ignore */ }
  return null;
}

export interface BackfillPayload {
  motionPdfB64: string | null;
  js44PdfB64: string | null;
  brochurePdfB64: string;
}

export const backfillAppPdfs = createServerFn({ method: "POST" })
  .inputValidator((input: { caseId: string }) => {
    if (!input?.caseId || typeof input.caseId !== "string" || input.caseId.length < 8) {
      throw new Error("Invalid caseId");
    }
    return input;
  })
  .handler(async ({ data }): Promise<BackfillPayload> => {
    const { data: intake, error: ie } = await supabaseAdmin
      .from("intake_submissions")
      .select("answers")
      .eq("stripe_session_id", data.caseId)
      .maybeSingle();
    if (ie || !intake) throw new Error("Case not found");
    const ans = ((intake as { answers: Record<string, unknown> | null }).answers ??
      {}) as Record<string, unknown>;

    let motion = await tryDownload(`${data.caseId}/SDFL-Motion-Referral-Volunteer-Attorney.pdf`);
    let js44 = await tryDownload(`${data.caseId}/JS44-Civil-Cover-Sheet.pdf`);
    if (!motion) { try { motion = await buildMotionReferralPdf(ans); } catch { /* keep null */ } }
    if (!js44)   { try { js44   = await buildJs44Pdf(ans);          } catch { /* keep null */ } }

    return {
      motionPdfB64: motion ? bytesToB64(motion) : null,
      js44PdfB64: js44 ? bytesToB64(js44) : null,
      brochurePdfB64: brochureB64Asset,
    };
  });
