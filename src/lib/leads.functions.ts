import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const leadSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(200).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  language: z.enum(["en", "es", "ht"]).default("es"),
  city: z.string().max(120).optional().nullable(),
  need: z.string().max(200).optional().nullable(),
  message: z.string().max(4000).optional().nullable(),
  source: z.string().max(80).optional().nullable(),
});

/** Public: capture an inquiry from the website and route it to the Firm. */
export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => leadSchema.parse(d))
  .handler(async ({ data }) => {
    const { createLead } = await import("./leads.server");
    return await createLead(data);
  });

export type LeadRow = {
  id: string;
  created_at: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  language: string;
  city: string | null;
  need: string | null;
  message: string | null;
  source: string;
  status: string;
  routed_to: string | null;
  routed_at: string | null;
  assigned_note: string | null;
};

async function assertStaff(userId: string): Promise<string[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as string);
  if (!roles.some((r) => r === "admin" || r === "firm" || r === "staff")) {
    throw new Error("Not authorized");
  }
  return roles;
}

/** Admin / firm / staff: list captured leads, newest first. */
export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ leads: LeadRow[]; roles: string[] }> => {
    const roles = await assertStaff(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("leads" as never)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return { leads: (data ?? []) as unknown as LeadRow[], roles };
  });

/** Admin / firm: update a lead's status or routing note. */
export const updateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["new", "routed", "contacted", "accepted", "declined", "closed"]).optional(),
        assignedNote: z.string().max(1000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const roles = await assertStaff(context.userId);
    if (!roles.some((r) => r === "admin" || r === "firm")) throw new Error("Not authorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.status) patch.status = data.status;
    if (data.assignedNote !== undefined) patch.assigned_note = data.assignedNote;
    const { error } = await supabaseAdmin.from("leads" as never).update(patch as never).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
