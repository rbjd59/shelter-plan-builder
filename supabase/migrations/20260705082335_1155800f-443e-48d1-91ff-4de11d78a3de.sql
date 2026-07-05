CREATE TABLE IF NOT EXISTS public.client_update_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.app_clients(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'app',
  status text NOT NULL DEFAULT 'pending',
  request_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT client_update_requests_status_check CHECK (status IN ('pending','reviewed','applied','rejected'))
);

GRANT SELECT, UPDATE ON public.client_update_requests TO authenticated;
GRANT ALL ON public.client_update_requests TO service_role;

ALTER TABLE public.client_update_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view client update requests" ON public.client_update_requests;
CREATE POLICY "Admins can view client update requests"
  ON public.client_update_requests
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update client update requests" ON public.client_update_requests;
CREATE POLICY "Admins can update client update requests"
  ON public.client_update_requests
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS touch_client_update_requests_updated_at ON public.client_update_requests;
CREATE TRIGGER touch_client_update_requests_updated_at
  BEFORE UPDATE ON public.client_update_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.record_sos_alert(
  _token text,
  _lat double precision DEFAULT NULL::double precision,
  _lng double precision DEFAULT NULL::double precision,
  _battery_pct integer DEFAULT NULL::integer,
  _payload jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _norm TEXT := upper(trim(_token));
  _client public.app_clients%ROWTYPE;
  _alert_id UUID;
  _dob DATE;
BEGIN
  IF _norm !~ '^[A-Z0-9]{8}$' THEN
    RAISE EXCEPTION 'invalid_token_format';
  END IF;

  SELECT * INTO _client FROM public.app_clients WHERE invite_token = _norm;
  IF _client.id IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  BEGIN
    _dob := COALESCE(
      NULLIF(_payload->>'date_of_birth','')::date,
      NULLIF(_payload->>'dob','')::date,
      NULLIF(_payload->>'birth_date','')::date,
      _client.date_of_birth
    );
  EXCEPTION WHEN OTHERS THEN
    _dob := _client.date_of_birth;
  END;

  INSERT INTO public.client_sos_alerts(
    client_id, lat, lng, battery_pct, payload,
    app_reported_name, app_reported_a_number,
    app_reported_place_of_birth, app_reported_date_of_birth
  )
  VALUES (
    _client.id, _lat, _lng, _battery_pct, COALESCE(_payload, '{}'::jsonb),
    COALESCE(NULLIF(_payload->>'name',''), NULLIF(_payload->>'full_name',''), _client.full_name),
    COALESCE(NULLIF(_payload->>'a_number',''), NULLIF(_payload->>'alien_number',''), _client.a_number),
    COALESCE(NULLIF(_payload->>'place_of_birth',''), NULLIF(_payload->>'birth_place',''), _client.place_of_birth),
    _dob
  )
  RETURNING id INTO _alert_id;

  RETURN _alert_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_client_bundle(_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  _norm TEXT := upper(trim(_token));
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
    'case_id', _row.invite_token,
    'activation_code', _row.invite_token,
    'activated_at', _row.activated_at,
    'hmac_secret', _secret,
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