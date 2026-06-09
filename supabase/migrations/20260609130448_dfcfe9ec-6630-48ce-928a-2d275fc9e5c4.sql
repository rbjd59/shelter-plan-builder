
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove prior schedule if it exists (idempotent re-run).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'retry-failed-emails-hourly') THEN
    PERFORM cron.unschedule('retry-failed-emails-hourly');
  END IF;
END$$;

SELECT cron.schedule(
  'retry-failed-emails-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--96e23389-dce2-4a84-bd5e-c5cefea33436.lovable.app/api/public/cron/retry-failed-emails',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-trigger-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'REPLIT_TRIGGER_SECRET' LIMIT 1)
    ),
    body := '{}'::jsonb
  );
  $$
);
