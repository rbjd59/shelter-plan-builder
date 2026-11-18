# Roadmap — app is notify-only, Lovable owns all sending

## November 17 — Don't Lose Your Car, Part 1
- 2026-11-17: Added Don't Lose Your Car vehicle program page, dealer page, and video. Pending: Sorrentino review of agreements; FL motor vehicle broker licensing question on the per-car dealer fee (Fla. Stat. 320.27); domains dontloseyourcar.com / nopierdastucarro.com not yet registered — do not link to them.
- [x] Add the trilingual vehicle-program page and aliases, homepage card, navigation, dealer page and interest form, SEO/sitemap entries, and program video with script.
- [x] Verify all public routes and aliases in EN/ES/HT, intake `vehicle=1` links, dealer save plus staff email/SMS log, language switching, video playback, mobile fit, 270 tests and build; no failed browser requests. Test lead removed after verification; nothing published. Spanish and Kreyòl narration still need native-speaker review.
- [ ] Part 2 (owner-approved 2026-11-18): add the trilingual intake checkbox and validated vehicle step, private enrollments and staff alerts, personalized draft/approved packet PDFs, attorney and company client-file entries, attorney approval flow, public sample/dealer PDFs, official FLHSMV links, full verification and one commit. Do not publish; remove test rows. Attorney review and Florida dealer-fee licensing review remain pending.

## Business call-request intake
- [x] Add EN/ES/HT business intake and save requests with owner-confirmed Ricky Bitelman-Behar JD assignment. Browser submission, saved assignment, email send, language switching and mobile fit verified; 135 tests pass.
- [ ] Verify signed-in lead inbox visually — current admin access redirects the owner test session to /dashboard; saved request and assignment verified directly, notification send confirmed.

## November 17 — business trust attorney approval
- [ ] Preserve each trilingual business trust draft and its exact client-fact snapshot; add a law-firm-only review queue for final legal terms, requested changes, approval and immutable execution-copy PDFs. Record the reviewing attorney and source draft, keep prior drafts unchanged, and expose approved packets through the existing client-file PDF email flow. Test generation, authorization and approval state transitions.

## November 17 — homepage video audio quality
- [ ] Diagnose all nine homepage voiceovers; preserve every script, visual, position and original file. Regenerate only confirmed chunked-audio cases as continuous takes, use the current English voice, Venezuelan Spanish and genuine Haitian Creole, verify full playback, then switch only the affected homepage media references. Run the complete tests.
- Resume checkpoint: Business v2 EN/ES/HT passed fresh complete decode, identical-video-stream and unmuted browser-end checks; Save My Home originals decoded unchanged; PDF 2/2 and full suite 135/135 passed. Process Overview exact scripts and continuous takes recovered and preserved as CDN assets; rebuilt aligned candidates introduced 1–7 s pauses and were rejected, so originals stay active. Remaining: a better caption-aligned audio edit and native ES/HT listening review. See docs/homepage-audio-quality.md and docs/process-overview-audio-source.json; no publication performed.

## November 17 — approved homepage and business-domain tidy-up
- [x] Job 1: preserve homepage section order; add the translated hero start button, shorten only the hero notice, keep full disclosures on legal notices/footer, make walkthrough language switching explicit, use light-only styling and align existing section spacing/buttons.
- [x] Job 2 code: route both business hosts to the existing business page with its own branding and defense cross-link; add the trilingual corporation/trust/agent/director explanation and separate-agreement conflict disclosure. Six routing tests and trilingual browser checks pass.
- [ ] Live multi-domain serving: a workspace admin must unset donotforgetyourbusiness.com as Primary in Project Settings → Domains and publish. Hosting currently 302-redirects detenciondefensa.com, listoahora.org and parekounya.org to the business domain before app code runs.

## November 17 — business conversion video revision
- [x] Write EN/ES/HT narration centered on guided conversion-program signup, corporate setup, phone-based job/payment records and hands-on assistance; do not build operating tools or invent tier prices, sale values or payment-provider guarantees.
- [ ] Record and replace the three business videos with the revised script — waiting for owner approval of the proposed-service wording before recording; preserve one male narrator and quiet or no music.

## November 17 — homepage contact and business-site repair
- [ ] Center and visually unify the content below the videos; replace the automatic AI box with a call-first live chat, staff fallback, callback choices and optional AI help in EN/ES/HT.
- [ ] Repair Save My Home call/start controls and route Do Not Forget Your Business to its own trilingual website rather than the Detención Defensa homepage; verify desktop/mobile and all three languages.

## November 17 — compliance and video questions
- [ ] Synchronize company, privilege, trust payment and hero disclosures in EN/ES/HT; text-only, no changes to payments or existing business/callback features.
- [x] Replace per-video question boxes with one EN/ES/HT Claude process-help box below the business video and above account setup; anonymous English Claude response and mobile fit verified; saved private conversations remain separate.
- [ ] Restore a compact final emergency-app intake with contacts, qualified defense-plan details, checked form drafts and delivery/download handoff; verify existing work before extending it.

