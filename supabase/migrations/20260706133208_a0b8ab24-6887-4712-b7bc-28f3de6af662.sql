
CREATE TABLE public.qualify_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  household_size INT,
  dependents_count INT,
  us_citizen_children BOOLEAN DEFAULT FALSE,
  primary_earner BOOLEAN DEFAULT FALSE,
  monthly_income_cents BIGINT,
  household_state TEXT,
  id_document_url TEXT,
  income_document_url TEXT,
  plaid_item_id TEXT,
  plaid_access_token_encrypted TEXT,
  plaid_linked_at TIMESTAMPTZ,
  attestation_signed BOOLEAN DEFAULT FALSE,
  attestation_signed_at TIMESTAMPTZ,
  attestation_signature TEXT,
  tier TEXT CHECK (tier IN ('nocost','reduced','standard')),
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.qualify_submissions TO authenticated;
GRANT INSERT ON public.qualify_submissions TO anon;
GRANT ALL ON public.qualify_submissions TO service_role;

ALTER TABLE public.qualify_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit qualification"
  ON public.qualify_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own submissions"
  ON public.qualify_submissions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own submissions"
  ON public.qualify_submissions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all submissions"
  ON public.qualify_submissions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all submissions"
  ON public.qualify_submissions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER qualify_submissions_touch
  BEFORE UPDATE ON public.qualify_submissions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX qualify_submissions_created_idx ON public.qualify_submissions(created_at DESC);
CREATE INDEX qualify_submissions_user_idx ON public.qualify_submissions(user_id) WHERE user_id IS NOT NULL;
