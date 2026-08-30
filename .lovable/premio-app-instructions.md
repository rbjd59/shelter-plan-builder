# DetencionDefensa — System Spec of Record (Web + App)

Version: 2026-08-30. This supersedes all earlier Premio instructions.
Web/back end = "Lovable". Mobile app = "Premio".
**Rule zero: the app never sends email or SMS. Lovable sends 100% of messages, server-side.**

---

## PART A — Website signup (detenciondefensa.com)

The signup/intake form collects everything, so the app collects nothing:

1. Client identity: full name, DOB, A-number, place of birth, country of origin, language (EN/ES/HT).
2. **Client phone (SMS) and client email** — required. These are the only channels used for the client.
3. Emergency contacts (up to 3): name, relationship, phone, email.
4. **Cancellation PIN — created here, on the website, during signup** (4 digits, confirm field,
   with "Write this down. You need this PIN to stop an alert.").
   The PIN is stored server-side and delivered to the app with the client bundle.
5. Optional: home-trust ("Save My Home" / trust program) enrollment flag.

On submit, Lovable generates the **activation code** (1 letter + 4 digits, e.g. `K4827`).

### What Lovable sends at signup — and nothing else

**1. To the client only — email + SMS: "how to install"**
- The activation code (short, copy/paste friendly).
- The cancellation PIN they chose (so they can't lose it).
- Android install link + the exact steps to get past "unsafe file / blocked by Play Protect":
  tap Download → open Files → Downloads → tap the `.apk` → if blocked, tap Settings →
  allow installs from this source for Chrome → back → Install → Open.
- "Apple / iPhone: coming soon. We will message you when it is ready."
- After install: open app → enter PIN → enter activation code → Activate. Done.

**2. To each emergency contact — email + SMS (one message each, no attachments)**
> "[CLIENT NAME] has activated an emergency app on his/her phone. If he/she is detained,
> you will be notified by SMS and email. If he/she does not cancel within 2 hours,
> contact detenciondefensa.com or call (534) 202-6852."

**3. To the client only — a second email: the self-help / family packet**
Contains everything that used to sit inside the app:
- Power of Attorney
- Bank account access authorization
- Rental / landlord authorization
- Homeowner / property access authorization
- School pickup authorization
- Vehicle / tow-yard release authorization
- Self-help information and nonprofit contact list

Email body instruction (EN/ES/HT):
> "Review the attached forms, fill them out and sign them (notarize where indicated), and
> give them in a sealed envelope to a family member. If you are detained, they should open
> that envelope — it tells them what to do and gives them access."

**4. Attorney/company records** — the attorney board and company board are populated with the
full case record. **No alert email is sent to anyone else at signup.** After these three
messages, the system goes quiet.

---

## PART B — The app (Premio)

### Two pages only
- **Page 1 — Setup**
  - Language picker (English / Español / Kreyòl) — whole page switches instantly.
  - Four short instructions in that language only.
  - **PIN field above the activation code field.** The PIN was created on the website;
    the client simply re-enters it here to confirm. (If we later prefill it from the bundle,
    the field becomes read-only confirmation.)
  - Activation code field (1 letter + 4 digits).
  - Activate → goes straight to the SOS screen. Never bounces back to the front screen.
- **Page 2 — SOS screen.** That is the entire app.

### Removed from the app
Multi-step wizard, dead man's switch, contact-entry forms, all legal/blank forms,
any use of the device mail client (that is what produced draft emails stuck on one phone).

### Trigger discipline
- Activation **must not** fire an app-trigger.
- `postAppTrigger` fires only on **SOS trigger** and on **cancel**.
- Exactly one POST per event. Duplicates were the source of duplicate emails.
- Contacts: read-only via `fetchContacts`. The app never creates or edits contacts.

### Endpoints
- Activation: app calls the activation endpoint with the code, receives the client bundle
  (name, language, contacts, documents, PIN state).
- SOS fire: `POST /api/public/emergency/activate` (token + contacts) and
  `POST /api/public/app-trigger` `{ "action": "trigger" }` (HMAC-signed).
- Cancel: `POST /api/public/app-trigger` `{ "action": "cancel", "cancel_pin": "…" }`.

---

## PART C — When SOS is triggered

Lovable sends, once:

1. **alerts@detenciondefensa.com** — full alert with all case data.
2. **Sorrentino Law Firm (intake@sorrentinolawfirm.com)** — same alert.
3. **SMS to +1 305-337-7713** — "TRIGGERED: [NAME], code [CODE]."
4. **Each emergency contact — email + SMS:**
   > "[CLIENT NAME] has triggered his/her emergency app. If he/she does not cancel it,
   > contact detenciondefensa.com. If you were given a sealed package of documents from
   > [CLIENT NAME], open it after 2 hours and begin searching for him/her and his/her
   > vehicle. Contact detenciondefensa.com / (534) 202-6852."
5. If the client is enrolled in the **home trust program**, the company board is flagged so
   the trust program is notified that the client has been detained.

Boards: the attorney board pushes the full record to the company board, and the locate
workflow begins.

### On cancel (PIN entered)
Cancellation notice to the same list — contacts, alerts@, Sorrentino, SMS +1 305-337-7713.
Nothing else.

---

## PART D — Locate → document completion → mailing packet

1. Company board staff enter the located facility / detention information into the
   **Present Location** form on the company board.
2. That data flows automatically to the **attorney board**.
3. All generated documents auto-fill with the located information and **all placeholders are
   removed** — AO 242 habeas petition, AO 240 IFP, JS-44, SDFL referral motion, and the
   **Memorandum of Law**.
4. The attorney board shows a **"Review before mailing"** checkbox on each document.
5. Once reviewed, the board **creates the mailing packet** (assembled PDF + mailing label)
   ready to print and mail.

---

## PART E — Test script after implementation

1. Sign up on the website with a real phone + email; set a PIN.
2. Confirm exactly three client-side messages: install email+SMS, contact notices, forms email.
   Confirm no alert reaches alerts@ / Sorrentino at this stage.
3. Install the app, enter PIN + code, activate — confirm **no** alert fires.
4. Hold SOS 3 seconds — confirm one alert each to contacts, alerts@, Sorrentino, and the SMS.
5. Cancel with the PIN — confirm one cancellation notice to the same list.
6. Enter located facility on the company board — confirm attorney board updates, documents
   fill in, "Review before mailing" appears, mailing packet generates.
