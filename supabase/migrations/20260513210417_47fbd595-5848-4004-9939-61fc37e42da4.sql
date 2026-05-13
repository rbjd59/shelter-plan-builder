create table public.app_install_tokens (
  token uuid primary key default gen_random_uuid(),
  intake_session_id text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days'),
  used_at timestamptz
);
create index app_install_tokens_session_idx on public.app_install_tokens(intake_session_id);
alter table public.app_install_tokens enable row level security;
-- No policies = no client access. Server uses service role and bypasses RLS.