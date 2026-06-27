-- GiST spatial indexes for geo-radius queries (ST_DWithin on geography).
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).
--
-- Uses geography() function instead of ::geography cast — the cast form
-- causes "syntax error at ::" inside CREATE INDEX on Supabase PostgreSQL.

CREATE INDEX IF NOT EXISTS wishes_location_gist
  ON public.wishes
  USING GIST (geography(ST_SetSRID(ST_MakePoint(lng, lat), 4326)))
  WHERE lat IS NOT NULL AND lng IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_location_gist
  ON public.profiles
  USING GIST (geography(ST_SetSRID(ST_MakePoint(lng, lat), 4326)))
  WHERE lat IS NOT NULL AND lng IS NOT NULL;
