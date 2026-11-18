# Don't Lose Your Car — Part 1

## Public pages and navigation
- Create one shared trilingual vehicle-program component for `/no-pierdas-tu-carro`, `/dont-lose-your-car`, and `/pa-pedi-machin-ou`.
- Include every requested section, the exact program limits, all four owner protections, the listed forms, 8–10 FAQs, referral disclosure near each CTA, review banner, and the shared firm/technology notices.
- Link the primary CTA to the existing intake as `/intake?lang=...&vehicle=1`; do not build the Part 2 checkbox or forms packet yet.
- Add a compact vehicle card with video beside the existing home/business paths, plus a localized Vehicle link in the main navigation and a For dealers footer link.

## Dealer page and saved interest
- Create `/dealers` in English and Spanish, with program obligations, licensing/insurance requirements, flat-fee wording without an amount, and the draft-agreement link at `/forms/vehicle/dealer-participation-agreement`.
- Validate and store each interest submission in a private dealer-interest table; reuse the existing lead email and staff SMS sender. Keep submissions out of public reads and use an idempotent request ID and practical submission limit.
- Add focused tests for validation, stored fields, notification behavior, and key public program promises.

## Video
- Save the exact EN/ES/HT narration and production notes in `docs/video-scripts/dont-lose-your-car.md` with the required approval/review status.
- Produce language-matched 16:9 videos using illustrative generated scenes, the existing click-to-play presentation, one male narrator, opening titles, synchronized captions, no music, and the required closing disclosure/firm text.
- Reuse one visual sequence across languages; generate continuous narration through the existing voice service where available. If narration cannot be produced, retain synchronized captions and document the limitation.

## Discovery, verification, and documentation
- Add per-language metadata, canonical/alias handling, and the main page to the existing sitemap without adding unsupported last-modified dates.
- Record the requested roadmap change-log entry and preserve the current homepage section order and unrelated features.
- Run the full tests, PDF tests, lint/typecheck and build; browser-check all aliases/languages, mobile layout, video playback, CTA destinations, and a marked dealer-form test. Confirm its saved row and notification logs, then remove only the test submission.
- Commit the completed Part 1 changes; do not publish or activate dealer fees, vehicle sales, retrievals, or legal documents.
