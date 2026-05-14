CREATE TABLE public.emergency_activations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_session_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('client','family')),
  fired_at timestamptz NOT NULL DEFAULT now(),
  act_after timestamptz NOT NULL,
  cancelled_at timestamptz,
  gps_lat numeric,
  gps_lng numeric,
  gps_raw text,
  user_agent text,
  ip text,
  alert_email text,
  contact_email text,
  full_name text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.emergency_activations ENABLE ROW LEVEL SECURITY;

CREATE INDEX emergency_activations_session_idx
  ON public.emergency_activations (intake_session_id, fired_at DESC);
CREATE INDEX emergency_activations_act_after_idx
  ON public.emergency_activations (act_after) WHERE cancelled_at IS NULL;