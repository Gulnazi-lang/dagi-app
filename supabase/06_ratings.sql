-- DAGI — Шаг 6 (часть 1): оценка после игры + рейтинг ★.
-- Выполни в Supabase: SQL Editor → New query → вставь → Run.
--
-- Две вещи:
--  1) Посещаемость: организатор отмечает по каждому — пришёл / не пришёл.
--  2) Оценка партнёров: КАЖДЫЙ ставит каждому 👍 отлично / = нормально / 👎 ужасно.
-- Оценка открывается, когда организатор нажмёт «Игра состоялась» (teams.status='done').
-- Сами оценки приватны (кто кого оценил — не видно); наружу идёт только агрегат.

-- =========================================================
-- 1. Посещаемость — флаг на участнике (ставит организатор)
-- =========================================================
alter table public.team_members
  add column if not exists attended boolean;  -- null = не отмечено, true = был, false = не был

-- RPC: организатор отмечает посещаемость участника
create or replace function public.set_attendance(
  p_team uuid, p_user uuid, p_attended boolean
) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_team_creator(p_team, auth.uid()) then
    raise exception 'only creator can set attendance';
  end if;
  update public.team_members
    set attended = p_attended
    where team_id = p_team and user_id = p_user;
end;
$$;

grant execute on function public.set_attendance(uuid, uuid, boolean) to authenticated;

-- =========================================================
-- 2. Оценки партнёров (👍 +1 / = 0 / 👎 -1)
-- =========================================================
create table if not exists public.ratings (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid not null references public.teams (id) on delete cascade,
  rater_id   uuid not null references auth.users (id) on delete cascade,
  ratee_id   uuid not null references auth.users (id) on delete cascade,
  score      smallint not null check (score in (-1, 0, 1)),
  created_at timestamptz not null default now(),
  unique (team_id, rater_id, ratee_id),
  check (rater_id <> ratee_id)
);

create index if not exists ratings_ratee_idx on public.ratings (ratee_id);

alter table public.ratings enable row level security;

-- видеть можно только СВОИ оценки (приватность; наружу — только агрегат через view)
drop policy if exists "ratings_select_own" on public.ratings;
create policy "ratings_select_own" on public.ratings for select to authenticated
  using (rater_id = auth.uid());

-- ставить оценку может участник команды, только от своего имени
drop policy if exists "ratings_insert_member" on public.ratings;
create policy "ratings_insert_member" on public.ratings for insert to authenticated
  with check (
    rater_id = auth.uid()
    and public.is_team_member(team_id, auth.uid())
  );

-- менять свою оценку
drop policy if exists "ratings_update_own" on public.ratings;
create policy "ratings_update_own" on public.ratings for update to authenticated
  using (rater_id = auth.uid()) with check (rater_id = auth.uid());

-- удалить свою оценку
drop policy if exists "ratings_delete_own" on public.ratings;
create policy "ratings_delete_own" on public.ratings for delete to authenticated
  using (rater_id = auth.uid());

-- =========================================================
-- 3. Публичный агрегат репутации (без раскрытия, кто кого оценил).
--    View по умолчанию выполняется с правами владельца (postgres),
--    поэтому RLS базовых таблиц обходится — наружу идут только суммы.
-- =========================================================
create or replace view public.user_reputation as
select
  p.id as user_id,
  coalesce(r.up, 0)       as up,
  coalesce(r.ok, 0)       as ok,
  coalesce(r.down, 0)     as down,
  coalesce(a.attended, 0) as attended,
  coalesce(a.missed, 0)   as missed
from public.profiles p
left join (
  select ratee_id,
    count(*) filter (where score = 1)  as up,
    count(*) filter (where score = 0)  as ok,
    count(*) filter (where score = -1) as down
  from public.ratings
  group by ratee_id
) r on r.ratee_id = p.id
left join (
  select user_id,
    count(*) filter (where attended is true)  as attended,
    count(*) filter (where attended is false) as missed
  from public.team_members
  group by user_id
) a on a.user_id = p.id;

grant select on public.user_reputation to authenticated;
