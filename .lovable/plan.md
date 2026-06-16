
# Premio (SOSConnect) ⇄ DetencionDefensa Web Integration

Single Lovable Cloud backend (`viyoqmjullnuzptnawtk`) talks to both the web app and the Flutter app. Flutter authenticates via an **activation code** (no Supabase Auth on device), pulls per-client documents + contacts, and fires SOS alerts back to the same backend.

---

## Phase A — Database (one migration)

New tables, all RLS-on, service-role writes from the web app, anon reads scoped by `client_id`/`invite_token`:

- `app_clients` — one row per paid customer
  - `id`, `intake_session_id` (FK to `intake_submissions.stripe_session_id`), `invite_token` (8-char uppercase, unique), `full_name`, `email`, `phone_e164`, `language`, `activated_at`, `device_info jsonb`
- `client_documents` — packet PDFs + emergency letters synced into the phone
  - `id`, `client_id` (FK), `title`, `content` (text or signed-URL), `document_type` (`habeas_ao242` | `ao240_ifp` | `js44` | `motion_counsel` | `cover_letter` | `power_of_attorney` | `pet_rescue_notice` | `emergency_letter`), `send_on_alert bool`, `loaded_at`
- `client_contacts` — emergency contacts the Flutter app reads
  - `id`, `client_id`, `name`, `phone_e164`, `email`, `relationship`, `priority int`, `notify_on_sos bool`
- `client_sos_alerts` — written by the Flutter app when SOS pressed
  - `id`, `client_id`, `triggered_at`, `lat`, `lng`, `battery_pct`, `payload jsonb`, `delivered_at`

Plus a Postgres function `redeem_invite_token(token)` (SECURITY DEFINER) that returns `{ client_id, full_name, language }` — the only way the Flutter anon role looks up a client.

RLS policies:
- `app_clients`: no anon SELECT; only the redeem function returns rows.
- `client_documents`, `client_contacts`: anon SELECT allowed only via row filter `client_id = current_setting('request.jwt.claim.client_id', true)::uuid` … but since Flutter uses anon key (not JWT), we instead expose a SECURITY DEFINER RPC `get_client_bundle(token)` that returns docs + contacts in one call.
- `client_sos_alerts`: anon INSERT via SECURITY DEFINER RPC `record_sos_alert(token, payload)`.

This pattern matches what the Flutter source already expects (REST queries scoped by `client_id`), but we never trust a client-supplied `client_id` — the token is the auth.

---

## Phase B — Activation pipeline (web side)

Trigger: customer pays + completes intake (`submitIntakeAnswers` in `src/utils/payments.functions.ts`).

New server function `provisionAppClient` runs after intake save:
1. Generate 8-char alphanumeric `invite_token` (crypto-random, no ambiguous chars).
2. Insert `app_clients` row tied to `intake_session_id`.
3. Generate PDFs (existing pipeline in `src/lib/email/intake-pdfs.server.ts` + new power-of-attorney + pet-rescue-notice when intake answers indicate).
4. Insert one `client_documents` row per generated PDF; flag emergency letters as `send_on_alert=true`.
5. Copy section-7 family contact + section-6 emergency contact + any additional contacts into `client_contacts`.
6. Enqueue activation email (template `app-activation`) — contains code, APK URL, TestFlight URL, install instructions in the user's language.
7. Send SMS via Twilio connector containing the same 8-char code + a deep link.

New email template `src/lib/email-templates/app-activation.tsx` (EN/ES/HT) — branded, with the code in monospace, APK + TestFlight buttons, and the standard disclaimer footer.

---

## Phase C — Twilio SMS

- Connect Twilio via `standard_connectors--connect`.
- New `src/lib/sms.functions.ts` with `sendActivationSms({ to, code, language })` calling the gateway at `https://connector-gateway.lovable.dev/twilio/Messages.json`.
- Bilingual message bodies, ≤160 chars each, with the bare `https://detenciondefensa.com/app` deep link.
- Logged into a new `sms_send_log` table for the admin dashboard.

---

## Phase D — APK + TestFlight delivery

- New public route `/app` (`src/routes/app.tsx` already exists — repurpose) that:
  - Detects Android UA → button "Download APK" pointing to `APK_URL`.
  - Detects iOS UA → button "Join TestFlight" pointing to a new secret `TESTFLIGHT_URL`.
  - Otherwise shows both.
  - Below: "Activation code" input that just tells the user to open the app — code entry happens in-app.
- Add `TESTFLIGHT_URL` secret (you provide the public TestFlight invite link).

---

## Phase E — Flutter source updates (in the uploaded project, returned as a patch zip)

Mechanical edits the user applies to the Flutter repo:
1. `lib/config/supabase_config.dart` → swap to `viyoqmjullnuzptnawtk` URL + the publishable anon key from `.env`.
2. `lib/services/supabase_service.dart`:
   - Replace direct `clients?invite_token=eq.` query with RPC `rest/v1/rpc/redeem_invite_token`.
   - Replace document/contact fetch with RPC `rest/v1/rpc/get_client_bundle`.
   - Replace SOS insert with RPC `rest/v1/rpc/record_sos_alert`.
   - Remove the `sendIntakeEmail` call (web app owns intake now).
3. Bump `pubspec.yaml` version. No new packages needed.

Deliverable: a ZIP of the modified `lib/` directory dropped into `/mnt/documents/sosconnect-supabase-patch.zip` — you unzip it over your Flutter source and rebuild the APK / TestFlight build.

---

## Phase F — Admin visibility

Add to `/admin/clients`:
- "Activation status" column (sent / activated / never opened).
- "Resend code" button → re-runs Phase B steps 6–7.
- View of `client_sos_alerts` per client.

---

## Technical notes

- Activation codes: 8 chars from `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no 0/O/1/I). Unique constraint on `app_clients.invite_token`. Re-roll on collision.
- All RPCs are `SECURITY DEFINER`, `search_path = public`, and validate token format (`^[A-Z0-9]{8}$`) before any lookup to prevent enumeration.
- Flutter's existing `TEST1234` dev bypass stays — we seed one dev row with that token + dummy docs in the migration.
- SOS alerts written by Flutter still trigger the same email/SMS fan-out used by your existing emergency-activation flow (`/api/public/emergency/activate`) by having the RPC enqueue a job.
- iOS App Store + Play Store launch later: nothing to change — store builds will point at the same backend.

---

## Files to create

- migration (Phase A)
- `src/lib/app-clients.functions.ts` — `provisionAppClient`, `resendActivation`
- `src/lib/sms.functions.ts` — Twilio sender
- `src/lib/email-templates/app-activation.tsx` (+ register)
- `src/routes/app.tsx` rewrite (UA-aware install page)
- `src/routes/_admin/admin.clients.$id.tsx` additions

## Files to modify

- `src/utils/payments.functions.ts` — call `provisionAppClient` after intake save
- `src/lib/email/intake-pdfs.server.ts` — add power-of-attorney + pet-rescue-notice generators (gated on intake answers)

## Secrets to add

- `TWILIO_API_KEY` (via Twilio connector)
- `TWILIO_FROM_NUMBER`
- `TESTFLIGHT_URL`

---

## What I need from you to start

1. **Approve plan** ("go").
2. **TestFlight public link** (or "skip iOS for now").
3. **Twilio**: I'll trigger the connector flow — you'll pick which connection to use and provide the `From` number.
4. Confirm the 8-char code format is OK, or tell me a different length/style.

Reply "go" + answers and I'll execute Phases A → F.
