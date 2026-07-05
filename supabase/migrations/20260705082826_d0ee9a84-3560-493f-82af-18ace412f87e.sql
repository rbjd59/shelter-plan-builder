REVOKE EXECUTE ON FUNCTION public.record_sos_alert(text, double precision, double precision, integer, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_sos_alert(text, double precision, double precision, integer, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.record_sos_alert(text, double precision, double precision, integer, jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.record_sos_alert(text, double precision, double precision, integer, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_sos_alert(text, double precision, double precision, integer, jsonb) TO sandbox_exec;