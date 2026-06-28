ALTER TABLE public.app_clients
  ADD COLUMN IF NOT EXISTS dead_man_switch_hours INTEGER
    CHECK (dead_man_switch_hours IS NULL OR dead_man_switch_hours IN (24, 36, 72)),
  ADD COLUMN IF NOT EXISTS last_checkin_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_app_clients_dms_active
  ON public.app_clients (last_checkin_at)
  WHERE dead_man_switch_hours IS NOT NULL;