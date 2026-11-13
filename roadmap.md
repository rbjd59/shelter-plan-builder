# Roadmap — app is notify-only, Lovable owns all sending

## November 13 — store launch preparation (owner review before publish)
- [x] Create one silent, reusable store-reviewer account through the normal provisioning path; verify 12+ activations, signed SOS/cancel board records, and zero email/SMS fan-out.
- [x] Correct English, Spanish and Haitian Creole privacy policies for SOS-only GPS, Update My Info, activation device details, hosting providers and advertising; retain deletion routes and update the revision date.

## Homepage arrangement
- [x] Set the homepage background to white and switch the hero family photo with Español, English and Kreyòl; preserve videos and links and verify desktop/mobile.
- [x] Rearrange and restyle the homepage while preserving all original link destinations, three video URLs, and every translated HTML paragraph; verify 360px mobile, desktop, language switching, FAQ expansion and video playback. Intake, backend, native app and sitewide SEO remain unchanged.

## Two-stage intake
- [x] Separate consent, signup and referral details from the complete form questionnaire; signed-in save/reload and back navigation verified, with 14 passing regression tests. No forms submitted or alerts sent during verification.

## November 12 — Apple resubmission prerequisites
- [ ] Apple Developer Program License Agreement updated: the Account Holder must sign in to the Apple Developer website, review and accept it. Until accepted, no existing app can be updated and no new app can be submitted — this blocks the v4.2 resubmission. Account Holder action only; not possible from this project. If no banner appears: check the pop-up blocker, open the Agreements section on the account page, then App Store Connect → Business (Agreements, Tax, and Banking) — the pending item is often the Paid Applications Schedule there, not the developer portal.
- [ ] Fix App Privacy answers (tracking = No) per Apple's Guideline 5.1.2 rejection before resubmitting.
- [ ] Repair TestFlight activation (see blocker above) so the reviewer can complete setup.

## November 12 — complete board reset and Josh refire
- [x] Clear all existing board cases except Josh's retained test file and clear his old alerts.
- [x] Verify the published activation bundle, refire one labeled server test, and email Josh his activation code and current TestFlight instructions.
- [x] Verify both boards show only Josh; physical Premium iPhone synchronization remains unverified until a real device confirms activation.
- [x] Double-check all 16 Josh test PDFs; correct alias mappings, memo caption overlap, family printed names/title wrapping and motion respondent/address. Regenerate and email corrected packet to Josh, Rick and Sorrentino. Six regression checks passed; AO 240/JS-44 intentionally blank, signatures/service/filing date require completion.
- [ ] Verify device activation through TestFlight; blocked on Josh completing setup or providing the exact phone error.

## Josh Pastor signup correction
- [x] Cancel the agent-triggered simulated SOS and send an all-clear; Josh only signed up.
- [x] Remove simulated activation/device state and verify signup-only status; retain clearly labeled test documents and installation instructions.
- [x] Refire Josh's authorized test and verify fresh notifications and both boards.
- [x] Diagnose Josh's iPhone screenshot: direct `redeem_invite_token` call returns 401/42501 because activation RPCs are server-only. Confirm registered code matches B9733 and setup/activation remain unrecorded; correct the phone-app handoff to use HTTPS activation and accept 5–8 characters.
- [ ] Repair and verify TestFlight activation: blocked on the phone-app developer replacing direct RPC calls with `/api/public/app/activate` and supplying an updated TestFlight build; native phone-app source is not in this repository. Keep server-only permissions intact.

## Done
- [x] Central fan-out (`src/lib/alert-fanout.server.ts`): activation, trigger, cancel.
      One send per recipient (15-min idempotency bucket + SMS log guard) — no duplicates.
- [x] `POST /api/public/app/activate` — code → client bundle (client_id, name, language,
      cancellation_pin, hmac_secret, emergency_contacts, add-on flags).
- [x] `POST /api/public/app-trigger` — signed `activated` | `trigger` (with GPS) | `cancel`.
- [x] DB: `cancel_pin_plain` + `has_trust_program`; bundle accepts 5–8 char codes and returns
      the PIN; bundle RPC locked to service_role; duplicate activation email removed from
      `redeem_invite_token`.
- [x] Contact wording per brief (activation + trigger + all-clear), callback number centralized.

## Open
- [x] Signup form: capture the client-chosen 4-digit cancellation PIN (`src/routes/intake.tsx`); blank → 0000. Activate endpoint also backfills 0000 for legacy clients.
- [ ] Client-only signup email + SMS: activation code, their PIN, Android link + Play Protect
      bypass steps, "Apple coming soon".
- [ ] Client-only forms email: 6 authorization forms + self-help sheets + nonprofit contacts,
      with the sealed-envelope instruction.
- [ ] Sorrentino-only legal template email at activation ("New client activated: [Name] —
      awaiting location data").
- [ ] Locate fill-in → auto-populate all forms incl. Memorandum of Law → attorney board shows
      "Forms completed — ready for review and mailing" → approve → mailing packet PDF.
- [ ] Confirm callback number: 534-202-6852 is not a valid US number (no 534 area code).
      Currently sending 305-337-7713; override with `CONTACT_CALLBACK_NUMBER`.

## Sep 3 2026 — app bug reports
- [x] App "Send my info" returns 400 "could not send" (api/public/app-update-request)
- [ ] Customers not receiving app-download/activation-code emails
- [ ] (Premio app) missing cancel-PIN field on SOS screen — report to app dev
- [x] Email-sending version update — rewrite done, awaiting user review + publish

## 2026-09-03 intake audit
- [x] Root cause: app_clients invite_token_format required 8 chars; generator makes 5 → every new client failed board registration. Constraint relaxed to 5–8 (matches app). NEEDS PUBLISH.
- [x] Removed dead Replit pairing call from intake (was throwing 404).
- [x] Re-provisioned 15:52 test submission (X5956), activation email re-sent.
- [x] Contact phones stored unnormalized (e.g. "305-401-1048") — normalize to E.164 at provision time so SOS SMS reaches contacts.
- [ ] Decide whether staff boards should show PIN set/not-set status (PIN itself stays client-only in Mi App).

## 2026-09-03 second test (contact rbjd@dr.com)
- [x] Root cause: contact "loved one activated" notices only fired on a second signed `activated` webhook the app never sent; the app also typed X5966 (real code X5956) → 404, and its follow-up app-trigger got 400. Now `/api/public/app/activate` itself fans out (idempotent) and codes with a `-EN` suffix are accepted.
- [x] Cancel with PIN failed because no PIN existed (no_pin_set) → alert stayed "active". Default PIN 0000 set at intake, on activate, and backfilled for X5956/K8935.
- [x] app-trigger now logs the reason for every 400 (schema issues / body keys).
- [ ] Client activation email: logs show `sent` to proseforms@atomicmail.io and njbittelman@gmail.com — check spam/atomicmail delivery; sender domain still notify.gohomesooner.com.
- [ ] NEEDS PUBLISH for all of the above.
