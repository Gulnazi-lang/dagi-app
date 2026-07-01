-- Fix: Enable RLS on PostGIS system table spatial_ref_sys (created in public schema).
-- Supabase Security Advisor flags any public table without RLS.
-- spatial_ref_sys is a read-only coordinate reference lookup — safe to allow SELECT for all.

alter table public.spatial_ref_sys enable row level security;

drop policy if exists "spatial_ref_sys public read" on public.spatial_ref_sys;
create policy "spatial_ref_sys public read"
  on public.spatial_ref_sys
  for select
  using (true);

-- Safety net: enable RLS on any other public table that may be missing it.
-- (Runs only if there are additional tables without RLS — no-op otherwise.)
do $$
declare
  rec record;
begin
  for rec in
    select t.tablename
    from pg_tables t
    join pg_class c on c.relname = t.tablename
    join pg_namespace n on n.oid = c.relnamespace
    where t.schemaname = 'public'
      and n.nspname = 'public'
      and c.relkind = 'r'
      and c.relrowsecurity = false
  loop
    execute format('alter table public.%I enable row level security', rec.tablename);
    raise notice 'Enabled RLS on public.%', rec.tablename;
  end loop;
end;
$$;
