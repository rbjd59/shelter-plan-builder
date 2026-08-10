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
  legalName: "Sorrentino Law Firm, PLLC",
  attorney: "Rosario Kyle Sorrentino, Esq.",
  flBarNumber: "FL Bar No. 1049132",
  address: "1110 Brickell Avenue, Suite 430, Miami, FL 33131-3152",
  city: "Miami, FL",
  phone: "+1 (561) 757-0338",
  email: "rsorrentino@sorrentinolawfirm.com",
  website: "https://sorrentinolawfirm.com",
  barProfileUrl: "https://www.floridabar.org/mybarprofile/1049132",
  admittedDate: "September 20, 2023",
  lawSchool: "Ave Maria School of Law, 2023",
  county: "Miami-Dade",
  circuit: "11th Judicial Circuit",
  firmPosition: "Managing Partner",
  accentColor: "#6B4F4F",
  admissions: [
    "The Florida Bar — Member in Good Standing (admitted Sept. 20, 2023)",
    "Young Lawyers Section, The Florida Bar",
    "11th Judicial Circuit, Miami-Dade County",
  ],
} as const;

export const COMPANY = {
  legalName: "DetencionDefensa.com, Inc.",
  state: "Delaware corporation",
  domain: "detenciondefensa.com",
} as const;

/** Pro bono program: no client-facing fee. Kept at zero so nothing can render a price. */
export const PRICE = {
  totalCents: 0,
  companyCents: 0,
  firmCents: 0,
  totalUsd: "$0",
  companyUsd: "$0",
  firmUsd: "$0 (pro bono)",
} as const;
