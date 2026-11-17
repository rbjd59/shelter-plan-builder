ALTER TABLE public.assessments
  ADD COLUMN access_token_hash text,
  ADD COLUMN home_appointment_at timestamptz,
  ADD COLUMN business_appointment_at timestamptz,
  ADD COLUMN property_estimate jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX assessments_home_appointment_idx ON public.assessments (home_appointment_at);
CREATE INDEX assessments_business_appointment_idx ON public.assessments (business_appointment_at);

CREATE TABLE public.assessment_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  title text NOT NULL,
  document_type text NOT NULL DEFAULT 'family_forms_packet',
  content text NOT NULL,
  review_status text NOT NULL DEFAULT 'draft_pending_review',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.assessment_documents TO authenticated;
GRANT ALL ON public.assessment_documents TO service_role;
ALTER TABLE public.assessment_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view assessment documents" ON public.assessment_documents FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'firm'));
CREATE POLICY "Staff can review assessment documents" ON public.assessment_documents FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'firm'));
CREATE INDEX assessment_documents_assessment_idx ON public.assessment_documents (assessment_id);
CREATE TRIGGER assessment_documents_touch BEFORE UPDATE ON public.assessment_documents FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();