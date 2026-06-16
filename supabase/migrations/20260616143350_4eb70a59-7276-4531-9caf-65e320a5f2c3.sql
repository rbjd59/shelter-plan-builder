
-- ============================================================
-- Premio/SOSConnect <-> Web app integration
-- Phase A: tables + secure RPCs for token-based mobile access
-- ============================================================

-- 1) app_clients: one paid customer = one mobile activation
CREATE TABLE public.app_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  intake_session_id TEXT UNIQUE,
  invite_token TEXT NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  phone_e164 TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  activated_at TIMESTAMPTZ,
  device_info JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT invite_token_format CHECK (invite_token ~ '^[A-Z0-9]{8}$'),
  CONSTRAINT language_valid CHECK (language IN ('en','es','ht'))
);

GRANT ALL ON public.app_clients TO service_role;
-- intentionally NO anon/authenticated grants: access is only via SECURITY DEFINER RPCs

ALTER TABLE public.app_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role manages app_clients" ON public.app_clients
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_app_clients_invite_token ON public.app_clients(invite_token);

-- 2) client_documents: PDFs/letters synced into the phone
CREATE TABLE public.client_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.app_clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  document_type TEXT NOT NULL,
  send_on_alert BOOLEAN NOT NULL DEFAULT false,
  loaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT doc_type_valid CHECK (document_type IN (
    'habeas_ao242','ao240_ifp','js44','motion_counsel','cover_letter',
    'power_of_attorney','pet_rescue_notice','emergency_letter','summary'
  ))
);

GRANT ALL ON public.client_documents TO service_role;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role manages client_documents" ON public.client_documents
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_client_documents_client_id ON public.client_documents(client_id);

-- 3) client_contacts: emergency contacts mobile app reads
CREATE TABLE public.client_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.app_clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_e164 TEXT,
  email TEXT,
  relationship TEXT,
  priority INT NOT NULL DEFAULT 100,
  notify_on_sos BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.client_contacts TO service_role;
ALTER TABLE public.client_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role manages client_contacts" ON public.client_contacts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_client_contacts_client_id ON public.client_contacts(client_id);

-- 4) client_sos_alerts: written from phone when SOS pressed
CREATE TABLE public.client_sos_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.app_clients(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  battery_pct INT,
  payload JSONB,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.client_sos_alerts TO service_role;
ALTER TABLE public.client_sos_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role manages client_sos_alerts" ON public.client_sos_alerts
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "admins read sos alerts" ON public.client_sos_alerts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_sos_alerts_client_id ON public.client_sos_alerts(client_id);

-- 5) sms_send_log: outbound SMS audit
CREATE TABLE public.sms_send_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_phone TEXT NOT NULL,
  purpose TEXT NOT NULL,
  body_preview TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  twilio_sid TEXT,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.sms_send_log TO service_role;
ALTER TABLE public.sms_send_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role manages sms_send_log" ON public.sms_send_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "admins read sms_send_log" ON public.sms_send_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- Updated-at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER app_clients_touch BEFORE UPDATE ON public.app_clients
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================
-- SECURITY DEFINER RPCs the Flutter app calls (anon key)
-- ============================================================

-- Redeem activation token: returns minimal session info, marks activated_at
CREATE OR REPLACE FUNCTION public.redeem_invite_token(_token TEXT)
RETURNS TABLE(client_id UUID, full_name TEXT, language TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _norm TEXT := upper(trim(_token));
BEGIN
  IF _norm !~ '^[A-Z0-9]{8}$' THEN
    RAISE EXCEPTION 'invalid_token_format';
  END IF;

  RETURN QUERY
  UPDATE public.app_clients c
     SET activated_at = COALESCE(c.activated_at, now())
   WHERE c.invite_token = _norm
   RETURNING c.id, c.full_name, c.language;
END; $$;

REVOKE ALL ON FUNCTION public.redeem_invite_token(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_invite_token(TEXT) TO anon, authenticated, service_role;

-- Bundle: documents + contacts for a redeemed token
CREATE OR REPLACE FUNCTION public.get_client_bundle(_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _norm TEXT := upper(trim(_token));
  _cid UUID;
BEGIN
  IF _norm !~ '^[A-Z0-9]{8}$' THEN
    RAISE EXCEPTION 'invalid_token_format';
  END IF;

  SELECT id INTO _cid FROM public.app_clients WHERE invite_token = _norm;
  IF _cid IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  RETURN jsonb_build_object(
    'client_id', _cid,
    'documents', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', id, 'title', title, 'content', content,
        'document_type', document_type, 'send_on_alert', send_on_alert,
        'loaded_at', loaded_at
      ) ORDER BY loaded_at)
      FROM public.client_documents WHERE client_id = _cid
    ), '[]'::jsonb),
    'contacts', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', id, 'name', name, 'phone_e164', phone_e164, 'email', email,
        'relationship', relationship, 'priority', priority,
        'notify_on_sos', notify_on_sos
      ) ORDER BY priority)
      FROM public.client_contacts WHERE client_id = _cid
    ), '[]'::jsonb)
  );
END; $$;

REVOKE ALL ON FUNCTION public.get_client_bundle(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_client_bundle(TEXT) TO anon, authenticated, service_role;

-- Record SOS alert from phone
CREATE OR REPLACE FUNCTION public.record_sos_alert(
  _token TEXT,
  _lat DOUBLE PRECISION DEFAULT NULL,
  _lng DOUBLE PRECISION DEFAULT NULL,
  _battery_pct INT DEFAULT NULL,
  _payload JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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

  INSERT INTO public.client_sos_alerts(client_id, lat, lng, battery_pct, payload)
  VALUES (_cid, _lat, _lng, _battery_pct, _payload)
  RETURNING id INTO _alert_id;

  RETURN _alert_id;
END; $$;

REVOKE ALL ON FUNCTION public.record_sos_alert(TEXT, DOUBLE PRECISION, DOUBLE PRECISION, INT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_sos_alert(TEXT, DOUBLE PRECISION, DOUBLE PRECISION, INT, JSONB) TO anon, authenticated, service_role;

-- ============================================================
-- Dev seed: TEST1234 bypass row (matches Flutter app's hardcoded dev token)
-- ============================================================
INSERT INTO public.app_clients (invite_token, full_name, email, language)
VALUES ('TEST1234', 'Test Client', 'test@detenciondefensa.com', 'en')
ON CONFLICT (invite_token) DO NOTHING;

INSERT INTO public.client_documents (client_id, title, content, document_type, send_on_alert)
SELECT id,
       'Welcome — Demo Packet',
       'This is a demo document loaded for the TEST1234 activation code. Replace by paying through the web app.',
       'summary', false
FROM public.app_clients WHERE invite_token = 'TEST1234'
ON CONFLICT DO NOTHING;
