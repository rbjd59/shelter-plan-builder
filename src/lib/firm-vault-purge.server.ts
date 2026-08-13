/**
 * ZERO-RETENTION PURGE (company side)
 * ---------------------------------------------------------------------------
 * After a case bundle has been accepted by the Firm Vault, the company must
 * hold nothing that identifies the client. This module performs the hard
 * purge and leaves only the activation code plus timestamps behind.
 */

import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type PurgeResult = {
  activation_code: string;
  documents_deleted: number;
  contacts_deleted: number;
  profile_scrubbed: boolean;
};

/**
 * Deletes documents + contacts and nulls every PII column on app_clients for
 * one activation code. Idempotent: running it twice is a no-op the second time.
 */
export async function purgeCompanyCopy(activationCode: string): Promise<PurgeResult> {
  const code = activationCode.trim().toUpperCase();
  if (!/^[A-Z0-9]{8}$/.test(code)) throw new Error("invalid_activation_code");

  const { data: client } = await supabaseAdmin
    .from("app_clients")
    .select("id")
    .eq("invite_token", code)
    .maybeSingle();
  if (!client) throw new Error("unknown_activation_code");
  const clientId = (client as { id: string }).id;

  const { data: docs } = await supabaseAdmin
    .from("client_documents")
    .delete()
    .eq("client_id", clientId)
    .select("id");

  const { data: contacts } = await supabaseAdmin
    .from("client_contacts")
    .delete()
    .eq("client_id", clientId)
    .select("id");

  const { error: scrubError } = await supabaseAdmin
    .from("app_clients")
    .update({
      full_name: null,
      email: null,
      phone_e164: null,
      a_number: null,
      date_of_birth: null,
      place_of_birth: null,
      country_of_origin: null,
      attorney_name: null,
      attorney_phone: null,
      attorney_email: null,
      device_info: null,
    } as never)
    .eq("id", clientId);

  return {
    activation_code: code,
    documents_deleted: docs?.length ?? 0,
    contacts_deleted: contacts?.length ?? 0,
    profile_scrubbed: !scrubError,
  };
}
