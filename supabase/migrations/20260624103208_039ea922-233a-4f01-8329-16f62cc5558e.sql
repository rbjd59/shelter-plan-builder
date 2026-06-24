CREATE POLICY "Admins can upload app builds"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'app-builds' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read app builds"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'app-builds' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update app builds"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'app-builds' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'app-builds' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete app builds"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'app-builds' AND public.has_role(auth.uid(), 'admin'));