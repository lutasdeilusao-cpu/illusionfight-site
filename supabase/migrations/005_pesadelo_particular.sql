-- Pesadelo Particular save table
CREATE TABLE IF NOT EXISTS pp_saves (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  reputacao INTEGER DEFAULT 0,
  casos_resolvidos TEXT[] DEFAULT '{}',
  pistas_coletadas JSONB DEFAULT '{}',
  caderno_suspeitas TEXT[] DEFAULT '{}',
  acusacoes_erradas JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pp_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own save" ON pp_saves
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
