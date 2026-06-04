-- DAGI — Шаг 2: желания (wishes)
-- Выполни в Supabase: SQL Editor → New query → вставь → Run.

create table if not exists public.wishes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  activity    text not null,                       -- ключ активности: football, volleyball, ...
  city        text not null,
  district    text,
  radius_km   int  not null default 10,
  wish_date   date not null,
  wish_time   time,                                -- NULL = «время не важно» (гибкий)
  status      text not null default 'active',      -- active | done | cancelled
  created_at  timestamptz not null default now()
);

comment on column public.wishes.wish_time is 'NULL = гибкий (любое время этого дня); иначе строгий фильтр по времени.';

create index if not exists wishes_match_idx
  on public.wishes (activity, wish_date, status);
create index if not exists wishes_user_idx
  on public.wishes (user_id);

alter table public.wishes enable row level security;

-- Видят все вошедшие (нужно для совпадений на Шаге 3)
drop policy if exists "wishes_select_authenticated" on public.wishes;
create policy "wishes_select_authenticated"
  on public.wishes for select to authenticated using (true);

-- Создавать можно только от своего имени
drop policy if exists "wishes_insert_own" on public.wishes;
create policy "wishes_insert_own"
  on public.wishes for insert to authenticated
  with check (auth.uid() = user_id);

-- Менять/удалять можно только свои желания
drop policy if exists "wishes_update_own" on public.wishes;
create policy "wishes_update_own"
  on public.wishes for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "wishes_delete_own" on public.wishes;
create policy "wishes_delete_own"
  on public.wishes for delete to authenticated
  using (auth.uid() = user_id);
