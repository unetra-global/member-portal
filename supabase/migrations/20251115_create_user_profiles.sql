-- Create table to store extended post-login user profile details
create schema if not exists public;

-- Helper to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email_comm text,
  phone_whatsapp text,
  address text,
  city text,
  state text,
  country text,
  category text,
  sub_category text,
  years_experience int,
  years_relevant_experience int,
  linkedin_url text,
  detailed_profile_text text,
  resume_url text,
  experiences jsonb,
  licenses jsonb,
  awards jsonb,
  organisation_name text,
  designation text,
  firm_size text,
  num_partners int,
  why_join text,
  expectations text,
  anything_else text,
  documents jsonb,
  accepted_rules boolean not null default false,
  accepted_privacy boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure updated_at is maintained
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'user_profiles_set_updated_at'
  ) then
    create trigger user_profiles_set_updated_at
    before update on public.user_profiles
    for each row
    execute function public.set_updated_at();
  end if;
end $$;

-- Basic RLS setup (optional; uncomment if using Supabase CLI to apply policies)
-- alter table public.user_profiles enable row level security;
-- create policy "Users can manage their own profile"
--   on public.user_profiles
--   for all
--   using (auth.uid() = user_id)
--   with check (auth.uid() = user_id);