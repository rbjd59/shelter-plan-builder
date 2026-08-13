import { createServerFn } from "@tanstack/react-start";

/**
 * Company-side handoff: ship a completed case to Sorrentino Law Firm PLLC's
 * separate backend, then hard-purge the company's copy. The company keeps only
 * the activation code.
 */
export const handoffCaseToVault = createServerFn({ method: "POST" })
  .inputValidator((d: { pin: string; activationCode: string }) => d)
  .handler(async ({ data }) => {
    const { assertBoardPin } = await import("@/lib/board-pin.server");
    assertBoardPin(data.pin);

    const { buildVaultBundleFor } = await import("@/lib/firm-vault-bundle.server");
    const { vaultIngestCase, vaultConfigured } = await import("@/lib/firm-vault.server");
    const { purgeCompanyCopy } = await import("@/lib/firm-vault-purge.server");

    if (!vaultConfigured()) {
      throw new Error(
        "The firm vault is not connected yet. Add FIRM_VAULT_URL and FIRM_VAULT_HMAC_SECRET first.",
      );
    }

    const bundle = await buildVaultBundleFor(data.activationCode);
    const receipt = await vaultIngestCase(bundle);
    const purge = await purgeCompanyCopy(data.activationCode);

    return { receipt, purge };
  });

/** Board read: activation code only, unless the firm reports a live trigger. */
export const vaultBoardStatus = createServerFn({ method: "POST" })
  .inputValidator((d: { pin: string; activationCodes: string[] }) => d)
  .handler(async ({ data }) => {
    const { assertBoardPin } = await import("@/lib/board-pin.server");
    assertBoardPin(data.pin);

    const { vaultGetStatusBatch, vaultConfigured } = await import("@/lib/firm-vault.server");
    if (!vaultConfigured()) return { connected: false as const, rows: [] };

    const { rows } = await vaultGetStatusBatch(data.activationCodes);
    return { connected: true as const, rows };
  });
