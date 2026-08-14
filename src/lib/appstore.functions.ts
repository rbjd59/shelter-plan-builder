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
  listVersions,
  submitBuildForReview,
  expireBuild,
  removeBuildFromBetaGroup,
  setWhatToTest,
  listBetaTesters,
  inviteBetaTesters,
  removeBetaTester,
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

export const appStoreListVersions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ appId: z.string().min(1).max(40) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    return await listVersions(data.appId);
  });

export const appStoreSubmitForReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        appId: z.string().min(1).max(40),
        buildId: z.string().min(1).max(40),
        versionString: z.string().min(1).max(40),
        replaceExisting: z.boolean().optional(),
        whatsNew: z.string().max(4000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    return await submitBuildForReview(data.appId, data.buildId, data.versionString, {
      replaceExisting: data.replaceExisting,
      whatsNew: data.whatsNew,
    });
  });

export const appStoreCredStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    return credentialStatus();
  });

export const appStoreExpireBuild = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ buildId: z.string().min(1).max(40) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    await expireBuild(data.buildId);
    return { ok: true };
  });

export const appStoreRemoveBuildFromGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ buildId: z.string().min(1).max(40), groupId: z.string().min(1).max(40) })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    await removeBuildFromBetaGroup(data.buildId, data.groupId);
    return { ok: true };
  });

export const appStoreSetWhatToTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        buildId: z.string().min(1).max(40),
        whatsNew: z.string().min(1).max(4000),
        locale: z.string().min(2).max(10).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    await setWhatToTest(data.buildId, data.whatsNew, data.locale ?? "en-US");
    return { ok: true };
  });

export const appStoreListTesters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ groupId: z.string().min(1).max(40) }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    return await listBetaTesters(data.groupId);
  });

export const appStoreInviteTesters = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        groupId: z.string().min(1).max(40),
        testers: z
          .array(
            z.object({
              email: z.string().email().max(200),
              firstName: z.string().max(80).optional(),
              lastName: z.string().max(80).optional(),
            }),
          )
          .min(1)
          .max(100),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    return await inviteBetaTesters(data.groupId, data.testers);
  });

export const appStoreRemoveTester = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ groupId: z.string().min(1).max(40), testerId: z.string().min(1).max(40) })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    await removeBetaTester(data.groupId, data.testerId);
    return { ok: true };
  });
