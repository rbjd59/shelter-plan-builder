import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function plaidBase() {
  const env = (process.env.PLAID_ENV || "sandbox").toLowerCase();
  if (env === "production") return "https://production.plaid.com";
  if (env === "development") return "https://development.plaid.com";
  return "https://sandbox.plaid.com";
}

async function plaidCall<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  if (!clientId || !secret) {
    throw new Error("Plaid is not configured (missing PLAID_CLIENT_ID or PLAID_SECRET).");
  }
  const res = await fetch(`${plaidBase()}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ client_id: clientId, secret, ...body }),
  });
  const json = (await res.json()) as any;
  if (!res.ok) {
    const msg = json?.error_message || json?.error_code || `Plaid error ${res.status}`;
    throw new Error(msg);
  }
  return json as T;
}

/**
 * Create a Plaid Link token used by react-plaid-link on the client.
 * We pass a submission_id (uuid we generated for the qualify draft) as client_user_id
 * so we can correlate the Plaid item back to the qualification record.
 */
export const createPlaidLinkToken = createServerFn({ method: "POST" })
  .inputValidator((data: { submissionId: string; legalName?: string }) =>
    z
      .object({
        submissionId: z.string().uuid(),
        legalName: z.string().trim().max(200).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const resp = await plaidCall<{ link_token: string; expiration: string }>(
      "/link/token/create",
      {
        client_name: "DetencionDefensa",
        language: "en",
        country_codes: ["US"],
        user: { client_user_id: data.submissionId, legal_name: data.legalName },
        products: ["auth", "transactions", "income_verification"],
      },
    );
    return { linkToken: resp.link_token, expiration: resp.expiration };
  });

/**
 * Exchange the public_token from Plaid Link for an access_token, and save
 * it onto the qualification submission row.
 */
export const exchangePlaidPublicToken = createServerFn({ method: "POST" })
  .inputValidator((data: { submissionId: string; publicToken: string }) =>
    z
      .object({
        submissionId: z.string().uuid(),
        publicToken: z.string().min(10),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const resp = await plaidCall<{ access_token: string; item_id: string }>(
      "/item/public_token/exchange",
      { public_token: data.publicToken },
    );

    // Persist token + item id on the submission. We store the access token
    // as-is in a column named *_encrypted — production should wrap with pgcrypto.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("qualify_submissions")
      .update({
        plaid_item_id: resp.item_id,
        plaid_access_token_encrypted: resp.access_token,
        plaid_linked_at: new Date().toISOString(),
      })
      .eq("id", data.submissionId);

    if (error) throw new Error(error.message);
    return { ok: true, itemId: resp.item_id };
  });
