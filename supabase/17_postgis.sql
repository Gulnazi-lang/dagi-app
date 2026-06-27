-- DUD — PostGIS: геолокация + глобальный поиск по радиусу.
-- Выполни в Supabase: SQL Editor → New query → вставь всё → Run.

-- =========================================================
-- 1. Расширение PostGIS
-- =========================================================
create extension if not exists postgis;

-- =========================================================
-- 2. Координаты в таблицах (nullable — обратная совместимость)
-- =========================================================
alter table public.wishes
  add column if not exists lat double precision,
  add column if not exists lng double precision;

alter table public.profiles
  add column if not exists lat double precision,
  add column if not exists lng double precision;

-- Индекс для ST_DWithin (работает только по строкам с координатами)
create index if not exists wishes_geo_idx
  on public.wishes using gist (
    st_point(lng, lat)::geography
  )
  where lat is not null and lng is not null;

-- =========================================================
-- 3. find_matches — ST_DWithin если оба с координатами,
--    иначе старый матч по городу (обратная совместимость).
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
    and other.status    = 'active'
    and other.user_id  <> mine.user_id
    and (mine.wish_date is null or other.wish_date is null or mine.wish_date = other.wish_date)
    and (mine.wish_time is null or other.wish_time is null or mine.wish_time = other.wish_time)
    and (
      -- Оба с координатами → расстояние через PostGIS
      (
        mine.lat is not null and mine.lng is not null
        and other.lat is not null and other.lng is not null
        and st_dwithin(
          st_point(mine.lng, mine.lat)::geography,
          st_point(other.lng, other.lat)::geography,
          least(mine.radius_km, other.radius_km) * 1000
        )
      )
      or
      -- Хотя бы один без координат → старый матч по городу
      (
        (mine.lat is null or other.lat is null)
        and other.city = mine.city
      )
    )
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
-- 4. browse_activity_counts — добавляем гео-фильтр
--    (старый вызов с p_city по-прежнему работает через дефолты)
-- =========================================================
drop function if exists public.browse_activity_counts(text);

create or replace function public.browse_activity_counts(
  p_city      text            default null,
  p_lat       double precision default null,
  p_lng       double precision default null,
  p_radius_km int             default 20
)
returns table (activity text, cnt int)
language sql stable security definer set search_path = public as $$
  select w.activity, count(*)::int as cnt
  from public.wishes w
  where w.status = 'active'
    and (w.wish_date is null or w.wish_date >= current_date)
    and (
      -- Гео-фильтр (если переданы координаты и у желания тоже есть гео)
      (
        p_lat is not null and p_lng is not null
        and w.lat is not null and w.lng is not null
        and st_dwithin(
          st_point(w.lng, w.lat)::geography,
          st_point(p_lng, p_lat)::geography,
          p_radius_km * 1000
        )
      )
      or
      -- Текстовый фильтр по городу (старый режим или желания без гео)
      (
        p_lat is null
        and (p_city is null or w.city = p_city)
      )
    )
  group by w.activity
  order by count(*) desc, w.activity asc;
$$;

grant execute on function public.browse_activity_counts(text, double precision, double precision, int) to authenticated;

-- =========================================================
-- 5. browse_activity_slots — добавляем гео-фильтр
-- =========================================================
drop function if exists public.browse_activity_slots(text, text);

create or replace function public.browse_activity_slots(
  p_city      text,
  p_activity  text,
  p_lat       double precision default null,
  p_lng       double precision default null,
  p_radius_km int             default 20
)
returns table (wish_date date, wish_time time, cnt int)
language sql stable security definer set search_path = public as $$
  select w.wish_date, w.wish_time, count(*)::int as cnt
  from public.wishes w
  where w.status = 'active'
    and (w.wish_date is null or w.wish_date >= current_date)
    and w.activity = p_activity
    and (
      (
        p_lat is not null and p_lng is not null
        and w.lat is not null and w.lng is not null
        and st_dwithin(
          st_point(w.lng, w.lat)::geography,
          st_point(p_lng, p_lat)::geography,
          p_radius_km * 1000
        )
      )
      or
      (
        p_lat is null
        and (p_city is null or w.city = p_city)
      )
    )
  group by w.wish_date, w.wish_time
  order by w.wish_date asc nulls first, w.wish_time asc nulls first;
$$;

grant execute on function public.browse_activity_slots(text, text, double precision, double precision, int) to authenticated;
