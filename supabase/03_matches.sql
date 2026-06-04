-- DAGI — Шаг 3: совпадения (поиск людей с тем же желанием).
-- Выполни в Supabase: SQL Editor → New query → вставь → Run.
--
-- Правило совпадения: тот же под-вид активности, тот же город, та же дата,
-- статус 'active', другой человек. Правило времени:
--   мой NULL (гибкий) или его NULL (гибкий) → подходит;
--   иначе только точное совпадение времени.
-- Геофильтр по радиусу/координатам добавим позже (PostGIS).

create or replace function public.find_matches()
returns table (
  my_wish_id    uuid,
  my_activity   text,
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
language sql
stable
security invoker
as $$
  select
    mine.id        as my_wish_id,
    mine.activity  as my_activity,
    other.id       as match_wish_id,
    other.user_id  as match_user_id,
    other.activity,
    other.city,
    other.district,
    other.wish_date,
    other.wish_time,
    p.display_name,
    p.username,
    p.avatar_url
  from public.wishes mine
  join public.wishes other
    on  other.activity  = mine.activity
    and other.city      = mine.city
    and other.wish_date = mine.wish_date
    and other.status    = 'active'
    and other.user_id  <> mine.user_id
    and (
      mine.wish_time is null
      or other.wish_time is null
      or mine.wish_time = other.wish_time
    )
  left join public.profiles p on p.id = other.user_id
  where mine.user_id = auth.uid()
    and mine.status = 'active'
  order by other.wish_date asc, other.wish_time asc nulls first;
$$;

grant execute on function public.find_matches() to authenticated;
