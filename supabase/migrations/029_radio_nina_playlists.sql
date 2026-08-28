-- Migration 029: Rádio Nina — playlist salva por usuário (conta free+)
-- Uma playlist por usuário. `faixas` = array de nomes de arquivo (.mp3) do bucket R2.

CREATE TABLE IF NOT EXISTS radio_nina_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  faixas JSONB NOT NULL DEFAULT '[]'::jsonb,
  atualizada_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE radio_nina_playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own radio playlist" ON radio_nina_playlists
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own radio playlist" ON radio_nina_playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own radio playlist" ON radio_nina_playlists
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own radio playlist" ON radio_nina_playlists
  FOR DELETE USING (auth.uid() = user_id);
