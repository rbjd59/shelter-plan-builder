-- Save-and-resume drafts for the intake questionnaire.
CREATE TABLE public.intake_drafts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  english_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  approvals JSONB NOT NULL DEFAULT '{}'::jsonb,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en','es','ht')),
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.intake_drafts TO authenticated;
GRANT ALL ON public.intake_drafts TO service_role;

ALTER TABLE public.intake_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own intake draft"
  ON public.intake_drafts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER intake_drafts_touch_updated_at
  BEFORE UPDATE ON public.intake_drafts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();