import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getRequestHeader } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const trackView = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      path: z.string().min(1).max(500),
      referrer: z.string().max(500).optional().nullable(),
    }).parse,
  )
  .handler(async ({ data }) => {
    const ua = getRequestHeader("user-agent") ?? null;
    const country = getRequestHeader("cf-ipcountry") ?? null;
    const city = getRequestHeader("cf-ipcity") ?? null;
    const ip =
      getRequestHeader("cf-connecting-ip") ??
      getRequestHeader("x-real-ip") ??
      (getRequestHeader("x-forwarded-for") ?? "").split(",")[0]?.trim() ??
      null;
    const l = (ua ?? "").toLowerCase();
    const device = /android/.test(l)
      ? "android"
      : /iphone|ipad|ipod/.test(l)
      ? "ios"
      : /curl|python|wget|bot|crawler|httpclient/.test(l)
      ? "script/bot"
      : "desktop";
    await supabaseAdmin.from("page_views").insert({
      path: data.path.slice(0, 500),
      referrer: data.referrer ? data.referrer.slice(0, 500) : null,
      country,
      city: city ? city.slice(0, 120) : null,
      ip: ip ? ip.slice(0, 64) : null,
      device,
      user_agent: ua,
    });
    return { ok: true };
  });
