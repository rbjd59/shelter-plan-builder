
# Plan — Sentinel Asset Protection (two-stage upsell)

## What we're building

After a family completes intake + payment for the $199 Detention Defense Plan, the success screen offers **two add-ons** powered by a "Sentinel" subsidiary brand (visual language pulled from the uploaded Sentinel Strategic Frame v1.2 + Sentinel Trust HTML mockups).

### Stage 1 — "Sentinel Readiness Packet" — $100 add-on (this build)
Modeled on Immigrant Defense Project's *ReadyNow* family-preparedness workbook, but:
- Delivered in client's chosen language (ES/EN/HT), with **we-translate-and-type** service
- Documents stay **locked in the on-device encrypted vault**
- Auto-released to the designated person **only when the lock-screen panic trigger fires** (reuses existing emergency_activations workflow with the 2h/12h confirmation windows)

Packet contents (the ReadyNow checklist, adapted):
1. **Power of Attorney** (general + childcare-specific, state-appropriate template)
2. **Standby/Temporary Guardianship designation** for minor children
3. **School pickup authorization** (per-school, per-child)
4. **Medical authorization / HIPAA release** for designated caregiver
5. **Bank account access letter** + list of accounts/balances (no passwords stored)
6. **Property & vehicle inventory** with title locations
7. **Lease/mortgage info sheet** + landlord contact
8. **Emergency contact tree** (3 tiers: immediate, extended, attorney)
9. **Children's information sheet** (DOB, SSN, school, doctor, allergies, meds)
10. **A-number, alien registration, court info** if applicable
11. **Document locator map** (where birth certs, passports, deeds physically live)
12. **Letter to children** (optional, family writes; we type/translate)

### Stage 2 — "Sentinel Trust" — premium tier (NOT built this turn, just teased)
Irrevocable spendthrift trust + LLC structure for asset protection during removal proceedings. CTA card on success page: *"Learn about Sentinel Trust →"* linking to a marketing page. Actual trust formation is a separate $1,500–5,000 product handled by attorney referral.

## User flow

```text
checkout ($199)  →  intake form  →  intake success
                                     │
                                     ├─[card] Add Sentinel Readiness Packet — $100
                                     │   click → /readiness/start
                                     │
                                     └─[card] Sentinel Trust (premium) → /sentinel-trust (marketing only)

/readiness/start
  → Stripe checkout for $100 add-on (one-time, lookup_key: readiness_packet_100)
  → on success: /readiness/intake
       multi-step form (client fills in their language):
         Step 1: Designated trigger recipient (name, email, phone, relationship)
         Step 2: Children info
         Step 3: Financial accounts (no passwords)
         Step 4: Property & documents locator
         Step 5: Emergency contact tree
         Step 6: POA / guardianship designees + state
         Step 7: Optional letter to children (free text)
       → submits to readiness_packets table (status='pending_translation')
  → success screen: "Our team will translate, type, and deliver your packet
     to your secure vault within 48 hours. You'll be notified by email."

[STAFF — manual, off-app] translator types up forms in EN + client lang,
generates PDF bundle, uploads to private storage bucket, marks packet
status='ready_to_sign'. System emails client a one-time link.

Client receives email → /readiness/sign?token=…
  → downloads each PDF, prints, signs, gets notarized
  → uploads scanned signed copies back via same page
  → status='vaulted'  (encrypted-at-rest, AES-256, in private bucket; key
     derived from token + intake_session_id)

VAULT IS DORMANT. Files exist but are unreachable to anyone — including
the client — until emergency trigger fires.

[TRIGGER] existing /api/public/emergency/activate fires →
  after 2h (client) or 12h (family) confirmation window expires without
  cancel → background job:
    1. decrypt vaulted PDFs
    2. email signed packet to designated trigger recipient (Step 1)
    3. log delivery in readiness_deliveries
```

## Technical implementation

### Database (one migration)
```sql
-- new product/packet record
create table public.readiness_packets (
  id uuid primary key default gen_random_uuid(),
  intake_session_id text not null,
  stripe_session_id text,
  language text not null default 'es',
  status text not null default 'pending_payment',
    -- pending_payment | paid | pending_translation | ready_to_sign | vaulted | delivered | cancelled
  designated_recipient jsonb,         -- {name,email,phone,relationship}
  form_answers jsonb,                 -- raw client input
  signing_token text unique,          -- one-time URL token
  signing_token_expires_at timestamptz,
  vault_storage_paths text[],         -- paths in 'readiness-vault' bucket
  vaulted_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.readiness_packets enable row level security;
-- no public SELECT — all access via server functions w/ service role

create table public.readiness_deliveries (
  id uuid primary key default gen_random_uuid(),
  packet_id uuid references public.readiness_packets(id),
  emergency_activation_id uuid,
  delivered_to_email text,
  delivered_at timestamptz not null default now(),
  message_id text
);
alter table public.readiness_deliveries enable row level security;

-- private storage bucket
insert into storage.buckets (id, name, public) values
  ('readiness-vault', 'readiness-vault', false)
  on conflict do nothing;
```

