-- 050 — Save do Lendas do LDI (jogo de texto sem ficha).
-- Uma linha por jogo: o nome do personagem, a Veia escolhida (linha de
-- conhecimento, id 1–5: Fio Solto, Lona, Faro, Caô, Estática — nomes no i18n) e
-- o nível nela (0–5), onde parou na história, flags, pistas e o diário das
-- escolhas. Só o dono lê e escreve.

create table if not exists public.lendas_saves (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  nome         text not null default '',
  veia         smallint,
  nivel        smallint not null default 0 check (nivel between 0 and 5),
  cena         text not null default '1.1',
  ato          smallint not null default 1,
  flags        jsonb not null default '{}'::jsonb,
  pistas       jsonb not null default '[]'::jsonb,
  diario       jsonb not null default '[]'::jsonb,
  status       text not null default 'ativo',
  criado_em    timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint lendas_saves_veia check (veia is null or veia between 1 and 5)
);

create index if not exists lendas_saves_user_idx on public.lendas_saves (user_id, atualizado_em desc);
alter table public.lendas_saves enable row level security;

drop policy if exists lendas_saves_ler on public.lendas_saves;
create policy lendas_saves_ler on public.lendas_saves for select using (auth.uid() = user_id);
drop policy if exists lendas_saves_inserir on public.lendas_saves;
create policy lendas_saves_inserir on public.lendas_saves for insert with check (auth.uid() = user_id);
drop policy if exists lendas_saves_atualizar on public.lendas_saves;
create policy lendas_saves_atualizar on public.lendas_saves for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists lendas_saves_apagar on public.lendas_saves;
create policy lendas_saves_apagar on public.lendas_saves for delete using (auth.uid() = user_id);
