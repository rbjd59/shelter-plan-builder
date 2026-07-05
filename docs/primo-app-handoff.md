# Primo (Phone App) Handoff — Detencion Defensa

Everything the client needs is generated on our side (web intake). The phone
app's only job is:

1. Accept an activation code
2. Pull the pre-filled bundle from our backend
3. Run the dead-man switch and fire the alert when it trips

The client should never have to type their A-number, name, DOB, contacts,
etc. into the phone. All of that is already collected in the web intake and
attached to their activation code.

---

## 1. Activation code format

Codes are issued in the form:

```
XXXXXX-<LANG>
```

- `XXXXXX` — 6-character alphanumeric case ID (e.g. `A3F7B2`)
- `<LANG>` — two-letter uppercase language tag: `EN`, `ES`, or `HT`

Examples:
- `A3F7B2-EN` — English
- `9K2M4Q-ES` — Spanish
- `77XPLQ-HT` — Haitian Creole

**Parse rule:** split on the last `-`. Left side is the lookup code, right
side is the UI language. If no suffix is present, default to `EN`.

The app should:
1. Read the suffix and immediately switch the UI to that language
2. Send only the left-side lookup code to our activation endpoint

---

## 2. Activation endpoint (what the app calls)

`POST` to our backend RPC `get_client_bundle` with `{ code: "A3F7B2" }`.

Returns (already implemented on our side). The response includes
`hmac_secret` — a per-client 64-char hex secret. Store it in
`flutter_secure_storage` on first activation and use it to sign the
`/api/public/app-trigger` payload. It never leaves the device outbound;
we rotate it server-side without an app update.

```json
{
  "client_id": "uuid",
  "hmac_secret": "…64-hex…",
  "client": {
    "first_name": "…",
    "last_name": "…",
    "date_of_birth": "YYYY-MM-DD",
    "a_number": "A123456789",
    "place_of_birth": "City, Country",
    "language": "es"
  },
  "emergency_contacts": [
    { "name": "…", "phone": "…", "email": "…", "relation": "…" }
  ],
  "attorney": {
    "name": "…",
    "phone": "…",
    "email": "…"
  },
  "asset_protection": {
    "enabled": true,
    "distribution_contact": { "name": "…", "phone": "…", "email": "…" }
  },
  "case_id": "A3F7B2",
  "activated_at": "ISO-8601"
}
```

The app should **display** this information (read-only) and let the user
confirm. No editing on the phone. If a field is wrong, they call the
attorney — do not let them mutate the case record from the app.

---

## 3. What the app must send back on trigger (dead-man switch fires)

When the dead-man switch fires (24 / 36 / 72 hr no check-in, user-selected),
POST to our webhook:

`POST https://detenciondefensa.com/api/public/app-trigger`

Payload:

```json
{
  "case_id": "A3F7B2",
  "triggered_at": "ISO-8601",
  "last_known_location": { "lat": 0, "lng": 0 },
  "arrest_location_hint": "optional free text if user provided one"
}
```

Signature header: `x-app-signature: <hex HMAC-SHA256 of the raw JSON body,
keyed by hmac_secret>`. The secret is delivered via `get_client_bundle`
on activation — do NOT embed it in the app binary. Sign the exact byte
sequence you POST (no re-serialization).

Stub response (live now):
```json
{ "ok": true, "event_id": "<uuid>", "signature_status": "ok|missing|bad|skipped" }
```

During rollout the stub logs but does not reject `missing` signatures so
you can wire the round-trip first; once you're signing, `signature_status`
will flip to `ok`. Real fan-out (SMS/email/board mirror) will move behind
this same route with no app changes.

Our side already has name, DOB, A-number, country of origin, attorney, and
contacts — do **not** re-send PII in the trigger payload. Just the case ID.

### App-trigger vs. current logAlert flow

