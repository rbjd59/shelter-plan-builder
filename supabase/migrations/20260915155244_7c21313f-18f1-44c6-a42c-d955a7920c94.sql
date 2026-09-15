CREATE TABLE public.client_form_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL UNIQUE REFERENCES public.app_clients(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.client_form_answers TO service_role;

ALTER TABLE public.client_form_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view form answers"
ON public.client_form_answers FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_client_form_answers_updated_at
BEFORE UPDATE ON public.client_form_answers
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();