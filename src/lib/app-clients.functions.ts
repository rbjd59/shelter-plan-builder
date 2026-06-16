import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Admin-only: resend the activation code email + SMS for a given app client.
 */
export const resendActivationFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { clientId: string }) => {
    if (!data.clientId || typeof data.clientId !== "string") {
      throw new Error("Invalid clientId");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { resendActivation } = await import("./app-clients.server");
    return resendActivation(data.clientId);
  });
