// Server-only helpers for issuing/consuming one-time PWA install tokens.
// These are the FALLBACK install URLs used only when the welcome email has
// no DefensaSiempre invite_code (e.g. webhook failed). The primary path is
// the defensasiempre://activate?code=... deep link rendered in
// sendWelcomeEmail when an invite_code is present.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SITE_BASE = "https://detenciondefensa.com";

export type InstallRole = "client" | "family";

export async function issueAppInstallToken(
  intakeSessionId: string,
  role: InstallRole = "client",
): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("app_install_tokens" as never)
    .insert({ intake_session_id: intakeSessionId, role } as never)
    .select("token")
    .single();
  if (error || !data) {
    console.error("issueAppInstallToken failed", error);
    return null;
  }
  return (data as { token: string }).token;
}

export function buildAppInstallUrl(token: string, _role: InstallRole = "client"): string {
  return `${SITE_BASE}/app?bootstrap=${token}`;
}
