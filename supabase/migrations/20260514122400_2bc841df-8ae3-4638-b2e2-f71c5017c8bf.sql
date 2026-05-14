
-- Explicit deny-all policies for sensitive tables (service_role bypasses RLS)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'emergency_activations','readiness_packets','readiness_deliveries',
    'app_install_tokens','case_tracking','intake_submissions'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Deny all client access" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Deny all client access" ON public.%I AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)', t);
  END LOOP;
END $$;

-- Storage policies: deny anon/authenticated on intake-forms bucket
DROP POLICY IF EXISTS "intake-forms deny client access" ON storage.objects;
CREATE POLICY "intake-forms deny client access"
  ON storage.objects AS RESTRICTIVE
  FOR ALL TO anon, authenticated
  USING (bucket_id <> 'intake-forms')
  WITH CHECK (bucket_id <> 'intake-forms');

-- Lock down SECURITY DEFINER functions to service_role only
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon, authenticated;

-- Set immutable search_path on email queue functions
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq, extensions;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq, extensions;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq, extensions;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq, extensions;
