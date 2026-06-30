-- Очистка тестовых данных перед запуском рекламы.
-- Удаляет все желания, команды, участников команд и оценки.
-- Профили и пользователи НЕ трогаются.
--
-- Выполни в Supabase: SQL Editor → New query → Run.

-- Порядок важен: сначала зависимые таблицы.
delete from public.ratings;
delete from public.team_members;
delete from public.teams;
delete from public.wishes;

-- Проверка (должно быть 0 во всех строках):
select
  (select count(*) from public.wishes)      as wishes,
  (select count(*) from public.teams)       as teams,
  (select count(*) from public.team_members) as team_members,
  (select count(*) from public.ratings)     as ratings;
