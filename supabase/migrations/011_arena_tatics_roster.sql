-- ARENA TÁTICS v4.0.0 — Roster System
-- Adiciona coluna personagens_ids para salvar IDs dos personagens do roster

-- Garante que a tabela existe
CREATE TABLE IF NOT EXISTS arena_tatica_saves (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adiciona coluna personagens_ids (array de inteiros) se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'arena_tatica_saves' AND column_name = 'personagens_ids'
  ) THEN
    ALTER TABLE arena_tatica_saves ADD COLUMN personagens_ids INTEGER[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'arena_tatica_saves' AND column_name = 'sdr'
  ) THEN
    ALTER TABLE arena_tatica_saves ADD COLUMN sdr INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'arena_tatica_saves' AND column_name = 'xp'
  ) THEN
    ALTER TABLE arena_tatica_saves ADD COLUMN xp INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'arena_tatica_saves' AND column_name = 'nivel'
  ) THEN
    ALTER TABLE arena_tatica_saves ADD COLUMN nivel INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'arena_tatica_saves' AND column_name = 'vitorias'
  ) THEN
    ALTER TABLE arena_tatica_saves ADD COLUMN vitorias INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'arena_tatica_saves' AND column_name = 'derrotas'
  ) THEN
    ALTER TABLE arena_tatica_saves ADD COLUMN derrotas INTEGER DEFAULT 0;
  END IF;
END $$;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_arena_tatica_saves_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_arena_tatica_saves_updated_at ON arena_tatica_saves;
CREATE TRIGGER set_arena_tatica_saves_updated_at
  BEFORE UPDATE ON arena_tatica_saves
  FOR EACH ROW EXECUTE FUNCTION update_arena_tatica_saves_updated_at();
