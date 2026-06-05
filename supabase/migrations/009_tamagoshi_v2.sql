-- Migration 009: Tamagoshi v2 — DIX wallet, badges, fama, inventário
-- carteira DIX
create table if not exists public.dix_wallet (
  user_id     uuid references auth.users(id) on delete cascade primary key,
  saldo       int not null default 0,
  updated_at  timestamptz default now()
);
alter table public.dix_wallet enable row level security;
create policy "usuario le propria wallet"
  on public.dix_wallet for select using (auth.uid() = user_id);
create policy "usuario atualiza propria wallet"
  on public.dix_wallet for update using (auth.uid() = user_id);
create policy "usuario insere propria wallet"
  on public.dix_wallet for insert with check (auth.uid() = user_id);

-- histórico DIX
create table if not exists public.dix_historico (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  valor       int not null,
  motivo      text not null,
  created_at  timestamptz default now()
);
alter table public.dix_historico enable row level security;
create policy "usuario le proprio historico"
  on public.dix_historico for select using (auth.uid() = user_id);
create policy "usuario insere proprio historico"
  on public.dix_historico for insert with check (auth.uid() = user_id);

-- badges do tamagoshi
create table if not exists public.tamagoshi_badges (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  criatura_id   text not null,
  badge_id      text not null,
  conquistado_em timestamptz default now()
);
alter table public.tamagoshi_badges enable row level security;
create policy "usuario le proprias badges"
  on public.tamagoshi_badges for select using (auth.uid() = user_id);
create policy "usuario insere proprias badges"
  on public.tamagoshi_badges for insert with check (auth.uid() = user_id);

-- salão da fama
create table if not exists public.tamagoshi_fama (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  criatura_id   text not null,
  nome_custom   text,
  fase_final    text not null,
  partida_em    timestamptz default now(),
  badges        jsonb not null default '[]'
);
alter table public.tamagoshi_fama enable row level security;
create policy "usuario le proprio fama"
  on public.tamagoshi_fama for select using (auth.uid() = user_id);
create policy "usuario insere proprio fama"
  on public.tamagoshi_fama for insert with check (auth.uid() = user_id);

-- inventario column on tamagoshi_saves
alter table public.tamagoshi_saves
  add column if not exists inventario jsonb not null default '{}';
