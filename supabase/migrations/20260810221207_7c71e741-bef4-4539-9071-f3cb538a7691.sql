CREATE OR REPLACE FUNCTION public.redeem_invite_token(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _norm text := upper(trim(p_token));
  _was_activated timestamptz;
  _row record;
  _subject text;
  _html text;
  _msg_id text;
BEGIN
  IF _norm !~ '^[A-Z0-9]{8}$' THEN
    RAISE EXCEPTION 'invalid_token_format';
  END IF;

  SELECT activated_at INTO _was_activated
    FROM public.app_clients WHERE invite_token = _norm;

  UPDATE public.app_clients c
     SET activated_at = COALESCE(c.activated_at, now())
   WHERE c.invite_token = _norm
   RETURNING c.id, c.invite_token, c.full_name, c.language, c.email, c.phone_e164
   INTO _row;

  IF _row.id IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  IF _was_activated IS NULL THEN
    _subject := 'CLIENT SIGN-UP: ' || _row.invite_token;
    _html := '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;line-height:1.6;">'
          || '<h2 style="margin:0 0 12px;">New client sign-up</h2>'
          || '<p style="margin:4px 0;"><strong>Activation code:</strong> ' || _row.invite_token || '</p>'
          || coalesce('<p style="margin:4px 0;"><strong>Name:</strong> ' || _row.full_name || '</p>','')
          || '<p style="margin:4px 0;"><strong>Signed up (UTC):</strong> ' || to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI') || '</p>'
          || '<p style="color:#666;font-size:12px;">This is a sign-up notice only. No emergency has been triggered and no case action is required.</p></div>';
    _msg_id := 'signup_' || _row.id::text;

    BEGIN
      PERFORM public.enqueue_email('transactional_emails', jsonb_build_object(
        'to', 'info@theconsumerdefender.com',
        'from', 'info@notify.gohomesooner.com',
        'sender_domain', 'notify.gohomesooner.com',
        'subject', _subject,
        'html', _html,
        'text', 'New client sign-up — activation code ' || _row.invite_token || ' (' || coalesce(_row.full_name,'name unknown') || '). Sign-up only, no emergency triggered.',
        'purpose', 'transactional',
        'label', 'client_signup_notice',
        'idempotency_key', _msg_id,
        'message_id', _msg_id,
        'queued_at', now()
      ));
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'signup notice enqueue failed: %', SQLERRM;
    END;
  END IF;

  RETURN jsonb_build_object(
    'client_id', _row.id,
    'invite_token', _row.invite_token,
    'full_name', _row.full_name,
    'language', _row.language
  );
END;
$function$;