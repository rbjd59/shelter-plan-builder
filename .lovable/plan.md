
# 5-Day Beta Launch Audit — DetencionDefensa + Primo App

**Goal:** By end of Day 5, every screen, email, SMS, PDF, and board is reviewed word-by-word and confirmed working end-to-end for board of directors, legal, and funding partner demo. Zero regressions.

**Ground rules (apply every day):**
- Fix in small, scoped commits — no "while I'm in here" edits.
- After every fix: re-run the specific flow that was fixed AND the two adjacent flows (upstream trigger, downstream consequence).
- Keep a running `docs/beta-audit-log.md` — one row per finding: `stage | issue | fix | verified-by`.
- Language parity check on every user-facing string: EN / ES / HT must all be present, correct, and not fall back to the wrong language.
- Nothing gets marked "done" until it's been walked through in the live preview by you.

---

## Day 1 — Qualify → Intake → Payment

**Scope:** everything before the client has an activation code.

1. **Qualify wizard** (`/qualify`)
   - AI 150% FPL check runs before Step 2 (already wired — re-verify with 3 test households: qualifies, reduced-cost, does-not-qualify).
   - Copy review EN/ES/HT for all three outcomes.
   - Confirm the "reduced cost" 10% path actually applies a discount at checkout.
2. **Intake form** (`/intake`)
   - Every field label, help text, error message reviewed in all 3 languages.
   - Draft autosave: leave mid-form, come back, resume from same step.
   - Validation: A-number format, phone format, email optional-but-valid (the recent Zod fix).
3. **Stripe checkout** (`/checkout`)
   - Test mode banner visible.
   - Test card 4242… completes.
   - Webhook `/api/public/payments/webhook` fires → `intake_submissions` row updated → activation code generated.
4. **Sign-off:** Walk one full qualify→intake→pay flow in each language. Log receipts.

---

## Day 2 — Activation Emails, SMS, and Documents

**Scope:** the moment payment succeeds, who gets what.

1. **Email audit** — read `src/lib/email/activation-emails.server.ts` line by line.
   - **Client welcome only** — confirm attorney/company/emergency-contact emails are NOT fired on activation (they only fire on SOS). This was the source of "wrong emails going out."
   - Verify EN/ES/HT subject + body + CTA + doc links + configure-from-web section.
   - Check every doc link resolves (Habeas, Memorandum, Referral, JS-44, Brochure) — 14-day signed URL still valid.
2. **SMS audit** — `src/lib/sms-notifications.server.ts`
   - Client confirmation SMS: correct language, correct invite code, no PII leak.
   - Staff alert SMS: goes only to staff numbers, contains case ID not client PII.
3. **PDF audit** — open each generated PDF and eyeball:
   - AO 242 Habeas
   - Memorandum of Law
   - SDFL Motion for Referral
   - JS-44 Civil Cover Sheet
   - Pro Se Brochure
   - Confirm client name / A-number / DOB / detention facility populate correctly.
4. **Suppression + unsubscribe** — one-click unsubscribe token works, resubscribe path documented.
5. **Sign-off:** trigger 3 real test activations (one per language), inspect inbox + SMS + PDFs.

---

## Day 3 — App Install (TestFlight + Android) and `/configurar` Setup Hub

**Scope:** client goes from welcome email → installed app with data pre-loaded.

1. **`/get-app` redirect** — iOS UA → TestFlight URL, Android → APK, desktop → `/download`. Test on all three.
2. **TestFlight instructions** — rewrite the iOS pending page + welcome email iOS section into plain-language steps:
   - Tap link → App Store opens TestFlight → install TestFlight → tap "Accept" → install DetencionDefensa → open → enter 8-char activation code.
   - Add screenshots.
3. **`/configurar` magic-link entry** — email → OTP link → `/configurar/dashboard`.
4. **5-step setup hub** (per `.lovable/plan.md`):
   - Step 1 Profile, Step 2 Contacts (up to 8), Step 3 Documents, Step 4 Pets, Step 5 PIN.
   - Every field saves on blur. Progress checkmarks correct.
5. **App activation** — enter code in native app → `get_client_bundle` returns everything set up in step 4 → no re-entry needed.
6. **Sign-off:** one tester on iPhone, one on Android, both fully activated.

---

## Day 4 — Attorney Board, Company Board, Admin Console

**Scope:** who sees what, and nothing they shouldn't.

1. **Attorney board** (`/attorney-board`, `/_firm/*`)
   - Column-by-column review: only case-relevant fields (name, A-number, facility, status, docs, next action).
   - **Remove:** payment amounts, Stripe IDs, internal notes, unrelated PII.
   - Detained queue, review queue, packet view all render correctly.
2. **Company board** (`/company-board`)
   - Only ops-relevant fields (activation status, install status, contact count, last-seen, alert status).
   - **Remove:** legal case content, doc contents, attorney notes.
3. **Admin console** (`/_admin/*`) — spot-check activations, alerts, emails, invite codes, reminders, triggers, webhooks tabs still load and paginate.
4. **RLS re-audit** — run `security--run_security_scan`, fix any new findings in the same day.
5. **Sign-off:** log in as attorney role, company role, admin role; confirm role isolation.

---

## Day 5 — SOS End-to-End + Full Dress Rehearsal

**Scope:** the moment that matters most.

1. **SOS trigger** from native app → `/api/public/emergency/activate` → `emergency_activations` row → email queue + SMS queue.
2. **PIN-to-cancel** — wrong PIN keeps alert firing, correct PIN cancels.
3. **Emergency contacts receive:**
   - Email with PDF attachments (Habeas, POA, Pet Plan) — verify Resend attachment path, not inline `<pre>`.
   - SMS with short message + link to `/alerta/$token`.
4. **Attorney gets SOS notification** — separate from client welcome flow.
5. **`/alerta/$token`** public page renders in recipient's language, shows facility info, next steps.
6. **Full dress rehearsal:** run one complete beta persona from qualify → pay → email → install → configure → SOS → cancel, in each language. Board-of-directors demo script written from this run.
7. **Publish** to production. Freeze code. Beta open.

---

## What I need from you before Day 1

- Confirm the 3 test personas (name, language, household size, income) so AI qualification has real inputs.
- Confirm TestFlight public link is live and the Android APK build is current.
- Confirm which phone numbers can receive test SMS (Twilio A2P).
- Confirm the demo date so Day 5 lines up.

Approve this plan and I'll start Day 1 in the next message.
