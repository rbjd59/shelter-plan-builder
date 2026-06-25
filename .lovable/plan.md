## What we're building

A guided, trilingual (ES/EN/PT) **"Configura Mi App"** section on detenciondefensa.com where families enter everything BEFORE installing the app, plus two SOS fixes.

---

## 1. Setup hub at `/configurar` (alias `/app-setup`)

Public landing with big plain-language instructions and a hero video walkthrough. Entry flow:

```text
Enter email → "Te enviamos un enlace" → click link in email →
land in dashboard scoped to their activation code (auto-linked by email match,
or prompt for code if no match)
```

Magic-link auth via Supabase `signInWithOtp` (email only — no password). Returning user clicks the same link from any device, lands back in their dashboard.

Once inside, **5 step cards** with a progress checkmark on each:

1. **Tus datos** — name, A-number, DOB, place of birth, language, phone
2. **Contactos de emergencia** (up to 8) — name, relationship, phone, email, "notify on SOS" toggle. Drag to reorder priority. Inline help: *"Estas personas recibirán un correo y un mensaje cuando actives la alerta."*
3. **Documentos legales** — pre-filled toggles for the 10 standard docs (Habeas, POA, Pet Custody, etc.); each shows a preview; user can edit content inline or upload a custom PDF
4. **Plan para mascotas** — species, name, vet, designated caretaker, feeding notes, vaccine file upload
5. **PIN de seguridad** — 4-digit PIN to cancel an SOS (new, see §3)

Every field saves on blur to the existing tables (`app_clients`, `client_contacts`, `client_documents`, `client_pet_rescue`). No new schema for §1 — we already have the tables.

Activation flow change: when the user enters their 8-char code in the installed app, the app calls `get_client_bundle(_token)` (already exists) and everything is already there.

---

## 2. Magic-link gate

- New public route `/configurar` — email form + "enviar enlace"
- New `/configurar/dashboard` under `_authenticated/` — the 5-step UI
- On first sign-in we look up `app_clients` by email; if found, link `user_id`; if not, prompt for the 8-char code, then link.

---

## 3. SOS PIN-to-cancel

- Add `cancel_pin_hash` column to `app_clients` (bcrypt, set during step 5 of setup)
- New RPC `cancel_sos_alert_with_pin(_token, _pin)` — verifies PIN before flipping `cancelled_at`. Existing `cancel_sos_alert` becomes admin-only.
- Native app: after SOS fires, the "Cancelar alerta" button opens a PIN keypad. Wrong PIN = alert keeps firing and contacts keep getting follow-ups.

---

## 4. Fix: documents not attached to SOS email

Current `_enqueue_sos_emails` inlines doc content as `<pre>` HTML inside the email body. Gmail/Outlook strip large `<pre>` blocks and many recipients reported empty emails.

Fix: attach each `send_on_alert=true` document as a real PDF attachment via the email queue worker.

- Add `attachments` field to the queued payload: `[{filename, content_base64, content_type}]`
- Update email worker (`src/lib/email/worker.server.ts`) to pass attachments to Resend
- Generate the PDF server-side using existing `memorandum-of-law.server.ts` pdf-lib helper for each doc, base64 it, attach it
- Body of the email becomes a short summary + "Adjuntos: Writ of Habeas Corpus, POA, Pet Custody Plan…"

---

## Files

**New**
- `src/routes/configurar.tsx` — public magic-link entry
- `src/routes/_authenticated/configurar.dashboard.tsx` — 5-step hub
- `src/components/app-setup/StepContacts.tsx`
- `src/components/app-setup/StepDocuments.tsx`
- `src/components/app-setup/StepPets.tsx`
- `src/components/app-setup/StepPin.tsx`
- `src/components/app-setup/StepProfile.tsx`
- `src/lib/app-setup.functions.ts` — saveContact, saveDoc, savePin, linkCodeToEmail
- `src/lib/sos-pdf-bundle.server.ts` — render all client docs to PDF attachments

**Modified**
- `src/lib/email/worker.server.ts` — pass attachments to Resend
- `src/routes/api/public/emergency/activate.ts` — call new bundle builder
- Native app code (Capacitor) — PIN keypad on cancel; pull from `get_client_bundle` on activation (already wired)

**Migrations**
- Add `cancel_pin_hash text` to `app_clients`
- Add `user_id uuid references auth.users` to `app_clients` (nullable) + index
- New RPC `cancel_sos_alert_with_pin`
- New RPC `link_app_client_to_user(_token, _user_id)`

---

## Out of scope (separate turn)

- Translating every existing legal doc template into Portuguese (we have ES/EN)
- Push notifications inside the app for setup reminders
- Family-shared edits (multiple emails on one activation code)

Approve and I'll build everything in this turn.