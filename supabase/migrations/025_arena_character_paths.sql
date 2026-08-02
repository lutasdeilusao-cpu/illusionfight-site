-- Arena 2.1: reset autorizado das fichas e adoção do modelo A/H/R/D.
DELETE FROM character_sheets;

ALTER TABLE character_sheets
  DROP CONSTRAINT IF EXISTS character_sheets_combat_style_check,
  DROP CONSTRAINT IF EXISTS character_sheets_weakness_id_check,
  DROP CONSTRAINT IF EXISTS character_sheets_technique_ids_limit_check,
  DROP COLUMN IF EXISTS combat_style,
  DROP COLUMN IF EXISTS technique_ids,
  DROP COLUMN IF EXISTS weakness_id,
  DROP COLUMN IF EXISTS weapon,
  DROP COLUMN IF EXISTS advantages,
  DROP COLUMN IF EXISTS disadvantages,
  DROP COLUMN IF EXISTS perks,
  DROP COLUMN IF EXISTS specializations,
  ADD COLUMN IF NOT EXISTS combat_path text NOT NULL,
  ALTER COLUMN loadout_version SET DEFAULT 2;

ALTER TABLE character_sheets
  ADD CONSTRAINT character_sheets_combat_path_check
    CHECK (combat_path IN ('atacante', 'defensor', 'mistico'));
