
REVOKE EXECUTE ON FUNCTION public.get_client_bundle(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_client_bundle(text) TO service_role;

REVOKE EXECUTE ON FUNCTION public.redeem_invite_token(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_invite_token(text) TO service_role;
