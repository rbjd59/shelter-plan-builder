
# Plan — Activate Sentinel Readiness Packet end-to-end

## Goal
Ship the Readiness Packet so a paying customer can: (1) buy $99 add-on, optionally (2) subscribe $5/mo vault, (3) fill a guided multi-step intake in their language, (4) we auto-generate court-grade PDFs (POA, guardianship, school pickup, medical/HIPAA, financial inventory, contact tree, children's info, document locator) — bilingual, ready to print + notarize, (5) choose "send to family now" OR "vault until HELP NOW fires."

## Document templates — source strategy
Use only **public-domain / open-source** form text. LegalZoom forms are proprietary; do not copy. Use:
- **Uniform Power of Attorney Act (UPOAA)** — model statutory POA text, public domain (adopted by 30+ states)
- **Standby Guardianship**: state statutory short forms (NY DSS-7, FL Form 12.982, CA GC-211 etc.) — public records
- **HIPAA Authorization** — model form from HHS.gov (public domain)
- **School pickup** — generic notarized authorization letter (no statutory form required)
- **Financial inventory / contact tree / document locator / children's info** — our own templates (no statutory form exists)

V1 ships **one general UPOAA-based template** with a "verify with your state's notary" disclaimer. Per-state templates land in V2.

All templates rendered server-side via `pdfkit` (already Worker-compatible, no native deps), bilingual two-column layout (English left, client language right) so notaries can read English while the signer reads their language.

## What gets built

### A. Database (one migration)
- Add `delivery_mode` to `readiness_packets`: `'send_now' | 'vault_until_emergency'`
- Add `vault_subscription_id` (text, nullable) → links to `subscriptions.stripe_subscription_id`
- Add `recipient_sent_at`, `recipient_sent_message_id` columns
- Add `generated_pdf_paths text[]` (separate from signed `vault_storage_paths`)
- New product/price records via Stripe tools: `readiness_packet_99` ($99 one-time, replaces $100), `readiness_vault_monthly` ($5/mo recurring)

### B. Stripe products
- Create `readiness_packet` product → price `readiness_packet_99` ($99 one-time)
- Create `readiness_vault` product → price `readiness_vault_monthly` ($5/month recurring)
- Tax code `txcd_99999999` (mixed service)

### C. Server functions (new in `src/lib/readiness.functions.ts`)
- `createReadinessCheckout` (already exists) — switch to $99 lookup key
- `createVaultSubscriptionCheckout` — $5/mo Stripe subscription, links to packet
- `generatePacketPDFs` — takes packet_id, renders 8 PDFs from form_answers using pdfkit, returns storage paths
- `sendPacketToRecipientNow` — emails the bundle directly to designated recipient with download links
- `triggerVaultRelease` (exists) — keep, fires on emergency

### D. PDF templates (`src/lib/readiness-pdf/`)
One file per document, each exports `renderXxxPDF(answers, lang): Uint8Array`:
- `power-of-attorney.ts` (UPOAA general POA)
- `standby-guardianship.ts`
- `school-pickup.ts`
- `hipaa-authorization.ts`
- `financial-inventory.ts`
- `emergency-contact-tree.ts`
- `children-info.ts`
- `document-locator.ts`

Bilingual two-column. Notary block at bottom. Signature lines. State field. Auto-fills from intake answers.

### E. Frontend
- **`/readiness/intake`** (exists, 7-step form) → on submit: call `generatePacketPDFs` → route to **`/readiness/review`** (new)
- **`/readiness/review`** (new): preview generated PDFs, choose:
  - **[A] Send to family now** — collect recipient email, fire `sendPacketToRecipientNow`, show "delivered" confirmation. Customer still prints + notarizes physically; recipient gets PDFs to print and hold.
  - **[B] Vault for emergency only** — gate on $5/mo subscription. If not subscribed, show inline `<VaultSubscriptionUpsell>` → Stripe embedded checkout → on success, mark packet `delivery_mode='vault_until_emergency'`.
  - **[C] Both** — send now AND vault.
- **`<SentinelUpsellCards>`** — already updated, no change

### F. App-side bundle
The existing `/api/public/emergency/activate` already calls `triggerVaultRelease`. After this build, vaulted packets get released alongside the existing AO 242 (habeas) + AO 240 (IFP) PDFs that are already attached to the emergency alert. Update `triggerVaultRelease` to attach generated PDFs (not just signed scans) so families get usable docs even if the client never uploaded notarized copies.

## File changes
**New:**
- `src/lib/readiness-pdf/index.ts` (registry)
- `src/lib/readiness-pdf/power-of-attorney.ts`
- `src/lib/readiness-pdf/standby-guardianship.ts`
- `src/lib/readiness-pdf/school-pickup.ts`
- `src/lib/readiness-pdf/hipaa-authorization.ts`
- `src/lib/readiness-pdf/financial-inventory.ts`
- `src/lib/readiness-pdf/emergency-contact-tree.ts`
- `src/lib/readiness-pdf/children-info.ts`
- `src/lib/readiness-pdf/document-locator.ts`
- `src/lib/readiness-pdf/shared.ts` (bilingual two-column helpers, notary block)
- `src/routes/readiness/review.tsx`
- `src/components/VaultSubscriptionUpsell.tsx`
- One migration

**Edited:**
- `src/lib/readiness.functions.ts` — add `generatePacketPDFs`, `sendPacketToRecipientNow`, `createVaultSubscriptionCheckout`; switch lookup key to `readiness_packet_99`
- `src/lib/readiness.server.ts` — `triggerVaultRelease` attaches generated PDFs
- `src/routes/readiness/intake.tsx` — on submit redirect to `/readiness/review` instead of "wait 48 hours" message
- `src/routes/readiness/start.tsx` — copy update to $99
- `src/components/SentinelUpsellCards.tsx` — already says $99, no change
- `src/routes/api/public/payments/webhook.ts` — handle `readiness_vault_monthly` subscription events

## Out of scope this turn
- Per-state POA template library (V1 = generic UPOAA + disclaimer)
- Notarization scheduling integration (recommend Notarize.com / OneNotary externally)
- Admin staff translator UI (auto-generation removes the manual step entirely for V1)
- Client-side PDF preview (just download links)

## Risk + UPL
Auto-generated POA from a public statutory model is document-prep — same UPL framing as the existing habeas/IFP product. Disclaimer on `/readiness/review`: *"Sentinel Readiness generates documents from public statutory models. Sentinel is not a law firm. POA, guardianship, and HIPAA authorizations should be reviewed by a licensed attorney in your state and notarized before they take effect."*

## Test plan
1. Buy $199 → intake → see Sentinel cards
2. Click Add Packet → $99 Stripe sandbox checkout
3. Fill 7-step intake → click Generate → see 8 PDF download links on `/readiness/review`
4. Choose "Send to family now" → enter recipient email → confirm delivery (Resend log row)
5. Choose "Vault" → $5/mo subscription checkout → packet marked vaulted
6. Trigger emergency → verify recipient gets generated PDFs attached

Approve to proceed.
