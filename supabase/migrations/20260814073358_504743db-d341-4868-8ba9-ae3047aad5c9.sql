CREATE TABLE IF NOT EXISTS public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null,
  email text,
  phone text,
  language text not null default 'es',
  city text,
  message text,
  source text not null default 'website',
  need text,
  status text not null default 'new',
  routed_to text,
  routed_at timestamptz,
  assigned_note text
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff can read leads" ON public.leads;
CREATE POLICY "staff can read leads" ON public.leads
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'firm') OR public.has_role(auth.uid(), 'staff'));

DROP POLICY IF EXISTS "staff can update leads" ON public.leads;
CREATE POLICY "staff can update leads" ON public.leads
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'firm'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'firm'));

CREATE INDEX IF NOT EXISTS leads_created_at_idx ON public.leads (created_at DESC);