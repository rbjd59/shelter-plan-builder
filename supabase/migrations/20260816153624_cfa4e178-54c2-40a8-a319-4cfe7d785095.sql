
DO $$
DECLARE src uuid; dst uuid;
BEGIN
  SELECT id INTO src FROM public.app_clients WHERE invite_token = 'LP9ZFDNY';
  IF src IS NULL THEN RAISE EXCEPTION 'source demo client missing'; END IF;

  SELECT id INTO dst FROM public.app_clients WHERE invite_token = 'TEST1234';
  IF dst IS NULL THEN
    INSERT INTO public.app_clients (
      intake_session_id, invite_token, full_name, email, phone_e164, language,
      date_of_birth, a_number, place_of_birth, country_of_origin,
      has_asset_protection, has_pet_rescue, hmac_secret
    )
    SELECT 'demo-shared-testflight', 'TEST1234', 'TestFlight Beta Tester',
           email, phone_e164, language, date_of_birth, a_number, place_of_birth,
           country_of_origin, has_asset_protection, has_pet_rescue,
           encode(gen_random_bytes(32), 'hex')
    FROM public.app_clients WHERE id = src
    RETURNING id INTO dst;
  END IF;

  DELETE FROM public.client_contacts WHERE client_id = dst;
  INSERT INTO public.client_contacts (client_id, name, phone_e164, email, relationship, role, priority, notify_on_sos)
  SELECT dst, name, phone_e164, email, relationship, role, priority, notify_on_sos
  FROM public.client_contacts WHERE client_id = src;

  DELETE FROM public.client_documents WHERE client_id = dst;
  INSERT INTO public.client_documents (client_id, title, content, document_type, send_on_alert, storage_path, review_status)
  SELECT dst, title, content, document_type, send_on_alert, storage_path, review_status
  FROM public.client_documents WHERE client_id = src;
END $$;
