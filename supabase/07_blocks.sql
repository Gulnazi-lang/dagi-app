-- DAGI — Шаг 6 (часть 2): блокировка пользователя.
-- Выполни в Supabase: SQL Editor → New query → вставь всё → Run.
--
-- Блокировка добровольная и взаимная по эффекту: если я заблокировал человека,
-- мы перестаём видеть друг друга в «Совпадениях» и не можем звать друг друга
-- в команду. Существующие команды не трогаем. Блокировку можно снять.

-- =========================================================
-- 1. Таблица блокировок
-- =========================================================
create table if not exists public.blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create index if not exists blocks_blocked_idx on public.blocks (blocked_id);

-- =========================================================
-- 2. RLS — каждый управляет только своими блокировками
-- =========================================================
alter table public.blocks enable row level security;

drop policy if exists "blocks_select_own" on public.blocks;
create policy "blocks_select_own" on public.blocks for select to authenticated
  using (blocker_id = auth.uid());

drop policy if exists "blocks_insert_own" on public.blocks;
create policy "blocks_insert_own" on public.blocks for insert to authenticated
  with check (blocker_id = auth.uid());

drop policy if exists "blocks_delete_own" on public.blocks;
create policy "blocks_delete_own" on public.blocks for delete to authenticated
  using (blocker_id = auth.uid());

-- =========================================================
-- 3. RPC: заблокировать / разблокировать (от своего имени)
-- =========================================================
create or replace function public.block_user(p_target uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  if p_target = v_uid then
    raise exception 'cannot block yourself';
  end if;
  insert into public.blocks (blocker_id, blocked_id)
  values (v_uid, p_target)
  on conflict (blocker_id, blocked_id) do nothing;
end;
$$;

grant execute on function public.block_user(uuid) to authenticated;

create or replace function public.unblock_user(p_target uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  delete from public.blocks
  where blocker_id = v_uid and blocked_id = p_target;
end;
$$;

grant execute on function public.unblock_user(uuid) to authenticated;

-- =========================================================
-- 4. find_matches — прячем тех, кто в блокировке (в любую сторону).
--    Набор колонок не меняется → можно create or replace без drop.
-- =========================================================
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
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = mine.user_id  and b.blocked_id = other.user_id)
         or (b.blocker_id = other.user_id and b.blocked_id = mine.user_id)
    )
  order by other.wish_date asc, other.wish_time asc nulls first;
$$;

grant execute on function public.find_matches() to authenticated;

-- =========================================================
-- 5. create_team — нельзя пригласить того, кто в блокировке (в любую сторону).
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

  -- приглашённые (пропускаем себя и тех, кто в блокировке в любую сторону)
  if p_member_ids is not null then
    foreach m in array p_member_ids loop
      if m <> v_uid and not exists (
        select 1 from public.blocks b
        where (b.blocker_id = v_uid and b.blocked_id = m)
           or (b.blocker_id = m and b.blocked_id = v_uid)
      ) then
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
