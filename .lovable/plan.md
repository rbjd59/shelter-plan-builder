## Goal

Bring the full intake → PDF → email flow from the ICE Detainer Plan project into this site, behind a real $199 Stripe checkout that replaces the current `/checkout` stub. Trilingual (ES / EN / HT), same forms, same templates.

## Prerequisites (must happen first, in order)

1. **Enable Lovable Cloud** — required for storage, email queue, and the case-tracking tables.
2. **Enable Lovable's built‑in Stripe payments** — for the $199 one‑time charge that gates `/intake`. I'll run the eligibility check first and confirm with you before enabling.
3. **Set up an email sender domain** — needed so we can email the family their welcome link and email the intake team the prepared PDFs. I'll prompt you for this with the Cloud email setup dialog.
4. **Install `pdf-lib`** for AcroForm filling.

If you'd rather start with just steps 1 + 4 (no payments, no emails) and add the rest later, say so and I'll trim the plan.

## What gets copied from ICE Detainer Plan (verbatim or near-verbatim)

- `src/assets/forms/AO242.pdf` (official habeas template, base64 module)
- `src/assets/forms/AO240.pdf` (official IFP template, base64 module)
- `src/lib/email/intake-pdfs.server.ts` — pdf-lib AcroForm filler for both forms
- `src/lib/email/intake-notification.server.ts` — uploads PDFs to private storage, generates signed URLs, sends email to `intake@…` + creates family case-tracking record
- `src/lib/case-tracking.server.ts` + `case-tracking.functions.ts` — token-based family tracking page support
- `src/routes/intake.tsx` — the 7-section trilingual intake form (Petitioner, Respondent, Detainer, Grounds, IFP, Mailing, Family Contact) with disabled fields for inmate-filled blanks
- `src/utils/payments.functions.ts` — `verifyAndCreateIntake` and `submitIntakeAnswers` server functions

I'll adjust strings/branding to DetencionDefensa.com (e.g. recipient email, sender domain) and keep your existing dark-navy + cream + burnt-orange theme on the new pages instead of the cream-paper styling from the source project — the form layout stays functionally identical.

## What gets created in this project

- DB tables: `intake_sessions`, `case_tracking`, `email_send_log`, `email_unsubscribe_tokens`, `suppressed_emails` (most are auto-created by Cloud's email infra).
- Storage bucket `intake-forms` (private) with RLS so only signed URLs work.
- Stripe product: "Pre-Detention Defense Plan — $199 one-time" + (optionally) "$10/mo" subscription if you want me to wire the recurring portion now or later.
- Server route `/api/public/stripe-webhook` to record paid sessions.
- Replace `src/routes/checkout.tsx` stub: redirect to a real Stripe Checkout Session, return URL `/intake?session_id=…&lang=…`.
- Wire all `$199 + $10/mo` CTAs in `SiteShell` to `/checkout?lang=<current>`.

## Flow after build

```text
/                → click "$199 + $10/mo" CTA
/checkout        → server fn creates Stripe session, redirects to Stripe
Stripe           → on success, redirects to /intake?session_id=cs_…&lang=es
/intake          → verifies paid via verifyAndCreateIntake; user fills 7 sections
submit           → submitIntakeAnswers → fills AO 242 + AO 240 → uploads to
                   storage → emails intake team + family welcome email →
                   shows "✓ thank you" screen
```

## Open questions before I start

- The source project hard-codes the U.S. District Court for the Southern District of Florida on the AO 242 form. Keep that, or make it dynamic per case?
- Recipient address for the prepared forms email — keep `intake@gohomesooner.com` + `rbjd@dr.com`, or use a DetencionDefensa.com address?
- The $10/month subscription — start charging it at checkout (Stripe subscription + one-time fee combined), or only the $199 now and add the subscription later?

## Technical notes

- pdf-lib runs fine in the Cloudflare Worker SSR runtime used by TanStack Start; the existing project already proves this.
- Both PDF templates are AcroForm PDFs from uscourts.gov, embedded as base64 TS modules so they bundle cleanly without any runtime filesystem reads.
- The `personal3 / personal4 / personal5` checkbox groups on AO 242 use a custom `setCheckOption` helper that toggles widget appearance states — already battle-tested in the source.
- The intake form is presentational; it does NOT pick legal grounds for the user — the "we are not a law firm" disclaimer is preserved verbatim.
