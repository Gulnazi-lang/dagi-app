-- Fix: wishes created without GPS in non-Latvian cities now appear
-- in nearby browse via city-text fallback (p_city_hint).
--
-- Run in Supabase SQL Editor.

-- =========================================================
-- browse_activity_counts — добавляем p_city_hint
-- =========================================================
drop function if exists public.browse_activity_counts(text, double precision, double precision, int);

create or replace function public.browse_activity_counts(
  p_city      text             default null,
  p_lat       double precision default null,
  p_lng       double precision default null,
  p_radius_km int              default 20,
  p_city_hint text             default null   -- название города пользователя в nearby-режиме
)
returns table (activity text, cnt int)
language sql stable security definer set search_path = public as $$
  select w.activity, count(*)::int as cnt
  from public.wishes w
  where w.status = 'active'
    and (w.wish_date is null or w.wish_date >= current_date)
    and (
      -- 1. Оба с координатами → гео-радиус
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
      -- 2. Nearby-режим, но желание без координат → город совпадает
      (
        p_lat is not null
        and w.lat is null
        and p_city_hint is not null
        and w.city = p_city_hint
      )
      or
      -- 3. Текстовый режим (Латвия) — старый путь
      (
        p_lat is null
        and (p_city is null or w.city = p_city)
      )
    )
  group by w.activity
  order by count(*) desc, w.activity asc;
$$;

grant execute on function public.browse_activity_counts(text, double precision, double precision, int, text) to authenticated;

-- =========================================================
-- browse_activity_slots — то же самое
-- =========================================================
drop function if exists public.browse_activity_slots(text, text, double precision, double precision, int);

create or replace function public.browse_activity_slots(
  p_city      text,
  p_activity  text,
  p_lat       double precision default null,
  p_lng       double precision default null,
  p_radius_km int              default 20,
  p_city_hint text             default null
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
        p_lat is not null
        and w.lat is null
        and p_city_hint is not null
        and w.city = p_city_hint
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

grant execute on function public.browse_activity_slots(text, text, double precision, double precision, int, text) to authenticated;
