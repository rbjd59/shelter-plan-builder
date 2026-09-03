# Roadmap — app is notify-only, Lovable owns all sending

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
