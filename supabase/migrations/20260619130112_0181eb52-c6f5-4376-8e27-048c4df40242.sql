-- 1. Add app-reported identity columns to SOS alerts
ALTER TABLE public.client_sos_alerts
  ADD COLUMN IF NOT EXISTS app_reported_name TEXT,
  ADD COLUMN IF NOT EXISTS app_reported_a_number TEXT,
  ADD COLUMN IF NOT EXISTS app_reported_place_of_birth TEXT,
  ADD COLUMN IF NOT EXISTS app_reported_date_of_birth DATE;

-- 2. Flag documents that were uploaded from the phone after a trigger
ALTER TABLE public.client_documents
  ADD COLUMN IF NOT EXISTS from_app BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Update record_sos_alert to pull the four fields out of _payload
CREATE OR REPLACE FUNCTION public.record_sos_alert(
  _token text,
  _lat double precision DEFAULT NULL::double precision,
  _lng double precision DEFAULT NULL::double precision,
  _battery_pct integer DEFAULT NULL::integer,
  _payload jsonb DEFAULT '{}'::jsonb
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _norm TEXT := upper(trim(_token));
  _cid UUID;
  _alert_id UUID;
  _dob DATE;
BEGIN
  IF _norm !~ '^[A-Z0-9]{8}$' THEN
    RAISE EXCEPTION 'invalid_token_format';
  END IF;

  SELECT id INTO _cid FROM public.app_clients WHERE invite_token = _norm;
  IF _cid IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  -- Try to coerce DOB if present; ignore if unparseable
  BEGIN
    _dob := NULLIF(_payload->>'date_of_birth','')::date;
  EXCEPTION WHEN OTHERS THEN
    _dob := NULL;
  END;

  INSERT INTO public.client_sos_alerts(
    client_id, lat, lng, battery_pct, payload,
    app_reported_name, app_reported_a_number,
    app_reported_place_of_birth, app_reported_date_of_birth
  )
  VALUES (
    _cid, _lat, _lng, _battery_pct, _payload,
    NULLIF(_payload->>'name',''),
    NULLIF(_payload->>'a_number',''),
    NULLIF(_payload->>'place_of_birth',''),
    _dob
  )
  RETURNING id INTO _alert_id;

  RETURN _alert_id;
END;
$function$;

-- 4. New RPC: app uploads a form to the client's file (attorney-side)
CREATE OR REPLACE FUNCTION public.attach_alert_document(
  _token text,
  _title text,
  _content text,
  _document_type text DEFAULT 'app_upload'
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _norm TEXT := upper(trim(_token));
  _cid UUID;
  _doc_id UUID;
BEGIN
  IF _norm !~ '^[A-Z0-9]{8}$' THEN
    RAISE EXCEPTION 'invalid_token_format';
  END IF;

  SELECT id INTO _cid FROM public.app_clients WHERE invite_token = _norm;
  IF _cid IS NULL THEN
    RAISE EXCEPTION 'invalid_token';
  END IF;

  IF _title IS NULL OR length(trim(_title)) = 0 THEN
    RAISE EXCEPTION 'title_required';
  END IF;

  INSERT INTO public.client_documents(client_id, title, content, document_type, send_on_alert, from_app)
  VALUES (_cid, trim(_title), COALESCE(_content,''), COALESCE(_document_type,'app_upload'), FALSE, TRUE)
  RETURNING id INTO _doc_id;

  RETURN _doc_id;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.attach_alert_document(text, text, text, text) TO anon, authenticated;