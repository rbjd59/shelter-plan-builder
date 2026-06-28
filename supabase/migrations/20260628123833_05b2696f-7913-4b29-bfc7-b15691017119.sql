UPDATE public.app_releases SET is_current = false WHERE platform = 'android' AND is_current = true;
INSERT INTO public.app_releases (platform, version, apk_path, min_android_sdk, notes, is_current)
VALUES ('android', '0.2.0', 'android/sosconnect-0.2.0-782612798.apk', 26, 'Build 782612798 — adds privacy strings, PIN cancel, deep-linking', true);