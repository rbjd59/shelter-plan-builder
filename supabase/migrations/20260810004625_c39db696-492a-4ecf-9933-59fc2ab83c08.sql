CREATE OR REPLACE FUNCTION public.sync_client_contacts(_token text, _contacts jsonb)
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
  _role text;
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

  DELETE FROM public.client_contacts
  WHERE client_id = _cid;

  FOR _item IN SELECT value FROM jsonb_array_elements(_contacts) LOOP
    _name := nullif(trim(coalesce(_item->>'name', '')), '');
    _email := nullif(lower(trim(coalesce(_item->>'email', ''))), '');
    _phone := nullif(trim(coalesce(_item->>'phone_e164', _item->>'phone', '')), '');
    _relationship := nullif(trim(coalesce(_item->>'relationship', _item->>'relation', 'emergency')), '');
    _role := lower(trim(coalesce(_item->>'role', 'family')));
    IF _role NOT IN ('family', 'lawyer', 'company') THEN
      _role := 'family';
    END IF;

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
      client_id, name, email, phone_e164, relationship, role, priority, notify_on_sos, updated_at
    )
    VALUES (
      _cid,
      left(_name, 160),
      left(_email, 200),
      left(_phone, 32),
      left(coalesce(_relationship, 'emergency'), 80),
      _role,
      _priority,
      true,
      now()
    );

    _priority := _priority + 1;
    _inserted := _inserted + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'ok', true,
    'client_id', _cid,
    'case_id', _norm,
    'contacts_saved', _inserted,
    'contacts_updated_at', now()
  );
END;
$function$;