
-- 1. Extend client_documents for review workflow
ALTER TABLE public.client_documents
  ADD COLUMN IF NOT EXISTS ai_generated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_model text,
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'draft_pending_review',
  ADD COLUMN IF NOT EXISTS attorney_reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS attorney_reviewed_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS review_notes text;

CREATE INDEX IF NOT EXISTS client_documents_review_status_idx
  ON public.client_documents(review_status);
CREATE INDEX IF NOT EXISTS client_documents_stripe_session_id_idx
  ON public.client_documents(stripe_session_id);

-- 2. Extend intake_submissions
ALTER TABLE public.intake_submissions
  ADD COLUMN IF NOT EXISTS packet_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS packet_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS packet_released_at timestamptz,
  ADD COLUMN IF NOT EXISTS packet_released_by uuid REFERENCES auth.users(id);

-- 3. Firm earnings ledger
CREATE TABLE IF NOT EXISTS public.firm_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text NOT NULL,
  intake_email text,
  amount_cents integer NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  released_to_operating_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.firm_earnings TO authenticated;
GRANT ALL ON public.firm_earnings TO service_role;

ALTER TABLE public.firm_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Firm can view earnings"
  ON public.firm_earnings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'firm') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Firm can update earnings"
  ON public.firm_earnings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'firm') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'firm') OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS firm_earnings_session_idx
  ON public.firm_earnings(stripe_session_id);
CREATE INDEX IF NOT EXISTS firm_earnings_reviewed_at_idx
  ON public.firm_earnings(reviewed_at);
