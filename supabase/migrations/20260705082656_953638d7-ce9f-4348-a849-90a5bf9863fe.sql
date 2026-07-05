GRANT EXECUTE ON FUNCTION public.get_client_bundle(text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.record_sos_alert(text, double precision, double precision, integer, jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_app_trigger_signature(text, text, text) TO service_role;

DROP TRIGGER IF EXISTS trg_sos_alert_insert ON public.client_sos_alerts;
CREATE TRIGGER trg_sos_alert_insert
  AFTER INSERT ON public.client_sos_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public._trg_sos_alert_insert();

DROP TRIGGER IF EXISTS trg_sos_alert_cancelled ON public.client_sos_alerts;
CREATE TRIGGER trg_sos_alert_cancelled
  AFTER UPDATE OF cancelled_at ON public.client_sos_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public._trg_sos_alert_cancelled();