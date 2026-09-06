-- Migration 034: LDI Gangues — save slots (múltiplas gangues por conta)
--
-- Antes: gangues_story_progress tinha user_id como PRIMARY KEY (1 gangue por
-- conta, sem jeito de ter elencos/progressos diferentes em paralelo).
-- Agora cada usuário pode ter várias gangues (saves) — uma tela antes do
-- lobby deixa escolher, criar ou apagar um save, pra poder recrutar elencos
-- diferentes sem perder o progresso anterior. Quantos saves por conta é
-- regra de app (GANGUES_SAVE_SLOT_LIMITS em ganguesLoadout.js), não do banco.
--
-- Não existe usuário real usando isso hoje além do dono do site — reset
-- total em vez de migração de dados (pedido explícito, ver conversa).
BEGIN;

DROP TABLE IF EXISTS gangues_story_progress CASCADE;

CREATE TABLE gangues_story_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gang_name TEXT NOT NULL DEFAULT '',
  story_progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  cena_progresso JSONB NOT NULL DEFAULT '{}'::jsonb,
  grana INTEGER NOT NULL DEFAULT 0,
  rep INTEGER NOT NULL DEFAULT 0,
  campaign_clears INTEGER NOT NULL DEFAULT 0 CHECK (campaign_clears >= 0),
  event_character_ids INTEGER[] NOT NULL DEFAULT '{}'
    CHECK (event_character_ids <@ ARRAY[8,9,10,18,19,20,26,28,29,30]::INTEGER[]),
  criada_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  atualizada_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX gangues_story_progress_user_id_idx ON gangues_story_progress (user_id);

ALTER TABLE gangues_story_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own gangues story progress" ON gangues_story_progress
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gangues story progress" ON gangues_story_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gangues story progress" ON gangues_story_progress
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own gangues story progress" ON gangues_story_progress
  FOR DELETE USING (auth.uid() = user_id);

-- character_sheets é compartilhada com "Lendas do LDI" (src/pages/games/LDI/),
-- então save_id fica opcional (NULL) — só o Gangues preenche essa coluna,
-- LDI nunca sabe que ela existe.
ALTER TABLE character_sheets
  ADD COLUMN IF NOT EXISTS save_id UUID REFERENCES gangues_story_progress(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS character_sheets_save_id_idx ON character_sheets (save_id);

-- Índice antigo impedia recrutar o mesmo personagem 2x pro mesmo usuário.
-- Agora a unicidade é por save — o mesmo personagem pode existir em duas
-- gangues diferentes da mesma conta.
DROP INDEX IF EXISTS character_sheets_user_template_unique;
CREATE UNIQUE INDEX character_sheets_save_template_unique
  ON character_sheets (save_id, character_template_id)
  WHERE character_type = 'template' AND character_template_id IS NOT NULL AND save_id IS NOT NULL;

-- Reset das fichas do Gangues (character_type = 'template'): sem save_id elas
-- não pertencem a save nenhum. "Lendas do LDI" usa character_type = 'legacy'
-- e não é afetado.
DELETE FROM game_saves WHERE sheet_id IN (SELECT id FROM character_sheets WHERE character_type = 'template');
DELETE FROM character_sheets WHERE character_type = 'template';

COMMIT;
