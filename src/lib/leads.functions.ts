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
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as string);
  if (!roles.some((r) => r === "admin" || r === "firm" || r === "staff")) {
    throw new Error("Not authorized");
  }
  return roles;
}

/** Admin / firm / staff: list captured leads, newest first. */
export type StaffMember = { userId: string; email: string; roles: string[] };

const STAFF_ROLES = ["admin", "firm", "staff"] as const;

/** Real accounts that hold a staff role; the only people a lead may be assigned to. */
async function loadStaff(): Promise<StaffMember[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("user_id, role")
    .in("role", [...STAFF_ROLES]);
  const byUser = new Map<string, string[]>();
  for (const r of data ?? [])
    byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r.role as string]);
  const staff: StaffMember[] = [];
  for (const [userId, roles] of byUser) {
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (u?.user?.email) staff.push({ userId, email: u.user.email, roles });
  }
  return staff.sort((a, b) => a.email.localeCompare(b.email));
}

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(
    async ({
      context,
    }): Promise<{ leads: LeadRow[]; roles: string[]; staff: StaffMember[]; me: string }> => {
      const roles = await assertStaff(context.userId);
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data, error } = await supabaseAdmin
        .from("leads" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      if (error) throw new Error(error.message);
      return {
        leads: (data ?? []) as unknown as LeadRow[],
        roles,
        staff: await loadStaff(),
        me: context.userId,
      };
    },
  );

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
    const { error } = await supabaseAdmin
      .from("leads" as never)
      .update(patch as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin / firm: assign a lead to a real staff account and email that person. */
export const assignLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), assigneeId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const roles = await assertStaff(context.userId);
    if (!roles.some((r) => r === "admin" || r === "firm")) throw new Error("Not authorized");
    const assignee = (await loadStaff()).find((s) => s.userId === data.assigneeId);
    if (!assignee) throw new Error("That person does not have a staff account");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: lead, error: readErr } = await supabaseAdmin
      .from("leads" as never)
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (readErr || !lead) throw new Error("Lead not found");
    const row = lead as unknown as LeadRow;
    const now = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from("leads" as never)
      .update({
        routed_to: assignee.userId,
        routed_at: now,
        assigned_note: `Assigned to ${assignee.email}`,
        status: row.status === "new" ? "routed" : row.status,
        updated_at: now,
      } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    let notified = false;
    if (row.routed_to !== assignee.userId) {
      try {
        const { sendTemplateEmail } = await import("./email-templates/send-email");
        const r = await sendTemplateEmail("lead-assigned", assignee.email, {
          templateData: {
            name: row.full_name,
            phone: row.phone ?? "",
            language: row.language,
            source: row.source,
            details: [row.need, row.message].filter(Boolean).join("\n"),
          },
          idempotencyKey: `lead-assigned-${row.id}-${assignee.userId}`,
        });
        notified = r.sent;
      } catch {
        console.error("Lead assignment email failed; assignment is saved", { id: row.id });
      }
    }
    return { ok: true, notified, assignee: assignee.email };
  });