### Stripe
- New product `readiness_packet` with one-time price `$100` (lookup_key `readiness_packet_100`, tax code `txcd_30060000` to match existing form-prep classification).

### Files
- `src/routes/readiness/start.tsx` — add-on offer page (Stripe embedded checkout for $100)
- `src/routes/readiness/success.tsx` — post-payment redirect → links to intake
- `src/routes/readiness/intake.tsx` — 7-step packet intake form (i18n via existing LanguageContext)
- `src/routes/readiness/sign.tsx` — token-gated download/upload page for signed PDFs
- `src/routes/sentinel-trust.tsx` — marketing page, Sentinel Trust visual language
- `src/components/SentinelUpsellCards.tsx` — two cards rendered on `/intake` success
- `src/lib/readiness.functions.ts` — `createReadinessCheckout`, `submitReadinessIntake`, `getPacketByToken`, `uploadSignedPacket`, `triggerVaultRelease` (called by emergency activate handler)
- `src/lib/readiness.server.ts` — encryption helpers (AES-GCM via Web Crypto), PDF templating list, staff notification email
- Modify `src/routes/api/public/emergency/activate.ts` — after the 2h/12h window expires, call `triggerVaultRelease(intake_session_id)` to email packet to designated recipient
- Modify `src/routes/intake.tsx` — render `<SentinelUpsellCards />` after submission
- Modify `src/routes/api/public/payments/webhook.ts` — recognize `readiness_packet` line item and mark `readiness_packets.status='paid'`

### Encryption model
- Each packet's PDFs encrypted at rest with a per-packet AES-256-GCM key.
- Key wrapped by HKDF(intake_session_id ‖ signing_token, server_secret).
- Server-only — never exposed to client. Decrypt only inside `triggerVaultRelease` server fn after emergency confirmation expires.

### Translation workflow (manual MVP)
First version: staff gets an email when `status='pending_translation'`, types up PDFs locally using a Word/Google Doc template library, uploads to vault via an internal staff route (`/admin/readiness/:id` — gated by `has_role(admin)`, future). For this build, the staff upload page can be a simple authenticated TanStack route — or skipped entirely and replaced by a Supabase storage upload via the dashboard. **Recommend skipping the admin UI in this first cut** — staff uploads directly via Cloud storage and runs an SQL update; we'll build the admin page in a follow-up once volume justifies it.

### Visual design
- Sentinel pages use the palette + typography from the uploaded HTML mockups:
  - Fraunces serif headings, Inter Tight body, JetBrains Mono captions
  - Paper `#f4efe6`, ink `#0e1a2b`, accent `#b8551f`, gold `#c9a961`
- Lives as a sibling visual identity to the main red/black detenciondefensa look — clearly "premium subsidiary."

## Out of scope this turn
- Sentinel Trust formation product (only marketing page)
- Admin staff UI for translators (manual SQL + Cloud storage upload for now)
- Per-state POA template library — V1 ships generic POA + a "verify with local notary" disclaimer
- Notarization scheduling integration

## Test plan
1. Buy $199 → intake → see two upsell cards
2. Click "Add Readiness Packet" → Stripe sandbox $100 checkout → success
3. Fill 7-step intake → submit → row in `readiness_packets` w/ status `pending_translation`
4. Manually upload a test PDF to `readiness-vault/{packet_id}/poa.pdf`, set status `vaulted`
5. Trigger emergency activation for that intake_session_id → wait window → verify designated recipient receives email with packet attached, `readiness_deliveries` row written
6. Verify vault PDFs are unreachable via direct Supabase URL (private bucket)

---

**Risk note:** The packet is document-prep + translation only — UPL-safe under the same scrivener framing as the existing $199 product. Add a disclaimer on `/readiness/start`: *"Sentinel Readiness is a document preparation and translation service. We do not provide legal advice. POA, guardianship, and trust documents should be reviewed by a licensed attorney in your state before signing."*

Approve to proceed, or tell me what to change.
