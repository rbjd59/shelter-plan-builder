# Roadmap — notify-only app / Lovable owns all sending

- [x] Central fan-out module (`src/lib/alert-fanout.server.ts`): activation, trigger, cancel — one send per recipient, deduped.
- [x] `/api/public/app-trigger` handles `action: activated | trigger | cancel`, GPS restored on trigger.
- [x] `get_client_bundle` returns `cancellation_pin`, `hmac_secret`, contacts, name, language; accepts 5–8 char codes.
- [x] Remove duplicate activation email from `redeem_invite_token`.
- [ ] Signup: capture client-chosen 4-digit PIN on the website intake form.
- [ ] Client-only signup email/SMS: code + PIN + Android install + "unverified app" bypass steps.
- [ ] Client-only forms email: self-help info, nonprofit contacts, 6 authorization forms.
- [ ] Locate → auto-fill all forms incl. Memorandum of Law, push to attorney board as
      "Forms completed — ready for review and mailing".
- [ ] Confirm callback number (534-202-6852 is not a valid US area code) before it ships in contact messages.
