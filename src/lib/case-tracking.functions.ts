import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface PublicCaseStatus {
  found: boolean;
  contactName: string | null;
  inmateName: string | null;
  language: string;
  step1At: string | null;
  step2At: string | null;
  step3At: string | null;
}

export const getPublicCaseStatus = createServerFn({ method: "GET" })
  .inputValidator((data: { token: string }) => {
    if (!data?.token || !/^[a-f0-9]{32,40}$/i.test(data.token)) throw new Error("Invalid token");
    return data;
  })
  .handler(async ({ data }): Promise<PublicCaseStatus> => {
    const { data: row } = await supabaseAdmin
      .from("case_tracking")
      .select(
        "contact_name, inmate_name, language, step1_received_at, step2_sent_to_inmate_at, step3_sent_to_family_at",
      )
      .eq("tracking_token", data.token)
      .maybeSingle();
    if (!row) {
      return {
        found: false,
        contactName: null,
        inmateName: null,
        language: "es",
        step1At: null,
        step2At: null,
        step3At: null,
      };
    }
    const r = row as {
      contact_name: string | null;
      inmate_name: string | null;
      language: string;
      step1_received_at: string | null;
      step2_sent_to_inmate_at: string | null;
      step3_sent_to_family_at: string | null;
    };
    return {
      found: true,
      contactName: r.contact_name,
      inmateName: r.inmate_name,
      language: r.language,
      step1At: r.step1_received_at,
      step2At: r.step2_sent_to_inmate_at,
      step3At: r.step3_sent_to_family_at,
    };
  });
