-- Top Trumps Multiplayer — Schema

create table if not exists public.toptrumps_salas (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  status text not null default 'aguardando'
    check (status in ('aguardando', 'confirmando_aposta', 'em_jogo', 'encerrada', 'cancelada')),
  modo text not null check (modo in ('free', 'apostado')),
  tipo_sala text not null default 'publica' check (tipo_sala in ('privada', 'publica')),
  jogador1_id uuid references auth.users(id) on delete cascade,
  jogador2_id uuid references auth.users(id) on delete cascade,
  turnos_j1 integer,
  turnos_j2 integer,
  total_turnos integer,
  turno_atual integer default 1,
  jogador_da_vez uuid references auth.users(id),
  pontos_j1 integer default 0,
  pontos_j2 integer default 0,
  carta_aposta_j1 integer,
  carta_aposta_j2 integer,
  aposta_confirmada_j1 boolean default false,
  aposta_confirmada_j2 boolean default false,
  resultado text check (resultado in ('j1_venceu', 'j2_venceu', 'empate')),
  criada_em timestamptz default now(),
  atualizada_em timestamptz default now()
);

create table if not exists public.toptrumps_movimentos (
  id uuid primary key default gen_random_uuid(),
  sala_id uuid references public.toptrumps_salas(id) on delete cascade,
  turno integer not null,
  jogador_id uuid references auth.users(id),
  carta_id integer not null,
  atributo text not null,
  foi_ia boolean default false,
  criado_em timestamptz default now()
);

create table if not exists public.toptrumps_mp_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_partidas integer default 0,
  total_vitorias integer default 0,
  total_derrotas integer default 0,
  total_empates integer default 0,
  streak_atual integer default 0,
  melhor_streak integer default 0,
  partidas_hoje integer default 0,
  partidas_hoje_data date default current_date,
  atualizado_em timestamptz default now()
);

alter table public.toptrumps_salas enable row level security;
alter table public.toptrumps_movimentos enable row level security;
alter table public.toptrumps_mp_stats enable row level security;

create policy "jogadores veem sala" on public.toptrumps_salas
  for select using (auth.uid() = jogador1_id or auth.uid() = jogador2_id or status = 'aguardando');

create policy "jogador1 cria sala" on public.toptrumps_salas
  for insert with check (auth.uid() = jogador1_id);

create policy "jogadores atualizam sala" on public.toptrumps_salas
  for update using (auth.uid() = jogador1_id or auth.uid() = jogador2_id);

create policy "jogadores veem movimentos" on public.toptrumps_movimentos
  for select using (exists (select 1 from public.toptrumps_salas s where s.id = sala_id and (s.jogador1_id = auth.uid() or s.jogador2_id = auth.uid())));

create policy "jogadores inserem movimentos" on public.toptrumps_movimentos
  for insert with check (auth.uid() = jogador_id);

create policy "usuario ve proprias mp_stats" on public.toptrumps_mp_stats
  for select using (auth.uid() = user_id);

create policy "usuario upsert proprias mp_stats" on public.toptrumps_mp_stats
  for all using (auth.uid() = user_id);

alter publication supabase_realtime add table public.toptrumps_salas;
alter publication supabase_realtime add table public.toptrumps_movimentos;
