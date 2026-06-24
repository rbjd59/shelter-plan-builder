// Admin server functions for managing app releases (Android APK / iOS TestFlight).
// Only callers with the 'admin' role may use these.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data: isAdmin } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

export interface AppRelease {
  id: string;
  platform: "android" | "ios";
  version: string;
  apk_path: string | null;
  testflight_url: string | null;
  min_android_sdk: number | null;
  notes: string | null;
  is_current: boolean;
  created_at: string;
}

export const listAppReleases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AppRelease[]> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("app_releases")
      .select("id,platform,version,apk_path,testflight_url,min_android_sdk,notes,is_current,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as AppRelease[];
  });

const createReleaseSchema = z.object({
  platform: z.enum(["android", "ios"]),
  version: z.string().min(1).max(40),
  apk_path: z.string().max(500).nullable().optional(),
  testflight_url: z.string().url().max(500).nullable().optional(),
  min_android_sdk: z.number().int().min(1).max(99).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  make_current: z.boolean().default(true),
});

export const createAppRelease = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createReleaseSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.make_current) {
      // Clear current flag on this platform before inserting new current row
      // (unique partial index enforces only one current per platform).
      const { error: clrErr } = await supabaseAdmin
        .from("app_releases")
        .update({ is_current: false })
        .eq("platform", data.platform)
        .eq("is_current", true);
      if (clrErr) throw clrErr;
    }

    const { data: row, error } = await supabaseAdmin
      .from("app_releases")
      .insert({
        platform: data.platform,
        version: data.version,
        apk_path: data.apk_path ?? null,
        testflight_url: data.testflight_url ?? null,
        min_android_sdk: data.min_android_sdk ?? null,
        notes: data.notes ?? null,
        is_current: data.make_current,
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { id: row.id };
  });

export const setCurrentRelease = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), platform: z.enum(["android", "ios"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: clrErr } = await supabaseAdmin
      .from("app_releases")
      .update({ is_current: false })
      .eq("platform", data.platform)
      .eq("is_current", true);
    if (clrErr) throw clrErr;
    const { error } = await supabaseAdmin
      .from("app_releases")
      .update({ is_current: true })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const deleteAppRelease = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Look up apk_path so we can also remove the storage object
    const { data: row } = await supabaseAdmin
      .from("app_releases")
      .select("apk_path")
      .eq("id", data.id)
      .maybeSingle();
    if (row?.apk_path) {
      await supabaseAdmin.storage.from("app-builds").remove([row.apk_path]);
    }
    const { error } = await supabaseAdmin.from("app_releases").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
