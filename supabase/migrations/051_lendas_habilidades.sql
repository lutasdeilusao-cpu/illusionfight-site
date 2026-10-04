-- 051 — Lendas do LDI: a jornada guarda as habilidades aprendidas (ids da
-- Veia, ex. [31, 32]) em vez de um nível.
alter table public.lendas_saves add column if not exists habilidades jsonb not null default '[]'::jsonb;
alter table public.lendas_saves drop column if exists nivel;
