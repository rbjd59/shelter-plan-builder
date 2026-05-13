
-- Intake submissions: one row per Stripe checkout session
create table public.intake_submissions (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  language text not null default 'es',
  email text,
  paid boolean not null default false,
  answers jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_intake_submissions_session on public.intake_submissions(stripe_session_id);
alter table public.intake_submissions enable row level security;
-- No public policies: service role only.

-- Case tracking: family-facing magic-link record
create table public.case_tracking (
  id uuid primary key default gen_random_uuid(),
  intake_session_id text not null unique,
  tracking_token text not null unique default encode(gen_random_bytes(20), 'hex'),
  contact_name text,
  contact_email text,
  contact_phone text,
  inmate_name text,
  language text not null default 'es',
  step1_received_at timestamptz not null default now(),
  step2_sent_to_inmate_at timestamptz,
  step3_sent_to_family_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_case_tracking_token on public.case_tracking(tracking_token);
alter table public.case_tracking enable row level security;
-- No public policies: service role only. The /track/:token page reads via a server function.

-- Storage bucket for the prepared PDFs (private)
insert into storage.buckets (id, name, public)
values ('intake-forms', 'intake-forms', false)
on conflict (id) do nothing;
