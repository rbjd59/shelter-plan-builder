import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SignupSchema = z.object({
  email: z.string().email().max(255),
  user_agent: z.string().max(500).optional(),
  source: z.enum(["en", "es", "ht"]).optional(),
});

export const submitDefenderSignup = createServerFn({ method: "POST" })
  .inputValidator((input) => SignupSchema.parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("defendermicasa_signups")
      .insert({
        email: data.email,
        user_agent: data.user_agent ?? null,
        source: data.source ? `coming-soon:${data.source}` : "coming-soon",
      });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
