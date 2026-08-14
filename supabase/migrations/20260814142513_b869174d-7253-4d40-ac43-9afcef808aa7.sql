-- 1) client_documents: prevent owners from self-marking attorney review
CREATE OR REPLACE FUNCTION public.guard_client_document_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- service_role / privileged backend bypasses this guard
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'firm') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.review_status := 'pending';
    NEW.attorney_reviewed_at := NULL;
    NEW.attorney_reviewed_by := NULL;
    NEW.review_notes := NULL;
    RETURN NEW;
  END IF;

  NEW.review_status := OLD.review_status;
  NEW.attorney_reviewed_at := OLD.attorney_reviewed_at;
  NEW.attorney_reviewed_by := OLD.attorney_reviewed_by;
  NEW.review_notes := OLD.review_notes;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_client_document_review ON public.client_documents;
CREATE TRIGGER trg_guard_client_document_review
BEFORE INSERT OR UPDATE ON public.client_documents
FOR EACH ROW EXECUTE FUNCTION public.guard_client_document_review();

-- 2) firm_earnings: no self-approval by firm users
DROP POLICY IF EXISTS "Firm can update earnings" ON public.firm_earnings;

CREATE POLICY "Admins can update earnings"
ON public.firm_earnings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.guard_firm_earnings_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  -- reviewer identity is always the acting admin, never client-supplied
  IF NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
     OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by
     OR NEW.released_to_operating_at IS DISTINCT FROM OLD.released_to_operating_at THEN
    NEW.reviewed_by := auth.uid();
    IF NEW.reviewed_at IS NULL THEN
      NEW.reviewed_at := now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_firm_earnings_review ON public.firm_earnings;
CREATE TRIGGER trg_guard_firm_earnings_review
BEFORE UPDATE ON public.firm_earnings
FOR EACH ROW EXECUTE FUNCTION public.guard_firm_earnings_review();