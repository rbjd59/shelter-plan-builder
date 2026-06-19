# Two-board data separation + app SOS payload

## Goal

The activation code is the file number used everywhere. Each board holds only what it needs — so a subpoena against the company yields nothing identifying.

## Data contract

```text
                        ACTIVATION CODE  (file # everywhere)
                                 |
        ┌────────────────────────┴────────────────────────┐
        |                                                 |
  COMPANY BOARD                                    ATTORNEY BOARD
  --------------                                   ----------------
  At signup:                                       At signup:
  - activation code (only)                         - activation code
                                                   - full name
                                                   - contact email / phone
                                                   - A-Number (if known)
                                                   - draft forms (5 core)

  On SOS trigger (from app):                       On SOS trigger (from app):
  - activation code                                - activation code
  - name (entered in app)                          - date + time of trigger
  - A-Number (entered in app)                      - any forms uploaded from
  - place of birth                                   the phone are attached
  - date of birth                                    to the client's file
  - trigger date + time                              automatically
```

## What changes

### 1. Welcome email (already simplified)

Keeps: activation code (big), one button → `https://detenciondefensa.com/download`. That page already auto-detects iPhone vs. Android and walks them through install. No change required this turn beyond confirming wording is third-grade-friendly.

### 2. Company board (`/company-board`)

Rewrite the board to show two sections:

- **Registered clients (no trigger yet)** — table of just `activation_code` and `registered_at`. No names, no emails.
- **Triggered clients** — for each, only what the app sent on trigger: `activation_code`, `name`, `A-Number`, `place_of_birth`, `date_of_birth`, `trigger_date`, `trigger_time`. Nothing else.

Remove from this board: contact emails, phone numbers, documents, detention-locate form, attorney workflow.

### 3. Attorney board (`/attorney-board`)

Show **every** client (not just detained), keyed by activation code:

- At signup: activation code, full name, contact email/phone, A-Number (if intake captured it), the 5 draft forms attached.
- At trigger: timestamp appears on the row; any forms the app uploads land in the client's folder automatically.

### 4. SOS app payload — new fields

The app currently calls `record_sos_alert(_token, _lat, _lng, _battery_pct, _payload)`. We extend the JSON payload contract so the app can send `{ name, a_number, place_of_birth, date_of_birth }` on trigger. A small migration:

- Add nullable columns `app_reported_name`, `app_reported_a_number`, `app_reported_place_of_birth`, `app_reported_date_of_birth` to `client_sos_alerts`.
- Update `record_sos_alert` to read those keys out of `_payload` and write them to the columns.

These fields are what the company board reads. The intake-stored name/email never crosses over to the company board.

### 5. Attorney upload channel for forms-from-phone

New RPC `attach_alert_document(_token, _title, _content, _document_type)` — anon-callable, validates token format, inserts into `client_documents` with a new flag `from_app = true`. Attorney board groups these under the client's folder.

## Order I'll ship

1. Migration: new alert columns + `attach_alert_document` RPC + `from_app` column on `client_documents`. Update `record_sos_alert`.
2. Rewrite `pinListAlerts` / add `pinListRegisteredClients` server fns to match the new company-board contract.
3. Rewrite `/company-board` UI: registered table + triggered table, nothing else.
4. Expand `pinListDetained` → `pinListAllClients`; rewrite `/attorney-board` UI to show every client with their draft forms and any app-uploaded forms.
5. Update the API contract doc (`/mnt/documents/api-contract.md`) so the Flutter dev knows the four new payload keys and the new `attach_alert_document` RPC.

## Out of scope (this turn)

- Actual auto-install of the app on a phone — neither iOS nor Android allows that without the App Store / Play Store. The `/download` flow with the activation code is the simplest legal path; user enters code → app loads with their data already wired. We are not building an exploit-style auto-installer.
- SMS delivery of the activation code (already exists separately).
- Per-form audience routing (deferred from earlier).

## Technical notes

- `client_sos_alerts` already has a `payload jsonb` column, so the new columns are denormalized convenience for board queries.
- `attach_alert_document` is anon-callable like the other app-facing RPCs, validated by `^[A-Z0-9]{8}$` token regex.
- No schema changes to `app_clients` — what the company board sees comes from the alert row, not the client row.
