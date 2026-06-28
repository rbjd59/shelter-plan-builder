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
         setup_completed_at = COALESCE(setup_completed_at, now())
   WHERE id = _client_id;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.set_sos_cancel_pin_admin(uuid, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_sos_cancel_pin_admin(uuid, text) TO service_role;