# Bilingual Court-Form Intake

## Goal

Replace the current question-style intake with the four official SDFL forms reproduced field-by-field. The user fills the left column in their language (Spanish or Haitian Creole); the right column shows live English translation they can review and approve. On submit, generate both the official English PDFs (for filing) and a native-language copy (for their records).

## Forms to mirror

1. **AO 242** — Petition for Writ of Habeas Corpus, 28 U.S.C. § 2241
2. **AO 240** — Application to Proceed In Forma Pauperis
3. **SDFL Motion for Referral to Volunteer Attorney Program**
4. **JS-44 Civil Cover Sheet** (from the PDF you uploaded)

Each form rendered as a structured schema (sections → fields with type, label, court-position) so we can swap layouts later without rewriting.

## Architecture

```
src/lib/forms/
  schema.ts                 # FormSchema, FieldSchema types (text/textarea/check/select/date)
  ao242.ts                  # field definitions matching official PDF
  ao240.ts
  sdfl-motion.ts
  js44.ts
  translations.ts           # static UI strings (es/en/ht) for labels & instructions

src/lib/translate.functions.ts
  translateFields()         # createServerFn → Lovable AI (Gemini), batch translates
                            # {fieldId: nativeText} → {fieldId: englishText}
                            # debounced from UI, cached per-field

src/components/intake/
  BilingualForm.tsx         # renders one form: two-column grid (native | English)
  BilingualField.tsx        # single row: label + native input + english readonly + approve checkbox
  FormShell.tsx             # stepper across the 4 forms
  ReviewSummary.tsx         # final approve-all screen before submit

src/routes/intake.tsx       # rewritten — replaces the current question flow
```

## UX flow

1. Language picker (already exists) → es / en / ht.
2. Stepper: Form 1 of 4 → Form 4 of 4 (AO 242, AO 240, SDFL Motion, JS-44).
3. For each field:
   - Native input on the left (their language).
   - English translation appears on the right ~700ms after they stop typing.
   - "✓ Approve translation" checkbox per field (auto-checked if user types directly in English mode).
4. Cannot advance to next form until all required fields are approved.
5. Final review: scrollable summary of all four forms in English; one big "Submit & Generate PDFs" button.
6. On submit: existing PDF generators run with the approved English text; a new native-language PDF set is generated alongside; both attached to the intake email.

## Translation

- `translateFields` server function calls Lovable AI (`google/gemini-3-flash-preview`) with a system prompt: *"You are a legal translator. Translate the following field values from {sourceLang} to English. Preserve legal terminology. Return JSON {fieldId: englishValue}."*
- Batches fields per request (debounced, ~500ms).
- Reverse direction (en→es/ht) used only on the final review screen so user sees their native version one last time.
- Failures: field shows "Translation unavailable — retry" with a button; never blocks the user.

## PDF generation

- Existing `intake-pdfs.server.ts` (AO 242 + AO 240) and `motion-referral.server.ts` keep working — they consume the approved English answers map.
- Add `js44.server.ts` that fills the JS-44 (AcroForm fields from the uploaded PDF).
- Add `native-copies.server.ts` that renders the same four forms in the user's native language using pdf-lib (text layout, not AcroForm) for their records.
- Email attaches 8 PDF links (4 English official + 4 native copies) instead of the current 4.

## Out of scope (this turn)

- Marking sections "not fillable" — you said we'll do that pass-by-pass later.
- Saving partial progress to the DB between forms — current intake is single-session; we keep that.
- Civil Cover Sheet PDF field mapping requires me to parse `Civil_Cover_Sheet.pdf` first to extract field names; I'll do that as the first step before writing `js44.ts`.

## Technical notes

- All four form schemas are pure data — no JSX — so the renderer is one component.
- Field IDs in schemas match the existing answer keys where possible (`full_name`, `facility_name`, etc.) so PDF fillers keep working unchanged.
- Translation cache keyed by `{lang}:{fieldId}:{nativeText}` to avoid re-translating unchanged values.
- "Approve" state stored in a separate `approvals: Set<string>` alongside `answers`.

## Estimated impact

- New files: ~10
- Rewritten: `src/routes/intake.tsx` (large), `src/lib/email/intake-notification.server.ts` (attach native copies)
- Net new dependency: none (pdf-lib + Lovable AI already in project)

Reply with approval (or tweaks) and I'll build it.