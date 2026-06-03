-- Lendas do LDI — Tabelas para o RPG narrativo
-- Migration 003: character_sheets + game_saves

-- Tabela de fichas de personagem
create table if not exists character_sheets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  sheet_name text not null,
  attributes jsonb not null default '{"F":0,"H":0,"R":0,"A":0,"PdF":0}',
  advantages text[] default '{}',
  disadvantages text[] default '{}',
  perks text[] default '{}',
  specializations text[] default '{}',
  special_skills text[] default '{}',
  weapon text not null,
  elemental text not null,
  xp_total integer default 0,
  created_at timestamptz default now()
);

alter table character_sheets enable row level security;

create policy "user owns sheet"
  on character_sheets
  for all
  using (auth.uid() = user_id);

-- Tabela de saves de jogo
create table if not exists game_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  sheet_id uuid references character_sheets not null,
  arc integer default 1,
  current_scene_id text default '1.1',
  day_in_game integer default 1,
  credits integer default 0,
  pv_current integer not null,
  pm_current integer not null,
  clues_collected jsonb default '[]',
  flags jsonb default '{}',
  inventory jsonb default '[]',
  status text default 'active'
    constraint game_saves_status_check
    check (status in ('active','ended_defeat','ended_victory','ended_fork')),
  last_updated timestamptz default now()
);

alter table game_saves enable row level security;

create policy "user owns save"
  on game_saves
  for all
  using (auth.uid() = user_id);
