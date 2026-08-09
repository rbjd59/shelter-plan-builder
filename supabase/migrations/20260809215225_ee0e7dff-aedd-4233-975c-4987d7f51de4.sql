CREATE TABLE public.intake_delivery_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  intake_session_id text,
  client_id uuid,
  activation_code text,
  step text NOT NULL,
  status text NOT NULL DEFAULT 'success',
  target text,
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  duration_ms integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.intake_delivery_log TO service_role;
GRANT SELECT ON public.intake_delivery_log TO authenticated;

ALTER TABLE public.intake_delivery_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and staff can view delivery log"
ON public.intake_delivery_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'firm'));

CREATE INDEX idx_intake_delivery_log_created_at ON public.intake_delivery_log (created_at DESC);
CREATE INDEX idx_intake_delivery_log_session ON public.intake_delivery_log (intake_session_id);
CREATE INDEX idx_intake_delivery_log_client ON public.intake_delivery_log (client_id);