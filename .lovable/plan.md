
# Attorney-Reviewed Layer — Rosario Sorrentino Law Firm PLLC

Adds an **independent attorney review** layer to DetencionDefensa.com, modeled on the single-firm + IOLTA compliance pattern (DocDraft / LegalZoom-style trust signaling). Sequenced so we ship everything except the IOLTA money movement now, then flip on the $35 → IOLTA charge the moment Stripe Connect is live.

---

## Compliance posture (non-negotiable)

- Two entities, never conflated: **DetencionDefensa.com, Inc.** (tech / app / translation / typing) and **Rosario Sorrentino Law Firm PLLC** (legal services). Distinct accent color for the Firm (`#6B4F4F`).
- **"Not a law firm" disclaimer** in the global footer on every page.
- **Attorney advertising notice** (Florida Bar Rule 4-7) on every page that references legal services + Firm's geographic location.
- **Dual-role disclosure** wherever the same flow touches both entities.
- **No fee sharing**: $35 attorney portion will flow customer → Firm IOLTA via Stripe Connect (Phase 2). Until Connect is live, we DO NOT charge the $35 attorney fee — customer pays $164 to the Company, signs the retainer, and the attorney portion is invoiced/collected off-platform with a clear on-screen note. **No single $199 charge to the Company touches attorney funds, ever.**
- **Limited-scope engagement letter** (Rule 4-1.2(c)) signed before any legal service begins. Captured with version, language, IP, timestamp, signature.

---

## What the customer sees (new flow)

1. **Landing** — repositioned as "Every document is reviewed by an independent licensed attorney." Trust band with attorney photo, bar number, firm name. DocDraft/LegalZoom-style hero. Three-step explainer: *Sign up → Attorney reviews your draft → Locate & mail to detention*.
2. **What the app does** (new explainer section, EN/ES/HT) — lists every form generated from intake answers:
   - AO 242 (Habeas Petition) — draft
   - AO 240 (IFP / *In Forma Pauperis*)
   - JS 44 Civil Cover Sheet
   - Motion for Assignment of Counsel
   - Cover letter to the clerk
3. **Checkout** — single page, shows itemized breakdown:
   - $164.00 — DetencionDefensa.com, Inc. (app, translation, typing, storage)
   - $35.00 — Sorrentino Law Firm PLLC (attorney review, limited scope)
   - **Total: $199.00**
   Two-step charge (see Payments below).
4. **Limited-scope retainer** — signed BEFORE intake answers are taken. Bilingual. Captured to `legal_retainers` table.
5. **Intake** (existing) — answers feed draft generation.
6. **Draft generation** (existing pipeline) — but now lands in **attorney review queue** instead of going straight to the app.
7. **Attorney completes review** at `/firm/review/:caseId` → marks "Approved for storage" → drafts are released to the customer's app + a copy goes to the Firm.
8. **Trigger (NOTIFY FAMILY)** — when fired, the package routes to: (a) attorney, (b) family/next contact, (c) company ops. Attorney's clock starts.
9. **Locate** — company ops locate the person (existing case_action_log step 4).
10. **Attorney fills in respondent / facility / federal # / date of arrest** at `/firm/finalize/:caseId` → marks "Mailed via legal mail" with tracking #. Attorney's fee is earned on review (step 7); mailing is bundled service, not an additional charge.
11. **Receipt confirmation** logged by ops when USPS confirms delivery.

---

## Build phases

### Phase 1 — Compliance, copy, retainer (ship now, no Connect needed)

- Global footer: add "Not a law firm" disclaimer + Firm advertising notice on every page.
- New `/attorney` page: Rosario's bio, FL bar #, firm address, scope of services, what "attorney-reviewed" means.
- Landing page rework: hero, trust band, 3-step explainer, "What the app does" list of forms, attorney-review badge.
- Retainer: bilingual limited-scope engagement letter (EN/ES/HT) — drafted from FL Bar Rule 4-1.2(c) template. Inserted into checkout flow as a required signing step (typed-name e-signature + checkbox acknowledgment + version + timestamp + IP). Stored in new `legal_retainers` table.
- Checkout page UI: shows itemized $164 + $35 = $199 breakdown with explicit "two entities" note. **In Phase 1, only the $164 actually charges**; on-screen note explains the $35 attorney fee is billed separately by the Firm under the signed retainer.

