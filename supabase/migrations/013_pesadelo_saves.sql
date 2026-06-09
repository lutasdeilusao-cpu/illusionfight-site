-- Pesadelo Particular — Migração para sistema de 3 slots
-- Cria tabela pesadelo_saves com suporte a múltiplos slots por usuário

CREATE TABLE IF NOT EXISTS pesadelo_saves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slot INTEGER NOT NULL CHECK (slot IN (1, 2, 3)),
  reputacao INTEGER DEFAULT 0,
  casos_resolvidos TEXT[] DEFAULT '{}',
  pistas_coletadas JSONB DEFAULT '{}',
  acusacoes_erradas JSONB DEFAULT '{}',
  caso_atual INTEGER,
  progresso JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slot)
);

ALTER TABLE pesadelo_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own pesadelo saves"
  ON pesadelo_saves FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
