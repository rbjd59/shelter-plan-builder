# Plan — Fix payments, add accounts, sync subscription state

## Decisions captured
- Billing: **$199 charged today** + $30/mo starting month 3
- Auth: **Magic-link login** (passwordless email)
- Self-service portal: **No** — staff cancels manually
- Tax: **Stripe full compliance handling** (+3.5%) on every checkout

## What changes

### 1. Fix the billing model so $199 is actually charged today
Replace the current `trial_period_days: 60` (which defers everything to month 3) with:
- `subscription_data.billing_cycle_anchor` = now + 60 days
- `subscription_data.proration_behavior: "none"`
- Line items stay: `pretransfer_30mo` (recurring) + `pretransfer_199` (one-time)

Result: first Stripe invoice today contains only the $199; the $30/mo starts on day 60 and bills monthly thereafter.

Also add `managed_payments: { enabled: true }` (full tax/fraud/dispute handling). Confirm `pretransfer_199` and `pretransfer_30mo` exist in Stripe; create them if missing with the correct tax code (`txcd_30060000` — legal services / form preparation).

### 2. Resolve a Stripe Customer per user
Add `resolveOrCreateCustomer` (search by `metadata.userId`, fall back to email, otherwise create) and pass `customer: customerId`. No more duplicate Customers on repeat checkout.

### 3. Make `verifyAndCreateIntake` actually mean "they paid"
Stop treating "subscription exists" as success. Require `session.payment_status === "paid"`. The new billing config guarantees the $199 is collected at checkout, so this is the right gate.

### 4. Magic-link login
- Auth pages: `/login` (enter email → send magic link) and `/auth/callback` (Supabase recovery).
- A logged-in user is **optional for buying** (we still capture email at checkout); but if a user is logged in, we attach `userId` to the Stripe Customer + Subscription metadata so they can see their case in `/dashboard` later.
- Add a small "Sign in" button in the SiteShell topbar.

### 5. Real webhook handler + `subscriptions` table
Replace the no-op handler with the standard one:
- Tables: `subscriptions` (per `stripe-webhooks` schema) + `profiles` (id → auth.users, email).
- Handle `customer.subscription.created/updated/deleted`, `checkout.session.completed`, `invoice.payment_failed`.
- Even an anonymous (no-userId) checkout writes a row keyed by `stripe_subscription_id` so staff can audit.

### 6. Family dashboard (logged-in only)
`/_authenticated/dashboard` lists the user's subscription (status, next bill date, $ amount, tracking link to their case). No "Cancel" button — copy says "To cancel, email intake@detenciondefensa.com".

### 7. Cleanup
- Remove the `PaymentTestModeBanner` from `/checkout` (the new yellow Beta banner already covers this site-wide).
- Add a `Sign in` link in the SiteShell nav (right side, next to language toggle).

## Technical implementation notes

**Files touched**
- `src/utils/payments.functions.ts` — new checkout payload, `resolveOrCreateCustomer`, stricter verify gate
- `src/routes/api/public/payments/webhook.ts` — full handler from the webhooks knowledge
- `src/routes/login.tsx`, `src/routes/auth.callback.tsx`, `src/routes/_authenticated.tsx`, `src/routes/_authenticated/dashboard.tsx` — magic-link auth + dashboard
- `src/components/SiteShell.tsx` — add Sign-in button, pass `userId` when navigating to checkout if signed in
- `src/components/StripeEmbeddedCheckout.tsx` — pass `userId` to server fn
- `src/routes/checkout.tsx` — drop duplicate test banner, read current user

**Database (migrations)**
- `profiles (id uuid pk → auth.users, email text, created_at)` + insert trigger from `auth.users`
- `subscriptions (...)` per the canonical schema, with RLS (owner-read, service_role write)
- `has_active_subscription(user_uuid, env)` security-definer function

**Stripe**
- Verify or create products `pretransfer_199` (one-time, $199) and `pretransfer_30mo` (recurring monthly, $30) with tax code `txcd_30060000`.
- `managed_payments: { enabled: true }` on every session.

**Auth config**
- `configure_auth`: keep `disable_signup: false`, no auto-confirm (magic links self-verify).
- Configure auth email templates so the magic-link email is branded (optional follow-up).

## How to test in preview

A yellow Beta banner is already site-wide. Stripe is in **sandbox/test** mode in preview, so no real money moves.

1. **Buy as guest**
   1. Open the preview, choose a language on `/splash`.
   2. Click any "Empezar — $199" / "Start — $199" button.
   3. On checkout, fill in any email; card `4242 4242 4242 4242`, any future expiry (e.g. `12/34`), any 3-digit CVC, any ZIP.
   4. Submit. You should be redirected to `/intake?session_id=…`. The page must show the form (not "We could not verify your payment").
   5. Open Stripe test dashboard via Lovable Cloud → Payments. The **first invoice** should be **$199** (paid today), and the subscription should show "Next invoice: in ~60 days, $30.00".
   6. Fill the intake form and submit. Confirm the family welcome email arrives and a row exists in `case_tracking`.

2. **Buy while logged in** (after auth ships)
   1. Click "Sign in" in the topbar → enter your email → click the magic link from your inbox.
   2. Repeat the buy flow. In `/dashboard` you should see the subscription appear within ~10 s of completing checkout (webhook-driven).

3. **Decline path** — re-run with card `4000 0000 0000 0002`. Checkout should refuse the card and you should NOT be redirected to `/intake`.

4. **3D-Secure** — card `4000 0025 0000 3155` triggers the bank-prompt flow; complete it, then verify the rest behaves like #1.

5. **Webhook sanity** — after each successful purchase, check `subscriptions` table: `status` is `active` (or `trialing` between purchase and the day-60 anchor depending on Stripe behavior), `current_period_end` is roughly 60 days out, `environment = 'sandbox'`.

If any test card fails with "Prices not found", that means the `pretransfer_199` / `pretransfer_30mo` lookup keys aren't registered yet — I'll create them as part of step 1.
