// Server-only: office-staff allowlist. Read OFFICE_STAFF_EMAILS env var
// (comma-separated). Falls back to the legal inbox so a fresh deploy isn't
// locked out. Add more emails by setting the secret in Lovable Cloud.

const FALLBACK_ALLOWLIST = ["intake@detenciondefensa.com"];

export function getOfficeAllowlist(): string[] {
  const raw = process.env.OFFICE_STAFF_EMAILS;
  if (!raw) return FALLBACK_ALLOWLIST;
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isOfficeStaff(email: string | null | undefined): boolean {
  if (!email) return false;
  return getOfficeAllowlist().includes(email.toLowerCase());
}

export function assertOfficeStaff(email: string | null | undefined): void {
  if (!isOfficeStaff(email)) {
    throw new Error("Forbidden: office staff only");
  }
}
