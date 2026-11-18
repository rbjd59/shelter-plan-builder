CREATE TABLE public.vehicle_rescue_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_session_id text NOT NULL UNIQUE,
  assessment_id uuid REFERENCES public.assessments(id) ON DELETE CASCADE,
  app_client_id uuid REFERENCES public.app_clients(id) ON DELETE CASCADE,
  user_id uuid,
  language text NOT NULL DEFAULT 'en',
  owner_name text NOT NULL,
  vehicle_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  review_status text NOT NULL DEFAULT 'draft_pending_review',
  draft_document_id uuid,
  approved_document_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vehicle_rescue_one_client CHECK (num_nonnulls(assessment_id, app_client_id) = 1),
  CONSTRAINT vehicle_rescue_language CHECK (language IN ('en','es','ht'))
);
GRANT SELECT ON public.vehicle_rescue_enrollments TO authenticated;
GRANT ALL ON public.vehicle_rescue_enrollments TO service_role;
ALTER TABLE public.vehicle_rescue_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners and authorized staff can read vehicle enrollments"
ON public.vehicle_rescue_enrollments FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'firm'));
CREATE POLICY "Authorized staff can update vehicle enrollments"
ON public.vehicle_rescue_enrollments FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'firm'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'firm'));
CREATE INDEX vehicle_rescue_app_client_idx ON public.vehicle_rescue_enrollments(app_client_id);
CREATE INDEX vehicle_rescue_assessment_idx ON public.vehicle_rescue_enrollments(assessment_id);
CREATE INDEX vehicle_rescue_user_idx ON public.vehicle_rescue_enrollments(user_id);