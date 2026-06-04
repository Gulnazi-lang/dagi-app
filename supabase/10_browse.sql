-- DAGI — «Все желания»: анонимный просмотр спроса по активностям.
-- Выполни в Supabase: SQL Editor → New query → вставь всё → Run.
--
-- Идея: любой вошедший видит, СКОЛЬКО людей хотят ту или иную активность и в
-- какие даты/время — но БЕЗ имён, аватаров, района и точного места. Только
-- агрегированные числа. Поэтому функции security definer и отдают лишь счётчики.
-- p_city = NULL → по всей Латвии (все города); иначе фильтр по городу.

-- =========================================================
-- 1. Счётчики по активностям (для списка)
-- =========================================================
create or replace function public.browse_activity_counts(p_city text default null)
returns table (activity text, cnt int)
language sql
stable
security definer
set search_path = public
as $$
  select w.activity, count(*)::int as cnt
  from public.wishes w
  where w.status = 'active'
    and w.wish_date >= current_date
    and (p_city is null or w.city = p_city)
  group by w.activity
  order by count(*) desc, w.activity asc;
$$;

grant execute on function public.browse_activity_counts(text) to authenticated;

-- =========================================================
-- 2. Слоты (дата + время) по конкретной активности — со счётчиком людей
-- =========================================================
create or replace function public.browse_activity_slots(p_city text, p_activity text)
returns table (wish_date date, wish_time time, cnt int)
language sql
stable
security definer
set search_path = public
as $$
  select w.wish_date, w.wish_time, count(*)::int as cnt
  from public.wishes w
  where w.status = 'active'
    and w.wish_date >= current_date
    and w.activity = p_activity
    and (p_city is null or w.city = p_city)
  group by w.wish_date, w.wish_time
  order by w.wish_date asc, w.wish_time asc nulls first;
$$;

grant execute on function public.browse_activity_slots(text, text) to authenticated;
