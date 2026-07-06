
-- 1) Tighten qualify_submissions INSERT: prevent anon inserts from claiming another user's identity
DROP POLICY IF EXISTS "Anyone can submit qualification" ON public.qualify_submissions;
CREATE POLICY "Anyone can submit qualification"
  ON public.qualify_submissions
  FOR INSERT
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- 2) Scope qualify-docs uploads: object path must be prefixed by a valid submission UUID that exists
DROP POLICY IF EXISTS "Anyone can upload qualify docs" ON storage.objects;
CREATE POLICY "Uploads scoped to existing qualify submission"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'qualify-docs'
    AND name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
    AND EXISTS (
      SELECT 1 FROM public.qualify_submissions qs
      WHERE qs.id::text = split_part(name, '/', 1)
        AND (qs.user_id IS NULL OR qs.user_id = auth.uid())
    )
  );
