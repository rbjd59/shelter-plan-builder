# Premio (Flutter app) — instructions of record

Recorded, not yet implemented. No code changes until the actual changes arrive.

## App structure — two pages only
- **Page 1 — Setup (first screen):**
  - Language picker (English / Español / Kreyòl); entire page switches instantly.
  - Short instructions in the chosen language only.
  - Step 1: create 4-digit PIN — placed **above** the activation code field ("Write it down. You need this PIN to stop an alert.")
  - Step 2: enter activation code (new format: 1 letter + 4 digits).
  - Press Activate → goes straight to the SOS screen (no bounce back to front screen).
- **Page 2 — SOS screen.** Nothing else.

## Removed from the app
- Multi-step setup wizard.
- Dead man's switch.
- Contact-entry forms (contacts come from Lovable only, via fetchContacts).
- All legal/blank forms (Lovable emails them instead).
- Any device mail-client sending (this is what caused draft emails sitting on one phone).

## Trigger discipline
- Activation must NOT fire an app-trigger.
- `postAppTrigger` fires only on SOS trigger and on cancel.
- Send once only — duplicates were the source of extra emails.

## What the app does
It notifies Lovable. Lovable sends 100% of email/SMS, server-side (Resend/Twilio).

## Lovable-side sending contract

### 1. On activation (app calls activation endpoint with the code)
- To each of the client's contacts (email + SMS):
  "You have been listed as an emergency contact for [CLIENT NAME]. If you receive an alert notice, the person who registered you may have been detained. If they do not cancel within 2 hours, contact detenciondefensa.com."
- To intake@sorrentinolawfirm.com, alerts@detenciondefensa.com, legal@detenciondefensa.com, and SMS +1 305-337-7713:
  "New activation: [CLIENT NAME], code [CODE]."
- To the client's own email — attach blank forms: Power of Attorney, Bank Authorization, School Authorization, Tow Yard Authorization.

### 2. On SOS fire
- App POSTs to `/api/public/emergency/activate` (token + contacts), and `{ "action": "trigger" }` to `/api/public/app-trigger` (HMAC-signed).
- Lovable sends alert email + SMS to: all contacts, intake@sorrentinolawfirm.com, alerts@detenciondefensa.com, legal@detenciondefensa.com, SMS +1 305-337-7713.
- Only one send per event.

### 3. On cancel with PIN
- App POSTs `{ "action": "cancel", "cancel_pin": "..." }`.
- Lovable sends a cancellation notice to the same list.

### 4. Contacts
- Owned by Lovable / detenciondefensa.com only. App reads, never writes.

## Test after implementation
Activate with a dev code → set PIN → hold SOS 3 seconds → cancel with PIN.
