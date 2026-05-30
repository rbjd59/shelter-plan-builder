-- Restrict to the known fixed filenames so the bucket cannot be listed
-- but each public reference document is still downloadable by direct URL.
DROP POLICY IF EXISTS "Self-help library public read" ON storage.objects;
CREATE POLICY "Self-help library named files only"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'self-help-library'
    AND name = ANY (ARRAY[
      'NIJC-Pro-Se-Manual-EN.pdf',
      'NIPNLG-Release-Guide-EN.pdf',
      'JS44-Civil-Cover-Sheet-Blank.pdf',
      'AO240-Application-IFP-Blank.pdf',
      'Federal-District-Courts-List.pdf'
    ])
  );
