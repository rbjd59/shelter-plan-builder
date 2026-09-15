# Forms on demand, attorney editing, and a tappable sign-up email

## What changes, in plain terms

1. **No forms are built at sign-up.** Today, five draft documents are generated the moment
   someone signs up. That stops. Sign-up just stores everything the person told us,
   filed under their activation code.

2. **The attorney board shows the intake information itself** — name, date of birth, place of
   birth, country, A-number, contacts, language — laid out as the form fields, so the
   attorney can see exactly what is known and what is missing before anything is created.

3. **Forms are created only after an activation.** When a person triggers "I've been detained"
   and we locate them, the facility, mailing address, warden/officer in charge, A-number,
   date of arrest and booking/federal ID are entered on the board. A single
   **Create forms** button then builds the whole packet, already filled from the intake
   answers plus the locate information. Nothing is emailed anywhere automatically.

4. **The attorney can edit everything on screen.** A new editable page per client lists every
   field that feeds the forms. The attorney corrects anything, saves, and the packet
   rebuilds from the corrected values. Their corrections always win over the intake text and
   are kept, so rebuilding never wipes their work.

5. **One sign-up email, tappable, no camera needed.** The QR code stops being the way in.
   The email leads with a big **Install the app** button going to the existing get-app page,
   which sends Android phones straight to the installer and iPhones to TestFlight. Under it:
   the person's activation code, plain steps for putting the icon on the home screen, and
   links to the self-help form package and the nonprofit information. The QR image stays
   below as a fallback for people reading the email on a computer.

## How it works underneath

- `src/lib/app-clients.server.ts`: drop the sign-up PDF seeding block (intake PDFs, motion,
  JS-44, memorandum) and the `client_documents` seed insert. Keep storing the answers.
- New table `client_form_answers` (`client_id` unique, `answers` jsonb, timestamps,
  `service_role` grants only — reached through the PIN-gated server functions).
- `src/lib/forms-regenerate.server.ts`: `buildAnswersForClient` merges in
  `client_form_answers.answers` last, so attorney edits override intake and locate data.
- New server functions in `src/lib/pin-access.functions.ts`:
  - `pinGetFormAnswers` — merged answers + which required fields are still blank.
  - `pinSaveFormAnswers` — writes the overrides.
  - `pinGenerateForms` — calls `regenerateClientForms` on demand, returns the built list.
- `src/lib/detention-locate.server.ts`: stop auto-regenerating and emailing the packet on
  locate; it records the locate and notifies the attorney that the case is ready. Generation
  moves behind the button.
- `src/routes/attorney-board.tsx`: per-client panel with the six locate fields (facility,
  mailing address, warden/officer in charge, A-number, date of arrest, federal/booking ID),
  an intake summary, a **Create forms** button enabled once the required fields are filled,
  and a link to the new editable page.
- New route `src/routes/attorney-forms.$clientId.tsx` (PIN-gated, `noindex`): grouped editable
  fields, Save, Rebuild packet, preview/download each PDF.
- `src/lib/email/activation-emails.server.ts` + `src/lib/email-templates/app-activation.tsx`:
  install button first, activation code, home-screen steps, self-help package and nonprofit
  links, QR demoted to a fallback block. All three languages.

## Notes

- Existing clients that already have seeded draft documents keep them; the Create forms
  button overwrites them with the real, filled versions.
- Publish → Update is needed for any of this to reach the live site and live emails.
