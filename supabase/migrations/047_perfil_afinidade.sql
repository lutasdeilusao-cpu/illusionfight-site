-- 047 — Afinidade do "Pra você" na CONTA (Isaias, 01/10/2026: "sistema de
-- recomendação baseado no que o usuário mais costuma acessar no produto").
-- Uma linha por conta: o placar do que a pessoa usa (jogos, histórias, WEB
-- SHARD, música) e o histórico de leitura, pra recomendação seguir a pessoa
-- de aparelho em aparelho. Só o dono lê e escreve a própria linha.
create table if not exists public.perfil_afinidade (
  user_id uuid primary key references auth.users(id) on delete cascade,
  dados jsonb not null default '{}'::jsonb,
  atualizado timestamptz not null default now()
);

alter table public.perfil_afinidade enable row level security;

drop policy if exists perfil_afinidade_ler on public.perfil_afinidade;
create policy perfil_afinidade_ler on public.perfil_afinidade
  for select using (auth.uid() = user_id);

drop policy if exists perfil_afinidade_inserir on public.perfil_afinidade;
create policy perfil_afinidade_inserir on public.perfil_afinidade
  for insert with check (auth.uid() = user_id);

drop policy if exists perfil_afinidade_atualizar on public.perfil_afinidade;
create policy perfil_afinidade_atualizar on public.perfil_afinidade
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- trava de tamanho: o placar é pequeno; nada de virar depósito
alter table public.perfil_afinidade drop constraint if exists perfil_afinidade_tamanho;
alter table public.perfil_afinidade add constraint perfil_afinidade_tamanho
  check (pg_column_size(dados) < 65536);
