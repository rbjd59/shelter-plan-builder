# Form generation
- Service-client operations require authenticated admin authorization; never use the shared board PIN to authorize new service-file edits, callback assignments or email sends.
- Store operational callback schedules separately from sending infrastructure; managed reminders use per-callback idempotency keys and respect cancellation.
- Keep simple family PDF generation separate from detention litigation forms, and keep real-estate authority out of family powers; trust agreement drafts remain incomplete and non-executable until state-specific attorney terms and transfer documents are approved.
- Normalize canonical attorney form fields to PDF aliases after merging edits, so names, custody dates, booking IDs and case details cannot diverge between generators.
- Keep memo caption columns width-constrained and wrap variable text, so long client and custodian names do not overlap the case-number column.

# Phone activation
- Phone apps exchange activation codes through `/api/public/app/activate`, never direct activation database RPCs; keep those RPCs server-only to preserve the client-data boundary.

# Intake stages
- Keep signup identity, referral attribution and consent in the intake answer record used by existing authenticated drafts; persist before continuing or signing out so both stages retain one source of truth.
- Account registration may carry only allowlisted non-secret signup fields in intake_signup metadata; passwords stay transient and email confirmation must complete before authenticated draft saving.

# Homepage presentation
- Use one anonymous, session-only process-help conversation before account setup; keep existing authenticated saved conversations private and separate from public help.
- Disable raw-HTML parsing in homepage chat answers; streaming Markdown must not invoke the incompatible HTML parser or inject model HTML.
- Keep optional homepage service-video previews click-to-play and separate from automatic qualified-result playback; this prevents simultaneous audio while keeping account setup below the previews.
- Overview video covers and labels must switch with the same language as the video source, so a localized recording never appears behind an unrelated-language cover.
- Keep the homepage arrangement scoped to `.home-redesign` and reuse verbatim exported HTML sections; isolated styles prevent redesigns from changing intake, staff or legal workflows.
- Keep related business-offering copy in the language-aware paid-solutions area and use `withLang` for outbound links so homepage language selection carries through without altering existing videos.
- Keep process-overview media language-specific and CDN-hosted, with original how-it-works media available in the video library; large video files must not enter the repository.
- Use the shared assessment video player for qualified-service videos: attempt audible autoplay, offer a localized play control when browsers block it, and advance only on video end or an explicit next action.
- Keep qualification-based video transitions in the tested assessment video-flow module so home and business videos play consecutively before scheduling; expose the same business media in the video library for previews without creating an assessment.
