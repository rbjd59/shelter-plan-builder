# Launch Readiness Plan — DetencionDefensa + Primo App

Everything remaining to (1) finish the product, (2) get the phone app into the App Store and Play Store, and (3) be safe to point a radio ad at the phone number / URL.

---

## 1. Product completion (web + backend)

### 1a. Qualify → Intake → Pay
- [ ] Walk qualify wizard EN / ES / HT with 3 test households (qualifies, reduced-cost 10% off, does-not-qualify). Confirm the 10% discount actually applies at Stripe checkout.
- [ ] Step 2 ID verification: run one full Stripe Identity session end-to-end (phone SMS link, license front/back, selfie, webhook flips `status` to `verified`).
- [ ] Step 2 document uploads: upload one church letter + one income doc for each of the three doc types (pay stub, tax return, benefits letter). Confirm they land in the `qualify-docs` private bucket and are visible in the admin console.
- [ ] Intake draft autosave: leave mid-form on each step, come back, resume.
- [ ] A-number / phone / email validation errors read correctly in all three languages.

### 1b. Payment + activation
- [ ] Switch Stripe from sandbox to live keys, run one $1 live test on a real card, refund it.
- [ ] Confirm webhook `/api/public/payments/webhook` in **live mode** creates the activation code and `app_clients` row.
- [ ] Welcome email fires in the client's chosen language only; no attorney / company / emergency-contact emails on activation (those are SOS-only).
- [ ] Client SMS confirmation fires with correct 8-char invite code.

### 1c. `/configurar` setup hub (5 steps)
- [ ] Magic-link email → OTP → `/configurar/dashboard` works on iPhone Safari and Android Chrome.
- [ ] Profile / Contacts (up to 8) / Documents / Pets / PIN — every field saves on blur, progress checkmarks correct.
- [ ] After setup, entering the activation code in the native app pulls everything down via `get_client_bundle` with no re-entry.

### 1d. SOS end-to-end
- [ ] Trigger from phone → `emergency_activations` row → email + SMS fan-out to all contacts + attorney.
- [ ] Correct PIN cancels; wrong PIN does not.
- [ ] Emergency emails include Habeas + POA + Pet Plan PDFs as attachments (not inline `<pre>`).
- [ ] `/alerta/$token` renders in recipient's language.

### 1e. Role isolation & security
- [ ] Log in as attorney role, company role, admin role — confirm each sees only their scope.
- [ ] Run `security--run_security_scan`, resolve any critical findings.
- [ ] Confirm every `public.*` table has `GRANT`s matching its RLS policies.

---

## 2. App Store (iOS) submission

The phone app is a Capacitor build wrapping the same activation-code + SOS flow. To get it into TestFlight → App Store:

