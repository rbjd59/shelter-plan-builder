ALTER TABLE public.client_documents DROP CONSTRAINT IF EXISTS doc_type_valid;
ALTER TABLE public.client_documents ADD CONSTRAINT doc_type_valid CHECK (
  document_type = ANY (ARRAY[
    'ao_242','ao_240','civil_cover_sheet','motion_for_counsel','memorandum_of_law',
    'power_of_attorney','school_authorization','vehicle_impound_auth','bank_account_access','property_access_permission',
    'habeas_ao242','ao240_ifp','js44','motion_counsel','cover_letter','pet_rescue_notice','emergency_letter','summary'
  ])
);

INSERT INTO public.client_documents (client_id, title, content, document_type, send_on_alert)
SELECT c.id, t.title, 'Pending attorney review. This document will be populated from your intake answers.', t.dtype, true
FROM public.app_clients c
CROSS JOIN (VALUES
  ('ao_242','AO 242 — Petition for Writ of Habeas Corpus'),
  ('ao_240','AO 240 — Application to Proceed In Forma Pauperis'),
  ('civil_cover_sheet','JS-44 — Civil Cover Sheet'),
  ('motion_for_counsel','SDFL Motion for Referral to Volunteer Attorney'),
  ('memorandum_of_law','Memorandum of Law')
) AS t(dtype, title)
WHERE NOT EXISTS (
  SELECT 1 FROM public.client_documents d WHERE d.client_id = c.id AND d.document_type = t.dtype
);

INSERT INTO public.client_documents (client_id, title, content, document_type, send_on_alert)
SELECT c.id, t.title, 'Pending attorney review. This document will be populated from your intake answers.', t.dtype, true
FROM public.app_clients c
CROSS JOIN (VALUES
  ('power_of_attorney','Power of Attorney'),
  ('school_authorization','School Pickup Authorization'),
  ('vehicle_impound_auth','Vehicle Impound Release Authorization'),
  ('bank_account_access','Bank Account Access Authorization'),
  ('property_access_permission','Property Access Permission')
) AS t(dtype, title)
WHERE c.has_asset_protection = true
  AND NOT EXISTS (
    SELECT 1 FROM public.client_documents d WHERE d.client_id = c.id AND d.document_type = t.dtype
  );