### Phase 2 — Stripe Connect / IOLTA ($35 charge) — UNBLOCKED WHEN YOU CONFIRM CONNECT IS LIVE

- Add `STRIPE_CONNECT_FIRM_ACCOUNT_ID` secret.
- Modify checkout to create **two charges in one UX**: PaymentIntent A ($164 → Company) + PaymentIntent B ($35 → Firm via `transfer_data.destination = <connected account>` → Firm IOLTA). Atomic from the customer's view; two line items on their statement.
- Update receipts.
- Remove the Phase-1 "billed separately" note.

### Phase 3 — Attorney review portal (firm-only)

- New `/firm/*` subtree (gated by `role = 'firm'` in `user_roles`). Distinct Firm accent color.
- `/firm/queue` — drafts awaiting review.
- `/firm/review/:caseId` — view generated drafts (AO 242, AO 240, JS 44, motion for counsel), edit, approve for storage. Marks `case_action_log` step.
- `/firm/finalize/:caseId` — post-locate: fill in respondent, facility, fed #, arrest date on AO 242. Generate final PDF. Mark "mailed via legal mail" + tracking #.
- Audit log of every attorney action (who, when, IP).

### Phase 4 — Trigger routing update

- When NOTIFY FAMILY fires, package now also emails the attorney as a recipient.
- Attorney receives "Locate complete → please finalize" notification once ops completes step 4.

---

## Database changes (single migration)

```text
legal_retainers
├── id, intake_session_id (or user_id for pre-checkout), version,
├── language (en|es|ht), signed_name, ip, user_agent,
├── body_snapshot (text — exact retainer shown), signed_at

attorney_actions
├── id, case_id, attorney_user_id, action ('reviewed_draft' | 'approved_for_storage' | 'finalized_ao242' | 'mailed'),
├── notes, metadata (jsonb), created_at

user_roles  (existing — add 'firm' to app_role enum)
```

Plus an `is_firm` policy helper using existing `has_role`.

---

## Files to create / modify

**New:**
- `src/routes/attorney.tsx` — public attorney page
- `src/routes/retainer.tsx` — bilingual retainer signing
- `src/lib/retainer-content.ts` — EN/ES/HT retainer text + version constant
- `src/routes/_firm.tsx` + `_firm/firm.queue.tsx` + `_firm/firm.review.$id.tsx` + `_firm/firm.finalize.$id.tsx`
- `src/components/AttorneyReviewBadge.tsx`
- `src/components/LegalDisclaimerFooter.tsx`
- `src/lib/retainer.functions.ts` — sign + fetch
- `src/lib/firm-review.functions.ts` — queue, approve, finalize
- Migration for `legal_retainers`, `attorney_actions`, `firm` role

**Modified:**
- `src/routes/index.tsx` — landing rework
- `src/routes/intake.tsx` — gate behind signed retainer
- `src/components/SiteShell.tsx` — global footer + nav link to /attorney
- `src/utils/payments.functions.ts` — Phase 1: still $164 single charge with new line-item display metadata; Phase 2: split via Connect
- `src/components/StripeEmbeddedCheckout.tsx` — itemized breakdown UI
- Draft pipeline (case-tracking / intake-notification) — route to firm queue, not directly to app

---

## What I need from you before I start

1. **Approve this plan** (reply "go").
2. **Rosario's details** for the attorney page + retainer: full name as it appears on FL Bar (e.g., "Rosario Sorrentino, Esq."), FL Bar number, firm address, firm phone, firm email.
3. **Confirm price**: $164 to Company + $35 to Firm = $199 total. ✓ (already confirmed)
4. **Confirm Phase 1 UX**: customer charged $164 now, sees on-screen note that $35 attorney fee is billed separately by the Firm under the signed retainer until Connect is live. (Y/N — if N, I'll hold all checkout work until Connect is ready.)
5. **Retainer template language**: I'll draft EN first, then mark `[ES TRANSLATION NEEDED]` / `[HT TRANSLATION NEEDED]` per the skill rules — you commission certified legal translation before launch. OK?
6. **Firm user**: Rosario's email so I can seed his account as `role = 'firm'` after he signs in once.

Reply "go" + answers to 2 / 4 / 6 and I'll start with Phase 1.
