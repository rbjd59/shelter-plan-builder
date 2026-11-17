CREATE TABLE public.video_question_threads (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, topic text NOT NULL CHECK (topic IN ('overview','home','business')), title text NOT NULL DEFAULT 'Question', messages jsonb NOT NULL DEFAULT '[]'::jsonb, blocked_reason text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_question_threads TO authenticated;
GRANT ALL ON public.video_question_threads TO service_role;
ALTER TABLE public.video_question_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY video_threads_read ON public.video_question_threads FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY video_threads_insert ON public.video_question_threads FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND blocked_reason IS NULL);
CREATE POLICY video_threads_update ON public.video_question_threads FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY video_threads_delete ON public.video_question_threads FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX video_question_owner_topic ON public.video_question_threads(user_id, topic, updated_at DESC);