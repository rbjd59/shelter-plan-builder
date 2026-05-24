// Client-callable server function: redeem a one-time install token, returns
// all intake PDFs (base64) plus case metadata. Token is invalidated after use.
import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildIntakePdfs } from "@/lib/email/intake-pdfs.server";
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

export interface AppBootstrapPayload {
  habeasPdfB64: string;
  ifpPdfB64: string;
  motionPdfB64: string | null;
  js44PdfB64: string | null;
  brochurePdfB64: string;
  caseId: string;
  fullName: string;
  contactName: string;
  contactEmail: string;
  language: string;
  role: "client" | "family";
}

async function tryDownload(path: string): Promise<Uint8Array | null> {
  try {
    const r = await supabaseAdmin.storage.from(FORMS_BUCKET).download(path);
    if (r.data) return new Uint8Array(await r.data.arrayBuffer());
  } catch { /* ignore */ }
  return null;
}

export const bootstrapAppFromToken = createServerFn({ method: "POST" })
  .inputValidator((input: { token: string }) => {
    if (!input?.token || typeof input.token !== "string" || input.token.length < 10) {
      throw new Error("Invalid token");
    }
    return input;
  })
  .handler(async ({ data }): Promise<AppBootstrapPayload> => {
    const { data: row, error } = await supabaseAdmin
      .from("app_install_tokens" as never)
      .select("token, intake_session_id, used_at, expires_at, role")
      .eq("token", data.token)
      .maybeSingle();

    if (error || !row) throw new Error("Token not found");
    const r = row as {
      token: string;
      intake_session_id: string;
      used_at: string | null;
      expires_at: string;
      role: "client" | "family" | null;
    };
    if (r.used_at) throw new Error("This install link has already been used.");
    if (new Date(r.expires_at).getTime() < Date.now()) throw new Error("Install link expired.");

    const { data: intake, error: ie } = await supabaseAdmin
      .from("intake_submissions")
      .select("answers, language, email")
      .eq("stripe_session_id", r.intake_session_id)
      .maybeSingle();
    if (ie || !intake) throw new Error("Intake not found");
    const ans = ((intake as { answers: Record<string, unknown> | null }).answers ??
      {}) as Record<string, unknown>;

    // Try to fetch uploaded PDFs from storage; fall back to building.
    let habeas = await tryDownload(`${r.intake_session_id}/AO242-habeas-2241.pdf`);
    let ifp = await tryDownload(`${r.intake_session_id}/AO240-in-forma-pauperis.pdf`);
    let motion = await tryDownload(`${r.intake_session_id}/SDFL-Motion-Referral-Volunteer-Attorney.pdf`);
    let js44 = await tryDownload(`${r.intake_session_id}/JS44-Civil-Cover-Sheet.pdf`);

    if (!habeas || !ifp) {
      const built = await buildIntakePdfs(ans);
      habeas = habeas ?? built.habeas;
      ifp = ifp ?? built.ifp;
    }
    if (!motion) {
      try { motion = await buildMotionReferralPdf(ans); } catch { /* keep null */ }
    }
    if (!js44) {
      try { js44 = await buildJs44Pdf(ans); } catch { /* keep null */ }
    }

    // Mark token as used (single-use).
    await supabaseAdmin
      .from("app_install_tokens" as never)
      .update({ used_at: new Date().toISOString() } as never)
      .eq("token", r.token);

    return {
      habeasPdfB64: bytesToB64(habeas!),
      ifpPdfB64: bytesToB64(ifp!),
      motionPdfB64: motion ? bytesToB64(motion) : null,
      js44PdfB64: js44 ? bytesToB64(js44) : null,
      brochurePdfB64: brochureB64Asset,
      caseId: r.intake_session_id,
      fullName: String(ans.full_name ?? ans.mail_inmate_name ?? ""),
      contactName: String(ans.contact_name ?? ""),
      contactEmail: String(ans.contact_email ?? (intake as { email: string | null }).email ?? ""),
      language: (intake as { language: string }).language ?? "es",
      role: r.role === "family" ? "family" : "client",
    };
  });
