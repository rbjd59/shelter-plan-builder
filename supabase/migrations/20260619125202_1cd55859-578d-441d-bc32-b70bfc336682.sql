CREATE OR REPLACE FUNCTION public._enqueue_sos_emails(_client_id uuid, _alert_id uuid, _kind text, _lat double precision, _lng double precision)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pgmq', 'extensions'
AS $function$
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
  _unsub TEXT;
BEGIN
  SELECT full_name, email, phone_e164, language, invite_token
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
    UNION ALL
    SELECT 'DetencionDefensa Team'::text AS name,
           'alerts@detenciondefensa.com'::text AS email
  LOOP
    IF _kind = 'alert' THEN
      _subject := 'EMERGENCY: ' || coalesce(_client.full_name,'A loved one') || ' needs help';
      _html := '<h2 style="color:#b91c1c;">Emergency alert</h2>' ||
               '<p>' || coalesce(_contact.name,'Friend') || ',</p>' ||
               '<p><strong>' || coalesce(_client.full_name,'Your contact') ||
               '</strong> has triggered an emergency alert from the DetencionDefensa app.</p>' ||
               '<p><strong>Activation code:</strong> ' || coalesce(_client.invite_token,'—') || '</p>' ||
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
               '<p><strong>Activation code:</strong> ' || coalesce(_client.invite_token,'—') || '</p>' ||
               '<hr/><p style="color:#666;font-size:12px;">Sent by DetencionDefensa.</p>';
      _text := coalesce(_client.full_name,'Your contact') ||
               ' cancelled the earlier emergency alert. No action needed.';
    END IF;

    _msg_id := 'sos_' || _kind || '_' || _alert_id::text || '_' || md5(_contact.email);

    -- Ensure an unsubscribe token exists for this recipient (queue worker requires one)
    SELECT token INTO _unsub
      FROM public.email_unsubscribe_tokens
     WHERE email = _contact.email;
    IF _unsub IS NULL THEN
      _unsub := gen_random_uuid()::text;
      INSERT INTO public.email_unsubscribe_tokens(email, token)
      VALUES (_contact.email, _unsub)
      ON CONFLICT (email) DO UPDATE SET token = EXCLUDED.token
      RETURNING token INTO _unsub;
    END IF;

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
      'unsubscribe_token', _unsub,
      'queued_at', now()
    ));
  END LOOP;
END;
$function$;