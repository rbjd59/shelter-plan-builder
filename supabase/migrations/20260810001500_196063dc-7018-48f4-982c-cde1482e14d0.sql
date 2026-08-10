ALTER TABLE public.client_documents DROP CONSTRAINT IF EXISTS doc_type_valid;
ALTER TABLE public.client_documents ADD CONSTRAINT doc_type_valid CHECK (document_type = ANY (ARRAY[
  'ao_242','ao_240','civil_cover_sheet','motion_for_counsel','memorandum_of_law',
  'power_of_attorney','school_authorization','vehicle_impound_auth','bank_account_access','property_access_permission',
  'blank_power_of_attorney','blank_school_pickup','blank_vehicle_impound_release','blank_bank_account_access','blank_property_access',
  'habeas_ao242','ao240_ifp','js44','motion_counsel','cover_letter','pet_rescue_notice','emergency_letter','summary'
]));