ALTER TABLE public.app_clients DROP CONSTRAINT IF EXISTS invite_token_format;
ALTER TABLE public.app_clients ADD CONSTRAINT invite_token_format CHECK (invite_token ~ '^[A-Z0-9]{5,8}$');