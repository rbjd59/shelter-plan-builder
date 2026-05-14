ALTER TABLE public.app_install_tokens
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'client'
  CHECK (role IN ('client','family'));