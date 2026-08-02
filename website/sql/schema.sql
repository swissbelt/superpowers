-- Benchmark Contract Services website: form submissions table.
-- Run this once in your Supabase project's SQL Editor (Supabase dashboard
-- -> SQL Editor -> New query -> paste this whole file -> Run).

create table if not exists public.submissions (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  form_type text not null check (form_type in ('government_quote', 'private_quote', 'partner_application')),
  name text not null,
  email text not null,
  phone text,
  company_or_agency text,
  title text,
  service text,
  trade text,
  service_area text,
  message text
);

-- Row Level Security: the public website can only ever INSERT new rows.
-- It can never read, update, or delete anything through the public API key,
-- so visitors can't see each other's submissions. You'll read submissions
-- yourself through the Supabase dashboard's Table Editor, which uses your
-- own login rather than the public key.
alter table public.submissions enable row level security;

create policy "Public can submit forms"
  on public.submissions
  for insert
  to anon
  with check (true);
