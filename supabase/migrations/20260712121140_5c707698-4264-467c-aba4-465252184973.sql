
ALTER TABLE public.qualify_submissions
  ADD COLUMN IF NOT EXISTS stripe_verification_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_verification_status text,
  ADD COLUMN IF NOT EXISTS stripe_verification_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS income_document_type text,
  ADD COLUMN IF NOT EXISTS id_document_path text,
  ADD COLUMN IF NOT EXISTS income_document_path text,
  ADD COLUMN IF NOT EXISTS support_letter_path text;

CREATE INDEX IF NOT EXISTS qualify_submissions_verif_idx
  ON public.qualify_submissions(stripe_verification_session_id)
  WHERE stripe_verification_session_id IS NOT NULL;
