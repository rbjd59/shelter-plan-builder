UPDATE public.app_releases
SET apk_path = 'android/detenciondefensa-0.4.1-787049667-signed.apk',
    updated_at = now()
WHERE platform = 'android' AND is_current = true;