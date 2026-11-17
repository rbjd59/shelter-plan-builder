ALTER TABLE public.assessment_documents
  ADD COLUMN IF NOT EXISTS packet_input jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.client_documents
  ADD COLUMN IF NOT EXISTS packet_input jsonb NOT NULL DEFAULT '{}'::jsonb;