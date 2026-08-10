-- Backfill the per-client signing key. Without it, verify_app_trigger_signature()
-- returns invalid_token and every SOS fire/cancel from the phone is rejected 401.
UPDATE public.app_clients
   SET hmac_secret = encode(extensions.gen_random_bytes(32), 'hex'),
       updated_at  = now()
 WHERE hmac_secret IS NULL;

-- Belt and braces: default it at the database level so an insert that forgets
-- the column still produces a usable client.
ALTER TABLE public.app_clients
  ALTER COLUMN hmac_secret SET DEFAULT encode(extensions.gen_random_bytes(32), 'hex');