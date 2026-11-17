CREATE TABLE public.refused_app_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  reason text NOT NULL,
  endpoint text NOT NULL,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.refused_app_codes TO authenticated;
GRANT ALL ON public.refused_app_codes TO service_role;
ALTER TABLE public.refused_app_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read refused app codes" ON public.refused_app_codes
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX refused_app_codes_created_idx ON public.refused_app_codes (created_at DESC);