
CREATE POLICY "Firm and admin can read case packets"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'case-packets'
    AND (public.has_role(auth.uid(), 'firm') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Firm and admin can update case packets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'case-packets'
    AND (public.has_role(auth.uid(), 'firm') OR public.has_role(auth.uid(), 'admin'))
  );
