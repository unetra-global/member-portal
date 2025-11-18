-- Add sub_categories JSONB to store multiple selections with relevant years
alter table if exists public.user_profiles
  add column if not exists sub_categories jsonb;