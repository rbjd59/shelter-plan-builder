update public.app_releases set is_current = false where platform = 'android' and is_current = true;
insert into public.app_releases (platform, version, apk_path, min_android_sdk, notes, is_current)
values ('android','0.4.1 (787049667)','android/detenciondefensa-android-787049667.apk',24,'Primio release-signed universal APK for sideload distribution.',true);