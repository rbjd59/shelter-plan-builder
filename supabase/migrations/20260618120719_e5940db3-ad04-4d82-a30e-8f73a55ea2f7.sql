
-- 1. New flag + bio columns on app_clients
ALTER TABLE public.app_clients
  ADD COLUMN IF NOT EXISTS place_of_birth TEXT,
  ADD COLUMN IF NOT EXISTS country_of_origin TEXT,
  ADD COLUMN IF NOT EXISTS has_asset_protection BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_pet_rescue BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. New table for pet rescue info (one row per client when has_pet_rescue=true)
CREATE TABLE IF NOT EXISTS public.client_pet_rescue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.app_clients(id) ON DELETE CASCADE,
  pet_name TEXT,
  pet_type TEXT,
  pet_location TEXT,
  access_instructions TEXT,
  who_to_notify TEXT,
  no_kill_shelter_preferred BOOLEAN NOT NULL DEFAULT TRUE,
  no_kill_shelter_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (client_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_pet_rescue TO authenticated;
GRANT ALL ON public.client_pet_rescue TO service_role;

ALTER TABLE public.client_pet_rescue ENABLE ROW LEVEL SECURITY;

-- Admins can read all pet rescue rows
CREATE POLICY "admins can read pet rescue"
  ON public.client_pet_rescue
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. updated_at trigger
DROP TRIGGER IF EXISTS trg_client_pet_rescue_updated_at ON public.client_pet_rescue;
CREATE TRIGGER trg_client_pet_rescue_updated_at
  BEFORE UPDATE ON public.client_pet_rescue
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