## November 17 — complete service client files
- [ ] Build complete English, Spanish and Haitian Creole business trust form packets with paralegal signature/preparation pages; select the PDF language in each client file and reuse the signed Email PDF flow without making drafts executable.
- [x] Connect client-specific Do Not Forget Your Business trust drafts and the $199 monthly-fee record to both client-file types; reuse private PDF emails without activating charges. Assessment-file save/reload/generation and email send verified; private business PDF returns 200 and altered links return 403. Twelve tests passed. Inbox receipt, final executed instruments and separate company-board browser verification remain unconfirmed.
- [x] Wire client-specific Save My Home Trust draft PDFs to both client-file types with staff email controls and seven-day private download links. Assessment-file generation/reload/email send and capability download verified; two PDF pages inspected and raw estimate data/internal partner terms removed. Inbox receipt and final attorney-approved execution documents are not confirmed.
- [x] Add shared client-file follow-ups and 60/30/15-minute paralegal reminders, document checklist and package preparation on both boards. Saved/cancelled callback verified; signed reminder endpoint verified with no due calls, actual reminder delivery still unverified.
- [x] Research Clear Capital home-equity/origination products; provide real product/contact links and track valuation/title requests without inventing provider access.
- [x] Generate attorney-review trust agreement drafts and simple limited family authority, school, paycheck and vehicle letters; exclude all real-estate powers from family authority. Family PDF saved/downloaded and notes read back after refresh; trusts remain incomplete attorney-review drafts.
- [ ] Prepare HELOC/sale/rental/business handoff packages and partner-agreement drafts with explicit consent/review gates; do not activate unreviewed closing-contingent referral fees or liens.
- [x] Add client document-request and appointment emails from the client file; distinguish operational messages from marketing. Appointment send attempted during callback verification; inbox delivery and checklist sends remain unverified.
- [x] Verify saved client files, follow-ups and draft downloads on the attorney board; company-board mounting shares the same component but separate browser verification remains outstanding.
- [ ] Activate provider ordering and complete lender-approved packages — blocked on Clear Capital account/product access and separate title/rental providers.
- [ ] Approve and execute trust/partner agreements — blocked on state-specific attorney terms, licensing/fee compliance review and clarification of $899 versus $1,299 trust pricing. No liens, escrow deductions or closing-paid referral charges activated.
- [ ] Configure SMS and complete marketing/business-site rollout — SMS provider and separate marketing service are not connected; full business site and report rollout remain unfinished.

## November 13 — store launch preparation (owner review before publish)
- [x] Create one silent, reusable store-reviewer account through the normal provisioning path; verify 12+ activations, signed SOS/cancel board records, and zero email/SMS fan-out.
- [x] Correct English, Spanish and Haitian Creole privacy policies for SOS-only GPS, Update My Info, activation device details, hosting providers and advertising; retain deletion routes and update the revision date.

## Homepage arrangement
- [x] November 17: stack Save My Home then Do Not Forget Your Business under How it works, with localized Start Now links below each; keep account setup immediately after both videos. Verified EN/ES/HT source/link/order, audible business playback and mobile fit. Existing business recordings still contain their earlier branding; video re-edit is outside this arrangement change.
- [x] November 17: replace the Spanish-only overview cover with English, Spanish and Haitian Creole “How it works” covers; keep the matching full videos and verify the top language switch updates both cover and playback.
- [ ] November 16: rebuild all three process videos in simpler language: Rosario and the program's team directly review submissions and offer discounted help, honest answers and emailed options, with no required outside-firm referral; cover the complete process, app downloads and home/business sites. Remove repetitive video disclaimers, preserve site legal disclosures, and do not publish.
- [x] Remove the homepage Problem and Solution section in all three languages; keep the video library and paid home/business offerings unchanged.
- [ ] November 15 follow-up: deliver the complete 3–4 minute English video first, not only its short presenter opening, then complete Haitian Creole; Spanish generation remains blocked and must not be bypassed.
- [ ] Replace the homepage how-it-works video with English and Haitian Creole process overviews using revised immigration-review wording, directly below the opening photo; preserve original videos in the video library and verify playback without publishing.
- [ ] Create the Spanish process overview; blocked by the video service's content-safety refusal, so retain the existing Spanish video until a new authorized generation is available.
- [x] Replace the homepage supporting message in all three languages and compact the notice below the banner without removing legal wording or videos; verify desktop and mobile, without publishing.
- [x] Add Save My Business alongside the existing homeowner video, with English, Spanish and Haitian Creole trust/corporation copy, language-aware savemybusiness.com links and disclosures; verify all languages and mobile without publishing.
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
- [x] Callback number confirmed by owner: one public number, 305-337-7713 (the old
      534-202-6852 was invalid — no 534 area code). `CONTACT_CALLBACK_NUMBER` still overrides.

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

