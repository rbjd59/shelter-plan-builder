// Server-only: refuses retired demo codes and codes with no app_clients row,
// and logs each refusal to refused_app_codes. Returns the HTTP status to send, or null when the code is valid.
import { isRetiredDemoCode, normalizeCode } from "./app-code-guard";

export async function refuseAppCode(
  raw: string | null | undefined,
  endpoint: string,
  request: Request,
): Promise<401 | 404 | null> {
  const code = normalizeCode(raw);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  let reason: "retired_demo_code" | "unknown_code" | null = null;
  if (isRetiredDemoCode(code)) {
    reason = "retired_demo_code";
  } else {
    const { data, error } = await supabaseAdmin
      .from("app_clients")
      .select("id")
      .eq("invite_token", code)
      .maybeSingle();
    if (error || !data) reason = "unknown_code";
  }
  if (!reason) return null;
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    null;
  try {
    await supabaseAdmin.from("refused_app_codes").insert({
      code: code.slice(0, 32),
      reason,
      endpoint,
      ip,
      user_agent: request.headers.get("user-agent")?.slice(0, 400) ?? null,
    });
  } catch (e) {
    console.error("[app-code-guard] log failed", e);
  }
  console.warn("[app-code-guard] refused", { endpoint, reason });
  return reason === "retired_demo_code" ? 401 : 404;
}
