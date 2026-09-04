-- Migration 031: Modo história do LD Gangues — progresso salvo por usuário
-- Uma linha por usuário (é o progresso da "gangue", não da ficha de personagem).
-- Antes disso o progresso (storyProgress, cenaProgresso, grana, rep, nome da gangue)
-- vivia só em localStorage — mesmo usuário logado perdia tudo ao trocar de
-- dispositivo/navegador ou limpar dados do site.

CREATE TABLE IF NOT EXISTS gangues_story_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gang_name TEXT NOT NULL DEFAULT '',
  story_progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  cena_progresso JSONB NOT NULL DEFAULT '{}'::jsonb,
  grana INTEGER NOT NULL DEFAULT 0,
  rep INTEGER NOT NULL DEFAULT 0,
  atualizada_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE gangues_story_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own gangues story progress" ON gangues_story_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gangues story progress" ON gangues_story_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gangues story progress" ON gangues_story_progress
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own gangues story progress" ON gangues_story_progress
  FOR DELETE USING (auth.uid() = user_id);
