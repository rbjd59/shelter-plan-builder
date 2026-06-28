ALTER TABLE public.app_clients
  ADD COLUMN IF NOT EXISTS dead_man_switch_hours INTEGER,
  ADD COLUMN IF NOT EXISTS last_checkin_at TIMESTAMPTZ;

ALTER TABLE public.app_clients
  DROP CONSTRAINT IF EXISTS app_clients_dms_hours_check;

ALTER TABLE public.app_clients
  ADD CONSTRAINT app_clients_dms_hours_check
  CHECK (dead_man_switch_hours IS NULL OR dead_man_switch_hours IN (24, 36, 72));

CREATE INDEX IF NOT EXISTS idx_app_clients_dms_due
  ON public.app_clients (last_checkin_at)
  WHERE dead_man_switch_hours IS NOT NULL;