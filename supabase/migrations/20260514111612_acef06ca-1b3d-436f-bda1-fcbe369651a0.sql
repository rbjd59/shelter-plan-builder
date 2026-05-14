
-- Readiness Packets ($100 Sentinel add-on)
create table public.readiness_packets (
  id uuid primary key default gen_random_uuid(),
  intake_session_id text not null,
  stripe_session_id text,
  language text not null default 'es',
  status text not null default 'pending_payment',
    -- pending_payment | paid | pending_translation | ready_to_sign | vaulted | delivered | cancelled
  designated_recipient jsonb,
  form_answers jsonb,
  signing_token text unique,
  signing_token_expires_at timestamptz,
  vault_storage_paths text[],
  vaulted_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index readiness_packets_intake_session_idx on public.readiness_packets(intake_session_id);
create index readiness_packets_stripe_session_idx on public.readiness_packets(stripe_session_id);
alter table public.readiness_packets enable row level security;
-- No policies = no anon/authenticated access; only service role (used in server fns) can read/write.

create table public.readiness_deliveries (
  id uuid primary key default gen_random_uuid(),
  packet_id uuid references public.readiness_packets(id) on delete cascade,
  emergency_activation_id uuid,
  delivered_to_email text not null,
  delivered_at timestamptz not null default now(),
  message_id text
);
create index readiness_deliveries_packet_idx on public.readiness_deliveries(packet_id);
alter table public.readiness_deliveries enable row level security;
-- service-role only

-- Private vault bucket
insert into storage.buckets (id, name, public)
values ('readiness-vault', 'readiness-vault', false)
on conflict (id) do nothing;

-- Storage policies: service role only (no public, no authenticated access).
create policy "Service role reads vault"
on storage.objects for select
to public
using (bucket_id = 'readiness-vault' and auth.role() = 'service_role');

create policy "Service role writes vault"
on storage.objects for insert
to public
with check (bucket_id = 'readiness-vault' and auth.role() = 'service_role');

create policy "Service role updates vault"
on storage.objects for update
to public
using (bucket_id = 'readiness-vault' and auth.role() = 'service_role');

create policy "Service role deletes vault"
on storage.objects for delete
to public
using (bucket_id = 'readiness-vault' and auth.role() = 'service_role');
