-- Restrict SELECT to service_role only
DROP POLICY IF EXISTS "authenticated can read" ON public.defendermicasa_signups;

CREATE POLICY "Service role can read signups"
ON public.defendermicasa_signups
FOR SELECT
USING (auth.role() = 'service_role');

-- Replace permissive INSERT (WITH CHECK true) with minimal validation
DROP POLICY IF EXISTS "anyone can insert signup" ON public.defendermicasa_signups;

CREATE POLICY "Anyone can submit signup"
ON public.defendermicasa_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (email IS NOT NULL AND length(email) > 3 AND length(email) < 320 AND email LIKE '%_@_%.__%');