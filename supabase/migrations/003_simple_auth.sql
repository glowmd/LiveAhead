-- =============================================
-- LiveAhead — Migration 003: Simple Email Auth
-- Replaces Supabase Auth with a plain app_users table.
-- Run this in the Supabase SQL Editor AFTER 001 + 002
-- =============================================

-- =============================================
-- 1. SIMPLE USERS TABLE
-- No link to auth.users — just email + UUID.
-- =============================================
create table if not exists public.app_users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  display_name text default '',
  created_at timestamptz default now() not null
);

comment on table public.app_users is 'Simple email-identified users. No Supabase Auth required.';

alter table public.app_users enable row level security;

drop policy if exists "Anyone can read app_users" on public.app_users;
drop policy if exists "Anyone can insert app_users" on public.app_users;
drop policy if exists "Anyone can update app_users" on public.app_users;

-- Open policies — anon key is safe because there is no sensitive data
create policy "Anyone can read app_users"   on public.app_users for select using (true);
create policy "Anyone can insert app_users" on public.app_users for insert with check (true);
create policy "Anyone can update app_users" on public.app_users for update using (true);

-- =============================================
-- 2. RECREATE HABIT_LOGS referencing app_users
-- =============================================
drop table if exists public.habit_logs cascade;

create table public.habit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.app_users(id) on delete cascade not null,
  habit_id text not null,
  logged_date date not null,
  created_at timestamptz default now() not null,
  unique(user_id, habit_id, logged_date)
);

comment on table public.habit_logs is 'Daily habit check-offs.';

alter table public.habit_logs enable row level security;

drop policy if exists "Anyone can read habit_logs" on public.habit_logs;
drop policy if exists "Anyone can insert habit_logs" on public.habit_logs;
drop policy if exists "Anyone can delete habit_logs" on public.habit_logs;

create policy "Anyone can read habit_logs"   on public.habit_logs for select using (true);
create policy "Anyone can insert habit_logs" on public.habit_logs for insert with check (true);
create policy "Anyone can delete habit_logs" on public.habit_logs for delete using (true);

-- =============================================
-- 3. RECREATE USER_SETTINGS referencing app_users
-- =============================================
drop table if exists public.user_settings cascade;

create table public.user_settings (
  user_id uuid references public.app_users(id) on delete cascade primary key,
  goals text[] default '{}',
  active_habits text[] default '{}',
  onboarding_complete boolean default false,
  share_dismissed boolean default false,
  dark_mode text default 'auto',
  updated_at timestamptz default now() not null
);

comment on table public.user_settings is 'Per-user app settings.';

alter table public.user_settings enable row level security;

drop policy if exists "Anyone can read user_settings" on public.user_settings;
drop policy if exists "Anyone can insert user_settings" on public.user_settings;
drop policy if exists "Anyone can update user_settings" on public.user_settings;

create policy "Anyone can read user_settings"   on public.user_settings for select using (true);
create policy "Anyone can insert user_settings" on public.user_settings for insert with check (true);
create policy "Anyone can update user_settings" on public.user_settings for update using (true);
