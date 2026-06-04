-- DAGI — Шаг 5: чат команды (сообщения + realtime).
-- Выполни в Supabase: SQL Editor → New query → вставь → Run.
--
-- Каждая команда = чат. Писать и читать могут только участники команды
-- (любой статус: invited/accepted/declined — чтобы договориться до решения).

-- =========================================================
-- 1. Таблица сообщений
-- =========================================================
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid not null references public.teams (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists messages_team_idx on public.messages (team_id, created_at);

-- =========================================================
-- 2. RLS — только участники команды
-- =========================================================
alter table public.messages enable row level security;

-- читать сообщения может участник команды
drop policy if exists "messages_select_member" on public.messages;
create policy "messages_select_member" on public.messages for select to authenticated
  using (public.is_team_member(team_id, auth.uid()));

-- писать может участник, и только от своего имени
drop policy if exists "messages_insert_member" on public.messages;
create policy "messages_insert_member" on public.messages for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.is_team_member(team_id, auth.uid())
  );

-- удалить можно только своё сообщение
drop policy if exists "messages_delete_own" on public.messages;
create policy "messages_delete_own" on public.messages for delete to authenticated
  using (user_id = auth.uid());

-- =========================================================
-- 3. Realtime — добавляем таблицу в публикацию,
--    чтобы новые сообщения прилетали мгновенно.
-- =========================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;