`/api/public/app-trigger` **supplements** the current
`/api/public/emergency/activate` (logAlert) path — it does not replace it
yet. Keep the existing activate call firing on SOS so all downstream
consumers (attorney board, company board, SMS/email fan-out) stay live.
Add `app-trigger` alongside it. Once we cut the fan-out over, we'll ask
you to drop the activate call in a follow-up release.

---

## 4. Instruction / first-run screen

Before activation, show a single screen in **all three languages stacked**
(EN / ES / HT), because the user hasn't activated yet so we don't know
their language:

**English**
> Enter your activation code and set your check-in interval (24, 36, or
> 72 hours). If you don't check in within that window, the app will
> automatically notify your attorney, emergency contacts, and begin the
> ICE locator process.

**Español**
> Ingrese su código de activación y elija su intervalo de registro
> (24, 36 o 72 horas). Si no se registra dentro de ese tiempo, la
> aplicación notificará automáticamente a su abogado y contactos de
> emergencia, e iniciará la búsqueda en el localizador de ICE.

**Kreyòl Ayisyen**
> Antre kòd aktivasyon ou epi chwazi entèval siyal ou (24, 36, oswa 72
> èdtan). Si w pa siyal nan tan sa a, aplikasyon an ap otomatikman
> avize avoka w ak kontak ijans yo, epi kòmanse chèche w sou lokalizatè
> ICE la.

After the code is entered and parsed, the whole app switches to the
suffix language and this screen is not shown again.

---

## 5. Dead-man switch UX (already built — just confirm)

- Interval options: 24h, 36h, 72h (default 24h)
- One-tap "I'm OK" check-in resets the timer
- Push + local notification at T-2h and T-30min
- On expiry: fire the webhook above, show a screen telling the user "Alert
  sent to your attorney" (in their language)

---

## 6. App Store / Play Store republish checklist

### Apple (iOS)

1. Bump `CFBundleShortVersionString` (e.g. `1.1.0`) and `CFBundleVersion`
   (build number, must be higher than the last uploaded build).
2. Archive in Xcode → Distribute App → App Store Connect → Upload.
3. In App Store Connect:
   - Add a new version (e.g. 1.1.0)
   - Update "What's New in This Version" in EN / ES / HT
   - Attach the new build
   - Answer export compliance (encryption: uses standard HTTPS only → yes,
     qualifies for exemption)
   - Submit for review
4. Screenshots: only re-upload if the instruction screen or activation
   screen changed visually. Otherwise reuse.
5. Review typically takes 24–48h.

### Android (Google Play)

1. Bump `versionCode` (integer, must increase) and `versionName` in
   `build.gradle`.
2. Build a signed AAB: `./gradlew bundleRelease`.
3. In Play Console → Production → Create new release:
   - Upload the AAB
   - Release notes in EN / ES / HT
   - Save → Review → Roll out to Production
4. Google review is typically a few hours to 1 day.

### Both stores — before submitting

- [ ] Test the activation flow end-to-end against production with a real
      code we generate for you.
- [ ] Test each language suffix (`-EN`, `-ES`, `-HT`) switches UI correctly.
- [ ] Test the dead-man switch fires the webhook with a short interval
      (temporarily set to 5 min in a debug build).
- [ ] Confirm the webhook signature is verified on our side (we'll confirm
      on our end with the shared secret).
- [ ] Confirm the trigger payload contains only `case_id` + timestamp +
      location — no PII.

---

## 7. What we (Detencion Defensa) will provide Primo

- Shared HMAC secret for the trigger webhook (out of band)
- A test activation code per language for QA
- Staging endpoint URL if you want to test without hitting production
- Updated store listing copy in EN / ES / HT

## 8. Open questions for Primo

1. Confirm current app version numbers (iOS + Android) so we know the
   next bump.
2. Confirm remote-config mechanism for the HMAC secret (Firebase Remote
   Config, or your own).
3. Confirm push provider (APNs directly, FCM) so we can wire server-side
   alerts if needed later.
