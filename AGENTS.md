# Form generation
- Normalize canonical attorney form fields to PDF aliases after merging edits, so names, custody dates, booking IDs and case details cannot diverge between generators.
- Keep memo caption columns width-constrained and wrap variable text, so long client and custodian names do not overlap the case-number column.

# Phone activation
- Phone apps exchange activation codes through `/api/public/app/activate`, never direct activation database RPCs; keep those RPCs server-only to preserve the client-data boundary.

# Intake stages
- Generate family packets only from the caller's confirmed-account, RLS-scoped saved draft; email only that account and keep habeas locked pending independent licensed review, so public screening never sends or releases legal petitions.
- Fill official vehicle/custody PDFs through their native named fields and preserve signature/notary fields unsigned; bundle answer-selected drafts with conditional execution guidance to prevent identity or legal-authority substitutions.
- Share the validated, deterministic legal-screening engine between homepage and intake; public assessments accept only categorical answers and never persist, notify, decide eligibility or generate individual odds, because five answers cannot establish legal standing.
- Keep signup identity, referral attribution and consent in the intake answer record used by existing authenticated drafts; persist before continuing or signing out so both stages retain one source of truth.
- Account registration may carry only allowlisted non-secret signup fields in intake_signup metadata; passwords stay transient and email confirmation must complete before authenticated draft saving.

# Homepage presentation
- Keep the homepage arrangement scoped to `.home-redesign` and reuse verbatim exported HTML sections; isolated styles prevent redesigns from changing intake, staff or legal workflows.
- Keep related business-offering copy in the language-aware paid-solutions area and use `withLang` for outbound links so homepage language selection carries through without altering existing videos.
