CREATE TABLE public.app_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('android','ios')),
  version TEXT NOT NULL,
  apk_path TEXT,
  testflight_url TEXT,
  min_android_sdk INTEGER,
  notes TEXT,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_releases TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.app_releases TO authenticated;
GRANT ALL ON public.app_releases TO service_role;

ALTER TABLE public.app_releases ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated /download visitors) can read the current release
CREATE POLICY "Public can read current releases"
  ON public.app_releases FOR SELECT
  USING (is_current = TRUE);

-- Admins can read history
CREATE POLICY "Admins can read all releases"
  ON public.app_releases FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage releases
CREATE POLICY "Admins can insert releases"
  ON public.app_releases FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update releases"
  ON public.app_releases FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete releases"
  ON public.app_releases FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only one current release per platform
CREATE UNIQUE INDEX app_releases_current_per_platform
  ON public.app_releases (platform)
  WHERE is_current = TRUE;

CREATE TRIGGER trg_app_releases_touch
  BEFORE UPDATE ON public.app_releases
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed: Premio v1.0.0 placeholder row so /download works before first upload
INSERT INTO public.app_releases (platform, version, min_android_sdk, is_current, notes)
VALUES ('android', '1.0.0', 26, TRUE, 'Initial Premio build — APK upload pending');