DROP FUNCTION IF EXISTS public.get_client_bundle(text);

CREATE OR REPLACE FUNCTION public.get_client_bundle(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  _norm TEXT := upper(trim(p_token));
  _row public.app_clients%ROWTYPE;
  _secret TEXT;
  _contacts jsonb;
  _docs jsonb;
  _pet jsonb;
BEGIN
  IF _norm !~ '^[A-Z0-9]{8}$' THEN
    RAISE EXCEPTION 'invalid_token_format';
  END IF;

  SELECT * INTO _row FROM public.app_clients WHERE invite_token = _norm;
  IF _row.id IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  _secret := _row.hmac_secret;
  IF _secret IS NULL OR length(_secret) < 32 THEN
    _secret := encode(extensions.gen_random_bytes(32), 'hex');
    UPDATE public.app_clients SET hmac_secret = _secret WHERE id = _row.id;
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id,
    'name', name,
    'phone', phone_e164,
    'phone_e164', phone_e164,
    'email', email,
    'relation', relationship,
    'relationship', relationship,
    'priority', priority,
    'notify_on_sos', notify_on_sos
  ) ORDER BY priority), '[]'::jsonb)
  INTO _contacts
  FROM public.client_contacts
  WHERE client_id = _row.id;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id,
    'title', title,
    'name', title,
    'content', content,
    'document_type', document_type,
    'type', document_type,
    'send_on_alert', send_on_alert,
    'from_app', from_app,
    'loaded_at', loaded_at
  ) ORDER BY loaded_at), '[]'::jsonb)
  INTO _docs
  FROM public.client_documents
  WHERE client_id = _row.id;

  SELECT CASE WHEN p.id IS NULL THEN NULL ELSE jsonb_build_object(
    'enabled', true,
    'pet_name', p.pet_name,
    'pet_type', p.pet_type,
    'pet_location', p.pet_location,
    'access_instructions', p.access_instructions,
    'who_to_notify', p.who_to_notify,
    'no_kill_shelter_preferred', p.no_kill_shelter_preferred,
    'no_kill_shelter_address', p.no_kill_shelter_address,
    'notes', p.notes
  ) END
  INTO _pet
  FROM public.client_pet_rescue p
  WHERE p.client_id = _row.id
  LIMIT 1;

  RETURN jsonb_build_object(
    'client_id', _row.id,
    'client_name', _row.full_name,
    'case_id', _row.invite_token,
    'activation_code', _row.invite_token,
    'activated_at', _row.activated_at,
    'hmac_secret', _secret,
    'has_asset_protection', COALESCE(_row.has_asset_protection, false),
    'has_pet_rescue', COALESCE(_row.has_pet_rescue, false),
    'update_url', 'https://detenciondefensa.com/update/' || _row.invite_token,
    'update_endpoint', 'https://detenciondefensa.com/api/public/app-update-request',
    'client', jsonb_build_object(
      'name', _row.full_name,
      'full_name', _row.full_name,
      'first_name', split_part(coalesce(_row.full_name,''), ' ', 1),
      'last_name', NULLIF(substr(coalesce(_row.full_name,''), length(split_part(coalesce(_row.full_name,''), ' ', 1))+2), ''),
      'date_of_birth', _row.date_of_birth,
      'dob', _row.date_of_birth,
      'birth_date', _row.date_of_birth,
      'a_number', _row.a_number,
      'alien_number', _row.a_number,
      'place_of_birth', _row.place_of_birth,
      'birth_place', _row.place_of_birth,
      'country_of_origin', _row.country_of_origin,
      'country', _row.country_of_origin,
      'language', _row.language,
      'phone', _row.phone_e164,
      'phone_e164', _row.phone_e164,
      'email', _row.email
    ),
    'profile', jsonb_build_object(
      'name', _row.full_name,
      'full_name', _row.full_name,
      'date_of_birth', _row.date_of_birth,
      'dob', _row.date_of_birth,
      'a_number', _row.a_number,
      'alien_number', _row.a_number,
      'place_of_birth', _row.place_of_birth,
      'birth_place', _row.place_of_birth,
      'country_of_origin', _row.country_of_origin,
      'phone', _row.phone_e164,
      'email', _row.email
    ),
    'attorney', CASE
      WHEN _row.attorney_name IS NOT NULL
        OR _row.attorney_phone IS NOT NULL
        OR _row.attorney_email IS NOT NULL
      THEN jsonb_build_object(
        'name', _row.attorney_name,
        'phone', _row.attorney_phone,
        'email', _row.attorney_email
      )
      ELSE NULL
    END,
    'emergency_contacts', _contacts,
    'family_contacts', _contacts,
    'contacts', _contacts,
    'documents', _docs,
    'forms', _docs,
    'legal_forms', _docs,
    'asset_protection', jsonb_build_object(
      'enabled', _row.has_asset_protection,
      'status', CASE WHEN _row.has_asset_protection THEN 'activated' ELSE 'not_activated' END
    ),
    'pet_protection', jsonb_build_object(
      'enabled', _row.has_pet_rescue,
      'status', CASE WHEN _row.has_pet_rescue THEN 'activated' ELSE 'not_activated' END,
      'details', _pet
    ),
    'pet_rescue', COALESCE(_pet, jsonb_build_object('enabled', false)),
    'protections', jsonb_build_object(
      'asset_protection', _row.has_asset_protection,
      'pet_protection', _row.has_pet_rescue
    )
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.get_client_bundle(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_client_bundle(text) TO anon, authenticated, service_role;