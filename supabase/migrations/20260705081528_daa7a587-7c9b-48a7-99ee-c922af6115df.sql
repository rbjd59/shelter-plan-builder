
ALTER TABLE public.app_clients
  ADD COLUMN IF NOT EXISTS a_number text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS attorney_name text,
  ADD COLUMN IF NOT EXISTS attorney_phone text,
  ADD COLUMN IF NOT EXISTS attorney_email text;

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

  RETURN jsonb_build_object(
    'client_id', _row.id,
    'case_id', _row.invite_token,
    'activated_at', _row.activated_at,
    'hmac_secret', _secret,
    'client', jsonb_build_object(
      'full_name', _row.full_name,
      'first_name', split_part(coalesce(_row.full_name,''), ' ', 1),
      'last_name', NULLIF(substr(coalesce(_row.full_name,''), length(split_part(coalesce(_row.full_name,''), ' ', 1))+2), ''),
      'date_of_birth', _row.date_of_birth,
      'a_number', _row.a_number,
      'place_of_birth', _row.place_of_birth,
      'country_of_origin', _row.country_of_origin,
      'language', _row.language,
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
    'emergency_contacts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', id,
        'name', name,
        'phone', phone_e164,
        'phone_e164', phone_e164,
        'email', email,
        'relation', relationship,
        'relationship', relationship,
        'priority', priority,
        'notify_on_sos', notify_on_sos
      ) ORDER BY priority)
      FROM public.client_contacts WHERE client_id = _row.id
    ), '[]'::jsonb),
    -- Legacy key kept for backward compatibility with earlier app builds.
    'contacts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', id, 'name', name, 'phone_e164', phone_e164, 'email', email,
        'relationship', relationship, 'priority', priority,
        'notify_on_sos', notify_on_sos
      ) ORDER BY priority)
      FROM public.client_contacts WHERE client_id = _row.id
    ), '[]'::jsonb),
    'documents', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', id, 'title', title, 'content', content,
        'document_type', document_type, 'send_on_alert', send_on_alert,
        'loaded_at', loaded_at
      ) ORDER BY loaded_at)
      FROM public.client_documents WHERE client_id = _row.id
    ), '[]'::jsonb)
  );
END; $function$;
