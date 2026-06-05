-- Migration 006: Tamagoshi LDI
CREATE TABLE IF NOT EXISTS tamagoshi_saves (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot INT NOT NULL DEFAULT 1,
  criatura_id TEXT,
  nome_custom TEXT,
  personalidade TEXT,
  fase TEXT DEFAULT 'ovo',
  estagio INT DEFAULT 0,
  fome INT DEFAULT 100,
  higiene INT DEFAULT 100,
  energia INT DEFAULT 100,
  humor INT DEFAULT 100,
  ultima_alimentacao TIMESTAMPTZ,
  ultima_higiene TIMESTAMPTZ,
  ultimo_passeio TIMESTAMPTZ,
  ultima_brincadeira TIMESTAMPTZ,
  dias_cuidado_streak INT DEFAULT 0,
  dias_perfeito_streak INT DEFAULT 0,
  nascido_em TIMESTAMPTZ,
  status TEXT,
  cooldown_ate TIMESTAMPTZ,
  flags JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  version TEXT,
  PRIMARY KEY (user_id, slot)
);

ALTER TABLE tamagoshi_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can upsert own tamagoshi_saves"
  ON tamagoshi_saves
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
