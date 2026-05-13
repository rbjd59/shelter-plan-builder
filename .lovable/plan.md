# DetencionDefensa.com — Checkout & Lifecycle Plan

## Pricing model (locked)
- **$199 one-time** — charged immediately at checkout (added to first invoice via `subscription_data.add_invoice_items`).
- **$10/month** subscription — `trial_period_days: 90`, so first $10 charge hits **month 4**.
- **3-month minimum** commitment after trial — enforced in our cancel flow (Stripe doesn't natively block early cancel).
- **Asset Protection Package — $100, "Coming July 2026"** — UI placeholder only, no Stripe product yet.

## On successful purchase (DONE / IN PROGRESS)
- `intake_submissions` row marked `paid=true` after Stripe verifies session.
- Customer redirected to `/intake?session_id=…&lang=…` to fill 7-section form.
- On intake submit: PDFs (AO 242 dynamic court + AO 240) generated, stored in `intake-forms` bucket, staff notification queued to `intake@detenciondefensa.com`.
- `case_tracking` row pre-created at payment time so staff sees the case immediately.

## On cancellation (TODO)
1. Stripe webhook `customer.subscription.deleted` fires.
2. Immediately email customer (ES/EN/HT): "You have **48 hours** to download/print your AO 242 + AO 240 forms before we permanently delete them. [Download link]"
3. Insert `pending_scrub` row with `scrub_at = now() + 48h`.
4. pg_cron job runs hourly, hard-deletes: PDFs from storage, `intake_submissions.answers`, `case_tracking` row.
5. Block early cancel (within 3-month minimum) in customer portal — show terms instead.

## On upgrade/downgrade
- Single tier today. Asset Protection ($100, July 2026) will be a separate `add_invoice_items` add-on at next renewal.

## Outstanding work
1. Email domain setup for `detenciondefensa.com` (`<presentation-open-email-setup>`).
2. Run `setup_email_infra` once domain configured.
3. Webhook: handle `customer.subscription.deleted` → enqueue 48h warning + insert scrub row.
4. New table `pending_scrubs (session_id, scrub_at)` + cron route `/api/public/hooks/scrub-cancelled`.
5. UI: wire $199 + $10/mo CTA in `SiteShell` to `/checkout`, add Asset Protection "coming soon" card.
6. Customer portal route + 3-month-minimum guard.
