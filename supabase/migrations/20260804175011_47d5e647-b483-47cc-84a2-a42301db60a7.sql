DROP POLICY IF EXISTS "Uploads scoped to existing qualify submission" ON storage.objects;

CREATE POLICY "Owners upload own qualify docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'qualify-docs'
  AND name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
  AND EXISTS (
    SELECT 1 FROM public.qualify_submissions qs
    WHERE qs.id::text = split_part(objects.name, '/', 1)
      AND qs.user_id = auth.uid()
  )
);