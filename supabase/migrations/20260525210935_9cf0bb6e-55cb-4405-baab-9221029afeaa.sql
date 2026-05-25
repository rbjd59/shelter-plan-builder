CREATE TABLE public.intake_pair_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intake_session_id text,
  payload jsonb NOT NULL,
  code text,
  expires_at timestamptz,
  http_status int,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_intake_pair_logs_created_at ON public.intake_pair_logs (created_at DESC);
CREATE INDEX idx_intake_pair_logs_session ON public.intake_pair_logs (intake_session_id);

ALTER TABLE public.intake_pair_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny all client access"
ON public.intake_pair_logs
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);