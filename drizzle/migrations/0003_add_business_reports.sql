ALTER TABLE public.assessments ADD COLUMN business_report jsonb;
ALTER TABLE public.assessments ADD COLUMN business_report_sent_at timestamptz;
ALTER TABLE public.assessments ADD COLUMN attorney_report_sent_at timestamptz;