-- DAGI — Шаг 6 (часть 3): тихая жалоба (report).
-- Выполни в Supabase: SQL Editor → New query → вставь всё → Run.
--
-- Жалоба приватная: её НЕ видит ни один обычный пользователь (даже автор не
-- читает через приложение). Видит только администрация — ты, в дашборде Supabase
-- (Table editor → reports), где service role обходит RLS. Человек, на которого
-- пожаловались, об этом не узнаёт — потому «тихая».

-- =========================================================
-- 1. Таблица жалоб
-- =========================================================
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reported_id uuid not null references auth.users (id) on delete cascade,
  team_id     uuid references public.teams (id) on delete set null,
  reason      text,
  created_at  timestamptz not null default now(),
  check (reporter_id <> reported_id)
);

create index if not exists reports_reported_idx on public.reports (reported_id);

-- =========================================================
-- 2. RLS — пользователям читать НЕЛЬЗЯ (политик select нет).
--    Запись идёт через RPC ниже (security definer), прямой insert не нужен.
-- =========================================================
alter table public.reports enable row level security;
-- Намеренно НЕ создаём ни одной политики: для обычных пользователей таблица
-- полностью закрыта (и на чтение, и на запись). Доступ только у админа.

-- =========================================================
-- 3. RPC: пожаловаться (от своего имени)
-- =========================================================
create or replace function public.report_user(
  p_reported uuid,
  p_team     uuid,
  p_reason   text
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  if p_reported = v_uid then
    raise exception 'cannot report yourself';
  end if;
  insert into public.reports (reporter_id, reported_id, team_id, reason)
  values (v_uid, p_reported, p_team, nullif(btrim(p_reason), ''));
end;
$$;

grant execute on function public.report_user(uuid, uuid, text) to authenticated;
