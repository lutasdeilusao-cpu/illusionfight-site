-- Migration 013: Create fichas (tokens) and fichas_historico tables

-- Main token balance table
CREATE TABLE IF NOT EXISTS fichas (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  saldo INTEGER DEFAULT 0,
  fichas_diarias_coletadas INTEGER DEFAULT 0,
  ultima_coleta DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction history
CREATE TABLE IF NOT EXISTS fichas_historico (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('ganho', 'gasto')),
  motivo TEXT NOT NULL,
  quantidade INTEGER NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fichas_historico_user ON fichas_historico(user_id);
CREATE INDEX IF NOT EXISTS idx_fichas_historico_criado ON fichas_historico(criado_em DESC);

-- Row Level Security
ALTER TABLE fichas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_historico ENABLE ROW LEVEL SECURITY;

-- Fichas policies: users can read and upsert their own row
CREATE POLICY "Users can read own fichas" ON fichas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fichas" ON fichas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fichas" ON fichas
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Fichas historico policies: users can read and insert their own history
CREATE POLICY "Users can read own historico" ON fichas_historico
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own historico" ON fichas_historico
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at trigger for fichas
CREATE OR REPLACE FUNCTION set_fichas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_fichas_updated_at ON fichas;
CREATE TRIGGER set_fichas_updated_at
  BEFORE UPDATE ON fichas
  FOR EACH ROW EXECUTE FUNCTION set_fichas_updated_at();
