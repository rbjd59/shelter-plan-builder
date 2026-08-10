ALTER TABLE public.client_contacts
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'family',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  ALTER TABLE public.client_contacts
    ADD CONSTRAINT client_contacts_role_check CHECK (role IN ('family','lawyer','company'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DROP TRIGGER IF EXISTS trg_client_contacts_touch ON public.client_contacts;
CREATE TRIGGER trg_client_contacts_touch BEFORE UPDATE ON public.client_contacts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.get_client_bundle(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  _norm TEXT := upper(trim(p_token));
  _row public.app_clients%ROWTYPE;
  _secret TEXT;
  _contacts jsonb;
  _contacts_updated timestamptz;
  _docs jsonb;
BEGIN
  IF _norm !~ '^[A-Z0-9]{8}$' THEN
    RAISE EXCEPTION 'invalid_token_format';
  END IF;

  SELECT * INTO _row FROM public.app_clients WHERE invite_token = _norm;
  IF _row.id IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  _secret := _row.hmac_secret;
  IF _secret IS NULL OR length(_secret) < 32 THEN
    _secret := encode(extensions.gen_random_bytes(32), 'hex');
    UPDATE public.app_clients SET hmac_secret = _secret WHERE id = _row.id;
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id,
    'name', name,
    'phone', phone_e164,
    'phone_e164', phone_e164,
    'email', email,
    'relation', relationship,
    'relationship', relationship,
    'role', COALESCE(role, 'family'),
    'priority', priority,
    'notify_on_sos', notify_on_sos
  ) ORDER BY priority), '[]'::jsonb),
  MAX(GREATEST(created_at, COALESCE(updated_at, created_at)))
  INTO _contacts, _contacts_updated
  FROM public.client_contacts
  WHERE client_id = _row.id;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id,
    'title', title,
    'name', title,
    'content', content,
    'document_type', document_type,
    'type', document_type,
    'send_on_alert', send_on_alert,
    'from_app', from_app,
    'loaded_at', loaded_at
  ) ORDER BY loaded_at), '[]'::jsonb)
  INTO _docs
  FROM public.client_documents
  WHERE client_id = _row.id;

  RETURN jsonb_build_object(
    'client_id', _row.id,
    'client_name', _row.full_name,
    'case_id', _row.invite_token,
    'activation_code', _row.invite_token,
    'activated_at', _row.activated_at,
    'hmac_secret', _secret,
    'update_endpoint', 'https://detenciondefensa.com/api/public/app-update-request',
    'client', jsonb_build_object(
      'name', _row.full_name,
      'full_name', _row.full_name,
      'first_name', split_part(coalesce(_row.full_name,''), ' ', 1),
      'last_name', NULLIF(substr(coalesce(_row.full_name,''), length(split_part(coalesce(_row.full_name,''), ' ', 1))+2), ''),
      'date_of_birth', _row.date_of_birth,
      'dob', _row.date_of_birth,
      'birth_date', _row.date_of_birth,
      'a_number', _row.a_number,
      'alien_number', _row.a_number,
      'place_of_birth', _row.place_of_birth,
      'birth_place', _row.place_of_birth,
      'country_of_origin', _row.country_of_origin,
      'country', _row.country_of_origin,
      'language', _row.language,
      'phone', _row.phone_e164,
      'phone_e164', _row.phone_e164,
      'email', _row.email
    ),
    'profile', jsonb_build_object(
      'name', _row.full_name,
      'full_name', _row.full_name,
      'date_of_birth', _row.date_of_birth,
      'dob', _row.date_of_birth,
      'a_number', _row.a_number,
      'alien_number', _row.a_number,
      'place_of_birth', _row.place_of_birth,
      'birth_place', _row.place_of_birth,
      'country_of_origin', _row.country_of_origin,
      'phone', _row.phone_e164,
      'email', _row.email
    ),
    'attorney', CASE
      WHEN _row.attorney_name IS NOT NULL
        OR _row.attorney_phone IS NOT NULL
        OR _row.attorney_email IS NOT NULL
      THEN jsonb_build_object(
        'name', _row.attorney_name,
        'phone', _row.attorney_phone,
        'email', _row.attorney_email
      )
      ELSE NULL
    END,
    'emergency_contacts', _contacts,
    'family_contacts', _contacts,
    'contacts', _contacts,
    'contacts_updated_at', _contacts_updated,
    'contacts_editable_in_app', false,
    'documents', _docs,
    'forms', _docs,
    'legal_forms', _docs,
    'family_docs', _docs
  );
END;
$function$;

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
    _subject := 'ACTIVATION: ' || _row.invite_token || ' — app activated';
    _html := '<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;line-height:1.6;">'
          || '<h2 style="margin:0 0 12px;">New app activation</h2>'
          || '<p style="margin:4px 0;"><strong>Activation code:</strong> ' || _row.invite_token || '</p>'
          || coalesce('<p style="margin:4px 0;"><strong>Name:</strong> ' || _row.full_name || '</p>','')
          || coalesce('<p style="margin:4px 0;"><strong>Email:</strong> ' || _row.email || '</p>','')
          || coalesce('<p style="margin:4px 0;"><strong>Phone:</strong> ' || _row.phone_e164 || '</p>','')
          || '<p style="margin:4px 0;"><strong>Activated (UTC):</strong> ' || to_char(now() AT TIME ZONE 'UTC','YYYY-MM-DD HH24:MI') || '</p>'
          || '<p style="color:#666;font-size:12px;">This is an activation notice only — no emergency has been triggered.</p></div>';
    _msg_id := 'activation_' || _row.id::text;

    BEGIN
      PERFORM public.enqueue_email('transactional_emails', jsonb_build_object(
        'to', 'legal@detenciondefensa.com',
        'from', 'info@notify.gohomesooner.com',
        'sender_domain', 'notify.gohomesooner.com',
        'subject', _subject,
        'html', _html,
        'text', 'New app activation — code ' || _row.invite_token || ' (' || coalesce(_row.full_name,'name unknown') || ')',
        'purpose', 'transactional',
        'label', 'app_activation_notice',
        'idempotency_key', _msg_id,
        'message_id', _msg_id,
        'queued_at', now()
      ));
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'activation notice enqueue failed: %', SQLERRM;
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