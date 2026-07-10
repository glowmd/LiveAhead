-- =============================================
-- LiveAhead — Migration 002: Logs & User Settings
-- Run this in the Supabase SQL Editor AFTER 001
-- =============================================

-- =============================================
-- 1. DAILY HABIT LOGS
-- Stores each habit check-off as a row.
-- =============================================
create table if not exists public.habit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  habit_id text not null,           -- e.g. 'sleep-well', 'move-daily'
  logged_date date not null,        -- the day this was logged for
  created_at timestamptz default now() not null,
  unique(user_id, habit_id, logged_date)  -- prevent duplicate check-offs
);

comment on table public.habit_logs is 'Daily habit check-offs keyed by user, habit ID, and date.';

alter table public.habit_logs enable row level security;

-- Drop existing policies if they exist before recreating
drop policy if exists "Users can view their own logs" on public.habit_logs;
drop policy if exists "Users can insert their own logs" on public.habit_logs;
drop policy if exists "Users can delete their own logs" on public.habit_logs;

create policy "Users can view their own logs"
  on public.habit_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own logs"
  on public.habit_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own logs"
  on public.habit_logs for delete
  using (auth.uid() = user_id);

-- =============================================
-- 2. USER APP SETTINGS (goals, active habits, etc.)
-- One row per user, upserted on change.
-- =============================================
create table if not exists public.user_settings (
  user_id uuid references public.profiles(id) on delete cascade primary key,
  goals text[] default '{}',             -- e.g. ['brain', 'stress']
  active_habits text[] default '{}',     -- e.g. ['sleep-well', 'move-daily']
  onboarding_complete boolean default false,
  share_dismissed boolean default false,
  dark_mode text default 'auto',         -- 'auto' | 'light' | 'dark'
  updated_at timestamptz default now() not null
);

comment on table public.user_settings is 'Per-user app settings: goals, habits, dark mode, onboarding state.';

alter table public.user_settings enable row level security;

-- Drop existing policies if they exist before recreating
drop policy if exists "Users can view their own settings" on public.user_settings;
drop policy if exists "Users can upsert their own settings" on public.user_settings;
drop policy if exists "Users can update their own settings" on public.user_settings;

create policy "Users can view their own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can upsert their own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own settings"
  on public.user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================
-- 3. UPDATE SIGNUP TRIGGER TO ALSO CREATE user_settings
-- This replaces the trigger from migration 001.
-- =============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  -- Create the profile row (idempotent)
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  )
  on conflict (id) do nothing;

  -- Create the settings row (idempotent)
  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Backfill user_settings for any existing users who signed up before this migration
insert into public.user_settings (user_id)
select id from public.profiles
where id not in (select user_id from public.user_settings)
on conflict (user_id) do nothing;
