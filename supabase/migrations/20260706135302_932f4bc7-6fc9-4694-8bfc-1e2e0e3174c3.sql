
ALTER TABLE public.qualify_submissions
  ADD COLUMN IF NOT EXISTS intake_data jsonb,
  ADD COLUMN IF NOT EXISTS support_letter_url text,
  ADD COLUMN IF NOT EXISTS assessment_reasoning text,
  ADD COLUMN IF NOT EXISTS qualifies boolean;
