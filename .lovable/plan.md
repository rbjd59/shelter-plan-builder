## Goal

Stop relying on the client's phone to upload forms during an SOS. The attorney's file should contain every personalized form the moment the client signs up. When SOS fires, the phone only needs to push the things the attorney genuinely can't have ahead of time: live GPS/battery/timestamp, plus any contacts or pet-rescue details the client edited in-app after signup.

## Why the right column is empty today

At signup, `provisionAppClient` (in `src/lib/app-clients.server.ts`) inserts the 5–10 seed forms into `client_documents` with `from_app = false`. The attorney board splits documents:

- `from_app = false` → "Draft forms" (left column) ✅
- `from_app = true`  → "From client's phone" (right column) ❌ empty until the phone POSTs back

That's a single-source design — there's no second copy. If the phone never uploads (because ICE took it), the right column stays blank forever. The forms themselves are not lost (they're in the left column), but the attorney has no visible signal that the file is complete.

## Plan

### 1. Mirror seed forms into the attorney file at signup

In `provisionAppClient`, after inserting the existing seed docs as `from_app = false` (left column / "Draft forms"), insert a **mirror copy** of the same set with `from_app = true` and `loaded_at = now()` (right column / "From client's phone"). The mirror's `content` field records that it was captured at activation, not uploaded from the device:

```
Mirrored from app file at activation on 2026-06-21.
Pending attorney review — will be populated from intake answers.
```

This means the moment a client activates the code, the attorney sees the right column populated with the same 10 forms. No SOS required. No race against ICE.

### 2. Wire the app to push immediately on activation

When the app redeems the activation code (`redeem_invite_token` RPC), have the phone immediately call `attach_alert_document` for each personalized form it locally generated, replacing the mirrored placeholder content. If the phone gets seized before this call, the placeholder mirror from step 1 is still in the attorney file — belt and suspenders.

Concretely: add a new server function `pinUploadAppCopy({ token, documentType, content })` that updates the matching `from_app = true` row's `content` field. The app calls this once per form right after activation.

### 3. Trigger payload becomes lean

On SOS, the phone only needs to send:
- Live GPS lat/lng
- Battery %
- Timestamp
- Any contacts/pet-rescue rows the client *added or edited in-app* after signup (not the seed ones — those are already on the server)

`record_sos_alert` already accepts these. No schema change needed.

### 4. UI label update on `/attorney-board`

In the right column header, change `From client's phone (N)` to:

```
From client's file (N) — captured at signup, live-updated by the app
```

So the attorney understands the column is populated at signup and refreshed by the app, not dependent on the phone surviving an arrest.

### 5. Backfill DEMO0001 and any existing clients

One-time SQL: for every `app_clients` row, find its `from_app = false` docs and insert mirrors with `from_app = true` if a mirror doesn't already exist. This makes the change visible immediately for existing demo clients without forcing a re-signup.

## Files touched

- `src/lib/app-clients.server.ts` — insert mirror docs at provisioning
- `src/lib/pin-access.functions.ts` — new `pinUploadAppCopy` server fn (step 2); update column header text in the response if needed
- `src/routes/attorney-board.tsx` — relabel the right column
- New migration — backfill mirrors for existing clients
- (Optional, for the app team) document the new `pinUploadAppCopy` endpoint so the Premio app can call it post-activation

## Out of scope for this PR

- The Premio app's local PDF generation pipeline. We expose the endpoint; the app team wires the call.
- Changing what SOS uploads — the payload is already correct.
- Twilio toll-free verification (separate thread).
