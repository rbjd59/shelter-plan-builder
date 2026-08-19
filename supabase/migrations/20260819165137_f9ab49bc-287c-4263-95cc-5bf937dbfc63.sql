DELETE FROM public.client_documents
WHERE from_app = false
  AND document_type IN ('power_of_attorney','school_authorization','vehicle_impound_auth','bank_account_access','property_access_permission');