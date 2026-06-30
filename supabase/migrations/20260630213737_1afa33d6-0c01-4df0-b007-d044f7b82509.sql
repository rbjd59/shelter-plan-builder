DROP FUNCTION IF EXISTS public.redeem_invite_token(text);

CREATE OR REPLACE FUNCTION public.redeem_invite_token(p_token text)
RETURNS TABLE(client_id uuid, invite_token text, full_name text, language text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _norm TEXT := upper(trim(p_token));
BEGIN
  IF _norm !~ '^[A-Z0-9]{8}$' THEN
    RAISE EXCEPTION 'invalid_token_format';
  END IF;

  RETURN QUERY
  UPDATE public.app_clients c
     SET activated_at = COALESCE(c.activated_at, now())
   WHERE c.invite_token = _norm
   RETURNING c.id, c.invite_token, c.full_name, c.language;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.redeem_invite_token(text) TO anon;
GRANT EXECUTE ON FUNCTION public.redeem_invite_token(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_invite_token(text) TO service_role;