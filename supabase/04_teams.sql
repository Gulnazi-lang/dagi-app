-- DAGI — Шаг 4: команды и приглашения.
-- Выполни в Supabase: SQL Editor → New query → вставь → Run.
--
-- Команда создаётся от совпадений желаний: один человек выбирает совпавших
-- галочками и зовёт их. Приглашённый принимает/отклоняет. Дальше (Шаг 5) —
-- чат команды, где договариваются, играть или нет.

-- =========================================================
-- 1. Таблицы
-- =========================================================
create table if not exists public.teams (
  id          uuid primary key default gen_random_uuid(),
  creator_id  uuid not null references auth.users (id) on delete cascade,
  activity    text not null,
  city        text not null,
  district    text,
  wish_date   date not null,
  wish_time   time,
  status      text not null default 'forming',  -- forming | ready | cancelled
  created_at  timestamptz not null default now()
);

create table if not exists public.team_members (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid not null references public.teams (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  status     text not null default 'invited',   -- invited | accepted | declined
  created_at timestamptz not null default now(),
  unique (team_id, user_id)
);

create index if not exists team_members_team_idx on public.team_members (team_id);
create index if not exists team_members_user_idx on public.team_members (user_id);

-- =========================================================
-- 2. Хелперы (security definer) — чтобы RLS не зациклился
--    при проверке «состою ли я в команде».
-- =========================================================
create or replace function public.is_team_member(p_team uuid, p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.team_members
    where team_id = p_team and user_id = p_user
  );
$$;

create or replace function public.is_team_creator(p_team uuid, p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.teams
    where id = p_team and creator_id = p_user
  );
$$;

-- =========================================================
-- 3. RLS
-- =========================================================
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- teams: вижу команды, где я создатель или участник
drop policy if exists "teams_select_involved" on public.teams;
create policy "teams_select_involved" on public.teams for select to authenticated
  using (creator_id = auth.uid() or public.is_team_member(id, auth.uid()));

-- создавать команду можно только от своего имени
drop policy if exists "teams_insert_own" on public.teams;
create policy "teams_insert_own" on public.teams for insert to authenticated
  with check (creator_id = auth.uid());

-- менять/удалять команду может только создатель
drop policy if exists "teams_update_creator" on public.teams;
create policy "teams_update_creator" on public.teams for update to authenticated
  using (creator_id = auth.uid()) with check (creator_id = auth.uid());

drop policy if exists "teams_delete_creator" on public.teams;
create policy "teams_delete_creator" on public.teams for delete to authenticated
  using (creator_id = auth.uid());

-- team_members: вижу участников команд, где я создатель/участник, и свои строки
drop policy if exists "members_select_involved" on public.team_members;
create policy "members_select_involved" on public.team_members for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_team_creator(team_id, auth.uid())
    or public.is_team_member(team_id, auth.uid())
  );

-- добавлять участников может создатель команды (или сам себя)
drop policy if exists "members_insert_by_creator" on public.team_members;
create policy "members_insert_by_creator" on public.team_members for insert to authenticated
  with check (
    public.is_team_creator(team_id, auth.uid())
    or user_id = auth.uid()
  );

-- приглашённый меняет статус только своей строки (принять/отклонить)
drop policy if exists "members_update_own" on public.team_members;
create policy "members_update_own" on public.team_members for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- удалить участника может создатель; сам участник может выйти
drop policy if exists "members_delete_self_or_creator" on public.team_members;
create policy "members_delete_self_or_creator" on public.team_members for delete to authenticated
  using (user_id = auth.uid() or public.is_team_creator(team_id, auth.uid()));

-- =========================================================
-- 4. RPC: создать команду атомарно (создатель + приглашённые)
-- =========================================================
create or replace function public.create_team(
  p_activity   text,
  p_city       text,
  p_district   text,
  p_wish_date  date,
  p_wish_time  time,
  p_member_ids uuid[]
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_team uuid;
  v_uid  uuid := auth.uid();
  m      uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.teams (creator_id, activity, city, district, wish_date, wish_time)
  values (v_uid, p_activity, p_city, p_district, p_wish_date, p_wish_time)
  returning id into v_team;

  -- создатель сразу в команде
  insert into public.team_members (team_id, user_id, status)
  values (v_team, v_uid, 'accepted');

  -- приглашённые
  if p_member_ids is not null then
    foreach m in array p_member_ids loop
      if m <> v_uid then
        insert into public.team_members (team_id, user_id, status)
        values (v_team, m, 'invited')
        on conflict (team_id, user_id) do nothing;
      end if;
    end loop;
  end if;

  return v_team;
end;
$$;

grant execute on function public.create_team(text, text, text, date, time, uuid[]) to authenticated;

-- =========================================================
-- 5. Обновляем find_matches — добавляем поля МОЕГО желания
--    (нужно для контекста команды: моя дата/время/район).
--    Сначала DROP — иначе Postgres не даёт сменить набор колонок (42P13).
-- =========================================================
drop function if exists public.find_matches();

create or replace function public.find_matches()
returns table (
  my_wish_id    uuid,
  my_activity   text,
  my_city       text,
  my_district   text,
  my_wish_date  date,
  my_wish_time  time,
  match_wish_id uuid,
  match_user_id uuid,
  activity      text,
  city          text,
  district      text,
  wish_date     date,
  wish_time     time,
  display_name  text,
  username      text,
  avatar_url    text
)
language sql stable security invoker as $$
  select
    mine.id, mine.activity, mine.city, mine.district, mine.wish_date, mine.wish_time,
    other.id, other.user_id,
    other.activity, other.city, other.district, other.wish_date, other.wish_time,
    p.display_name, p.username, p.avatar_url
  from public.wishes mine
  join public.wishes other
    on  other.activity  = mine.activity
    and other.city      = mine.city
    and other.wish_date = mine.wish_date
    and other.status    = 'active'
    and other.user_id  <> mine.user_id
    and (mine.wish_time is null or other.wish_time is null or mine.wish_time = other.wish_time)
  left join public.profiles p on p.id = other.user_id
  where mine.user_id = auth.uid() and mine.status = 'active'
  order by other.wish_date asc, other.wish_time asc nulls first;
$$;

grant execute on function public.find_matches() to authenticated;
