DO $do$
DECLARE
  _def text;
BEGIN
  -- Correct the SOS email function.
  SELECT pg_get_functiondef(p.oid) INTO _def
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = '_enqueue_sos_emails'
   LIMIT 1;

  IF _def IS NOT NULL THEN
    _def := replace(_def, 'legal@theconsumerdefender.com', 'legal@detenciondefensa.com');
    EXECUTE _def;
  END IF;

  -- Correct the signup notification function.
  SELECT pg_get_functiondef(p.oid) INTO _def
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'redeem_invite_token'
   LIMIT 1;

  IF _def IS NOT NULL THEN
    _def := replace(_def, 'info@theconsumerdefender.com', 'info@detenciondefensa.com');
    EXECUTE _def;
  END IF;
END
$do$;