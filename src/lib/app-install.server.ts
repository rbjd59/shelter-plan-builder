// Server-only helpers for issuing app install links.
// Install links now point at the Premio app (ice-defense-plan.replit.app)
// instead of the local PWA bootstrap path. We still mint a one-time token
// keyed to the intake session so Premio (or our own backfill tooling) can
// look up the intake by token without leaking the raw session id in URLs.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PREMIO_BASE = "https://ice-defense-plan.replit.app";

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

// Premio install URL. Role distinguishes client vs family device so Premio
// can preselect the right cancel window (2h vs 12h).
export function buildAppInstallUrl(token: string, role: InstallRole = "client"): string {
  return `${PREMIO_BASE}/install?token=${encodeURIComponent(token)}&role=${role}`;
}
