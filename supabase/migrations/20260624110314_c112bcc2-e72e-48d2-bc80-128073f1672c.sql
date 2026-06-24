DROP POLICY IF EXISTS "Public can read current releases" ON public.app_releases;
REVOKE SELECT ON public.app_releases FROM anon;