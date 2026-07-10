-- =============================================
-- LiveAhead — Initial Database Schema
-- Run this in the Supabase SQL Editor
-- =============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- =============================================
-- 1. PROFILES
-- =============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.profiles is 'User profiles, auto-created on signup via trigger.';

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Users should not insert profiles directly (the trigger handles it)
-- But we allow it in case of edge cases
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- =============================================
-- 2. ROUTINES
-- =============================================
create table public.routines (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  schedule text default 'daily',
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

comment on table public.routines is 'User-created routines (e.g. "Morning routine", "Evening wind-down").';

-- RLS
alter table public.routines enable row level security;

create policy "Users can view their own routines"
  on public.routines for select
  using (auth.uid() = user_id);

create policy "Users can insert their own routines"
  on public.routines for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own routines"
  on public.routines for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own routines"
  on public.routines for delete
  using (auth.uid() = user_id);

-- =============================================
-- 3. ROUTINE ITEMS
-- =============================================
create table public.routine_items (
  id uuid default uuid_generate_v4() primary key,
  routine_id uuid references public.routines(id) on delete cascade not null,
  name text not null,
  duration_minutes int,
  sort_order int default 0,
  created_at timestamptz default now() not null
);

comment on table public.routine_items is 'Individual items within a routine.';

-- RLS (items inherit access from their parent routine's user_id)
alter table public.routine_items enable row level security;

create policy "Users can view their own routine items"
  on public.routine_items for select
  using (
    exists (
      select 1 from public.routines
      where routines.id = routine_items.routine_id
        and routines.user_id = auth.uid()
    )
  );

create policy "Users can insert their own routine items"
  on public.routine_items for insert
  with check (
    exists (
      select 1 from public.routines
      where routines.id = routine_items.routine_id
        and routines.user_id = auth.uid()
    )
  );

create policy "Users can update their own routine items"
  on public.routine_items for update
  using (
    exists (
      select 1 from public.routines
      where routines.id = routine_items.routine_id
        and routines.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.routines
      where routines.id = routine_items.routine_id
        and routines.user_id = auth.uid()
    )
  );

create policy "Users can delete their own routine items"
  on public.routine_items for delete
  using (
    exists (
      select 1 from public.routines
      where routines.id = routine_items.routine_id
        and routines.user_id = auth.uid()
    )
  );

-- =============================================
-- 4. AUTO-CREATE PROFILE ON SIGNUP
-- =============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
-- 5. AUTO-UPDATE updated_at TIMESTAMPS
-- =============================================
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger routines_updated_at
  before update on public.routines
  for each row execute function public.update_updated_at();
