-- Анкета профиля «о себе» (вместо/в дополнение к свободному bio).
-- Хранится как jsonb: { "<вопрос>": ["<вариант>", ...], ... }.
-- Ответы — фиксированные ключи (переводятся в приложении на 10 языков),
-- поэтому профиль читается на любом языке независимо от автора.

alter table public.profiles add column if not exists traits jsonb not null default '{}'::jsonb;

-- Мягкая защита: traits должен быть объектом (а не массивом/скаляром).
alter table public.profiles drop constraint if exists profiles_traits_obj;
alter table public.profiles
  add constraint profiles_traits_obj check (jsonb_typeof(traits) = 'object');
