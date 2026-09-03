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
- [ ] Signup form: capture the client-chosen 4-digit cancellation PIN (`src/routes/intake.tsx`).
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
- [x] Email-sending version update — started (rewrite turn pending)
