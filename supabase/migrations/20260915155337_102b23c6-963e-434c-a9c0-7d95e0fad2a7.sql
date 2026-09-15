ALTER TABLE public.client_form_answers
  ADD COLUMN IF NOT EXISTS intake_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb;