CREATE TABLE public.assessment_drafts (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  language text NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'es', 'ht')),
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  sms_consent boolean NOT NULL DEFAULT false,
  sms_consent_at timestamptz,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  contacts jsonb NOT NULL DEFAULT '[]'::jsonb,
  help_requested text[] NOT NULL DEFAULT '{}',
  current_step integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'later')),
  reminder_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessment_drafts TO authenticated;
GRANT ALL ON public.assessment_drafts TO service_role;
ALTER TABLE public.assessment_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own assessment draft" ON public.assessment_drafts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own assessment draft" ON public.assessment_drafts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own assessment draft" ON public.assessment_drafts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own assessment draft" ON public.assessment_drafts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX assessment_drafts_reminder_idx ON public.assessment_drafts (updated_at) WHERE reminder_sent_at IS NULL;
ALTER TABLE public.assessments ADD COLUMN user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;
CREATE INDEX assessments_user_id_idx ON public.assessments (user_id);