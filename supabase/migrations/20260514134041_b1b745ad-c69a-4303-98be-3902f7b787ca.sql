create table public.defendermicasa_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text default 'coming-soon',
  user_agent text,
  created_at timestamptz not null default now()
);

create index defendermicasa_signups_email_idx on public.defendermicasa_signups (email);

alter table public.defendermicasa_signups enable row level security;

create policy "anyone can insert signup"
  on public.defendermicasa_signups
  for insert
  to anon, authenticated
  with check (true);

create policy "authenticated can read"
  on public.defendermicasa_signups
  for select
  to authenticated
  using (true);