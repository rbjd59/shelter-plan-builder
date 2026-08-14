// Admin server functions for the App Store Connect API (TestFlight status +
// build management). Only callers with the 'admin' role may use these. The
// heavy lifting lives in appstore.server.ts (server-only, never client).
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  listApps,
  listBuilds,
  listBetaGroups,
  addBuildToBetaGroup,
  credentialStatus,
} from "./appstore.server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data: isAdmin } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

export const appStoreListApps = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    return await listApps();
  });

export const appStoreListBuilds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ appId: z.string().min(1).max(40) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    return await listBuilds(data.appId);
  });

export const appStoreListBetaGroups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ appId: z.string().min(1).max(40) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    return await listBetaGroups(data.appId);
  });

export const appStoreAddBuildToGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({
      buildId: z.string().min(1).max(40),
      groupId: z.string().min(1).max(40),
    }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    await addBuildToBetaGroup(data.buildId, data.groupId);
    return { ok: true };
  });

export const appStoreCredStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    return credentialStatus();
  });
