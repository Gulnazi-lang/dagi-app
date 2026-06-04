-- DAGI — Полировка: «живые» статусы в «Командах».
-- Выполни в Supabase: SQL Editor → New query → вставь → Run.
--
-- Добавляем teams и team_members в realtime-публикацию, чтобы изменения
-- (принял/вышел/вернулся, «игра состоялась», роспуск, новое приглашение)
-- прилетали подписчикам без перезагрузки. RLS остаётся в силе — каждый
-- получает события только по тем строкам, которые ему разрешено видеть.

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'team_members'
  ) then
    alter publication supabase_realtime add table public.team_members;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'teams'
  ) then
    alter publication supabase_realtime add table public.teams;
  end if;
end $$;
