DROP FUNCTION IF EXISTS public.redeem_invite_token(text);

CREATE OR REPLACE FUNCTION public.redeem_invite_token(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _norm text := upper(trim(p_token));
  _row record;
BEGIN
  IF _norm !~ '^[A-Z0-9]{8}$' THEN
    RAISE EXCEPTION 'invalid_token_format';
  END IF;

  UPDATE public.app_clients c
     SET activated_at = COALESCE(c.activated_at, now())
   WHERE c.invite_token = _norm
   RETURNING c.id, c.invite_token, c.full_name, c.language
   INTO _row;

  IF _row.id IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  RETURN jsonb_build_object(
    'client_id', _row.id,
    'invite_token', _row.invite_token,
    'full_name', _row.full_name,
    'language', _row.language
  );
END;
$function$;

GRANT EXECUTE ON FUNCTION public.redeem_invite_token(text) TO anon, authenticated, service_role;