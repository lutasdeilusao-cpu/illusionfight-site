-- LDI Gangues 2.5.1: aplica o schema de templates e inicia uma geração limpa.
--
-- character_sheets é uma tabela historicamente compartilhada (era da "Arena", hoje é do
-- Gangues), mas a migration 026 (arena_clean_character_model) já apagou a tabela inteira e
-- deixou combat_path como NOT NULL sem default. Desde então, nenhuma linha pode existir nessa
-- tabela sem ter sido escrita pelo próprio Gangues (o outro jogo que também usa essa tabela,
-- "Lendas do LDI" em src/pages/games/LDI/, nunca envia combat_path — um insert dele violaria
-- essa constraint e falharia). Ou seja: reset total de character_sheets aqui é seguro, é
-- exatamente o mesmo raciocínio que já foi aplicado nas migrations 025 e 026.
BEGIN;

ALTER TABLE character_sheets
  ADD COLUMN IF NOT EXISTS character_type TEXT NOT NULL DEFAULT 'legacy'
    CHECK (character_type IN ('legacy', 'template')),
  ADD COLUMN IF NOT EXISTS character_template_id INTEGER
    CHECK (character_template_id BETWEEN 1 AND 30);

CREATE UNIQUE INDEX IF NOT EXISTS character_sheets_user_template_unique
  ON character_sheets (user_id, character_template_id)
  WHERE character_type = 'template' AND character_template_id IS NOT NULL;

ALTER TABLE gangues_story_progress
  ADD COLUMN IF NOT EXISTS campaign_clears INTEGER NOT NULL DEFAULT 0 CHECK (campaign_clears >= 0),
  ADD COLUMN IF NOT EXISTS event_character_ids INTEGER[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS save_version INTEGER NOT NULL DEFAULT 0;

ALTER TABLE gangues_story_progress
  DROP CONSTRAINT IF EXISTS gangues_story_progress_event_character_ids_check;
ALTER TABLE gangues_story_progress
  ADD CONSTRAINT gangues_story_progress_event_character_ids_check
  CHECK (event_character_ids <@ ARRAY[8,9,10,18,19,20,26,28,29,30]::INTEGER[]);

-- Reset total: apaga toda ficha (só pode ser do Gangues, ver comentário acima), todo save
-- vinculado e todo progresso de história — geração limpa pra todo mundo, sem exceção.
DELETE FROM game_saves
WHERE sheet_id IN (SELECT id FROM character_sheets);

DELETE FROM character_sheets;

DELETE FROM gangues_story_progress;

COMMIT;
