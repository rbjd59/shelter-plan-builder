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
  _doc_count INT := 0;
  _subject TEXT;
  _html TEXT;
  _text TEXT;
  _loc_line TEXT := '';
  _msg_id TEXT;
  _unsub TEXT;
  _viewer_url TEXT;
  _is_team BOOLEAN;
  _display_name TEXT;
BEGIN
  SELECT full_name, email, phone_e164, language, invite_token
    INTO _client
    FROM public.app_clients WHERE id = _client_id;

  _viewer_url := 'https://detenciondefensa.com/alerta/' || coalesce(_client.invite_token,'');
  _display_name := coalesce(_client.full_name, 'Your contact');

  IF _lat IS NOT NULL AND _lng IS NOT NULL THEN
    _loc_line := '<p style="margin:8px 0;"><strong>Location:</strong> ' ||
                 '<a href="https://maps.google.com/?q=' || _lat || ',' || _lng ||
                 '" style="color:#b91c1c;">' || _lat || ', ' || _lng || '</a></p>';
  END IF;

  IF _kind = 'alert' THEN
    FOR _doc IN
      SELECT title FROM public.client_documents
       WHERE client_id = _client_id AND send_on_alert = TRUE
       ORDER BY loaded_at
    LOOP
      _doc_count := _doc_count + 1;
      _docs_html := _docs_html ||
        '<li style="margin:4px 0;">' ||
        replace(replace(replace(coalesce(_doc.title,'Document'), '&', '&amp;'), '<', '&lt;'), '>', '&gt;') ||
        '</li>';
    END LOOP;
    IF _doc_count > 0 THEN
      _docs_html := '<ul style="margin:12px 0 0 18px;padding:0;color:#333;font-size:14px;">' || _docs_html || '</ul>';
    END IF;
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
    _is_team := lower(_contact.email) = 'alerts@detenciondefensa.com';

    IF _kind = 'alert' THEN
      IF _is_team THEN
        _subject := 'EMERGENCY: ' || _display_name || ' triggered SOS';
        _html := '<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:16px;">' ||
                 '<h2 style="color:#b91c1c;margin:0 0 16px 0;">Emergency Alert</h2>' ||
                 '<p><strong>' || _display_name ||
                 '</strong> triggered an SOS from the DetencionDefensa app.</p>' ||
                 '<div style="background:#fef2f2;border-left:4px solid #b91c1c;padding:12px;margin:16px 0;">' ||
                 '<p style="margin:4px 0;"><strong>Activation token:</strong> ' || coalesce(_client.invite_token,'—') || '</p>' ||
                 '<p style="margin:4px 0;"><strong>Time (UTC):</strong> ' || to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') || '</p>' ||
                 _loc_line ||
                 CASE WHEN _client.phone_e164 IS NOT NULL
                      THEN '<p style="margin:4px 0;"><strong>Phone:</strong> ' || _client.phone_e164 || '</p>'
                      ELSE '' END ||
                 '</div>' ||
                 '<p style="margin:16px 0;"><a href="' || _viewer_url || '" style="display:inline-block;background:#b91c1c;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Open case viewer</a></p>' ||
                 CASE WHEN _doc_count > 0 THEN
                   '<p style="color:#666;font-size:13px;margin-bottom:0;">' || _doc_count || ' legal document(s) on file — open the case viewer to read or download:</p>' || _docs_html
                 ELSE '' END ||
                 '</div>';
        _text := 'EMERGENCY: ' || _display_name ||
                 ' triggered an SOS. Case viewer: ' || _viewer_url;
      ELSE
        _subject := 'Alert: ' || _display_name || ' may have been detained';
        _html := '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;line-height:1.6;">' ||
                 '<p>Hello ' || coalesce(_contact.name,'') || ',</p>' ||
                 '<p><strong>' || _display_name ||
                 '</strong> has triggered an alert that he/she has been detained or arrested by ICE or police.</p>' ||
                 '<p>Immediately notify <a href="mailto:info@detenciondefensa.com">info@detenciondefensa.com</a> if you hear from him/her, or if you locate him/her.</p>' ||
                 '<p>We are in the process of locating him/her, and we will notify you once we do.</p>' ||
                 '<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>' ||
                 '<p style="color:#666;font-size:12px;">Sent by DetencionDefensa on behalf of ' ||
                 _display_name || '. Questions: info@detenciondefensa.com.</p>' ||
                 '</div>';
        _text := 'Hello ' || coalesce(_contact.name,'') || E',\n\n' ||
                 _display_name || ' has triggered an alert that he/she has been detained or arrested by ICE or police.' || E'\n\n' ||
                 'Immediately notify info@detenciondefensa.com if you hear from him/her, or if you locate him/her.' || E'\n\n' ||
                 'We are in the process of locating him/her, and we will notify you once we do.' || E'\n\n' ||
                 '— DetencionDefensa';
      END IF;
    ELSE
      _subject := 'False alarm: ' || _display_name || ' is OK';
      _html := '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;line-height:1.6;">' ||
               '<p>Hello ' || coalesce(_contact.name,'') || ',</p>' ||
               '<p><strong>' || _display_name ||
               '</strong> has cancelled the previous emergency alert. No action is needed.</p>' ||
               '<p style="color:#666;font-size:12px;margin-top:24px;">— DetencionDefensa</p>' ||
               '</div>';
      _text := _display_name || ' cancelled the alert. No action needed.';
    END IF;

    _msg_id := 'sos_' || _kind || '_' || _alert_id::text || '_' || md5(_contact.email);

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