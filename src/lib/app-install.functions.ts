// Client-callable server function: redeem a one-time install token, returns
// the two PDFs (base64) plus case metadata. Token is invalidated after use.
import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildIntakePdfs } from "@/lib/email/intake-pdfs.server";

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
  caseId: string;
  fullName: string;
  contactName: string;
  contactEmail: string;
  language: string;
  role: "client" | "family";
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
      .select("token, intake_session_id, used_at, expires_at")
      .eq("token", data.token)
      .maybeSingle();

    if (error || !row) throw new Error("Token not found");
    const r = row as {
      token: string;
      intake_session_id: string;
      used_at: string | null;
      expires_at: string;
    };
    if (r.used_at) throw new Error("This install link has already been used.");
    if (new Date(r.expires_at).getTime() < Date.now()) throw new Error("Install link expired.");

    // Load intake to build PDFs + metadata.
    const { data: intake, error: ie } = await supabaseAdmin
      .from("intake_submissions")
      .select("answers, language, email")
      .eq("stripe_session_id", r.intake_session_id)
      .maybeSingle();
    if (ie || !intake) throw new Error("Intake not found");
    const ans = ((intake as { answers: Record<string, unknown> | null }).answers ??
      {}) as Record<string, unknown>;

    // Try to fetch already-uploaded PDFs from storage; fall back to rebuilding.
    let habeas: Uint8Array | null = null;
    let ifp: Uint8Array | null = null;
    try {
      const h = await supabaseAdmin.storage
        .from(FORMS_BUCKET)
        .download(`${r.intake_session_id}/AO242-habeas-2241.pdf`);
      const i = await supabaseAdmin.storage
        .from(FORMS_BUCKET)
        .download(`${r.intake_session_id}/AO240-in-forma-pauperis.pdf`);
      if (h.data) habeas = new Uint8Array(await h.data.arrayBuffer());
      if (i.data) ifp = new Uint8Array(await i.data.arrayBuffer());
    } catch {
      /* fallback below */
    }
    if (!habeas || !ifp) {
      const built = await buildIntakePdfs(ans);
      habeas = built.habeas;
      ifp = built.ifp;
    }

    // Mark token as used (single-use).
    await supabaseAdmin
      .from("app_install_tokens" as never)
      .update({ used_at: new Date().toISOString() } as never)
      .eq("token", r.token);

    return {
      habeasPdfB64: bytesToB64(habeas),
      ifpPdfB64: bytesToB64(ifp),
      caseId: r.intake_session_id,
      fullName: String(ans.full_name ?? ans.mail_inmate_name ?? ""),
      contactName: String(ans.contact_name ?? ""),
      contactEmail: String(ans.contact_email ?? (intake as { email: string | null }).email ?? ""),
      language: (intake as { language: string }).language ?? "es",
    };
  });
