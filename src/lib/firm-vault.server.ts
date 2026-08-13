/**
 * FIRM VAULT CLIENT (company side)
 * ---------------------------------------------------------------------------
 * DetencionDefensa, Inc. is NOT the custodian of client files. Sorrentino Law
 * Firm PLLC is. This module is the only sanctioned way for the company system
 * to talk to the firm's separate backend ("Firm Vault").
 *
 * Rules enforced here:
 *   - Every request is HMAC-SHA256 signed over the raw body with a timestamp,
 *     so the Vault can reject replays and unsigned callers.
 *   - The company NEVER receives the Vault's service-role key.
 *   - Status lookups return an activation code only, unless a trigger is live.
 *     Live locate packets are returned in-memory and must not be persisted.
 *   - No location data is transmitted in either direction, ever.
 */

export type VaultContact = {
  name: string;
  phone_e164?: string | null;
  email?: string | null;
  relationship?: string | null;
  role?: "family" | "lawyer" | "company";
  priority?: number;
};

export type VaultDocument = {
  title: string;
  content: string;
  document_type: string;
  send_on_alert?: boolean;
};

export type VaultCaseBundle = {
  activation_code: string;
  language: string;
  profile: {
    full_name?: string | null;
    email?: string | null;
    phone_e164?: string | null;
    a_number?: string | null;
    date_of_birth?: string | null;
    place_of_birth?: string | null;
    country_of_origin?: string | null;
  };
  contacts: VaultContact[];
  documents: VaultDocument[];
};

export type VaultStatus = {
  activation_code: string;
  registered_at: string | null;
  activated_at: string | null;
  latest_alert: { triggered_at: string; cancelled_at: string | null } | null;
  /** Present ONLY while an alert is live. Render and discard — never store. */
  locate: {
    full_name: string | null;
    a_number: string | null;
    date_of_birth: string | null;
    place_of_birth: string | null;
    country_of_origin: string | null;
    language: string | null;
    phone: string | null;
  } | null;
};

export function vaultConfigured(): boolean {
  return Boolean(process.env["FIRM_VAULT_URL"] && process.env["FIRM_VAULT_HMAC_SECRET"]);
}

async function hmacHex(secret: string, body: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function vaultPost<T>(path: string, payload: unknown): Promise<T> {
  const base = process.env["FIRM_VAULT_URL"]?.replace(/\/+$/, "");
  const secret = process.env["FIRM_VAULT_HMAC_SECRET"];
  if (!base || !secret) throw new Error("firm_vault_not_configured");

  const body = JSON.stringify({ ...(payload as object), timestamp: new Date().toISOString() });
  const signature = await hmacHex(secret, body);

  const resp = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-vault-signature": `sha256=${signature}`,
    },
    body,
  });
  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`vault_${resp.status}: ${text.slice(0, 300)}`);
  }
  return JSON.parse(text) as T;
}

/** Hand a completed case to the firm. Returns once the firm confirms receipt. */
export async function vaultIngestCase(bundle: VaultCaseBundle) {
  return vaultPost<{ ok: true; activation_code: string; received_at: string }>(
    "/api/public/vault/ingest",
    bundle,
  );
}

/** Board lookup for one activation code. Code-only unless a trigger is live. */
export async function vaultGetStatus(activationCode: string) {
  return vaultPost<VaultStatus>("/api/public/vault/status", {
    activation_code: activationCode.trim().toUpperCase(),
  });
}

/** Batch board lookup. Same disclosure rules per row. */
export async function vaultGetStatusBatch(activationCodes: string[]) {
  return vaultPost<{ rows: VaultStatus[] }>("/api/public/vault/status", {
    activation_codes: activationCodes.map((c) => c.trim().toUpperCase()),
  });
}
