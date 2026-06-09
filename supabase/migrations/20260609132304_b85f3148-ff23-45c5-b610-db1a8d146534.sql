CREATE TABLE public.webhook_send_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  endpoint TEXT NOT NULL,
  intake_session_id TEXT,
  request_timestamp TEXT,
  status_code INT,
  ok BOOLEAN NOT NULL DEFAULT false,
  error_kind TEXT,
  error_message TEXT,
  response_snippet TEXT,
  duration_ms INT
);
CREATE INDEX webhook_send_log_created_at_idx ON public.webhook_send_log (created_at DESC);
CREATE INDEX webhook_send_log_ok_idx ON public.webhook_send_log (ok, created_at DESC);
GRANT SELECT ON public.webhook_send_log TO authenticated;
GRANT ALL ON public.webhook_send_log TO service_role;
ALTER TABLE public.webhook_send_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view webhook send log" ON public.webhook_send_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));