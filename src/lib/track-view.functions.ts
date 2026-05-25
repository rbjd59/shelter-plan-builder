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
    await supabaseAdmin.from("page_views").insert({
      path: data.path.slice(0, 500),
      referrer: data.referrer ? data.referrer.slice(0, 500) : null,
      country,
      user_agent: ua,
    });
    return { ok: true };
  });
