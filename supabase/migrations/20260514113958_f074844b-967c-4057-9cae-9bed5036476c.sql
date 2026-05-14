ALTER TABLE public.readiness_packets
  ADD COLUMN IF NOT EXISTS delivery_mode text,
  ADD COLUMN IF NOT EXISTS vault_subscription_id text,
  ADD COLUMN IF NOT EXISTS recipient_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS recipient_sent_message_id text,
  ADD COLUMN IF NOT EXISTS generated_pdf_paths text[];
