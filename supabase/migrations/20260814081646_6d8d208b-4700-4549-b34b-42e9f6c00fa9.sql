-- Remove overly permissive client-side INSERT paths; all writes go through trusted server code.
DROP POLICY IF EXISTS "Users insert their own retainers" ON public.legal_retainers;
DROP POLICY IF EXISTS "Anyone can submit qualification" ON public.qualify_submissions;

CREATE POLICY "Users insert their own retainers"
ON public.legal_retainers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

REVOKE INSERT ON public.qualify_submissions FROM anon, authenticated;
REVOKE INSERT ON public.legal_retainers FROM anon;
GRANT ALL ON public.qualify_submissions TO service_role;
GRANT ALL ON public.legal_retainers TO service_role;