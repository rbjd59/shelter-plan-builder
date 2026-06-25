-- Restore explicit API execute privileges after CREATE OR REPLACE reset function grants.
GRANT EXECUTE ON FUNCTION public.record_sos_alert(text, double precision, double precision, integer, jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_client_bundle(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.attach_alert_document(text, text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.cancel_sos_alert(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.redeem_invite_token(text) TO anon, authenticated, service_role;

-- Phone-app safe contact sync: app proves possession of the 8-character activation code.
CREATE OR REPLACE FUNCTION public.sync_client_contacts(
  _token text,
  _contacts jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _norm text := upper(trim(_token));
  _cid uuid;
  _item jsonb;
  _name text;
  _email text;
  _phone text;
  _relationship text;
  _priority integer := 1;
  _inserted integer := 0;
BEGIN
  IF _norm !~ '^[A-Z0-9]{8}$' THEN
    RAISE EXCEPTION 'invalid_token_format';
  END IF;

  SELECT id INTO _cid
  FROM public.app_clients
  WHERE invite_token = _norm;

  IF _cid IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  IF jsonb_typeof(_contacts) <> 'array' THEN
    RAISE EXCEPTION 'contacts_must_be_array';
  END IF;

  -- Replace this phone-entered contact set for the client.
  DELETE FROM public.client_contacts
  WHERE client_id = _cid;

  FOR _item IN SELECT value FROM jsonb_array_elements(_contacts) LOOP
    _name := nullif(trim(coalesce(_item->>'name', '')), '');
    _email := nullif(lower(trim(coalesce(_item->>'email', ''))), '');
    _phone := nullif(trim(coalesce(_item->>'phone_e164', _item->>'phone', '')), '');
    _relationship := nullif(trim(coalesce(_item->>'relationship', 'emergency')), '');

    IF _name IS NULL AND _email IS NULL AND _phone IS NULL THEN
      CONTINUE;
    END IF;

    IF _name IS NULL THEN
      _name := coalesce(_email, _phone, 'Emergency contact');
    END IF;

    IF _email IS NOT NULL AND _email !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$' THEN
      _email := NULL;
    END IF;

    INSERT INTO public.client_contacts(
      client_id, name, email, phone_e164, relationship, priority, notify_on_sos
    )
    VALUES (
      _cid,
      left(_name, 160),
      left(_email, 200),
      left(_phone, 32),
      left(coalesce(_relationship, 'emergency'), 80),
      _priority,
      true
    );

    _priority := _priority + 1;
    _inserted := _inserted + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true,
    'client_id', _cid,
    'contacts_saved', _inserted
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.sync_client_contacts(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_client_contacts(text, jsonb) TO anon, authenticated, service_role;