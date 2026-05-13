// Server-only helpers for issuing/consuming one-time PWA install tokens.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SITE_BASE = "https://detenciondefensa.com";

export async function issueAppInstallToken(intakeSessionId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from("app_install_tokens" as never)
    .insert({ intake_session_id: intakeSessionId } as never)
    .select("token")
    .single();
  if (error || !data) {
    console.error("issueAppInstallToken failed", error);
    return null;
  }
  return (data as { token: string }).token;
}

export function buildAppInstallUrl(token: string): string {
  return `${SITE_BASE}/app?bootstrap=${token}`;
}
