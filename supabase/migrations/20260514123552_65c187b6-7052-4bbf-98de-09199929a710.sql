
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='subscriptions' AND policyname='Deny anon access to subscriptions') THEN
    CREATE POLICY "Deny anon access to subscriptions"
      ON public.subscriptions
      AS RESTRICTIVE
      FOR ALL
      TO anon
      USING (false)
      WITH CHECK (false);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Deny client access to readiness-vault bucket') THEN
    CREATE POLICY "Deny client access to readiness-vault bucket"
      ON storage.objects
      AS RESTRICTIVE
      FOR ALL
      TO anon, authenticated
      USING (bucket_id <> 'readiness-vault')
      WITH CHECK (bucket_id <> 'readiness-vault');
  END IF;
END $$;
