CREATE OR REPLACE FUNCTION public.prevent_qualify_self_decision()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- service_role / internal (no JWT) and admins may change decision fields
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;

  NEW.qualifies := OLD.qualifies;
  NEW.status := OLD.status;
  NEW.tier := OLD.tier;
  NEW.notes := OLD.notes;
  NEW.assessment_reasoning := OLD.assessment_reasoning;
  NEW.attestation_signed := OLD.attestation_signed;
  NEW.attestation_signed_at := OLD.attestation_signed_at;
  NEW.attestation_signature := OLD.attestation_signature;
  NEW.stripe_verification_session_id := OLD.stripe_verification_session_id;
  NEW.stripe_verification_status := OLD.stripe_verification_status;
  NEW.stripe_verification_verified_at := OLD.stripe_verification_verified_at;
  NEW.plaid_item_id := OLD.plaid_item_id;
  NEW.plaid_access_token_encrypted := OLD.plaid_access_token_encrypted;
  NEW.plaid_linked_at := OLD.plaid_linked_at;
  NEW.user_id := OLD.user_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_qualify_self_decision_trg ON public.qualify_submissions;
CREATE TRIGGER prevent_qualify_self_decision_trg
BEFORE UPDATE ON public.qualify_submissions
FOR EACH ROW EXECUTE FUNCTION public.prevent_qualify_self_decision();