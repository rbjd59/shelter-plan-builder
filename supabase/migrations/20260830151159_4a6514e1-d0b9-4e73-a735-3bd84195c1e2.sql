
ALTER TABLE public.app_clients
  ADD COLUMN IF NOT EXISTS cancel_pin_plain text,
  ADD COLUMN IF NOT EXISTS has_trust_program boolean NOT NULL DEFAULT false;

-- PIN is created on the website; the app READS it from the bundle.
CREATE OR REPLACE FUNCTION public.set_sos_cancel_pin_admin(_client_id uuid, _pin text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  IF _pin !~ '^[0-9]{4,8}$' THEN
    RAISE EXCEPTION 'pin_must_be_4_to_8_digits';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.app_clients WHERE id = _client_id) THEN
    RAISE EXCEPTION 'client_not_found';
  END IF;

  UPDATE public.app_clients
     SET cancel_pin_hash = encode(extensions.digest(_pin || id::text, 'sha256'), 'hex'),
         cancel_pin_plain = _pin,
         setup_completed_at = COALESCE(setup_completed_at, now())
   WHERE id = _client_id;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.set_sos_cancel_pin_admin(uuid, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_sos_cancel_pin_admin(uuid, text) TO service_role;

-- Bundle: accept 5-8 char codes, expose cancellation_pin + add-ons.
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
  _contacts_updated timestamptz;
  _docs jsonb;
BEGIN
  IF _norm !~ '^[A-Z0-9]{5,8}$' THEN
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
    'role', COALESCE(role, 'family'),
    'priority', priority,
    'notify_on_sos', notify_on_sos
  ) ORDER BY priority), '[]'::jsonb),
  MAX(GREATEST(created_at, COALESCE(updated_at, created_at)))
  INTO _contacts, _contacts_updated
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

  RETURN jsonb_build_object(
    'client_id', _row.id,
    'client_name', _row.full_name,
    'case_id', _row.invite_token,
    'activation_code', _row.invite_token,
    'activated_at', _row.activated_at,
    'language', _row.language,
    'hmac_secret', _secret,
    'cancellation_pin', _row.cancel_pin_plain,
    'cancel_pin', _row.cancel_pin_plain,
    'has_asset_protection', COALESCE(_row.has_asset_protection, false),
    'has_pet_rescue', COALESCE(_row.has_pet_rescue, false),
    'has_trust_program', COALESCE(_row.has_trust_program, false),
    'trigger_endpoint', 'https://detenciondefensa.com/api/public/app-trigger',
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
    'contacts_updated_at', _contacts_updated,
    'contacts_editable_in_app', false,
    'documents', _docs,
    'forms', _docs,
    'legal_forms', _docs,
    'family_docs', _docs
  );
END;
$function$;

-- Activation notices are now sent by the app-trigger fan-out (one copy each).
-- This function must no longer enqueue its own email.
CREATE OR REPLACE FUNCTION public.redeem_invite_token(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _norm text := upper(trim(p_token));
  _row record;
BEGIN
  IF _norm !~ '^[A-Z0-9]{5,8}$' THEN
    RAISE EXCEPTION 'invalid_token_format';
  END IF;

  UPDATE public.app_clients c
     SET activated_at = COALESCE(c.activated_at, now())
   WHERE c.invite_token = _norm
   RETURNING c.id, c.invite_token, c.full_name, c.language
   INTO _row;

  IF _row.id IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  RETURN jsonb_build_object(
    'client_id', _row.id,
    'invite_token', _row.invite_token,
    'full_name', _row.full_name,
    'language', _row.language
  );
END;
$function$;
