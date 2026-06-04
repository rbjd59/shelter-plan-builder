import { createServerFn } from "@tanstack/react-start";

/**
 * Records a signed limited-scope engagement letter. Captures version,
 * language, signed name, IP, user agent, and the exact body text shown
 * to the signer for legal-record durability.
 *
 * Authenticated callers are linked to their user_id. Anonymous signers
 * (pre-account flow) are allowed because the RLS policy permits NULL
 * user_id inserts; we'll backfill once they create an account.
 */
export const signRetainer = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      version: string;
      language: "en" | "es" | "ht";
      signedName: string;
      bodySnapshot: string;
      intakeSessionId?: string;
      userId?: string;
    }) => {
      if (!data.version || data.version.length > 64) {
        throw new Error("Invalid version");
      }
      if (!["en", "es", "ht"].includes(data.language)) {
        throw new Error("Invalid language");
      }
      if (!data.signedName || data.signedName.trim().length < 2) {
        throw new Error("Please type your full legal name as your signature.");
      }
      if (data.signedName.length > 200) {
        throw new Error("Signature is too long.");
      }
      if (!data.bodySnapshot || data.bodySnapshot.length > 50000) {
        throw new Error("Invalid retainer body");
      }
      return data;
    },
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getRequest, getRequestHeader } = await import("@tanstack/react-start/server");

    let ip: string | null = null;
    try {
      const req = getRequest();
      ip =
        req.headers.get("cf-connecting-ip") ||
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        null;
    } catch {
      /* ignore */
    }
    const userAgent = getRequestHeader("user-agent") || null;

    const { data: row, error } = await supabaseAdmin
      .from("legal_retainers")
      .insert({
        user_id: data.userId ?? null,
        intake_session_id: data.intakeSessionId ?? null,
        version: data.version,
        language: data.language,
        signed_name: data.signedName.trim(),
        body_snapshot: data.bodySnapshot,
        ip,
        user_agent: userAgent,
      } as never)
      .select("id, signed_at")
      .single();

    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id, signedAt: (row as { signed_at: string }).signed_at };
  });
