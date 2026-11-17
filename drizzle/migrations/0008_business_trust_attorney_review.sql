ALTER TABLE public.assessment_documents
  ADD COLUMN IF NOT EXISTS attorney_reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS attorney_reviewed_by uuid,
  ADD COLUMN IF NOT EXISTS review_notes text,
  ADD COLUMN IF NOT EXISTS attorney_terms jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source_document_id uuid;

ALTER TABLE public.client_documents
  ADD COLUMN IF NOT EXISTS attorney_terms jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source_document_id uuid;

CREATE INDEX IF NOT EXISTS assessment_documents_source_document_idx
  ON public.assessment_documents(source_document_id);
CREATE INDEX IF NOT EXISTS client_documents_source_document_idx
  ON public.client_documents(source_document_id);

ALTER TABLE public.client_documents DROP CONSTRAINT IF EXISTS doc_type_valid;
ALTER TABLE public.client_documents ADD CONSTRAINT doc_type_valid CHECK (
  document_type = ANY (ARRAY[
    'ao_242','ao_240','civil_cover_sheet','motion_for_counsel','memorandum_of_law',
    'mailing_label','power_of_attorney','school_authorization','vehicle_impound_auth',
    'bank_account_access','property_access_permission','blank_power_of_attorney',
    'blank_school_pickup','blank_vehicle_impound_release','blank_bank_account_access',
    'blank_property_access','habeas_ao242','ao240_ifp','js44','motion_counsel',
    'cover_letter','pet_rescue_notice','emergency_letter','summary','service_business_trust'
  ])
);