- [ ] Apple Developer Program enrollment ($99/yr) — confirm active, D-U-N-S if org account.
- [ ] Bundle ID registered (`com.detenciondefensa.primo` or similar), App ID + push cert configured.
- [ ] App Store Connect record created: name, subtitle, category (Utilities or Medical), age rating, primary language = Spanish.
- [ ] Screenshots at required sizes (6.7", 6.5", 5.5" iPhone), EN + ES + HT.
- [ ] App icon 1024×1024, no alpha.
- [ ] Privacy nutrition labels — declare: location (SOS), contacts (emergency contacts), user content (docs), identifiers (device ID for push).
- [ ] Privacy policy URL (already at `/privacy`) + support URL (`/support`) + marketing URL.
- [ ] Data-safety declaration for background location + SMS-adjacent behavior.
- [ ] Sign-in with Apple — required if any social login is offered; add it or remove Google-only.
- [ ] Export compliance answer (uses HTTPS only → standard exemption).
- [ ] TestFlight internal build → external build with 5+ real testers running through: install → enter code → configure → fire SOS → cancel with PIN.
- [ ] App Review notes: include a demo activation code + demo PIN + explanation of the emergency use case (reviewers reject unexplained SOS/location apps).
- [ ] Submit to review. Budget 3–7 days, plan for one rejection round.

---

## 3. Play Store (Android) submission

Right now Android is a signed APK direct-download at `/api/public/app/latest.apk`. To be radio-safe we need Play Store listing (users will search, not type URLs).

- [ ] Google Play Console account ($25 one-time), D-U-N-S if org.
- [ ] Convert APK build to AAB (Android App Bundle) — Play requires AAB.
- [ ] Package name locked (`com.detenciondefensa.primo`).
- [ ] Play Console listing: title, short + long description EN/ES/HT, feature graphic 1024×500, phone screenshots, category = Communication or Medical.
- [ ] Data safety form: location, contacts, personal info, financial info (if income docs).
- [ ] Sensitive permissions declarations:
  - Foreground service (SOS) — justify use case
  - SMS permission (if used) — high-scrutiny, may need to remove or use RCS/notifications instead
  - Background location — justify with screen recording
- [ ] Target SDK current (34+ as of 2026).
- [ ] Internal testing track → closed testing (20 testers, 14 days) → production. Google now requires the 20-tester / 14-day closed test before first production release.
- [ ] Keep the direct-APK download live at `/get-app` for users on non-Play devices (Huawei, sideload).

---

## 4. Radio-ad readiness

A radio spot drives spikes of low-context, Spanish-first, phone-in-hand traffic. Every failure mode gets amplified.

### 4a. Capacity & reliability
- [ ] Load-test `/qualify`, `/intake`, `/checkout`, `/get-app`, `/api/public/payments/webhook` at 50 req/s for 5 min. Watch Cloud instance size — upgrade if we see timeouts.
- [ ] Confirm Cloudflare Worker cold-start is acceptable on the SOS trigger path.
- [ ] Twilio A2P 10DLC campaign approved for the expected daily SMS volume; request higher throughput if radio market > 100k listeners.
- [ ] Resend/email domain warmed; SPF/DKIM/DMARC all green; monitor bounce rate < 2%.
- [ ] Stripe live-mode rate limits and radar rules tuned (expect fraud attempts on a phone-in payment page).

### 4b. Attribution & analytics
- [ ] Vanity URL per market (e.g. `detenciondefensa.com/radio` or `/miami`, `/orlando`) 302 → `/qualify?utm_source=radio&utm_campaign=<market>`.
- [ ] Server-side event logging on qualify start, qualify complete, checkout start, checkout success, activation, install.
- [ ] Daily funnel dashboard (admin console) so we see drop-off within 24h of a spot airing.

### 4c. Phone number
- [ ] Decide: do we advertise a phone number or a URL? If phone, provision a tracked Twilio number per market that forwards to the intake team, records call, transcribes.
- [ ] Voicemail greeting in Spanish first, English second, Creole third, with the website URL spoken clearly.
- [ ] After-hours: SMS auto-reply with the qualify link.

### 4d. Content & compliance
- [ ] Radio script legal review (no unauthorized practice of law claims, FL Bar 4-7 advertising rules if Sorrentino firm branding is on air).
- [ ] Spanish + Haitian Creole voiceovers cut, 30s and 60s versions.
- [ ] Required disclaimers recorded (attorney advertising, results not guaranteed, fee separation).
- [ ] File the radio copy with FL Bar advertising review if firm is named.

### 4e. Support surge plan
- [ ] Staff schedule for the 2h after each ad airs — someone watching admin console, Resend, Twilio for failures.
- [ ] Prewritten SMS templates for the top 5 confused-user cases ("I paid but no app," "code doesn't work," "phone won't install").
- [ ] Escalation path to attorney on-call for real SOS events during the campaign.

---

## 5. Legal & business gates

- [ ] SEC scope-of-work document delivered (already generated at `/mnt/documents/detenciondefensa-scope-inventory.md`) — send to independent contractor for bid.
- [ ] Fee-separation ledger (client-facing charges vs firm-facing charges) reviewed by outside counsel for FL Bar 4-5.4 compliance.
- [ ] Terms of Service, Privacy Policy, SMS Terms — final legal sign-off, dated, versioned.
- [ ] Insurance: E&O / cyber liability policy in force before radio launch.
- [ ] Data retention + deletion policy documented (GDPR-style even though FL — good hygiene).

---

## 6. Suggested sequence (fastest path)

1. **Week 1**: Finish product completion (Section 1). Freeze feature scope.
2. **Week 2**: Submit iOS to TestFlight external (Section 2), start Play Store closed testing (Section 3). These run in parallel and both have mandatory waiting periods.
3. **Week 3**: Live Stripe test, load test, analytics wiring, support playbook (Section 4a–4b, 4e).
4. **Week 4**: Record radio spots, legal review, phone tree (Section 4c–4d, Section 5).
5. **Week 5**: iOS approved + Play Store production live → begin radio in one small market first, watch dashboards for 72h, then scale.

---

## What I need from you to start

1. Which store first — iOS, Android, or both parallel?
2. Which market(s) will the radio ads run in? (drives Twilio numbers and vanity URLs)
3. Is Sorrentino the named firm on the ad, or is it company-branded only? (drives FL Bar review path)
4. Approve this plan and I'll start on Section 1 in the next turn.
