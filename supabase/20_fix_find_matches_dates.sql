-- Fix: find_matches теперь исключает желания с прошедшими датами.
-- Раньше старые желания (напр. 19.06.2026) продолжали показываться в совпадениях.
-- Run in Supabase SQL Editor.

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
    -- Дата: совпадает или хотя бы одно «любая дата»; прошедшие даты исключаем
    and (mine.wish_date  is null or mine.wish_date  >= current_date)
    and (other.wish_date is null or other.wish_date >= current_date)
    and (mine.wish_date is null or other.wish_date is null or mine.wish_date = other.wish_date)
    and (mine.wish_time is null or other.wish_time is null or mine.wish_time = other.wish_time)
    and (
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
