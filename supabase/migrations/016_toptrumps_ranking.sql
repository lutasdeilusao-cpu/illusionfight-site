-- Migration 016: Top Trumps Ranking System
-- Tabela de ranking mensal ranqueado do Top Trumps
-- Period: 'YYYY-MM' (mês corrente)
-- Máximo de MAX_RANKED_PLAYS_DIA = 5 partidas ranqueadas por dia

CREATE TABLE IF NOT EXISTS toptrumps_ranking (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period TEXT NOT NULL DEFAULT '',
  score INTEGER NOT NULL DEFAULT 0,
  ranked_wins INTEGER NOT NULL DEFAULT 0,
  ranked_plays_today INTEGER NOT NULL DEFAULT 0,
  ranked_plays_date TEXT DEFAULT '',
  country_code TEXT DEFAULT 'BR',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period)
);

-- Índice para consultas de ranking ordenadas por score
CREATE INDEX IF NOT EXISTS idx_toptrumps_ranking_score ON toptrumps_ranking(period, score DESC);

-- Índice para filtro por país
CREATE INDEX IF NOT EXISTS idx_toptrumps_ranking_country ON toptrumps_ranking(period, country_code, score DESC);

ALTER TABLE toptrumps_ranking ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can read ranking" ON toptrumps_ranking
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own ranking" ON toptrumps_ranking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ranking" ON toptrumps_ranking
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_toptrumps_ranking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_toptrumps_ranking_updated_at
  BEFORE UPDATE ON toptrumps_ranking
  FOR EACH ROW
  EXECUTE FUNCTION update_toptrumps_ranking_updated_at();
