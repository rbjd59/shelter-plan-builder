DO $$
DECLARE r record; def text;
BEGIN
  FOR r IN
    SELECT p.oid FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prokind = 'f'
      AND pg_get_functiondef(p.oid) LIKE '%[A-Z0-9]{8}%'
  LOOP
    def := replace(pg_get_functiondef(r.oid), '[A-Z0-9]{8}', '[A-Z0-9]{5,8}');
    EXECUTE def;
  END LOOP;
END $$;