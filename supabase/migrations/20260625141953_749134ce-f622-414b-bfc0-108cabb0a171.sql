
-- Add columns for setup-hub linkage and SOS cancel PIN
ALTER TABLE public.app_clients
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cancel_pin_hash text,
  ADD COLUMN IF NOT EXISTS setup_completed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_app_clients_user_id ON public.app_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_app_clients_email_lower ON public.app_clients(lower(email));

-- Allow authenticated owners to read/update their own record (gated by user_id)
GRANT SELECT, UPDATE ON public.app_clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_pet_rescue TO authenticated;

DROP POLICY IF EXISTS "owners read own app_client" ON public.app_clients;
CREATE POLICY "owners read own app_client" ON public.app_clients
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "owners update own app_client" ON public.app_clients;
CREATE POLICY "owners update own app_client" ON public.app_clients
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "owners manage own contacts" ON public.client_contacts;
CREATE POLICY "owners manage own contacts" ON public.client_contacts
  FOR ALL TO authenticated
  USING (client_id IN (SELECT id FROM public.app_clients WHERE user_id = auth.uid()))
  WITH CHECK (client_id IN (SELECT id FROM public.app_clients WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "owners manage own documents" ON public.client_documents;
CREATE POLICY "owners manage own documents" ON public.client_documents
  FOR ALL TO authenticated
  USING (client_id IN (SELECT id FROM public.app_clients WHERE user_id = auth.uid()))
  WITH CHECK (client_id IN (SELECT id FROM public.app_clients WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "owners manage own pets" ON public.client_pet_rescue;
CREATE POLICY "owners manage own pets" ON public.client_pet_rescue
  FOR ALL TO authenticated
  USING (client_id IN (SELECT id FROM public.app_clients WHERE user_id = auth.uid()))
  WITH CHECK (client_id IN (SELECT id FROM public.app_clients WHERE user_id = auth.uid()));

-- Claim an app_client record by email after magic-link sign-in
CREATE OR REPLACE FUNCTION public.claim_app_client_by_email(_user_id uuid, _email text)
RETURNS TABLE(client_id uuid, invite_token text, full_name text, language text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _norm_email text := lower(trim(_email));
BEGIN
  IF _user_id IS NULL OR _norm_email = '' THEN
    RAISE EXCEPTION 'invalid_input';
  END IF;

  -- Link any unclaimed records with matching email to this user
  UPDATE public.app_clients
     SET user_id = _user_id
   WHERE lower(email) = _norm_email
     AND user_id IS NULL;

  RETURN QUERY
  SELECT c.id, c.invite_token, c.full_name, c.language
    FROM public.app_clients c
   WHERE c.user_id = _user_id
   ORDER BY c.created_at DESC;
END; $$;

-- Claim by activation code (for users who got a code without email match)
CREATE OR REPLACE FUNCTION public.claim_app_client_by_code(_user_id uuid, _token text)
RETURNS TABLE(client_id uuid, invite_token text, full_name text, language text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _norm text := upper(trim(_token));
  _cid uuid;
BEGIN
  IF _user_id IS NULL OR _norm !~ '^[A-Z0-9]{8}$' THEN
    RAISE EXCEPTION 'invalid_input';
  END IF;

  SELECT id INTO _cid FROM public.app_clients WHERE invite_token = _norm;
  IF _cid IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  UPDATE public.app_clients
     SET user_id = _user_id
   WHERE id = _cid
     AND (user_id IS NULL OR user_id = _user_id);

  RETURN QUERY
  SELECT c.id, c.invite_token, c.full_name, c.language
    FROM public.app_clients c
   WHERE c.id = _cid AND c.user_id = _user_id;
END; $$;

GRANT EXECUTE ON FUNCTION public.claim_app_client_by_email(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_app_client_by_code(uuid, text) TO authenticated;

-- Set/update the SOS cancel PIN (bcrypt-ish: we just store sha256 with per-row salt via uuid)
CREATE OR REPLACE FUNCTION public.set_sos_cancel_pin(_client_id uuid, _pin text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
BEGIN
  IF _pin !~ '^[0-9]{4,8}$' THEN
    RAISE EXCEPTION 'pin_must_be_4_to_8_digits';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.app_clients
     WHERE id = _client_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  UPDATE public.app_clients
     SET cancel_pin_hash = encode(extensions.digest(_pin || id::text, 'sha256'), 'hex'),
         setup_completed_at = COALESCE(setup_completed_at, now())
   WHERE id = _client_id;
END; $$;

GRANT EXECUTE ON FUNCTION public.set_sos_cancel_pin(uuid, text) TO authenticated;

-- Cancel SOS only when PIN matches
CREATE OR REPLACE FUNCTION public.cancel_sos_alert_with_pin(_token text, _pin text)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions AS $$
DECLARE
  _norm text := upper(trim(_token));
  _cid uuid;
  _stored text;
  _alert_id uuid;
  _expected text;
BEGIN
  IF _norm !~ '^[A-Z0-9]{8}$' THEN
    RAISE EXCEPTION 'invalid_token_format';
  END IF;
  IF _pin IS NULL OR _pin = '' THEN
    RAISE EXCEPTION 'pin_required';
  END IF;

  SELECT id, cancel_pin_hash INTO _cid, _stored
    FROM public.app_clients WHERE invite_token = _norm;
  IF _cid IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;
  IF _stored IS NULL THEN
    RAISE EXCEPTION 'no_pin_set';
  END IF;

  _expected := encode(extensions.digest(_pin || _cid::text, 'sha256'), 'hex');
  IF _expected <> _stored THEN
    RAISE EXCEPTION 'invalid_pin';
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
END; $$;

GRANT EXECUTE ON FUNCTION public.cancel_sos_alert_with_pin(text, text) TO anon, authenticated;

-- Improve SOS alert email so docs survive Gmail/Outlook formatting
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
BEGIN
  SELECT full_name, email, phone_e164, language, invite_token
    INTO _client
    FROM public.app_clients WHERE id = _client_id;

  _viewer_url := 'https://detenciondefensa.com/alerta/' || coalesce(_client.invite_token,'');

  IF _lat IS NOT NULL AND _lng IS NOT NULL THEN
    _loc_line := '<p style="margin:8px 0;"><strong>Ubicación / Location:</strong> ' ||
                 '<a href="https://maps.google.com/?q=' || _lat || ',' || _lng ||
                 '" style="color:#b91c1c;">' || _lat || ', ' || _lng || '</a></p>';
  END IF;

  IF _kind = 'alert' THEN
    FOR _doc IN
      SELECT title, content FROM public.client_documents
       WHERE client_id = _client_id AND send_on_alert = TRUE
       ORDER BY loaded_at
    LOOP
      _doc_count := _doc_count + 1;
      _docs_html := _docs_html ||
        '<div style="margin:24px 0;padding:16px;border:1px solid #d1d5db;border-radius:8px;background:#f9fafb;">' ||
        '<h3 style="margin:0 0 12px 0;color:#111;font-size:16px;">' ||
        _doc_count || '. ' || coalesce(_doc.title,'Document') || '</h3>' ||
        '<div style="white-space:pre-wrap;font-family:Georgia,serif;color:#333;line-height:1.5;font-size:14px;">' ||
        replace(replace(replace(coalesce(_doc.content,''), '&', '&amp;'), '<', '&lt;'), '>', '&gt;') ||
        '</div></div>';
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
      _subject := '🚨 EMERGENCY / EMERGENCIA: ' || coalesce(_client.full_name,'A loved one') || ' needs help';
      _html := '<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:16px;">' ||
               '<h2 style="color:#b91c1c;margin:0 0 16px 0;">🚨 Emergency Alert / Alerta de Emergencia</h2>' ||
               '<p>Hola ' || coalesce(_contact.name,'amigo') || ',</p>' ||
               '<p><strong>' || coalesce(_client.full_name,'Your contact') ||
               '</strong> ha activado una alerta de emergencia desde la app DetencionDefensa. ' ||
               'Por favor actúe inmediatamente.</p>' ||
               '<div style="background:#fef2f2;border-left:4px solid #b91c1c;padding:12px;margin:16px 0;">' ||
               '<p style="margin:4px 0;"><strong>Código de activación:</strong> ' || coalesce(_client.invite_token,'—') || '</p>' ||
               '<p style="margin:4px 0;"><strong>Hora / Time:</strong> ' || to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI UTC') || '</p>' ||
               _loc_line ||
               CASE WHEN _client.phone_e164 IS NOT NULL
                    THEN '<p style="margin:4px 0;"><strong>Teléfono / Phone:</strong> ' || _client.phone_e164 || '</p>'
                    ELSE '' END ||
               '</div>' ||
               '<p style="margin:16px 0;"><a href="' || _viewer_url || '" style="display:inline-block;background:#b91c1c;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Ver documentos legales / View legal documents</a></p>' ||
               CASE WHEN _doc_count > 0 THEN
                 '<p style="color:#666;font-size:13px;">' || _doc_count || ' documento(s) legal(es) están abajo y disponibles en el enlace de arriba.</p>'
               ELSE '' END ||
               _docs_html ||
               '<hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;"/>' ||
               '<p style="color:#666;font-size:12px;">Enviado por DetencionDefensa en nombre de ' ||
               coalesce(_client.full_name,'tu contacto') || '. Ver siempre los documentos en línea en <a href="' || _viewer_url || '">' || _viewer_url || '</a>.</p>' ||
               '</div>';
      _text := 'EMERGENCIA: ' || coalesce(_client.full_name,'A loved one') ||
               ' ha activado una alerta de emergencia. Vea los documentos legales aquí: ' || _viewer_url;
    ELSE
      _subject := '✓ Falsa alarma / False alarm: ' || coalesce(_client.full_name,'your contact') || ' está bien';
      _html := '<div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:16px;">' ||
               '<h2 style="color:#059669;">✓ Falsa alarma / False alarm</h2>' ||
               '<p>Hola ' || coalesce(_contact.name,'amigo') || ',</p>' ||
               '<p><strong>' || coalesce(_client.full_name,'Your contact') ||
               '</strong> canceló la alerta de emergencia anterior. No se necesita ninguna acción.</p>' ||
               '<p><strong>Código:</strong> ' || coalesce(_client.invite_token,'—') || '</p>' ||
               '</div>';
      _text := coalesce(_client.full_name,'Your contact') ||
               ' canceló la alerta. No se necesita acción.';
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

-- Public read for the alert viewer page (limited columns via RPC, not direct table)
CREATE OR REPLACE FUNCTION public.get_alert_viewer_bundle(_token text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _norm text := upper(trim(_token));
  _cid uuid;
BEGIN
  IF _norm !~ '^[A-Z0-9]{8}$' THEN
    RAISE EXCEPTION 'invalid_token_format';
  END IF;

  SELECT id INTO _cid FROM public.app_clients WHERE invite_token = _norm;
  IF _cid IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  RETURN jsonb_build_object(
    'client_name', (SELECT full_name FROM public.app_clients WHERE id = _cid),
    'language', (SELECT language FROM public.app_clients WHERE id = _cid),
    'latest_alert', (
      SELECT jsonb_build_object(
        'id', id, 'triggered_at', triggered_at, 'cancelled_at', cancelled_at,
        'lat', lat, 'lng', lng
      )
      FROM public.client_sos_alerts
      WHERE client_id = _cid
      ORDER BY triggered_at DESC LIMIT 1
    ),
    'documents', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', id, 'title', title, 'content', content,
        'document_type', document_type
      ) ORDER BY loaded_at)
      FROM public.client_documents
      WHERE client_id = _cid AND send_on_alert = TRUE
    ), '[]'::jsonb)
  );
END; $$;

GRANT EXECUTE ON FUNCTION public.get_alert_viewer_bundle(text) TO anon, authenticated;
