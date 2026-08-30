ALTER TABLE public.app_clients
  ADD COLUMN IF NOT EXISTS is_reviewer boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_app_clients_is_reviewer
  ON public.app_clients(is_reviewer) WHERE is_reviewer;