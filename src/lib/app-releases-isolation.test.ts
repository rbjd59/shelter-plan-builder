// Confirms the anonymous Data API role CANNOT read the public.app_releases
// table — the storage path (apk_path) must never be reachable from a
// browser or any unauthenticated client.
//
// This is a live integration test against the project's Supabase Data API
// using the public publishable (anon) key. It runs in CI alongside other
// vitest suites.
import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const haveCreds = Boolean(url && anonKey);

describe("app_releases anon isolation", () => {
  if (!haveCreds) {
    it.skip("requires SUPABASE_URL + SUPABASE_PUBLISHABLE_KEY", () => {});
    return;
  }

  const anon = createClient(url!, anonKey!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  it("anon cannot SELECT any rows from app_releases", async () => {
    const { data, error } = await anon
      .from("app_releases")
      .select("platform, version, apk_path, testflight_url, is_current");

    // Acceptable outcomes: explicit permission error, OR zero rows (RLS denies all).
    // Either way, no row may come back to an anon client.
    if (error) {
      expect(error.message.toLowerCase()).toMatch(/permission|denied|not allowed|policy|rls/);
    } else {
      expect(data ?? []).toHaveLength(0);
    }
  });

  it("anon cannot SELECT apk_path specifically", async () => {
    const { data, error } = await anon.from("app_releases").select("apk_path");
    if (error) {
      expect(error.message.toLowerCase()).toMatch(/permission|denied|not allowed|policy|rls/);
    } else {
      expect(data ?? []).toHaveLength(0);
    }
  });

  it("anon cannot filter by is_current = true", async () => {
    const { data, error } = await anon
      .from("app_releases")
      .select("apk_path, testflight_url")
      .eq("is_current", true);
    if (error) {
      expect(error.message.toLowerCase()).toMatch(/permission|denied|not allowed|policy|rls/);
    } else {
      expect(data ?? []).toHaveLength(0);
    }
  });
});
