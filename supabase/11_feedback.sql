-- DAGI — Отзывы / предложения новых активностей (feedback).
-- Выполни в Supabase: SQL Editor → New query → вставь всё → Run.
--
-- Пользователь пишет отзыв прямо в Профиле и жмёт «Отправить». Запись идёт через
-- RPC (security definer). Читать может только администрация — ты, в дашборде
-- Supabase (Table editor → feedback). Обычным пользователям таблица закрыта.

create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists feedback_created_idx on public.feedback (created_at desc);

alter table public.feedback enable row level security;
-- Намеренно НЕ создаём политик: для обычных пользователей таблица полностью
-- закрыта. Запись только через RPC ниже; чтение — у админа (service role).

create or replace function public.submit_feedback(p_body text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_text text := btrim(coalesce(p_body, ''));
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  if v_text = '' then
    raise exception 'empty feedback';
  end if;
  insert into public.feedback (user_id, body) values (v_uid, left(v_text, 2000));
end;
$$;

grant execute on function public.submit_feedback(text) to authenticated;
