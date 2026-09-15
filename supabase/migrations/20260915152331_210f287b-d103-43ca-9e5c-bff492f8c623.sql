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
  IF _norm !~ '^[A-Z0-9]{5,8}$' THEN
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
END;
$function$;

REVOKE ALL ON FUNCTION public.verify_app_trigger_signature(text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_app_trigger_signature(text, text, text) TO service_role;