-- Guard the DB-level SOS email fan-out for store-reviewer accounts.
-- All SOS email paths (insert trigger, cancel trigger) go through
-- public._enqueue_sos_emails, so renaming the implementation and adding a
-- guarded wrapper silences every path at once for reviewer accounts.

ALTER FUNCTION public._enqueue_sos_emails(uuid, uuid, text, double precision, double precision)
  RENAME TO _enqueue_sos_emails_impl;

CREATE OR REPLACE FUNCTION public._enqueue_sos_emails(_client_id uuid, _alert_id uuid, _kind text, _lat double precision, _lng double precision)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pgmq', 'extensions'
AS $function$
BEGIN
  -- Store reviewers press SOS for real during app review; their events are
  -- recorded on the boards but must never email anyone.
  IF EXISTS (SELECT 1 FROM public.app_clients WHERE id = _client_id AND is_reviewer) THEN
    RETURN;
  END IF;
  PERFORM public._enqueue_sos_emails_impl(_client_id, _alert_id, _kind, _lat, _lng);
END;
$function$;

REVOKE EXECUTE ON FUNCTION public._enqueue_sos_emails(uuid, uuid, text, double precision, double precision) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public._enqueue_sos_emails_impl(uuid, uuid, text, double precision, double precision) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._enqueue_sos_emails(uuid, uuid, text, double precision, double precision) TO service_role;
GRANT EXECUTE ON FUNCTION public._enqueue_sos_emails_impl(uuid, uuid, text, double precision, double precision) TO service_role;