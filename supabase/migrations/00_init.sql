-- ============================================================
-- I DESERVE IT — initial schema
-- Run this in Supabase SQL Editor (Project > SQL Editor > New Query)
-- ============================================================

-- 1. WEIGH-INS
create table if not exists public.weigh_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight numeric(5,2) not null check (weight > 0 and weight < 500),
  created_at timestamptz default now(),
  unique (user_id, date)
);
create index if not exists weigh_ins_user_date_idx on public.weigh_ins (user_id, date);

-- 2. CUSTOM AFFIRMATIONS
create table if not exists public.custom_affirmations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (length(text) between 3 and 280),
  category text not null check (category in ('morning','meal','craving','workout','evening','general')),
  source text not null default 'custom' check (source in ('custom','ai')),
  created_at timestamptz default now()
);
create index if not exists custom_affirmations_user_idx on public.custom_affirmations (user_id, category);

-- 3. DAILY CHECK-INS
create table if not exists public.daily_checkins (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now(),
  primary key (user_id, date)
);

-- 4. DAILY AFFIRMATION LOG (which one was shown today)
create table if not exists public.daily_affirmation (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  affirmation_id text not null,
  affirmation_text text not null,
  affirmation_category text not null,
  created_at timestamptz default now(),
  primary key (user_id, date)
);

-- 5. PUSH SUBSCRIPTIONS
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now(),
  unique (user_id, endpoint)
);

-- 6. NOTIFICATION SCHEDULES
create table if not exists public.notification_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('morning','meal','craving','workout','evening')),
  time_of_day time not null,
  enabled boolean not null default true,
  timezone text not null default 'Europe/Paris',
  last_sent_date date,
  created_at timestamptz default now(),
  unique (user_id, category)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.weigh_ins enable row level security;
alter table public.custom_affirmations enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.daily_affirmation enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notification_schedules enable row level security;

drop policy if exists "own_weigh_ins" on public.weigh_ins;
create policy "own_weigh_ins" on public.weigh_ins for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_affirmations" on public.custom_affirmations;
create policy "own_affirmations" on public.custom_affirmations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_checkins" on public.daily_checkins;
create policy "own_checkins" on public.daily_checkins for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_daily_affirmation" on public.daily_affirmation;
create policy "own_daily_affirmation" on public.daily_affirmation for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_subs" on public.push_subscriptions;
create policy "own_subs" on public.push_subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_schedules" on public.notification_schedules;
create policy "own_schedules" on public.notification_schedules for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- AUTO-SEED DEFAULT NOTIFICATION SCHEDULES ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notification_schedules (user_id, category, time_of_day, enabled) values
    (new.id, 'morning', '08:00', true),
    (new.id, 'meal',    '12:00', true),
    (new.id, 'craving', '15:00', true),
    (new.id, 'workout', '17:30', true),
    (new.id, 'evening', '22:00', true)
  on conflict (user_id, category) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
