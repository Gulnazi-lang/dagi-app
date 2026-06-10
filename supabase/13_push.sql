-- Push-подписки (Web Push). Одна строка = один браузер/устройство пользователя.
create table if not exists public.push_subscriptions (
  user_id    uuid not null references auth.users(id) on delete cascade,
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  locale     text,
  created_at timestamptz not null default now(),
  primary key (user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

-- Пользователь управляет только своими подписками.
-- (Отправщик /api/notify читает чужие подписки через service-role, в обход RLS.)
drop policy if exists "push own select" on public.push_subscriptions;
create policy "push own select" on public.push_subscriptions
  for select using (user_id = auth.uid());

drop policy if exists "push own insert" on public.push_subscriptions;
create policy "push own insert" on public.push_subscriptions
  for insert with check (user_id = auth.uid());

drop policy if exists "push own update" on public.push_subscriptions;
create policy "push own update" on public.push_subscriptions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "push own delete" on public.push_subscriptions;
create policy "push own delete" on public.push_subscriptions
  for delete using (user_id = auth.uid());
