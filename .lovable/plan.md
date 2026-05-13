# DetencionDefensa.com — Pro Se PWA Plan

## Pricing (LOCKED)
- **$199 one-time** at checkout (immediate, via `add_invoice_items`).
- **$30/month** subscription, `trial_period_days: 60` → first $30 charge hits **month 3**, ongoing until customer cancels.
- Old `$10/mo` and 3-month minimum REMOVED.

## End-to-end customer flow
1. Radio ad → site → "Create Pro Se Documents Now" CTA → **short disclaimer** modal (3 bullets + "I Understand & Agree", IP+timestamp logged).
2. Click through → `/disclaimer` **full LegalZoom-style page** (scrollable, 3 checkboxes, typed name, "I Agree", IP+timestamp logged to `disclaimer_acknowledgements`).
3. → `/checkout` ($199 + $30/mo).
4. → `/intake` (7-section form, district auto-detected from address).
5. → System generates AO 242 + AO 240 PDFs, stores in private bucket.
6. → SMS + email sent to customer with **PWA install link** (unique per case, signed token).
7. → Customer installs PWA → sets **dead-man-switch interval** (24/48/72h).

## PWA (installable, per-customer)
- Route: `/pwa/$token` with `manifest.json` + `display: standalone` (no service worker — see PWA knowledge).
- Shows: countdown to next required check-in, "I'M OK" button, "Trigger Now" button, view/print docs.
- On check-in: resets timer.
- On missed deadline OR manual trigger: starts **60-min cancel window** (push + email + SMS), then if not cancelled fires `triggered=true`.

## Trigger fires
- Email PDFs → `legal@detenciondefensa.com` + customer's registered email + emergency contact email.
- SMS link to PDFs → customer's phone + emergency contact phone.
- Mark case `triggered_at`, schedule purge at +24h.
- Purge job (pg_cron hourly): hard-delete PDFs from storage, intake answers, case_tracking row, PWA tokens. Customer record kept only as billing reference (Stripe customer id, no PII).

## On Stripe cancel
- Webhook `customer.subscription.deleted` → email "you have 48h to download/print" → row in `pending_scrubs` → cron purges 48h later.

## Outstanding work
1. **PREREQ — Twilio connection** (user declined; SMS dead-man-switch + trigger broadcast cannot ship until connected).
2. **PREREQ — Email domain** for `detenciondefensa.com` (cancel warnings, intake notifications, trigger broadcast).
3. New tables: `disclaimer_acknowledgements`, `pwa_tokens`, `dead_man_switch (case_id, interval_hours, last_checkin_at, trigger_armed_at, triggered_at)`, `pending_scrubs`.
4. Routes: `/disclaimer`, `/pwa/$token`, `/api/public/pwa/checkin`, `/api/public/pwa/trigger`, `/api/public/hooks/dms-tick` (cron, every 5 min).
5. Disclaimer short modal on landing CTA.
6. PWA manifest + install prompt + countdown UI.
7. Trigger broadcast: email (legal@ + customer + contact) + SMS (customer + contact) with signed PDF links.
8. Purge cron: hard-delete after trigger+24h, after cancel+48h.
