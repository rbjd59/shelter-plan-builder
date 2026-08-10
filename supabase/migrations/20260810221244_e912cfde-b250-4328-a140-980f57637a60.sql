DO $do$
DECLARE
  _def text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO _def
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = '_enqueue_sos_emails'
   LIMIT 1;

  IF _def IS NULL THEN
    RAISE EXCEPTION '_enqueue_sos_emails not found';
  END IF;

  _def := replace(_def, 'legal@detenciondefensa.com', 'legal@theconsumerdefender.com');
  EXECUTE _def;
END
$do$;