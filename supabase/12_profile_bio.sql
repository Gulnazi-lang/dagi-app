-- Поле «О себе / хобби» в профиле.
-- Видно другим (как имя/аватар) — помогает понять, с кем идёшь на активность.

alter table public.profiles add column if not exists bio text;

-- Мягкое ограничение длины (до 300 символов).
alter table public.profiles drop constraint if exists profiles_bio_len;
alter table public.profiles
  add constraint profiles_bio_len check (bio is null or char_length(bio) <= 300);
