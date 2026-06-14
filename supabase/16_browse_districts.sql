-- «Все желания» → внутри выбранного слота (активность + дата + время) —
-- разбивка по РАЙОНАМ со счётчиком людей. Клик по группе района = человек
-- вписывается в этот район (создаётся его желание). Только в рамках одного
-- города (районы привязаны к городу), поэтому p_city здесь обязателен по смыслу.
--
-- p_date / p_time = NULL означает слот «любой день» / «время не важно»
-- (сопоставляем строго: NULL совпадает только с NULL — is not distinct from).
-- Анонимно: отдаём только название района и число, без имён/user_id.

create or replace function public.browse_activity_districts(
  p_city text,
  p_activity text,
  p_date date default null,
  p_time time default null
)
returns table (district text, cnt int)
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(w.district, '') as district, count(*)::int as cnt
  from public.wishes w
  where w.status = 'active'
    and (w.wish_date is null or w.wish_date >= current_date)
    and w.activity = p_activity
    and (p_city is null or w.city = p_city)
    and w.wish_date is not distinct from p_date
    and w.wish_time is not distinct from p_time
  group by coalesce(w.district, '')
  order by count(*) desc, district asc;
$$;

grant execute on function public.browse_activity_districts(text, text, date, time) to authenticated;
