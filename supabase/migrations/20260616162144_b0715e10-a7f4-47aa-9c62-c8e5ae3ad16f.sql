
-- 1. Add cancellation tracking
ALTER TABLE public.client_sos_alerts
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- 2. cancel_sos_alert RPC (called by Flutter via anon key)
CREATE OR REPLACE FUNCTION public.cancel_sos_alert(_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _norm TEXT := upper(trim(_token));
  _cid UUID;
  _alert_id UUID;
BEGIN
  IF _norm !~ '^[A-Z0-9]{8}$' THEN
    RAISE EXCEPTION 'invalid_token_format';
  END IF;

  SELECT id INTO _cid FROM public.app_clients WHERE invite_token = _norm;
  IF _cid IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  UPDATE public.client_sos_alerts
     SET cancelled_at = now()
   WHERE id = (
     SELECT id FROM public.client_sos_alerts
      WHERE client_id = _cid AND cancelled_at IS NULL
      ORDER BY triggered_at DESC LIMIT 1
   )
   RETURNING id INTO _alert_id;

  RETURN _alert_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cancel_sos_alert(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cancel_sos_alert(TEXT) TO anon, authenticated, service_role;

-- 3. Email fan-out helper (shared by both triggers)
CREATE OR REPLACE FUNCTION public._enqueue_sos_emails(
  _client_id UUID,
  _alert_id UUID,
  _kind TEXT,           -- 'alert' or 'cancellation'
  _lat DOUBLE PRECISION,
  _lng DOUBLE PRECISION
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pgmq, extensions
AS $$
DECLARE
  _client RECORD;
  _contact RECORD;
  _docs_html TEXT := '';
  _doc RECORD;
  _subject TEXT;
  _html TEXT;
  _text TEXT;
  _loc_line TEXT := '';
  _msg_id TEXT;
BEGIN
  SELECT full_name, email, phone_e164, language
    INTO _client
    FROM public.app_clients WHERE id = _client_id;

  IF _lat IS NOT NULL AND _lng IS NOT NULL THEN
    _loc_line := '<p><strong>Location:</strong> <a href="https://maps.google.com/?q=' ||
                 _lat || ',' || _lng || '">' || _lat || ', ' || _lng || '</a></p>';
  END IF;

  IF _kind = 'alert' THEN
    FOR _doc IN
      SELECT title, content FROM public.client_documents
       WHERE client_id = _client_id AND send_on_alert = TRUE
       ORDER BY loaded_at
    LOOP
      _docs_html := _docs_html ||
        '<hr/><h3>' || coalesce(_doc.title,'Document') || '</h3>' ||
        '<pre style="white-space:pre-wrap;font-family:inherit;">' ||
        coalesce(_doc.content,'') || '</pre>';
    END LOOP;
  END IF;

  FOR _contact IN
    SELECT name, email FROM public.client_contacts
     WHERE client_id = _client_id
       AND notify_on_sos = TRUE
       AND email IS NOT NULL
       AND email <> ''
  LOOP
    IF _kind = 'alert' THEN
      _subject := 'EMERGENCY: ' || coalesce(_client.full_name,'A loved one') || ' needs help';
      _html := '<h2 style="color:#b91c1c;">Emergency alert</h2>' ||
               '<p>' || coalesce(_contact.name,'Friend') || ',</p>' ||
               '<p><strong>' || coalesce(_client.full_name,'Your contact') ||
               '</strong> has triggered an emergency alert from the DetencionDefensa app.</p>' ||
               '<p><strong>Time:</strong> ' || to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI UTC') || '</p>' ||
               _loc_line ||
               CASE WHEN _client.phone_e164 IS NOT NULL
                    THEN '<p><strong>Phone:</strong> ' || _client.phone_e164 || '</p>'
                    ELSE '' END ||
               '<p>Attached below are the legal documents they asked you to share if this happened.</p>' ||
               _docs_html ||
               '<hr/><p style="color:#666;font-size:12px;">Sent by DetencionDefensa on behalf of ' ||
               coalesce(_client.full_name,'your contact') || '.</p>';
      _text := 'EMERGENCY: ' || coalesce(_client.full_name,'A loved one') ||
               ' has triggered an emergency alert. See email for full details.';
    ELSE
      _subject := 'False alarm: ' || coalesce(_client.full_name,'your contact') || ' is OK';
      _html := '<h2>False alarm</h2>' ||
               '<p>' || coalesce(_contact.name,'Friend') || ',</p>' ||
               '<p><strong>' || coalesce(_client.full_name,'Your contact') ||
               '</strong> has cancelled the earlier emergency alert. No action is needed.</p>' ||
               '<hr/><p style="color:#666;font-size:12px;">Sent by DetencionDefensa.</p>';
      _text := coalesce(_client.full_name,'Your contact') ||
               ' cancelled the earlier emergency alert. No action needed.';
    END IF;

    _msg_id := 'sos_' || _kind || '_' || _alert_id::text || '_' || md5(_contact.email);

    PERFORM public.enqueue_email('transactional_emails', jsonb_build_object(
      'to', _contact.email,
      'from', 'alerts@notify.gohomesooner.com',
      'sender_domain', 'notify.gohomesooner.com',
      'subject', _subject,
      'html', _html,
      'text', _text,
      'purpose', 'transactional',
      'label', 'sos_' || _kind,
      'idempotency_key', _msg_id,
      'message_id', _msg_id,
      'queued_at', now()
    ));
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION public._enqueue_sos_emails(UUID, UUID, TEXT, DOUBLE PRECISION, DOUBLE PRECISION) FROM PUBLIC, anon, authenticated;

-- 4. Trigger on insert: fan out emergency emails
CREATE OR REPLACE FUNCTION public._trg_sos_alert_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public._enqueue_sos_emails(NEW.client_id, NEW.id, 'alert', NEW.lat, NEW.lng);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sos_alert_fanout ON public.client_sos_alerts;
CREATE TRIGGER trg_sos_alert_fanout
  AFTER INSERT ON public.client_sos_alerts
  FOR EACH ROW EXECUTE FUNCTION public._trg_sos_alert_insert();

-- 5. Trigger on cancellation: fan out cancellation emails
CREATE OR REPLACE FUNCTION public._trg_sos_alert_cancelled()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.cancelled_at IS NULL AND NEW.cancelled_at IS NOT NULL THEN
    PERFORM public._enqueue_sos_emails(NEW.client_id, NEW.id, 'cancellation', NULL, NULL);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sos_cancel_fanout ON public.client_sos_alerts;
CREATE TRIGGER trg_sos_cancel_fanout
  AFTER UPDATE OF cancelled_at ON public.client_sos_alerts
  FOR EACH ROW EXECUTE FUNCTION public._trg_sos_alert_cancelled();
