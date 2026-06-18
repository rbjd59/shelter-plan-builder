
CREATE TABLE public.client_detention_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL UNIQUE REFERENCES public.app_clients(id) ON DELETE CASCADE,
  facility_name text,
  facility_address text,
  warden_name text,
  arrest_date date,
  a_number text,
  federal_id text,
  notes text,
  located_at timestamptz,
  located_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_detention_info TO authenticated;
GRANT ALL ON public.client_detention_info TO service_role;

ALTER TABLE public.client_detention_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage detention info"
  ON public.client_detention_info
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Firm can view detention info"
  ON public.client_detention_info
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'firm'));

CREATE TRIGGER trg_client_detention_info_updated_at
  BEFORE UPDATE ON public.client_detention_info
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
