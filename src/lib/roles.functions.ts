import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ROLES = ["admin", "firm", "staff"] as const;
type Role = (typeof ROLES)[number];

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Not authorized");
}

export type RoleMember = { userId: string; email: string; roles: string[] };

/** Admin only: list every user that holds a role, with their email. */
export const listRoleMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ members: RoleMember[] }> => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("user_roles").select("user_id, role");
    if (error) throw new Error(error.message);

    const byUser = new Map<string, string[]>();
    for (const r of data ?? []) {
      const list = byUser.get(r.user_id) ?? [];
      list.push(r.role as string);
      byUser.set(r.user_id, list);
    }

    const members: RoleMember[] = [];
    for (const [userId, roles] of byUser) {
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(userId);
      members.push({ userId, email: u?.user?.email ?? "(unknown)", roles });
    }
    members.sort((a, b) => a.email.localeCompare(b.email));
    return { members };
  });

/**
 * Admin only: grant a role to an email address. Creates the account (invite
 * style, no password) when the person has never signed in.
 */
export const grantRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ email: z.string().email(), role: z.enum(ROLES) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.trim().toLowerCase();

    // find existing user by email
    let userId: string | null = null;
    const { data: page } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    userId = page?.users?.find((u) => (u.email ?? "").toLowerCase() === email)?.id ?? null;

    if (!userId) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
      });
      if (error) throw new Error(error.message);
      userId = created.user?.id ?? null;
    }
    if (!userId) throw new Error("Could not resolve or create that user");

    const { error: insErr } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: data.role as Role }, { onConflict: "user_id,role" });
    if (insErr) throw new Error(insErr.message);

    return { ok: true, userId, email };
  });

/** Admin only: revoke a role. Cannot revoke your own admin role. */
export const revokeRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ userId: z.string().uuid(), role: z.enum(ROLES) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    if (data.userId === context.userId && data.role === "admin") {
      throw new Error("You cannot remove your own admin access");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.userId)
      .eq("role", data.role);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
