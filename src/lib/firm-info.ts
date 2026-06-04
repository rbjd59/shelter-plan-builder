/**
 * Single source of truth for the independent law firm that provides legal
 * services to DetencionDefensa customers. Update the [CONFIRM: ...] values
 * with Rosario's official credentials before production launch.
 *
 * Compliance:
 * - Florida Bar Rule 4-7 (advertising) requires geographic location of the
 *   firm on every page that references legal services.
 * - Florida Bar Rule 4-5.4 forbids fee sharing with non-lawyers — Company
 *   funds and Firm funds are kept on separate Stripe charges, never pooled.
 */

export const FIRM = {
  legalName: "Sorrentino Law Firm PLLC",
  attorney: "Rosario Sorrentino, Esq.",
  // TODO: Replace placeholders before production launch.
  flBarNumber: "[CONFIRM: FL Bar #]",
  address: "[CONFIRM: Firm address — street, city, FL ZIP]",
  city: "[CONFIRM: City], FL",
  phone: "[CONFIRM: Firm phone]",
  email: "[CONFIRM: Firm email]",
  accentColor: "#6B4F4F",
  admissions: [
    "The Florida Bar",
    "U.S. District Court for the Southern District of Florida",
    "U.S. Court of Appeals for the Eleventh Circuit",
  ],
} as const;

export const COMPANY = {
  legalName: "DetencionDefensa.com, Inc.",
  state: "Delaware corporation",
  domain: "detenciondefensa.com",
} as const;

export const PRICE = {
  totalCents: 19900,
  companyCents: 16400,
  firmCents: 3500,
  totalUsd: "$199",
  companyUsd: "$164",
  firmUsd: "$35",
} as const;