## November 17 — Do Not Forget Your Business
- [ ] Replace Save My Business branding and destination with Do Not Forget Your Business / donotforgetyourbusiness.com throughout the Detención Defensa flow; link qualifying results and the business video to the new site.
- [ ] Build the original trilingual Do Not Forget Your Business website for owners leaving the US: simple value guidance, marketable trades, free pricing/client/job/invoice/receipt tools, business records, sale/run-from-abroad/family-run paths, document checklist and clear next steps.
- [ ] Explain the proposed paid setup plainly: $199/month to start, $899 trust payable monthly, Florida C-corporation filing cost and registered-agent fee separate, local director $50/month, and a signed broker agreement with a 10% sale commission; do not imply third-party prices or guaranteed business value.
- [ ] Research Jobber, Mowbook and business-sale marketplaces for feature ideas only; write original copy and tools rather than copying protected text, designs or data.
- [ ] Add the promised immediate paralegal call/text button and trilingual AI help, and connect the business report/dashboard work already in progress.

## November 17 — business reports and support
- [ ] Build a trilingual client business report with a transparent value range, marketing plan and document checklist; link qualifying results to it and email the report link to the client and attorney.
- [ ] Add a business valuation tool and business call page; provide immediate call and text buttons for the paralegal at 305-337-7713.
- [ ] Put complete contact, questionnaire, property, business, report, appointment and family-form information on the attorney and company dashboards.
- [ ] Add a trilingual AI question box with clear limits and server-only AI access; preserve the selected language.
- [ ] Finish account sign-up, saved questionnaire progress, later-path Home → Business videos and one unfinished-assessment reminder from the preceding request; verify all flows together.

## November 17 — homepage questionnaire
- [ ] Simplify the landing page: keep the process video, app steps and attorney section; remove pro bono/community pricing, app security and paid homeowner/business boxes; show only “Free” on the opening screen.
- [ ] Replace anonymous contact capture with account sign-up after the process video: name, sign-in email, password and phone/SMS contact; then answer questions or choose “I’ll answer later.” Keep Save My Home followed by Save My Business available on the later path.
- [ ] Add “Save my progress” throughout the questionnaire so signed-in users can stop and resume; preserve contact details in the final assessment.
- [ ] Add an unfinished-assessment reminder only with the required consent and supported sending path; ongoing promotional drip messages require a separate marketing service and are not part of built-in app email.
- [ ] Require and save name, email and phone before the questionnaire; offer a skip-to-videos path with Save My Home followed by Save My Business, without changing qualifying-result video playback.
- [x] Remove the homepage watch-video boxes; expose all three business videos in the video library for preview; play qualifying home then business videos consecutively before call scheduling.
- [x] Process Overview v2 video (EN/ES/HT) on homepage; tap-to-answer questionnaire below it with "I need help" buttons, scoring (stay 0–15% / over 15%, come-back bars, habeas, Save My Home 60%/120-day rule, $899 trust, Save My Business trades), Save My Home video then business step, results page, document authorization, 2-day paralegal call, disclosures.
- [ ] Expand the flow in this order: stay, come back, family forms, detailed home, detailed business, relocation, contact details. Prepare family-form drafts for review before home/business videos; add separate home/business scheduling and app-download steps.
- [ ] Home: collect address, purchase timing/price, balances/payments, mortgage count and late/default status, owners, beds/baths/age/condition, liens, and rent/sell/family goal. Save My Home requires 60% LTV to leave at least $40,000 and cover 120 days of housing costs; otherwise an owner gets the $899 trust path.
- [ ] Business: collect monthly income, workers, time in business, weekly/repeat customers, advertising, company type, records, and sell/run-from-abroad/family-run goal; send qualified cases to the business board.
- [ ] Automatic sale/rent estimates: no property-data provider is connected. Keep a server-side RentCast-ready lookup and Zillow address link as fallback; do not invent a home value.
- [ ] Spanish and Haitian Creole wording for the questionnaire (English only now; needs professional translation).
- [x] November 17: matching Save My Business videos in English (2:29), Spanish (3:04) and Haitian Creole (3:05), CDN-hosted. Real qualifying submissions verified audible autoplay in each language, video-end → business call scheduling → report, plus mobile layout and localized sound fallback. One male voice, music 30 dB below narration; audio checked by measurement/AI transcription, not direct human listening. Spanish/Creole translations and Creole accent still need native-speaker review. Not published.
- [ ] Show questionnaire results and family-form drafts on the attorney/company boards and send the 24-hour report email.
- [ ] Customer login/password creation and instant app provisioning remain to be connected to the existing authenticated intake; do not collect or store plaintext passwords in the public assessment.
- [ ] Remove one test entry ("Test Person") from saved questionnaires.
