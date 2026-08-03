-- Arena 3.0.2: limpeza definitiva do modelo legado de fichas.
-- ATENÇÃO: esta migration apaga todas as fichas da Arena e seus saves vinculados.
BEGIN;

DELETE FROM game_saves
WHERE sheet_id IN (SELECT id FROM character_sheets);

DELETE FROM character_sheets;

ALTER TABLE character_sheets
  DROP CONSTRAINT IF EXISTS character_sheets_combat_style_check,
  DROP CONSTRAINT IF EXISTS character_sheets_weakness_id_check,
  DROP CONSTRAINT IF EXISTS character_sheets_technique_ids_limit_check,
  DROP CONSTRAINT IF EXISTS character_sheets_combat_path_check,
  DROP COLUMN IF EXISTS combat_style,
  DROP COLUMN IF EXISTS technique_ids,
  DROP COLUMN IF EXISTS weakness_id,
  DROP COLUMN IF EXISTS weapon,
  DROP COLUMN IF EXISTS advantages,
  DROP COLUMN IF EXISTS disadvantages,
  DROP COLUMN IF EXISTS perks,
  DROP COLUMN IF EXISTS specializations;

ALTER TABLE character_sheets
  ADD COLUMN IF NOT EXISTS combat_path text,
  ADD COLUMN IF NOT EXISTS loadout_version smallint DEFAULT 2;

ALTER TABLE character_sheets
  ALTER COLUMN combat_path SET NOT NULL,
  ALTER COLUMN loadout_version SET DEFAULT 2,
  ALTER COLUMN loadout_version SET NOT NULL,
  ADD CONSTRAINT character_sheets_combat_path_check
    CHECK (combat_path IN ('atacante', 'defensor', 'mistico'));

COMMIT;
