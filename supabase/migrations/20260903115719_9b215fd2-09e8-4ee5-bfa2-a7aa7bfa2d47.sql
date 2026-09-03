CREATE OR REPLACE FUNCTION public.set_sos_cancel_pin(_client_id uuid, _pin text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
BEGIN
  IF _pin !~ '^[0-9]{4,8}$' THEN
    RAISE EXCEPTION 'pin_must_be_4_to_8_digits';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.app_clients
     WHERE id = _client_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  UPDATE public.app_clients
     SET cancel_pin_hash = encode(extensions.digest(_pin || id::text, 'sha256'), 'hex'),
         cancel_pin_plain = _pin,
         setup_completed_at = COALESCE(setup_completed_at, now())
   WHERE id = _client_id;
END; $$;