# Attorney Document Packet — End-to-End Preview

Goal for this turn: let you log into the firm back end, open a test case that has every form filled in, see the full document packet (including a new Memorandum of Law), and download/email it to yourself. LetterStream comes next as its own phase once you've eyeballed the output.

## Phase 1 — Memorandum of Law generator

New file: `src/lib/email/memorandum-of-law.server.ts`
- `buildMemorandumOfLawPdf(answers, options)` — pdf-lib, same style as existing intake PDFs
- Sections (auto-filled from intake answers + retainer):
  1. Caption (Immigration Court / Circuit, A-number, Respondent name)
  2. Introduction (who, country of origin, date of detention, custody facility)
  3. Statement of Facts (pulled from intake narrative fields)
  4. Procedural Posture
  5. Argument — three default headings:
     - Bond eligibility under 8 U.S.C. § 1226(a)
     - Lack of flight risk (community ties from intake)
     - Lack of danger (no qualifying convictions per intake)
  6. Prayer for Relief
  7. Signature block — Rosario Sorrentino, Esq.
- Long paragraphs wrap; multi-page supported.
- Where data is missing, prints a bracketed placeholder like `[FACT: date of arrest]` so the attorney sees what they still need to fill in. No silent blanks.

## Phase 2 — Dummy intake fixture

New file: `src/lib/fixtures/dummy-case.server.ts`
- Exports `seedDummyCase()` — a server function that:
  1. Creates an `app_clients` row (full name "Juan Demo Hernández", token `DEMO0001`, language `es`, country Honduras, etc.)
  2. Inserts a fully populated `intake_submissions.answers` JSON covering every field the PDFs read (personal info, family, employment, community ties, criminal history "none", detention facility, A-number, etc.)
  3. Inserts two `client_contacts`
  4. Inserts a signed `legal_retainers` row (so the review screen lets you approve)
  5. Returns `{ clientId, intakeSessionId }`
- Idempotent — re-running upserts on the demo token instead of duplicating.

Trigger: a button on `/firm/queue` labelled "Seed demo case" (firm-role only) that calls the server fn and then routes to the new packet page.

## Phase 3 — Document packet page on the attorney back end

New route: `src/routes/_firm/firm.packet.$id.tsx` (firm-role only)
- Lists every generated document for the case with a thumbnail row:
  - Cover letter (existing)
  - AO 242 habeas (existing)
  - JS-44 civil cover (existing)
  - Motion referral / pro-se brochure (existing)
  - **Memorandum of Law** (new)
  - Mailing label PDF (existing)
- Each row: "Preview" (opens PDF in new tab) and "Download" buttons
- Top of page: "Email entire packet to me" button → triggers a new server fn that zips/attaches all PDFs and emails them to the logged-in firm user
- Bottom: placeholder card "Send via LetterStream" (disabled, "Coming in Phase 4")

Backed by:
- `src/lib/firm-packet.functions.ts` — `getPacketManifest({caseId})`, `previewPacketDoc({caseId, docKey})` returns base64 PDF, `emailPacketToMe({caseId})`
- All require `requireSupabaseAuth` + `has_role('firm' | 'admin')`

## Phase 4 — LetterStream (next turn, after you eyeball Phase 1-3)

Not building this yet. When you're ready:
- Add `LETTERSTREAM_API_KEY` + `LETTERSTREAM_API_USER` via add_secret
- New `src/lib/letterstream.server.ts` wrapping their REST API (`/jobs`, certified mail w/ return receipt)
- "Send via LetterStream" button on the packet page → uploads PDFs, sets recipient address (detention facility from intake), confirms cost, returns tracking number
- Log each send in a new `letterstream_jobs` table

## Technical notes

- All new server fns use `createServerFn` + `requireSupabaseAuth`, gated by `has_role` check inside the handler.
- PDF builders are pure (answers in, `Uint8Array` out) so they're easy to unit test and reuse for LetterStream later.
- The "email packet to me" path reuses the existing transactional email queue with attachments — same pattern as `intake-pdfs.server.ts`.
- No new tables required for Phase 1-3. Phase 4 will need `letterstream_jobs`.

## What you'll do after I'm done

1. Open `/firm/queue` → click "Seed demo case"
2. Land on `/firm/packet/<id>` → preview each PDF, especially the Memorandum of Law
3. Click "Email packet to me" → check inbox at the firm email on file
4. Tell me what to tweak before we wire LetterStream

Approve and I'll build Phases 1-3 in one pass.
