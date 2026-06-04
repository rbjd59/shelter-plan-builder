CREATE TABLE IF NOT EXISTS public.firm_email_whitelist (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.firm_email_whitelist TO authenticated;
GRANT ALL ON public.firm_email_whitelist TO service_role;

ALTER TABLE public.firm_email_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage firm whitelist"
ON public.firm_email_whitelist
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.firm_email_whitelist (email)
VALUES ('rsorrentino@sorrentinolawfirm.com')
ON CONFLICT (email) DO NOTHING;

CREATE OR REPLACE FUNCTION public.auto_assign_firm_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.firm_email_whitelist
    WHERE LOWER(email) = LOWER(NEW.email)
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'firm')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_assign_firm ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_firm
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_firm_role();

-- If Rosario has already signed up, grant the role now.
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'firm'::app_role
FROM auth.users u
WHERE LOWER(u.email) = 'rsorrentino@sorrentinolawfirm.com'
ON CONFLICT (user_id, role) DO NOTHING;