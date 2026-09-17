DROP TRIGGER IF EXISTS trg_sos_alert_insert ON public.client_sos_alerts;
DROP TRIGGER IF EXISTS trg_sos_alert_fanout ON public.client_sos_alerts;
DROP TRIGGER IF EXISTS trg_sos_alert_cancelled ON public.client_sos_alerts;
DROP TRIGGER IF EXISTS trg_sos_cancel_fanout ON public.client_sos_alerts;