-- Fix: adicionar colunas faltantes + triggers
-- Rodar no SQL Editor do Supabase

-- Adicionar updated_at na character_sheets (se não existir)
ALTER TABLE character_sheets
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Adicionar created_at na game_saves (se não existir)
ALTER TABLE game_saves
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Adicionar updated_at na game_saves (se não existir)
ALTER TABLE game_saves
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Trigger function (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers (DROP IF EXISTS + CREATE para ser idempotente)
DROP TRIGGER IF EXISTS update_character_sheets_updated_at ON character_sheets;
CREATE TRIGGER update_character_sheets_updated_at
  BEFORE UPDATE ON character_sheets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_game_saves_updated_at ON game_saves;
CREATE TRIGGER update_game_saves_updated_at
  BEFORE UPDATE ON game_saves
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
