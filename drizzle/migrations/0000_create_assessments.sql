CREATE TABLE public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  language text NOT NULL DEFAULT 'en',
  full_name text,
  phone text,
  email text,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  results jsonb NOT NULL DEFAULT '{}'::jsonb,
  help_requested text[] NOT NULL DEFAULT '{}',
  authorization_signed_name text,
  authorization_signed_at timestamptz,
  paralegal_call_at timestamptz,
  status text NOT NULL DEFAULT 'pending_review',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.assessments TO authenticated;
GRANT ALL ON public.assessments TO service_role;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view assessments" ON public.assessments FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'firm'));
CREATE POLICY "Staff can update assessments" ON public.assessments FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'firm'));
CREATE TRIGGER assessments_touch BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();