
-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Admins read roles" ON public.user_roles FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Case action log: lifecycle steps per triggered client
CREATE TABLE public.case_action_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  intake_session_id TEXT NOT NULL,
  step TEXT NOT NULL,
  completed_by TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_case_action_session ON public.case_action_log(intake_session_id);
CREATE INDEX idx_case_action_step ON public.case_action_log(step);
ALTER TABLE public.case_action_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read case actions" ON public.case_action_log FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert case actions" ON public.case_action_log FOR INSERT
  TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Page views: lightweight analytics
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  referrer TEXT,
  country TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_page_views_created ON public.page_views(created_at DESC);
CREATE INDEX idx_page_views_referrer ON public.page_views(referrer);
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read page views" ON public.page_views FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Seed first admin if account already exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users
WHERE email = 'legal@detenciondefensa.com'
ON CONFLICT DO NOTHING;
