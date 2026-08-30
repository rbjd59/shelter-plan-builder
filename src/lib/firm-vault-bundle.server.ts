/**
 * Assembles the case bundle the company hands to the Firm Vault.
 * Deliberately excludes anything location-related.
 */

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { VaultCaseBundle } from "@/lib/firm-vault.server";

export async function buildVaultBundleFor(activationCode: string): Promise<VaultCaseBundle> {
  const code = activationCode.trim().toUpperCase();
  if (!/^[A-Z0-9]{5,8}$/.test(code)) throw new Error("invalid_activation_code");

  const { data: client } = await supabaseAdmin
    .from("app_clients")
    .select(
      "id, invite_token, language, full_name, email, phone_e164, a_number, date_of_birth, place_of_birth, country_of_origin",
    )
    .eq("invite_token", code)
    .maybeSingle();
  if (!client) throw new Error("unknown_activation_code");

  const row = client as Record<string, string | null> & { id: string };

  const [{ data: contacts }, { data: documents }] = await Promise.all([
    supabaseAdmin
      .from("client_contacts")
      .select("name, phone_e164, email, relationship, role, priority")
      .eq("client_id", row.id)
      .order("priority", { ascending: true }),
    supabaseAdmin
      .from("client_documents")
      .select("title, content, document_type, send_on_alert")
      .eq("client_id", row.id)
      .order("loaded_at", { ascending: true }),
  ]);

  return {
    activation_code: code,
    language: row.language ?? "es",
    profile: {
      full_name: row.full_name,
      email: row.email,
      phone_e164: row.phone_e164,
      a_number: row.a_number,
      date_of_birth: row.date_of_birth,
      place_of_birth: row.place_of_birth,
      country_of_origin: row.country_of_origin,
    },
    contacts: (contacts ?? []) as VaultCaseBundle["contacts"],
    documents: (documents ?? []) as VaultCaseBundle["documents"],
  };
}
