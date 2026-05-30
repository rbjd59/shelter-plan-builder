-- Public bucket for the Self-Help Library: publicly available federal
-- forms and non-profit publications bundled with every intake. No PII.
INSERT INTO storage.buckets (id, name, public)
VALUES ('self-help-library', 'self-help-library', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public READ on objects in this bucket
DROP POLICY IF EXISTS "Self-help library public read" ON storage.objects;
CREATE POLICY "Self-help library public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'self-help-library');

-- Only service role can write (no INSERT/UPDATE/DELETE for anon/authenticated).
-- Writes are performed by Lovable agents / admin tooling via the service role.
