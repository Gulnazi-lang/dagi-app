-- DUD — «Любой день»: гибкая дата у желания (NULL = подходит к любому дню),
-- по аналогии с «время не важно» (NULL time).
-- Выполни в Supabase: SQL Editor → New query → вставь всё → Run.

-- =========================================================
-- 1. Разрешаем NULL у даты (желания и команды)
-- =========================================================
alter table public.wishes alter column wish_date drop not null;
alter table public.teams  alter column wish_date drop not null;

comment on column public.wishes.wish_date is 'NULL = любой день (гибкий); иначе конкретная дата.';

-- =========================================================
-- 2. find_matches — NULL-дата подходит к любой (как с временем).
--    Набор колонок не меняется → create or replace без drop.
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
    and other.status    = 'active'
    and other.user_id  <> mine.user_id
    and (mine.wish_date is null or other.wish_date is null or mine.wish_date = other.wish_date)
    and (mine.wish_time is null or other.wish_time is null or mine.wish_time = other.wish_time)
  left join public.profiles p on p.id = other.user_id
  where mine.user_id = auth.uid() and mine.status = 'active'
    and not exists (
      select 1 from public.blocks b
      where (b.blocker_id = mine.user_id  and b.blocked_id = other.user_id)
         or (b.blocker_id = other.user_id and b.blocked_id = mine.user_id)
    )
  order by other.wish_date asc nulls first, other.wish_time asc nulls first;
$$;

grant execute on function public.find_matches() to authenticated;

-- =========================================================
-- 3. browse — учитываем желания «любой день» (wish_date is null)
-- =========================================================
create or replace function public.browse_activity_counts(p_city text default null)
returns table (activity text, cnt int)
language sql stable security definer set search_path = public as $$
  select w.activity, count(*)::int as cnt
  from public.wishes w
  where w.status = 'active'
    and (w.wish_date is null or w.wish_date >= current_date)
    and (p_city is null or w.city = p_city)
  group by w.activity
  order by count(*) desc, w.activity asc;
$$;

grant execute on function public.browse_activity_counts(text) to authenticated;

create or replace function public.browse_activity_slots(p_city text, p_activity text)
returns table (wish_date date, wish_time time, cnt int)
language sql stable security definer set search_path = public as $$
  select w.wish_date, w.wish_time, count(*)::int as cnt
  from public.wishes w
  where w.status = 'active'
    and (w.wish_date is null or w.wish_date >= current_date)
    and w.activity = p_activity
    and (p_city is null or w.city = p_city)
  group by w.wish_date, w.wish_time
  order by w.wish_date asc nulls first, w.wish_time asc nulls first;
$$;

grant execute on function public.browse_activity_slots(text, text) to authenticated;
