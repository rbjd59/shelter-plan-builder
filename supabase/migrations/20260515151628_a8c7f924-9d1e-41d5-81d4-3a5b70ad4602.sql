ALTER TABLE public.emergency_activations
  ADD COLUMN IF NOT EXISTS warden_name text,
  ADD COLUMN IF NOT EXISTS facility_name text,
  ADD COLUMN IF NOT EXISTS facility_address text,
  ADD COLUMN IF NOT EXISTS date_of_arrest date,
  ADD COLUMN IF NOT EXISTS a_number text,
  ADD COLUMN IF NOT EXISTS mailing_label_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS family_notified_at timestamptz,
  ADD COLUMN IF NOT EXISTS office_notes text;

CREATE INDEX IF NOT EXISTS idx_emergency_activations_act_after
  ON public.emergency_activations (act_after)
  WHERE cancelled_at IS NULL AND family_notified_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_emergency_activations_fired_at
  ON public.emergency_activations (fired_at DESC);