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
  _contacts_html TEXT := '';
  _contacts_text TEXT := '';
  _doc RECORD;
  _c RECORD;
  _doc_count INT := 0;
  _subject TEXT;
  _html TEXT;
  _text TEXT;
  _msg_id TEXT;
  _unsub TEXT;
  _viewer_url TEXT;
  _is_team BOOLEAN;
  _display_name TEXT;
  _team_email TEXT := 'alerts@detenciondefensa.com';
  _no_track TEXT := '<p style="color:#666;font-size:12px;margin:12px 0 0;">This app does not track location. No GPS data is collected, stored, or shared.</p>';
BEGIN
  SELECT full_name, email, phone_e164, language, invite_token, a_number, date_of_birth, place_of_birth, country_of_origin
    INTO _client
    FROM public.app_clients WHERE id = _client_id;

  _viewer_url := 'https://detenciondefensa.com/alerta/' || coalesce(_client.invite_token,'');
  _display_name := coalesce(_client.full_name, 'Your contact');

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

    FOR _c IN
      SELECT name, phone_e164, email, relationship, priority
        FROM public.client_contacts
       WHERE client_id = _client_id
       ORDER BY priority NULLS LAST
    LOOP
      _contacts_html := _contacts_html ||
        '<li style="margin:4px 0;"><strong>' || coalesce(_c.name,'—') || '</strong>' ||
        coalesce(' (' || _c.relationship || ')', '') || ' — ' ||
        coalesce(_c.phone_e164,'no phone') || ' · ' || coalesce(_c.email,'no email') || '</li>';
      _contacts_text := _contacts_text || '- ' || coalesce(_c.name,'—') || ' ' ||
        coalesce(_c.phone_e164,'') || ' ' || coalesce(_c.email,'') || E'\n';
    END LOOP;
    IF _contacts_html <> '' THEN
      _contacts_html := '<p style="margin:16px 0 4px;"><strong>Emergency contacts</strong></p>' ||
        '<ul style="margin:0 0 0 18px;padding:0;color:#333;font-size:14px;">' || _contacts_html || '</ul>';
    END IF;
  END IF;

  FOR _contact IN
    SELECT name, email FROM public.client_contacts
     WHERE client_id = _client_id
       AND notify_on_sos = TRUE
       AND email IS NOT NULL
       AND email <> ''
       AND lower(email) <> _team_email
    UNION ALL
    SELECT 'DetencionDefensa Alerts'::text AS name,
           _team_email::text AS email
  LOOP
    _is_team := lower(_contact.email) = _team_email;

    IF _kind = 'alert' THEN
      IF _is_team THEN
        _subject := 'TRIGGER: ' || coalesce(_client.invite_token,'—') || ' — ' || _display_name || ' fired SOS';
        _html := '<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:16px;">' ||
                 '<h2 style="color:#b91c1c;margin:0 0 16px 0;">App Trigger — locate this person now</h2>' ||
                 '<p><strong>' || _display_name ||
                 '</strong> triggered an SOS from the DetencionDefensa app.</p>' ||
                 '<div style="background:#fef2f2;border-left:4px solid #b91c1c;padding:12px;margin:16px 0;">' ||
                 '<p style="margin:4px 0;"><strong>Activation code:</strong> ' || coalesce(_client.invite_token,'—') || '</p>' ||
                 '<p style="margin:4px 0;"><strong>Name:</strong> ' || _display_name || '</p>' ||
                 coalesce('<p style="margin:4px 0;"><strong>A-number:</strong> ' || _client.a_number || '</p>','') ||
                 coalesce('<p style="margin:4px 0;"><strong>Date of birth:</strong> ' || _client.date_of_birth::text || '</p>','') ||
                 coalesce('<p style="margin:4px 0;"><strong>Place of birth:</strong> ' || _client.place_of_birth || '</p>','') ||
                 coalesce('<p style="margin:4px 0;"><strong>Country of origin:</strong> ' || _client.country_of_origin || '</p>','') ||
                 coalesce('<p style="margin:4px 0;"><strong>Language:</strong> ' || _client.language || '</p>','') ||
                 coalesce('<p style="margin:4px 0;"><strong>Phone:</strong> ' || _client.phone_e164 || '</p>','') ||
                 coalesce('<p style="margin:4px 0;"><strong>Email:</strong> ' || _client.email || '</p>','') ||
                 '<p style="margin:4px 0;"><strong>Triggered (UTC):</strong> ' || to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') || '</p>' ||
                 '</div>' ||
                 _contacts_html ||
                 '<p style="margin:16px 0;"><a href="' || _viewer_url || '" style="display:inline-block;background:#b91c1c;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Open case viewer</a></p>' ||
                 '<p style="margin:8px 0;font-size:13px;">Record the facility / location on the company board at https://detenciondefensa.com/company-board and send it to the attorney board.</p>' ||
                 CASE WHEN _doc_count > 0 THEN
                   '<p style="color:#666;font-size:13px;margin-bottom:0;">' || _doc_count || ' legal document(s) on file — open the case viewer to read or download:</p>' || _docs_html
                 ELSE '' END ||
                 _no_track ||
                 '</div>';
        _text := 'TRIGGER: ' || coalesce(_client.invite_token,'—') || ' — ' || _display_name ||
                 ' fired an SOS at ' || to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') || ' UTC.' || E'\n' ||
                 coalesce('A-number: ' || _client.a_number || E'\n','') ||
                 coalesce('DOB: ' || _client.date_of_birth::text || E'\n','') ||
                 coalesce('Place of birth: ' || _client.place_of_birth || E'\n','') ||
                 coalesce('Country of origin: ' || _client.country_of_origin || E'\n','') ||
                 coalesce('Phone: ' || _client.phone_e164 || E'\n','') ||
                 CASE WHEN _contacts_text <> '' THEN E'Contacts:\n' || _contacts_text ELSE '' END ||
                 'Case viewer: ' || _viewer_url || E'\nNo location data is collected by this app.';
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
                 _no_track ||
                 '</div>';
        _text := 'Hello ' || coalesce(_contact.name,'') || E',\n\n' ||
                 _display_name || ' has triggered an alert that he/she has been detained or arrested by ICE or police.' || E'\n\n' ||
                 'Immediately notify info@detenciondefensa.com if you hear from him/her, or if you locate him/her.' || E'\n\n' ||
                 'This app does not track location.' || E'\n\n' ||
                 '— DetencionDefensa';
      END IF;
    ELSE
      IF _is_team THEN
        _subject := 'CANCELLED: ' || coalesce(_client.invite_token,'—') || ' — ' || _display_name || ' cancelled the trigger';
        _html := '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;line-height:1.6;">' ||
                 '<p><strong>' || _display_name || '</strong> (activation code ' ||
                 coalesce(_client.invite_token,'—') || ') cancelled the emergency trigger at ' ||
                 to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') || ' UTC.</p>' ||
                 '<p style="color:#666;font-size:12px;">— DetencionDefensa</p></div>';
        _text := 'CANCELLED: ' || coalesce(_client.invite_token,'—') || ' — ' || _display_name || ' cancelled the trigger.';
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