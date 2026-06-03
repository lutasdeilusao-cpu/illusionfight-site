-- Top Trumps LDI — Schema de dados persistentes

-- Deck de cartas do jogador
create table if not exists public.toptrumps_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  carta_id integer not null,
  obtida_em timestamptz default now(),
  unique(user_id, carta_id)
);

-- Histórico de partidas
create table if not exists public.toptrumps_partidas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  jogadas integer not null,
  vitorias integer not null,
  derrotas integer not null,
  empates integer not null,
  resultado text not null check (resultado in ('vitoria', 'derrota', 'empate')),
  carta_recompensa integer,
  criada_em timestamptz default now()
);

-- Estatísticas agregadas do jogador
create table if not exists public.toptrumps_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_partidas integer default 0,
  total_vitorias integer default 0,
  total_derrotas integer default 0,
  total_empates integer default 0,
  streak_atual integer default 0,
  melhor_streak integer default 0,
  atualizado_em timestamptz default now()
);

-- RLS
alter table public.toptrumps_decks enable row level security;
alter table public.toptrumps_partidas enable row level security;
alter table public.toptrumps_stats enable row level security;

-- Policies toptrumps_decks
create policy "usuario ve proprio deck" on public.toptrumps_decks
  for select using (auth.uid() = user_id);
create policy "usuario insere no proprio deck" on public.toptrumps_decks
  for insert with check (auth.uid() = user_id);

-- Policies toptrumps_partidas
create policy "usuario ve proprias partidas" on public.toptrumps_partidas
  for select using (auth.uid() = user_id);
create policy "usuario insere proprias partidas" on public.toptrumps_partidas
  for insert with check (auth.uid() = user_id);

-- Policies toptrumps_stats
create policy "usuario ve proprias stats" on public.toptrumps_stats
  for select using (auth.uid() = user_id);
create policy "usuario upsert proprias stats" on public.toptrumps_stats
  for all using (auth.uid() = user_id);
