export const REMINDER_MINUTES = [60, 30, 15] as const;
export type ServiceKind = 'heloc' | 'sale' | 'rental' | 'trust' | 'business';
export const CHECKLISTS: Record<ServiceKind, string[]> = {
 heloc: ['Photo ID or identity-help request', 'Signed document-release permission', 'Deed and full property address', 'All mortgage statements and payoff quotes', 'Income and bank records requested by lender', 'Tax, insurance and HOA bills', 'Liens, judgments and foreclosure notices', 'Lender-approved valuation and condition report', 'Title search and lender-required title coverage', 'Trust documents and lender approval of trust borrower', '120-day housing reserve calculation'],
 sale: ['Signed owner permission', 'Deed and all owner names', 'Mortgage payoff and lien information', 'Title search', 'Property condition and repair photos', 'Comparable sales and licensed broker price opinion', 'Seller disclosures required in the state', 'Licensed listing agreement', 'Reviewed trust and trustee sale authority'],
 rental: ['Signed owner permission', 'Deed and owner names', 'Rental comparables', 'Condition, safety and repair check', 'Insurance and local rental requirements', 'HOA rental restrictions', 'Property manager agreement', 'Lease reviewed for the property state', 'Reviewed trust and trustee rental authority'],
 trust: ['Owner and beneficiary names', 'Trustee and backup trustee names', 'Property address and legal description', 'Deed, mortgage and lien review', 'Distribution and successor instructions', 'Attorney-approved trust terms', 'Witness and notary plan', 'Lender/insurance/HOA review before any transfer', 'Separate attorney-prepared deed and recording'],
 business: ['Owner permission and business goal', 'Customer list and repeat work', 'Work photos, invoices and receipts', 'Income, costs and bank records', 'Vehicles and equipment with debts', 'Company papers and licenses if any', 'Workers and customer agreements', 'Business value and marketing review', 'Licensed broker agreement and reviewed 10% commission terms'],
};
export function proposedPackageFee(amount: number): number | null {
 if (!Number.isFinite(amount) || amount < 100000 || amount > 1000000) return null;
 return amount <= 500000 ? 2500 : 5000;
}
export function dueReminders(startsAt: string, handled: number[], now = Date.now(), selected: readonly number[] = REMINDER_MINUTES) {
 const remaining = (new Date(startsAt).getTime() - now) / 60000;
 if (!Number.isFinite(remaining) || remaining <= 0) return [];
 // A short recovery window catches delayed checks without sending stale notices.
 return selected.filter(m => !handled.includes(m) && remaining <= m && remaining > m - 5);
}
export const LIMITED_POWERS = ['Pick up and care for the named children, subject to custody orders', 'Access and maintain my vehicle; no sale or title transfer', 'Pay my bills and credit card from funds I authorize', 'Speak with my bank and manage only the accounts I list; opening an account requires the bank to accept this authority', 'Hire and speak with lawyers on my behalf'];
export const EXCLUDED_POWERS = ['sell real estate', 'rent real estate', 'mortgage real estate', 'transfer real estate', 'make gifts', 'change beneficiaries'];