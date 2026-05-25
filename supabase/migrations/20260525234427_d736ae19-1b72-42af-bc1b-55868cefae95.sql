-- Create admin email whitelist table
CREATE TABLE public.admin_email_whitelist (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Seed with the 4 requested admin emails
INSERT INTO public.admin_email_whitelist (email) VALUES
  ('njbittelman@gmail.com'),
  ('nowmaxis@gmail.com'),
  ('benievasquez@gmail.com'),
  ('rbjd59@gmail.com')
ON CONFLICT DO NOTHING;

-- Create function to auto-assign admin role on profile creation
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.admin_email_whitelist
    WHERE LOWER(email) = LOWER(NEW.email)
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach trigger to profiles table
CREATE TRIGGER auto_assign_admin_on_profile
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.auto_assign_admin_role();

-- Enable RLS on whitelist (admins only)
ALTER TABLE public.admin_email_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read whitelist"
ON public.admin_email_whitelist
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
