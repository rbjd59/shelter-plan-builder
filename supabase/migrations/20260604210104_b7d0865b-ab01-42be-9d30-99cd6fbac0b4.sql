
CREATE TABLE public.legal_retainers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  intake_session_id TEXT,
  version TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('en','es','ht')),
  signed_name TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  body_snapshot TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.legal_retainers TO authenticated;
GRANT ALL ON public.legal_retainers TO service_role;

ALTER TABLE public.legal_retainers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert their own retainers"
  ON public.legal_retainers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users view their own retainers"
  ON public.legal_retainers FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Firm and admins view all retainers"
  ON public.legal_retainers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'firm') OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX legal_retainers_user_id_idx ON public.legal_retainers(user_id);
CREATE INDEX legal_retainers_intake_session_idx ON public.legal_retainers(intake_session_id);

CREATE TABLE public.attorney_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id TEXT NOT NULL,
  attorney_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN (
    'viewed_draft','reviewed_draft','approved_for_storage',
    'finalized_ao242','mailed','note'
  )),
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.attorney_actions TO authenticated;
GRANT ALL ON public.attorney_actions TO service_role;

ALTER TABLE public.attorney_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Firm and admins view attorney actions"
  ON public.attorney_actions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'firm') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Firm and admins insert attorney actions"
  ON public.attorney_actions FOR INSERT TO authenticated
  WITH CHECK (
    (public.has_role(auth.uid(), 'firm') OR public.has_role(auth.uid(), 'admin'))
    AND attorney_user_id = auth.uid()
  );

CREATE INDEX attorney_actions_case_idx ON public.attorney_actions(case_id);
CREATE INDEX attorney_actions_attorney_idx ON public.attorney_actions(attorney_user_id);
