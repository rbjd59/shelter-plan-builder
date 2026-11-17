ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS service_file jsonb NOT NULL DEFAULT '{}'::jsonb;
CREATE TABLE public.service_callbacks (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 assessment_id uuid REFERENCES public.assessments(id) ON DELETE CASCADE,
 app_client_id uuid REFERENCES public.app_clients(id) ON DELETE CASCADE,
 title text NOT NULL,
 starts_at timestamptz NOT NULL,
 timezone text NOT NULL DEFAULT 'America/New_York',
 paralegal_email text NOT NULL,
 notes text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'scheduled',
 reminder_minutes integer[] NOT NULL DEFAULT ARRAY[60,30,15],
 handled_reminders integer[] NOT NULL DEFAULT ARRAY[]::integer[],
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT callback_one_client CHECK ((assessment_id IS NOT NULL)::integer + (app_client_id IS NOT NULL)::integer = 1),
 CONSTRAINT callback_status CHECK (status IN ('scheduled','completed','cancelled'))
);
GRANT ALL ON public.service_callbacks TO service_role;
ALTER TABLE public.service_callbacks ENABLE ROW LEVEL SECURITY;
CREATE INDEX service_callbacks_due ON public.service_callbacks(starts_at) WHERE status='scheduled';