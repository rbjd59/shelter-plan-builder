
ALTER TABLE public.app_clients
  ADD COLUMN IF NOT EXISTS hmac_secret text;

-- Backfill any existing rows with a fresh secret so all clients have one.
UPDATE public.app_clients
   SET hmac_secret = encode(extensions.gen_random_bytes(32), 'hex')
 WHERE hmac_secret IS NULL;

-- Update get_client_bundle to lazily generate + return the secret.
CREATE OR REPLACE FUNCTION public.get_client_bundle(_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  _norm TEXT := upper(trim(_token));
  _cid UUID;
  _secret TEXT;
BEGIN
  IF _norm !~ '^[A-Z0-9]{8}$' THEN
    RAISE EXCEPTION 'invalid_token_format';
  END IF;

  SELECT id, hmac_secret INTO _cid, _secret
    FROM public.app_clients WHERE invite_token = _norm;
  IF _cid IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  IF _secret IS NULL OR length(_secret) < 32 THEN
    _secret := encode(extensions.gen_random_bytes(32), 'hex');
    UPDATE public.app_clients SET hmac_secret = _secret WHERE id = _cid;
  END IF;

  RETURN jsonb_build_object(
    'client_id', _cid,
    'hmac_secret', _secret,
    'documents', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', id, 'title', title, 'content', content,
        'document_type', document_type, 'send_on_alert', send_on_alert,
        'loaded_at', loaded_at
      ) ORDER BY loaded_at)
      FROM public.client_documents WHERE client_id = _cid
    ), '[]'::jsonb),
    'contacts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', id, 'name', name, 'phone_e164', phone_e164, 'email', email,
        'relationship', relationship, 'priority', priority,
        'notify_on_sos', notify_on_sos
      ) ORDER BY priority)
      FROM public.client_contacts WHERE client_id = _cid
    ), '[]'::jsonb)
  );
END; $function$;

-- Verifier used by the app-trigger stub. SECURITY DEFINER so the anon
-- publishable role can call it; we compare the provided HMAC to the
-- expected value server-side and return only client_id + ok flag.
CREATE OR REPLACE FUNCTION public.verify_app_trigger_signature(_token text, _body text, _signature text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  _norm text := upper(trim(_token));
  _cid uuid;
  _secret text;
  _expected text;
BEGIN
  IF _norm !~ '^[A-Z0-9]{8}$' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_token_format');
  END IF;

  SELECT id, hmac_secret INTO _cid, _secret
    FROM public.app_clients WHERE invite_token = _norm;
  IF _cid IS NULL OR _secret IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_token');
  END IF;

  _expected := encode(
    extensions.hmac(convert_to(_body, 'UTF8'), convert_to(_secret, 'UTF8'), 'sha256'),
    'hex'
  );

  IF lower(coalesce(_signature,'')) <> _expected THEN
    RETURN jsonb_build_object('ok', false, 'error', 'bad_signature');
  END IF;

  RETURN jsonb_build_object('ok', true, 'client_id', _cid);
END; $function$;
